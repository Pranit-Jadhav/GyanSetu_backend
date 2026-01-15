# GyanSetu Mastery Backend

A mastery tracking system based on Bayesian Knowledge Tracing (BKT) that provides adaptive learning recommendations and student mastery analytics.

## Overview

This backend service tracks student mastery of concepts, modules, and subjects using probabilistic models. It provides adaptive practice recommendations based on the Zone of Proximal Development (ZPD) principle, ensuring students practice at the optimal difficulty level.

## Features

- **Bayesian Knowledge Tracing (BKT)**: Probabilistic mastery tracking
- **Adaptive Practice Plans**: Recommendations based on student mastery levels
- **Multi-level Analytics**: Concept, module, subject, and overall student mastery
- **Explainable Recommendations**: No black-box models, fully traceable decisions
- **Cold-Start Handling**: Works immediately for new students without historical data

## Installation

```bash
pip install -r requirements.txt
```

## Running the Server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation (Swagger UI): `http://localhost:8000/docs`

## API Endpoints

### Update Concept Mastery

Update a student's mastery after they answer a question.

**Endpoint:** `POST /mastery/update`

**Request Body:**

```json
{
  "student_id": "S101",
  "concept_id": "DFS",
  "correct": true,
  "engagement": 1.2
}
```

**Response:**

```json
{
  "status": "updated"
}
```

### Get Concept Mastery

Retrieve mastery information for a specific concept.

**Endpoint:** `GET /mastery/concept/{student_id}/{concept_id}`

**Response:**

```json
{
  "concept": "Depth First Search",
  "probability": 0.75
}
```

### Get Module Mastery

Retrieve mastery information for a module (collection of concepts).

**Endpoint:** `GET /mastery/module/{student_id}/{module_id}`

**Response:**

```json
{
  "module": "Trees",
  "mastery": 65.5,
  "weakConcepts": ["DFS", "BFS"]
}
```

### Get Subject Mastery Dashboard

Retrieve comprehensive mastery information for a subject.

**Endpoint:** `GET /mastery/subject/{student_id}/{subject_id}`

**Response:**

```json
{
  "subject": "Data Structures",
  "subjectMastery": 71.2,
  "modules": [
    {
      "module": "Arrays",
      "mastery": 82,
      "status": "Strong"
    },
    {
      "module": "Trees",
      "mastery": 55,
      "status": "Needs Attention"
    }
  ]
}
```

### Get Adaptive Practice Plan

Get personalized practice recommendations for a subject.

**Endpoint:** `GET /mastery/practice/{student_id}/{subject_id}`

**Response:**

```json
{
  "plan": [
    {
      "module": "Trees",
      "concepts": ["DFS", "BFS"],
      "priority": "high"
    }
  ]
}
```

### Get Overall Student Mastery

Retrieve overall mastery statistics for a student across all concepts.

**Endpoint:** `GET /mastery/student/{student_id}`

**Response:**

```json
{
  "studentId": "S101",
  "overallMastery": 68.5
}
```

## Adaptive Practice Logic (ZPD)

The system recommends practice based on mastery probability using the Zone of Proximal Development (ZPD) principle:

| Mastery Probability | Action            |
| ------------------- | ----------------- |
| < 40%               | Remedial Practice |
| 40–75%              | Core Practice     |
| 75–85%              | Stretch (ZPD)     |
| > 85%               | Skip / Advance    |

## Explainability & Trust

- **No black-box ML models**: All recommendations are based on transparent probabilistic models
- **Explainable recommendations**: Every recommendation can be traced back to mastery calculations
- **Teacher-friendly**: Teachers can understand why a topic was assigned to a student
- **Academic-safe**: Designed for educational environments where transparency is essential

## Cold-Start Handling

New students start with an initial mastery belief (P(L₀) = 0.3). The system adapts immediately from the first question answered, without needing historical exams or practice data. This allows the system to work effectively even for students with no prior interaction history.

## Technology Stack

- **FastAPI**: Modern Python web framework
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server
