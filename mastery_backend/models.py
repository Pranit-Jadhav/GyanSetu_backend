from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List

# -------- Curriculum Models --------

@dataclass
class Subject:
    subject_id: str
    name: str
    modules: List[str]

@dataclass
class Module:
    module_id: str
    name: str
    subject_id: str
    concepts: List[str]

@dataclass
class Concept:
    concept_id: str
    name: str
    module_id: str
    subject_id: str
    prerequisites: List[str]

# -------- Student Mastery Models --------

@dataclass
class ConceptState:
    P_L: float = 0.3
    last_seen: datetime = field(default_factory=datetime.utcnow)

@dataclass
class StudentState:
    student_id: str
    concepts: Dict[str, ConceptState] = field(default_factory=dict)
