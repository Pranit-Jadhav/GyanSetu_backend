from fastapi import FastAPI
from pydantic import BaseModel
from models import StudentState, Subject, Module, Concept
from engine import MasteryEngine
from practice import practice_by_module, weak_concepts

app = FastAPI(title="GyanSetu Mastery Engine")

engine = MasteryEngine()

# ------------------ DATABASES ------------------
# These will be populated dynamically from the Node.js backend

STUDENTS = {}
SUBJECTS = {}
MODULES = {}
CONCEPTS = {}

# ------------------ API SCHEMAS ------------------

class UpdateRequest(BaseModel):
    student_id: str
    concept_id: str
    correct: bool
    engagement: float = 1.0

class SubjectRequest(BaseModel):
    subject_id: str
    name: str
    modules: list[str] = []

class ModuleRequest(BaseModel):
    module_id: str
    name: str
    subject_id: str
    concepts: list[str] = []

class ConceptRequest(BaseModel):
    concept_id: str
    name: str
    module_id: str
    subject_id: str
    prerequisites: list[str] = []

# ------------------ API ENDPOINTS ------------------
@app.get("/")
def root():
    return {"message": "GyanSetu Mastery Backend"}

# ------------------ CURRICULUM MANAGEMENT ENDPOINTS ------------------
@app.post("/curriculum/subject")
def create_subject(req: SubjectRequest):
    subject = Subject(req.subject_id, req.name, req.modules)
    SUBJECTS[req.subject_id] = subject
    return {"status": "created", "subject": req.subject_id}

@app.post("/curriculum/module")
def create_module(req: ModuleRequest):
    module = Module(req.module_id, req.name, req.subject_id, req.concepts)
    MODULES[req.module_id] = module
    return {"status": "created", "module": req.module_id}

@app.post("/curriculum/concept")
def create_concept(req: ConceptRequest):
    concept = Concept(req.concept_id, req.name, req.module_id, req.subject_id, req.prerequisites)
    CONCEPTS[req.concept_id] = concept
    return {"status": "created", "concept": req.concept_id}

@app.get("/curriculum/subjects")
def get_subjects():
    return {"subjects": list(SUBJECTS.keys())}

@app.get("/curriculum/subject/{subject_id}")
def get_subject(subject_id: str):
    subject = SUBJECTS.get(subject_id)
    if not subject:
        return {"error": "Subject not found"}
    return {
        "subject_id": subject.subject_id,
        "name": subject.name,
        "modules": subject.modules
    }

@app.get("/curriculum/module/{module_id}")
def get_module(module_id: str):
    module = MODULES.get(module_id)
    if not module:
        return {"error": "Module not found"}
    return {
        "module_id": module.module_id,
        "name": module.name,
        "subject_id": module.subject_id,
        "concepts": module.concepts
    }

@app.get("/curriculum/concept/{concept_id}")
def get_concept(concept_id: str):
    concept = CONCEPTS.get(concept_id)
    if not concept:
        return {"error": "Concept not found"}
    return {
        "concept_id": concept.concept_id,
        "name": concept.name,
        "module_id": concept.module_id,
        "subject_id": concept.subject_id,
        "prerequisites": concept.prerequisites
    }

@app.post("/mastery/update")
def update_mastery(req: UpdateRequest):
    student = STUDENTS.get(req.student_id)
    if not student:
        student = StudentState(req.student_id)
        STUDENTS[req.student_id] = student

    engine.update_concept(
        student,
        req.concept_id,
        req.correct,
        req.engagement
    )
    return {"status": "updated"}

@app.get("/mastery/concept/{student_id}/{concept_id}")
def concept_report(student_id: str, concept_id: str):
    student = STUDENTS.get(student_id)
    if not student:
        student = StudentState(student_id)
        STUDENTS[student_id] = student
    
    state = student.concepts.get(concept_id)
    P_L = state.P_L if state else 0.3
    
    concept_name = CONCEPTS.get(concept_id)
    concept_name = concept_name.name if concept_name else concept_id
    
    return {
        "concept": concept_name,
        "masteryScore": int(P_L * 100),
        "probability": round(P_L, 2)
    }

@app.get("/mastery/module/{student_id}/{module_id}")
def module_report(student_id: str, module_id: str):
    student = STUDENTS.get(student_id)
    if not student:
        student = StudentState(student_id)
        STUDENTS[student_id] = student
    
    module = MODULES.get(module_id)
    if not module:
        return {
            "module": module_id,
            "mastery": 0.0,
            "weakConcepts": []
        }
    
    return {
        "module": module.name,
        "mastery": engine.module_mastery(student, module),
        "weakConcepts": weak_concepts(student)
    }

@app.get("/mastery/subject/{student_id}/{subject_id}")
def subject_report(student_id: str, subject_id: str):
    student = STUDENTS.get(student_id)
    if not student:
        student = StudentState(student_id)
        STUDENTS[student_id] = student
    
    subject = SUBJECTS.get(subject_id)
    if not subject:
        return {
            "subject": subject_id,
            "subjectMastery": 0.0,
            "modules": []
        }

    modules_data = []
    for mid in subject.modules:
        module = MODULES.get(mid)
        if module:
            score = engine.module_mastery(student, module)
            modules_data.append({
                "module": module.name,
                "mastery": score,
                "status": "Strong" if score >= 75 else "Needs Attention"
            })

    return {
        "subject": subject.name,
        "subjectMastery": engine.subject_mastery(student, subject, MODULES),
        "modules": modules_data
    }

@app.get("/mastery/practice/{student_id}/{subject_id}")
def practice_plan(student_id: str, subject_id: str):
    student = STUDENTS.get(student_id)
    if not student:
        student = StudentState(student_id)
        STUDENTS[student_id] = student
    
    subject = SUBJECTS.get(subject_id)
    if not subject:
        return {"plan": []}
    
    subject_modules = {mid: MODULES[mid] for mid in subject.modules if mid in MODULES}
    return practice_by_module(student, subject_modules)

@app.get("/mastery/student/{student_id}")
def student_dashboard(student_id: str):
    student = STUDENTS.get(student_id)
    if not student:
        student = StudentState(student_id)
        STUDENTS[student_id] = student
    
    return {
        "studentId": student_id,
        "overallMastery": engine.overall_mastery(student)
    }
