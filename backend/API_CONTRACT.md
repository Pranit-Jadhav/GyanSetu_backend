# GyanSetu Backend API Contract

## 🔐 Authentication & Authorization

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@mail.com",
  "password": "secret",
  "role": "TEACHER",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "u123",
    "email": "user@mail.com",
    "role": "TEACHER",
    "name": "John Doe"
  }
}
```

### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@mail.com",
  "password": "secret"
}
```

**Response:** Same as register

### GET /api/auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "u123",
    "email": "user@mail.com",
    "role": "TEACHER",
    "name": "John Doe"
  }
}
```

---

## 🏫 Classroom & Course Service

### POST /api/classes
Create a new class (TEACHER/ADMIN only).

**Request Body:**
```json
{
  "className": "CSE-A",
  "subject": "DSA",
  "semester": 4
}
```

**Response:**
```json
{
  "id": "c123",
  "className": "CSE-A",
  "subject": "DSA",
  "semester": 4,
  "teacherId": "t123"
}
```

### GET /api/classes/:id
Get class details.

**Response:**
```json
{
  "id": "c123",
  "className": "CSE-A",
  "subject": "DSA",
  "semester": 4,
  "teacher": { "id": "t123", "email": "teacher@mail.com" },
  "students": [...]
}
```

### POST /api/classes/:id/join
Join a class (STUDENT only).

**Response:**
```json
{
  "message": "Successfully joined class",
  "classId": "c123"
}
```

### GET /api/classes/:id/students
Get all students in a class.

**Response:**
```json
{
  "students": [
    {
      "id": "s1",
      "email": "student@mail.com",
      "name": "Jane Doe",
      "role": "STUDENT"
    }
  ]
}
```

---

## 🧠 Mastery Engine Service

### GET /api/mastery/:studentId
Get student's mastery across all concepts.

**Response:**
```json
{
  "mastery": [
    {
      "conceptId": "c1",
      "concept": "Binary Search",
      "masteryScore": 58,
      "confidence": 0.62,
      "lastUpdated": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/mastery/update
Update mastery based on quiz score.

**Request Body:**
```json
{
  "studentId": "s1",
  "conceptId": "c1",
  "quizScore": 65
}
```

**Response:**
```json
{
  "concept": "Binary Search",
  "masteryScore": 58,
  "confidence": 0.62
}
```

### GET /api/mastery/at-risk
Get students with mastery below threshold.

**Query Params:** `?threshold=50` (default: 50)

**Response:**
```json
{
  "students": [
    {
      "studentId": "s1",
      "studentName": "Jane Doe",
      "lowMasteryConcepts": [
        {
          "concept": "Recursion",
          "masteryScore": 35
        }
      ]
    }
  ]
}
```

---

## ⚡ Engagement Tracking Service

### POST /api/engagement/log
Log student engagement data.

**Request Body:**
```json
{
  "studentId": "s1",
  "classId": "c1",
  "idleTime": 20,
  "interactions": 5,
  "pollParticipation": 1,
  "tabFocus": 85
}
```

**Response:**
```json
{
  "engagementIndex": 0.74,
  "logId": "log123"
}
```

### GET /api/engagement/class/:classId
Get engagement data for a class.

**Response:**
```json
{
  "classId": "c1",
  "averageEngagement": 0.72,
  "engagement": [
    {
      "studentId": "s1",
      "studentName": "Jane Doe",
      "engagementIndex": 0.74,
      "idleTime": 20,
      "interactions": 5,
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### GET /api/engagement/student/:studentId
Get engagement data for a student.

**Response:**
```json
{
  "studentId": "s1",
  "averageEngagement": 0.72,
  "engagement": [
    {
      "classId": "c1",
      "className": "CSE-A",
      "engagementIndex": 0.74,
      "idleTime": 20,
      "interactions": 5,
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## 🚨 Confusion Detection & Alerts

### GET /api/alerts/class/:classId
Get alerts for a class (TEACHER/ADMIN only).

**Query Params:** `?resolved=true` (include resolved alerts)

**Response:**
```json
{
  "alerts": [
    {
      "id": "a1",
      "type": "CONFUSION_ALERT",
      "severity": "HIGH",
      "message": "Student engagement dropped to 25%",
      "student": {
        "id": "s1",
        "name": "Jane Doe"
      },
      "concept": "Recursion",
      "resolved": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/alerts/:id/resolve
Resolve an alert (TEACHER/ADMIN only).

**Response:**
```json
{
  "message": "Alert resolved",
  "alertId": "a1"
}
```

---

## 👥 Project-Based Learning (PBL) Service

### POST /api/projects
Create a new project (TEACHER/ADMIN only).

**Request Body:**
```json
{
  "title": "Smart Traffic System",
  "description": "IoT-based traffic management",
  "classId": "c1",
  "milestones": ["Design", "Prototype", "Testing"],
  "rubrics": ["Teamwork", "Creativity", "Technical Skills"]
}
```

**Response:**
```json
{
  "id": "p1",
  "title": "Smart Traffic System",
  "description": "IoT-based traffic management",
  "milestones": ["Design", "Prototype", "Testing"],
  "rubrics": ["Teamwork", "Creativity", "Technical Skills"]
}
```

### GET /api/projects/:id
Get project details.

**Response:**
```json
{
  "id": "p1",
  "title": "Smart Traffic System",
  "description": "IoT-based traffic management",
  "milestones": ["Design", "Prototype", "Testing"],
  "rubrics": ["Teamwork", "Creativity", "Technical Skills"],
  "teams": [
    {
      "teamId": "t1",
      "members": [...],
      "artifacts": [
        {
          "artifactId": "art1",
          "url": "https://example.com/artifact",
          "submittedAt": "2024-01-15T10:00:00Z"
        }
      ]
    }
  ]
}
```

### POST /api/projects/:id/team
Create a team for a project.

**Request Body:**
```json
{
  "teamId": "t1",
  "members": ["s1", "s2", "s3"]
}
```

**Response:**
```json
{
  "message": "Team created successfully",
  "teamId": "t1"
}
```

### POST /api/projects/:id/artifact
Submit an artifact for a team.

**Request Body:**
```json
{
  "teamId": "t1",
  "artifactId": "art1",
  "url": "https://example.com/artifact"
}
```

**Response:**
```json
{
  "message": "Artifact submitted successfully",
  "artifactId": "art1"
}
```

---

## 🤝 Soft-Skill Assessment Service

### POST /api/soft-skills/peer-review
Submit a peer review.

**Request Body:**
```json
{
  "reviewerId": "s1",
  "revieweeId": "s2",
  "projectId": "p1",
  "teamwork": 82,
  "communication": 75,
  "leadership": 68,
  "creativity": 90,
  "comments": "Great collaboration skills"
}
```

**Response:**
```json
{
  "message": "Peer review submitted successfully",
  "reviewId": "r1"
}
```

### GET /api/soft-skills/:studentId
Get student's soft skill scores.

**Response:**
```json
{
  "studentId": "s1",
  "teamwork": 82,
  "communication": 75,
  "leadership": 68,
  "creativity": 85,
  "totalReviews": 5
}
```

---

## 📊 Analytics & Dashboards

### GET /api/dashboard/teacher
Get teacher dashboard (TEACHER/ADMIN only).

**Response:**
```json
{
  "teacherId": "t1",
  "totalClasses": 3,
  "totalStudents": 45,
  "averageMastery": 72,
  "averageEngagement": 0.75,
  "atRiskStudents": 5,
  "atRiskStudentsList": [...],
  "activeAlerts": 2,
  "classes": [...]
}
```

### GET /api/dashboard/admin
Get admin dashboard (ADMIN only).

**Response:**
```json
{
  "totalUsers": 150,
  "totalStudents": 120,
  "totalTeachers": 25,
  "totalClasses": 15,
  "averageMastery": 68,
  "averageEngagement": 0.72,
  "teacherAdoption": 85,
  "atRiskStudents": 18
}
```

---

## 🔌 WebSocket Events

### Client → Server Events

- `join-class` - Join class room (teachers)
  ```json
  {
    "classId": "c1"
  }
  ```

### Server → Client Events

- `CONFUSION_ALERT` - Confusion detected
  ```json
  {
    "type": "CONFUSION_ALERT",
    "concept": "Recursion",
    "severity": "HIGH",
    "timestamp": "2024-01-15T10:00:00Z"
  }
  ```

- `ENGAGEMENT_DROP` - Engagement dropped
  ```json
  {
    "type": "ENGAGEMENT_DROP",
    "studentId": "s1",
    "engagementIndex": 0.25,
    "timestamp": "2024-01-15T10:00:00Z"
  }
  ```

- `MASTERY_THRESHOLD` - Mastery threshold crossed
  ```json
  {
    "type": "MASTERY_THRESHOLD",
    "conceptId": "c1",
    "masteryScore": 45,
    "timestamp": "2024-01-15T10:00:00Z"
  }
  ```

- `ALERT` - General alert notification
  ```json
  {
    "type": "CONFUSION_ALERT",
    "severity": "MEDIUM",
    "message": "30% students failed same concept",
    "timestamp": "2024-01-15T10:00:00Z"
  }
  ```

---

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## 📝 Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": [...] // Optional, for validation errors
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
