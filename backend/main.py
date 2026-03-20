from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import json
import os
import sys
from typing import Union
from dotenv import load_dotenv
from .logic import detect_legal_standard, build_system_prompt
from .detector import analyze_text  # Import the new detector logic
from fastapi.middleware.cors import CORSMiddleware

# --- Path Hack for Core Module ---
# Add the current directory to sys.path so that 'from core...' imports work inside the copied module
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Now we can safely import from the copied core module
try:
    from core.models import HumanizeReq, HumanizeRes
    from core.pipeline import run_humanize
except ImportError as e:
    print(f"Warning: Could not import humanizer core: {e}")
    # Define mocks if import fails to avoid crashing
    class HumanizeReq(BaseModel):
        text: str
        mode: str = "balanced"
        length_ratio: float = 0.15
        keep_sentence_count: bool = True
        keep_paragraph_count: bool = True
        max_retries: int = 1
    
    class HumanizeRes(BaseModel):
        output: str
    
    def run_humanize(req):
        raise HTTPException(status_code=501, detail="Humanizer core not loaded")

load_dotenv()


def get_openai_api_key() -> str | None:
    """Server-side key lookup with backward-compatible fallback."""
    return os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

class GenerateRequest(BaseModel):
    case_data: Union[dict, str]

class DetectRequest(BaseModel):
    text: str

BASE_SYSTEM_PROMPT = """Opinion Assistant GPT — Instrucciones Canónicas (v3) 
 
 ## Propósito 
 Generar opiniones médicas tipo **VA DBQ** (nexus) usando **solo** los datos estructurados **JSON** que entregue el usuario. Sin navegación web. Sin inventar hechos. Sin especulación fuera del expediente. Sin consejos de tratamiento. Sin hablar de beneficios/ratings. 
 
 ## Entrada 
 - El usuario entrega **JSON** con: servicio (fechas), STRs/exámenes, hallazgos post‑servicio (imágenes, diagnósticos, fechas), y **la pregunta** médico‑legal. 
 
 ## Salida (formato y tono) 
 - Longitud objetivo: **120–180 palabras**. 
 - Lenguaje profesional DBQ. 
 - Citar evidencia objetiva: **fechas**, tipo de estudio (p. ej., “X‑ray”), impresiones, notas de STR/exámenes. 
 - Si faltan datos (p. ej. “entrance exam silencioso/no disponible”), **mencionar la brecha en 1 frase** y continuar de forma conservadora. 
 - No pedir aclaraciones salvo que el caso sea ininteligible. 
 
 ## Regla de apertura (primera frase) 
 ### A) Conexión directa a servicio (Direct Service Connection / causación) 
 Si la pregunta es “¿incurrido en / causado por servicio?” “¿resultado de dolor en servicio?” etc., la **primera frase** debe ser exactamente una de: 
 - **“It is at least as likely as not (>=50% probability) that …”** 
 - **“It is less likely than not (<50% probability) that …”** 
 
 ### B) Preguntas de “clear and unmistakable evidence (CUE)” (preexistencia / no‑agravación) 
 Si la pregunta incluye **“clear and unmistakable”**, **preexistencia**, o **agravación más allá del curso natural**, **NO** usar lenguaje 50/50 en la primera frase. En su lugar, abrir con: 
 - **“There is clear and unmistakable evidence that …”**  
   o  
 - **“There is not clear and unmistakable evidence that …”** 
 
 > Esta excepción existe porque CUE es un umbral legal distinto al 50/50. 
 
 ## Lógica legal (determinística) 
 1) **CUE preexistencia:**  
    - Concluir **CUE sí/no** SOLO con evidencia indiscutible pre‑servicio (registros previos, diagnóstico documentado antes de entrar, etc.).  
    - Si el examen de entrada es silencioso y no hay evidencia pre‑servicio en el JSON → normalmente: **no CUE**. 
 
 2) **CUE no‑agravación (si preexistió):**  
    - Evaluar si hay evidencia indiscutible de **no** empeoramiento permanente en servicio.  
    - STRs silenciosos + separación sin empeoramiento documentado + gran brecha hasta evidencia objetiva post‑servicio puede apoyar **CUE no‑agravación**. 
 
 3) Si **no** se establece preexistencia por CUE → volver a **conexión directa** (50/50). 
 
 ## Ponderación de evidencia (solo lo presente en el JSON) 
 - STRs/exámenes de entrada y salida: quejas, diagnósticos, tratamiento, perfiles, imágenes; o “silencioso”. 
 - **Cronología:** tiempo desde separación hasta primer hallazgo objetivo post‑servicio. 
 - **Patrón:** bilateral/unilateral, degenerativo/osteopenia/espuelas si se documenta. 
 - **Condiciones separadas:** si la pregunta dice “separate from” otra discapacidad, mantenerlas separadas salvo vínculo explícito en el JSON. 
 
 ## Plantilla de razonamiento (2–5 frases) 
 - Servicio: fechas + qué muestran (o no) STRs/entrada/salida. 
 - Post‑servicio: primer estudio/diagnóstico con fecha + impresión relevante. 
 - Continuidad: describir brecha temporal con fechas. 
 - Concluir: amarrar la evidencia al estándar aplicable (50/50 o CUE). 
 
 ## Prohibiciones 
 - No inventar hechos ni asumir eventos en servicio sin respaldo. 
 - No especular etiologías no documentadas. 
 - No recomendaciones de tratamiento. 
 - No discutir compensación, ratings, o elegibilidad."""

@app.post("/generate")
async def generate_opinion(request: GenerateRequest):
    try:
        case_data = request.case_data
        
        # Handle both dict (JSON) and str (Text) inputs
        if isinstance(case_data, dict):
            # Try to find question in common fields
            question_text = case_data.get("question", case_data.get("medical_legal_question", ""))
            # If not found, stringify the whole object
            if not question_text:
                question_text = json.dumps(case_data)
            content_payload = json.dumps(case_data, indent=2)
        else:
            # It's a string (plain text)
            question_text = case_data
            content_payload = case_data
        
        legal_instruction = detect_legal_standard(question_text)
        system_prompt = build_system_prompt(BASE_SYSTEM_PROMPT, legal_instruction)
        
        api_key = get_openai_api_key()
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API Key not configured on server")

        client = OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"CASE DATA:\n{content_payload}"}
            ],
            temperature=0.1, # Very low for precision/determinism
        )
        
        return {"opinion": response.choices[0].message.content}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- New Humanizer Endpoint ---
@app.post("/api/humanize", response_model=HumanizeRes)
def humanize_endpoint(req: HumanizeReq):
    # Ensure API Key is set (either from env or request if we wanted to support BYOK)
    if not get_openai_api_key():
         raise HTTPException(status_code=500, detail="Server misconfiguration: OPENAI_API_KEY not set")

    try:
        # Run the imported pipeline logic
        result = run_humanize(req)
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /api/humanize: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- New Detector Endpoint ---
@app.post("/api/detect")
def detect_endpoint(req: DetectRequest):
    try:
        result = analyze_text(req.text)
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /api/detect: {e}")
        raise HTTPException(status_code=500, detail=str(e))
