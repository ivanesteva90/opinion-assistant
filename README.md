# PointWise - VA DBQ Nexus Generator

This is a web application designed to generate concise VA DBQ-style nexus opinions from structured JSON case data. It uses a hybrid approach with Python for precise legal standard detection and an LLM (OpenAI GPT) for generating the rationale.

## Features

- **Precise Legal Standard Detection**: Automatically detects if the case is a "Direct Service Connection" or "CUE/Aggravation" case and enforces the exact required opening phrasing.
- **VA DBQ Style**: Generates professional, concise (120-180 words) opinions.
- **Evidence-Based**: Cites specific evidence from the provided JSON.

## Project Structure

- `src/`: React Frontend (Vite + TypeScript + Tailwind CSS).
- `backend/`: Python Backend (FastAPI).
    - `main.py`: API Entry point.
    - `logic.py`: Deterministic logic for legal standard detection.

## Prerequisites

- Node.js & npm
- Python 3.9+
- OpenAI API Key

## Setup & Run

1.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```

2.  **Install Backend Dependencies**:
    ```bash
    pip install -r backend/requirements.txt
    ```

3.  **Start the Backend**:
    ```bash
    python3 -m uvicorn backend.main:app --reload --port 8000
    ```

4.  **Start the Frontend**:
    ```bash
    npm run dev
    ```

5.  Open your browser at `http://localhost:5173` (or the port shown in the terminal).

## Usage

1.  Enter your OpenAI API Key.
2.  Paste the Case Data JSON.
3.  Click "Generate Opinion".

## SaaS Roadmap (Draft)

See the detailed plan in the generated response.
