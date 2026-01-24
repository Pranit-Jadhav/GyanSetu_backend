from fastapi import FastAPI, HTTPException
from models import BatchUpdatePayload, MasteryResponse
from engine import MasteryEngine

app = FastAPI(title="GyanSetu Mastery Engine (Stateless)")
engine = MasteryEngine()

@app.get("/")
def root():
    return {"message": "GyanSetu Stateless Mastery Engine Online"}

@app.post("/mastery/assess", response_model=MasteryResponse)
def assess_mastery(payload: BatchUpdatePayload):
    try:
        if not payload.attempts:
            return MasteryResponse(student_id=payload.student_id, updates=[])
            
        updates = engine.process_batch_updates(payload)
        return MasteryResponse(student_id=payload.student_id, updates=updates)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
