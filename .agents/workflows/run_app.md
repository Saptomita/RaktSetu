---
description: How to run the BloodBridge platform locally and verify its endpoints
---

# Running BloodBridge Platform

This workflow details how to start the FastAPI backend server, serve the frontend static files, and access the endpoints.

## Prerequisites
Ensure Python 3.10+ is installed and the following packages are in the python environment:
- `fastapi`
- `uvicorn`
- `google-genai`
- `python-dotenv`
- `httpx`

## Step-by-Step Instructions

// turbo
1. Start the FastAPI server using Uvicorn with auto-reload:
```bash
python -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload
```
Note: Ensure this is executed from the `backend` directory.

2. Open your web browser and navigate to the local portal:
```
http://127.0.0.1:8000/
```

3. Verify chatbot functionality:
- Click the floating chatbot avatar in the bottom-right corner.
- Enter a query (e.g. "Where is Safdarjung Hospital Blood Bank?") and observe streaming response.

4. Verify facility registration:
- Scroll to the "Register Your Hospital or Blood Bank" section.
- Fill out the Hospital or Blood Bank registration forms.
- Submit the forms to confirm receipt by the backend (a success modal with a unique registration ID will appear).

5. Access registered facilities data:
- Navigate to the admin view URL to fetch in-memory submissions:
```
http://127.0.0.1:8000/api/registrations
```
