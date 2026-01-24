from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class AssessmentAttempt(BaseModel):
    concept_id: str
    correct: bool
    engagement: float = Field(..., ge=0.0, description="Engagement score multiplier (approx 0.5 to 1.5)")

class MasteryState(BaseModel):
    concept_id: str
    probability: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)

class BatchUpdatePayload(BaseModel):
    student_id: str
    current_states: Dict[str, MasteryState] = Field(default_factory=dict, description="Map of concept_id to current state")
    attempts: List[AssessmentAttempt]

class MasteryUpdate(BaseModel):
    concept_id: str
    probability: float
    confidence: float
    status: str  # Not Ready, Developing, Proficient, Mastered
    explanation: str

class MasteryResponse(BaseModel):
    student_id: str
    updates: List[MasteryUpdate]
