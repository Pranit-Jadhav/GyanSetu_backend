# Postman Collection Setup Guide

This guide explains how to import and use the GyanSetu API Postman Collection.

## 📥 Importing the Collection

### Method 1: Import JSON File
1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `GyanSetu_API_Collection.postman_collection.json`
5. Click **Import**

### Method 2: Import via URL
1. Open Postman
2. Click **Import**
3. Select **Link** tab
4. Paste the collection URL (if hosted)
5. Click **Continue** → **Import**

## 🔧 Configuring Variables

After importing, configure collection variables:

### Base URLs
1. Click on collection name → **Variables** tab
2. Set `base_url` = `http://localhost:3001` (Node.js backend)
3. Set `python_base_url` = `http://localhost:8000` (Python backend)

### Auto-populated Variables
These are automatically set by the collection:
- `auth_token` - Current user's token
- `teacher_token` - Teacher user token
- `student_token` - Student user token
- `admin_token` - Admin user token
- `student_id` - Current student ID
- `teacher_id` - Current teacher ID
- `class_id` - Current class ID
- `subject_id` - Current subject ID
- `module_id` - Current module ID
- `concept_id` - Current concept ID
- `assessment_id` - Current assessment ID
- `project_id` - Current project ID

## 🚀 Quick Start Testing Flow

### Step 1: Health Check
- Run `💚 Health Check` → `Backend Health`
- Verify server is running

### Step 2: Register Users
1. Run `🔐 Authentication` → `Register User` (as TEACHER)
   - Token is auto-saved to `teacher_token`
   - Teacher ID saved to `teacher_id`
2. Run `Register Student` (as STUDENT)
   - Token auto-saved to `student_token`
   - Student ID saved to `student_id`

### Step 3: Create Curriculum
1. `📚 Curriculum Management` → `Create Subject`
   - Creates DSA subject
   - Saves `subject_id`
2. `Create Module` (e.g., Trees)
   - Saves `module_id`
3. `Create Concept` (e.g., DFS)
   - Saves `concept_id`

### Step 4: Create Classroom
1. `🏫 Classroom Management` → `Create Classroom`
   - Saves `class_id`
   - Note the `joinCode` in response

### Step 5: Join Classroom
1. `Join Class by Code`
   - Use the join code from Step 4

### Step 6: Create Assessment
1. `🧪 Assessments` → `Create Manual Assessment` or `Generate AI Assessment`
   - Saves `assessment_id`
2. `Launch Assessment`

### Step 7: Submit Assessment
1. `Submit Assessment`
   - Answers are validated and mastery is updated automatically

### Step 8: Check Mastery
1. `🧠 Mastery Engine` → `Get Concept Mastery`
   - View updated mastery scores

## 📝 Request Flow Examples

### Complete Learning Flow
```
1. Register Student → Get student_id
2. Create Subject → Get subject_id
3. Create Module → Get module_id
4. Create Concept → Get concept_id
5. Create Classroom → Get class_id
6. Join Classroom
7. Create Assessment → Get assessment_id
8. Launch Assessment
9. Submit Assessment (updates mastery automatically)
10. Get Concept Mastery (see improvement)
11. Get Practice Plan (get recommendations)
```

### Teacher Workflow
```
1. Register as Teacher
2. Create Classroom
3. Create Curriculum (Subject/Module/Concept)
4. Create Assessment (Manual or AI)
5. Launch Assessment
6. Get Assessment Results
7. Get Teacher Dashboard
8. Get Class Alerts
```

### Admin Workflow
```
1. Register as Admin
2. Create Template (PROJECT/ASSESSMENT/RUBRIC)
3. Get Templates
4. Get Admin Dashboard (institutional metrics)
```

## 🔐 Authentication

Most endpoints require JWT authentication:
- Token is auto-extracted from registration/login responses
- Stored in collection variables
- Automatically added to requests via Bearer token auth

### Manual Token Setup
If tokens aren't auto-saved:
1. Copy token from login/register response
2. Set collection variable `auth_token`
3. Or set role-specific tokens: `teacher_token`, `student_token`, `admin_token`

## 🧪 Testing Scenarios

### Scenario 1: New Student Journey
1. Register student
2. Join classroom
3. Submit assessment
4. Check mastery (should show default/cold-start)
5. Submit more assessments
6. Watch mastery improve

### Scenario 2: Mastery Tracking
1. Update mastery multiple times with different outcomes
2. Check concept mastery after each update
3. Verify module/subject mastery aggregation
4. Get practice plan (should categorize concepts)

### Scenario 3: Engagement Tracking
1. Log engagement data
2. Get class engagement
3. Check alerts (if engagement drops)

## 📊 Collection Organization

The collection is organized by feature:
- 🔐 Authentication
- 🏫 Classroom Management
- 📚 Curriculum Management
- 🧠 Mastery Engine
- 🧪 Assessments
- ⚡ Engagement Tracking
- 🚨 Alerts
- 👑 Admin
- 📦 Project-Based Learning (PBL)
- 🤝 Soft Skills
- 📊 Dashboards
- 🐍 Python Mastery Backend (direct testing)
- 💚 Health Check

## ⚠️ Important Notes

1. **Order Matters**: Some endpoints depend on IDs from previous requests
2. **Auto-Save**: Collection automatically saves IDs from responses
3. **Tokens**: Login/register automatically save tokens
4. **Python Backend**: Ensure Python backend is running on port 8000
5. **MongoDB**: Ensure MongoDB is running
6. **Variables**: Check collection variables if requests fail

## 🐛 Troubleshooting

### 401 Unauthorized
- Check if token is set in collection variables
- Re-login to get fresh token
- Verify Bearer token is in request headers

### 404 Not Found
- Verify IDs are saved in collection variables
- Check if resource was created successfully
- Ensure you're using correct endpoint path

### 500 Server Error
- Check backend logs
- Verify MongoDB is connected
- Ensure Python backend is running (for mastery endpoints)

### Variables Not Updating
- Manually check collection variables
- Re-run the request that should set the variable
- Check Postman console for variable assignment

## 🔄 Updating the Collection

To update the collection:
1. Export current collection
2. Make changes in JSON
3. Re-import or use Postman's edit feature

## 📚 Additional Resources

- API Documentation: `API_CONTRACT.md`
- Backend README: `README.md`
- Implementation Summary: `IMPLEMENTATION_SUMMARY.md`
