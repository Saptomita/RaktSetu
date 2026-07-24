"""
MedGemma Service Module
========================
Reusable service for communicating with Google's MedGemma model
running locally via Ollama.

Architecture:
  Frontend → Backend (this service) → Ollama (localhost:11434) → MedGemma

All model interaction is encapsulated here — never exposed to the frontend.
"""

import os
import re
import json
import logging
import httpx
from typing import Optional, AsyncGenerator

# ── Logging ──────────────────────────────────────────────────────
logger = logging.getLogger("medgemma_service")
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter(
            "[%(asctime)s] %(levelname)s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )
    logger.addHandler(handler)

# ── Constants ────────────────────────────────────────────────────
MODEL_NAME = "medgemma:4b"
REQUEST_TIMEOUT_SECONDS = int(os.getenv("MEDGEMMA_TIMEOUT", "180"))  # Override via env var

SYSTEM_PROMPT = (
    "You are raktsetu AI, a helpful conversational AI assistant integrated\n"
    "into the BloodBridge website.\n\n"
    "You can have normal conversations and answer general knowledge questions.\n\n"
    "You are particularly useful for explaining general healthcare and\n"
    "blood-donation information in simple language.\n\n"
    "When users ask about raktsetu, help them understand and navigate the\n"
    "platform.\n\n"
    "For blood availability, nearby hospitals, blood banks, addresses,\n"
    "contact details, inventory, or other real-time information, use only\n"
    "information supplied by the RaktSetu backend. Never invent this data.\n\n"
    "Do not claim to be a doctor. Do not provide definitive diagnoses,\n"
    "prescriptions, or personalized treatment decisions. For serious or\n"
    "urgent medical concerns, encourage appropriate professional medical\n"
    "care.\n\n"
    "Keep normal answers concise and conversational unless the user asks\n"
    "for more detail."
)

class MedGemmaService:
    """Handles database routing and communication with MedGemma via Ollama."""

    def __init__(self) -> None:
        self.ollama_base_url: str = os.getenv(
            "OLLAMA_BASE_URL", "http://localhost:11434"
        )
        self.model: str = os.getenv("MEDGEMMA_MODEL", MODEL_NAME)
        logger.info(
            "MedGemma service initialised (model: %s, ollama: %s)",
            self.model,
            self.ollama_base_url,
        )

    # ── Database Loader ──────────────────────────────────────────
    def load_database(self) -> list:
        """Dynamically load and parse HOSPITALS_DATA from data.js in root."""
        data_path = os.path.join(os.path.dirname(__file__), "..", "data.js")
        if not os.path.exists(data_path):
            logger.warning("Database file not found at %s", data_path)
            return []

        try:
            with open(data_path, "r", encoding="utf-8") as f:
                content = f.read()

            match = re.search(r"const HOSPITALS_DATA = (\[.*?\]);", content, re.DOTALL)
            if not match:
                logger.warning("Could not find HOSPITALS_DATA in data.js")
                return []

            js_array = match.group(1)
            # Remove comments
            js_array = re.sub(r"//.*", "", js_array)
            # Quote unquoted object keys (values already use double quotes)
            json_str = re.sub(r"([{\s,])(\w+)(:)", r'\1"\2"\3', js_array)
            # Handle trailing commas
            json_str = re.sub(r",\s*([\]}])", r"\1", json_str)

            data = json.loads(json_str)
            logger.info("Database loaded: %d facilities", len(data))
            return data
        except Exception as e:
            logger.exception("Error parsing database: %s", e)
            return []

    # ── Database RAG Routing ──────────────────────────────────────
    def get_database_context(self, query: str) -> Optional[str]:
        """
        Analyze user query to match blood group requests or facility directory queries.
        Queries the database and returns a context string for MedGemma RAG.
        """
        q = query.lower()

        # Define lists of words
        blood_groups = ["a+", "a-", "b+", "b-", "ab+", "ab-", "o+", "o-"]
        has_blood_group = any(bg in q for bg in blood_groups)
        
        # Keywords for search/availability intent
        search_intent = ["find", "search", "near", "where", "available", "stock", "inventory", "closest", "nearest", "nearby", "get", "show", "list", "directory", "location", "address", "phone", "contact"]
        
        is_blood_search = has_blood_group and any(w in q for w in search_intent)
        
        is_facility_search = any(w in q for w in ["hospital", "blood bank", "blood-bank"]) and any(w in q for w in ["near", "nearest", "nearby", "closest", "where", "find", "search", "list", "show", "directory", "address", "phone", "contact"])
        
        # Also check if it explicitly asks for a city and any facility/blood word
        cities = ["delhi", "mumbai", "chennai", "bangalore", "bengaluru", "kolkata", "hyderabad", "pune", "ahmedabad", "gurugram", "gurgaon", "vellore"]
        has_city = any(c in q for c in cities)
        is_city_search = has_city and any(w in q for w in ["hospital", "blood bank", "blood-bank", "blood", "avail", "find", "search"])

        if not (is_blood_search or is_facility_search or is_city_search):
            return None  # No database lookup needed (route to regular LLM chat)

        database = self.load_database()
        if not database:
            return "No database records are currently available."

        # Detect requested facility category
        target_category = None
        if "blood bank" in q or "blood-bank" in q:
            target_category = "blood-bank"
        elif "hospital" in q:
            target_category = "hospital"

        # Detect requested blood group if present
        target_group = None
        for bg in ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]:
            if bg.lower() in q:
                target_group = bg
                break

        # Detect requested city name if present
        target_city = None
        for city in cities:
            if city in q:
                target_city = city
                break

        matches = []
        for facility in database:
            # Category filter
            if target_category and facility.get("category") != target_category:
                continue

            # City filter
            if target_city:
                facility_city = facility.get("city", "").lower()
                # Equate bangalore and bengaluru
                if target_city in ["bangalore", "bengaluru"] and facility_city in ["bangalore", "bengaluru"]:
                    pass
                elif target_city != facility_city:
                    continue

            # Blood group stock filter
            if target_group:
                if facility.get("blood", {}).get(target_group, 0) == 0:
                    continue

            matches.append(facility)

        if not matches:
            criteria = []
            if target_city: criteria.append(f"in {target_city.capitalize()}")
            if target_group: criteria.append(f"with {target_group} availability")
            criteria_str = " ".join(criteria)
            return f"No matching facility {criteria_str} was found in the database. Warn the user that no records exist in the system for this request."

        # Format context for MedGemma RAG
        formatted_matches = []
        for f in matches:
            stock = ", ".join([f"{bg}: {units}" for bg, units in f.get("blood", {}).items()])
            services = ", ".join(f.get("services", []))
            formatted_matches.append(
                f"- Name: {f['name']}\n"
                f"  Category: {f['category'].replace('-', ' ').title()} (Type: {f['type'].title()})\n"
                f"  Address: {f['address']}, {f['city']}\n"
                f"  Phone: {f['phone']} | Email: {f['email']}\n"
                f"  Hours: {f['hours']}\n"
                f"  Services: {services}\n"
                f"  Blood Inventory: {stock}"
            )

        context_data = "\n\n".join(formatted_matches)
        return (
            "Here is the real-time, verified information from the RaktSetu database matching the user's query:\n"
            "----------------------------------------\n"
            f"{context_data}\n"
            "----------------------------------------\n"
            "Use ONLY the database records above to answer the user's request. Never invent details."
        )

    # ── Streaming API ────────────────────────────────────────────
    async def generate_response_stream(self, user_message: str, database_context: str = None) -> AsyncGenerator[str, None]:
        """
        Send *user_message* to local MedGemma via Ollama and yield reply tokens in real time.
        """
        url = f"{self.ollama_base_url}/api/chat"

        system_content = SYSTEM_PROMPT
        if database_context:
            system_content += f"\n\n{database_context}"
            logger.info("Routing query to database search context: %d chars", len(database_context))
        else:
            logger.info("Routing query to general/healthcare model conversation")

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_message},
            ],
            "options": {
                "num_predict": 256
            },
            "stream": True,
        }

        logger.info("→ MedGemma stream start | user_msg_len=%d", len(user_message))

        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(REQUEST_TIMEOUT_SECONDS)
            ) as client:
                async with client.stream("POST", url, json=payload) as response:
                    if response.status_code != 200:
                        body = await response.aread()
                        logger.error(
                            "Ollama returned status %d. Body: %s",
                            response.status_code,
                            body[:200],
                        )
                        yield "⚠️ The AI service is currently having trouble. Please try again."
                        return

                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                            token = data.get("message", {}).get("content", "")
                            if token:
                                yield token
                        except Exception as e:
                            logger.error("Error parsing stream line: %s", e)

            logger.info("✓ MedGemma stream completed successfully")

        except httpx.TimeoutException:
            logger.error("MedGemma stream timed out after %ds", REQUEST_TIMEOUT_SECONDS)
            yield "⏱️ The response timed out. Please try again."
        except httpx.ConnectError:
            logger.error("Cannot connect to Ollama at %s", self.ollama_base_url)
            yield "⚠️ Cannot connect to the local inference service. Make sure Ollama is running."
        except httpx.RequestError as exc:
            logger.error("MedGemma stream request error: %s", exc)
            yield f"⚠️ Inference service connection error: {exc}"


# ── Singleton instance ───────────────────────────────────────────
medgemma_service = MedGemmaService()
