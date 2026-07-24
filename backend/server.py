from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime, timezone
from dotenv import load_dotenv
from google import genai
import os
import logging
import uuid

# ── Environment & Logging ─────────────────────────────────────────
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("server")

# ── Gemini client (existing) ──────────────────────────────────────
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# ── MedGemma service (new) ────────────────────────────────────────
from medgemma_service import medgemma_service

# ── FastAPI app ───────────────────────────────────────────────────
app = FastAPI(title="RaktSetu API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Middleware to Disable Caching ────────────────────────────────
@app.middleware("http")
async def add_no_cache_header(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# ── Request schemas ───────────────────────────────────────────────
class Prompt(BaseModel):
    message: str

class MedGemmaRequest(BaseModel):
    message: str

# ── Existing /chat endpoint (Gemini) ─────────────────────────────
@app.post("/chat")
def chat(prompt: Prompt):
    logger.info("POST /chat | msg_len=%d", len(prompt.message))

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt.message,
        config={"system_instruction": "You are Gemma AI, an AI healthcare assistant integrated into the RaktSetu platform. You help users find blood, locate hospitals, and answer healthcare FAQs. Keep responses concise and helpful. Use emojis to make responses friendly. Format important info with **bold** markdown."}
    )

    return {
        "response": response.text
    }

# ── NEW: /api/medgemma endpoint (Streaming) ──────────────────────
from fastapi.responses import StreamingResponse

@app.post("/api/medgemma")
async def medgemma_chat(request: MedGemmaRequest):
    """
    Send a user message to MedGemma 1.5 4B-IT and stream the reply tokens back.
    All inference happens server-side with routing to database RAG context when needed.
    """
    logger.info("POST /api/medgemma | msg_len=%d", len(request.message))

    if not request.message.strip():
        logger.warning("/api/medgemma called with empty message")
        return JSONResponse(
            status_code=400,
            content={"reply": "Please enter a message."},
        )

    # Route and check retrieve database context
    db_context = medgemma_service.get_database_context(request.message)

    async def stream_generator():
        try:
            async for token in medgemma_service.generate_response_stream(request.message, db_context):
                yield token
        except Exception as exc:
            logger.exception("Unexpected error inside event stream generator: %s", exc)
            yield "⚠️ An unexpected error occurred. Please try again."

    return StreamingResponse(stream_generator(), media_type="text/plain")

# ── Registration & Inventory Schemas ─────────────────────────────
class HospitalRegistration(BaseModel):
    name: str
    type: str
    city: str
    address: str
    phone: str
    email: str
    hours: Optional[str] = "24/7"
    license: str
    services: Optional[str] = ""

class BloodBankRegistration(BaseModel):
    name: str
    affiliated: Optional[str] = ""
    city: str
    address: str
    phone: str
    email: str
    hours: Optional[str] = "24/7"
    license: str

class InventoryUpdate(BaseModel):
    facility_id: str
    blood: Dict[str, int]  # e.g. {"A+": 40, "O-": 12, ...}
    notes: Optional[str] = ""

# ── In-memory stores (replace with DB in production) ─────────────
registered_hospitals: List[dict] = []
registered_blood_banks: List[dict] = []
inventory_updates: List[dict] = []

# ── Registration endpoints ───────────────────────────────────────
@app.post("/api/register/hospital")
def register_hospital(data: HospitalRegistration):
    entry = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "status": "pending_verification",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    registered_hospitals.append(entry)
    logger.info("Hospital registered: %s (%s)", data.name, data.city)
    return {
        "success": True,
        "message": f"{data.name} has been registered successfully.",
        "registration_id": entry["id"],
        "status": "pending_verification",
        "estimated_review": "24-48 hours",
    }

@app.post("/api/register/bloodbank")
def register_bloodbank(data: BloodBankRegistration):
    entry = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "status": "pending_verification",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    registered_blood_banks.append(entry)
    logger.info("Blood bank registered: %s (%s)", data.name, data.city)
    return {
        "success": True,
        "message": f"{data.name} has been registered successfully.",
        "registration_id": entry["id"],
        "status": "pending_verification",
        "estimated_review": "24-48 hours",
    }

@app.post("/api/inventory/update")
def update_inventory(data: InventoryUpdate):
    entry = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    inventory_updates.append(entry)
    logger.info("Inventory updated for facility_id=%s", data.facility_id)
    return {
        "success": True,
        "message": "Blood inventory has been updated successfully.",
        "update_id": entry["id"],
        "facility_id": data.facility_id,
        "blood_units": data.blood,
    }

# ── Admin: list registrations (GET) ─────────────────────────────
@app.get("/api/registrations")
def list_registrations():
    return {
        "hospitals": registered_hospitals,
        "blood_banks": registered_blood_banks,
        "inventory_updates": inventory_updates,
    }

# ── Serve frontend static files ──────────────────────────────────
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..")
app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

# Serve individual static files from root
@app.get("/styles.css")
def serve_css():
    return FileResponse(os.path.join(FRONTEND_DIR, "styles.css"), media_type="text/css")

@app.get("/data.js")
def serve_data_js():
    return FileResponse(os.path.join(FRONTEND_DIR, "data.js"), media_type="application/javascript")

@app.get("/app.js")
def serve_app_js():
    return FileResponse(os.path.join(FRONTEND_DIR, "app.js"), media_type="application/javascript")

# Serve index.html at root
@app.get("/")
def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"), media_type="text/html")