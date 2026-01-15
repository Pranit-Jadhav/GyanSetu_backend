from fastapi import FastAPI
from pydantic import BaseModel
from models import StudentState, Subject, Module, Concept
from engine import MasteryEngine
from practice import practice_by_module, weak_concepts

app = FastAPI(title="GyanSetu Mastery Engine")

engine = MasteryEngine()

# ------------------ MOCK DATABASES ------------------

STUDENTS = {}
SUBJECTS = {}
MODULES = {}
CONCEPTS = {}

# ------------------ SAMPLE CURRICULUM ------------------

SUBJECTS["DSA"] = Subject("DSA", "Data Structures", ["ARRAYS", "TREES"])

MODULES["ARRAYS"] = Module("ARRAYS", "Arrays", "DSA", ["BS"])
MODULES["TREES"] = Module("TREES", "Trees", "DSA", ["DFS", "BFS"])

CONCEPTS["BS"] = Concept("BS", "Binary Search", "ARRAYS", "DSA", [])
CONCEPTS["DFS"] = Concept("DFS", "Depth First Search", "TREES", "DSA", [])
CONCEPTS["BFS"] = Concept("BFS", "Breadth First Search", "TREES", "DSA", [])

# ------------------ API SCHEMAS ------------------

class UpdateRequest(BaseModel):
    student_id: str
    concept_id: str
    correct: bool
    engagement: float = 1.0

# ------------------ API ENDPOINTS ------------------
@app.get("/")
def root():
    return {"message": "GyanSetu Mastery Backend"}

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
