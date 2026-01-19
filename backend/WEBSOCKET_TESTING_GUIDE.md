# WebSocket Testing Guide

This guide explains how to test the Socket.IO WebSocket events in the GyanSetu backend.

## 🔌 WebSocket Overview

The GyanSetu backend uses **Socket.IO** for real-time communication between students and teachers. WebSocket events enable:
- Real-time confusion alerts
- Engagement drop notifications
- Mastery threshold alerts
- Live class monitoring

## ⚠️ Why Postman Can't Test WebSockets Directly

**Postman has limited support for Socket.IO** because Socket.IO uses a custom protocol on top of WebSockets. The native WebSocket support in Postman doesn't work with Socket.IO's handshake and event system.

## ✅ Testing Methods

### Method 1: Browser Console (Recommended - Easiest)

This is the quickest way to test WebSocket events.

#### Step 1: Get Your Auth Token

1. Use Postman to login/register
2. Copy your JWT token from the response
3. Or check Postman collection variables: `{{auth_token}}`, `{{teacher_token}}`, or `{{student_token}}`

#### Step 2: Load Socket.IO Client in Browser

1. Open your browser (Chrome, Firefox, Edge)
2. Open DevTools (F12 or Right-click → Inspect)
3. Go to Console tab
4. Load Socket.IO client library:

```javascript
// Load Socket.IO client library
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
document.head.appendChild(script);

// Wait a moment for library to load, then connect
setTimeout(() => {
  const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with your token
  
  // Connect to Socket.IO server
  const socket = io('http://localhost:3001', {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling']
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Connected! Socket ID:', socket.id);
    console.log('👤 User role and ID available after connection');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Disconnected:', reason);
  });

  // Listen for alerts (Teacher/Admin)
  socket.on('CONFUSION_ALERT', (data) => {
    console.log('🚨 CONFUSION ALERT:', data);
  });

  socket.on('ENGAGEMENT_DROP', (data) => {
    console.log('📉 ENGAGEMENT DROP:', data);
  });

  socket.on('MASTERY_THRESHOLD', (data) => {
    console.log('📊 MASTERY THRESHOLD:', data);
  });

  socket.on('ALERT', (data) => {
    console.log('⚠️ ALERT:', data);
  });

  // Join class room (Teacher/Admin only)
  // Replace with your class_id
  const classId = 'YOUR_CLASS_ID_HERE';
  socket.emit('join-class', classId);
  console.log('📚 Joined class room:', classId);

  // Save socket to global for testing
  window.testSocket = socket;
}, 1000);
```

#### Step 3: Test Events

After connection, you can test:

```javascript
// Join a class (Teacher/Admin)
window.testSocket.emit('join-class', 'YOUR_CLASS_ID');

// Listen for events (already set up above)
// Events will automatically log to console when received

// Disconnect
window.testSocket.disconnect();
```

---

### Method 2: HTML Test Page

Create a simple HTML file to test WebSocket connections.

#### Create `websocket-test.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>GyanSetu WebSocket Test</title>
  <script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
  <style>
    body { font-family: Arial; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    input, button { padding: 10px; margin: 5px; }
    #messages { border: 1px solid #ccc; padding: 10px; height: 400px; overflow-y: auto; }
    .message { margin: 5px 0; padding: 5px; background: #f0f0f0; }
    .alert { background: #ffebee; }
    .success { background: #e8f5e9; }
    .error { background: #ffcdd2; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔌 GyanSetu WebSocket Test</h1>
    
    <div>
      <label>JWT Token:</label><br>
      <input type="text" id="token" placeholder="Enter your JWT token" style="width: 500px;" />
    </div>
    
    <div>
      <label>Class ID (for teachers):</label><br>
      <input type="text" id="classId" placeholder="Enter class ID" />
    </div>
    
    <div>
      <button onclick="connect()">Connect</button>
      <button onclick="joinClass()">Join Class</button>
      <button onclick="disconnect()">Disconnect</button>
    </div>
    
    <h3>Messages:</h3>
    <div id="messages"></div>
  </div>

  <script>
    let socket = null;

    function addMessage(message, type = 'message') {
      const messagesDiv = document.getElementById('messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${type}`;
      messageDiv.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function connect() {
      const token = document.getElementById('token').value;
      if (!token) {
        alert('Please enter a JWT token');
        return;
      }

      addMessage('Connecting to server...', 'message');
      
      socket = io('http://localhost:3001', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        addMessage(`✅ Connected! Socket ID: ${socket.id}`, 'success');
      });

      socket.on('connect_error', (error) => {
        addMessage(`❌ Connection error: ${error.message}`, 'error');
      });

      socket.on('disconnect', (reason) => {
        addMessage(`🔌 Disconnected: ${reason}`, 'message');
      });

      // Listen for alerts
      socket.on('CONFUSION_ALERT', (data) => {
        addMessage(`🚨 CONFUSION ALERT: ${JSON.stringify(data, null, 2)}`, 'alert');
      });

      socket.on('ENGAGEMENT_DROP', (data) => {
        addMessage(`📉 ENGAGEMENT DROP: ${JSON.stringify(data, null, 2)}`, 'alert');
      });

      socket.on('MASTERY_THRESHOLD', (data) => {
        addMessage(`📊 MASTERY THRESHOLD: ${JSON.stringify(data, null, 2)}`, 'message');
      });

      socket.on('ALERT', (data) => {
        addMessage(`⚠️ ALERT: ${JSON.stringify(data, null, 2)}`, 'alert');
      });
    }

    function joinClass() {
      const classId = document.getElementById('classId').value;
      if (!socket) {
        alert('Please connect first');
        return;
      }
      if (!classId) {
        alert('Please enter a class ID');
        return;
      }
      
      socket.emit('join-class', classId);
      addMessage(`📚 Joined class room: ${classId}`, 'success');
    }

    function disconnect() {
      if (socket) {
        socket.disconnect();
        socket = null;
        addMessage('Disconnected from server', 'message');
      }
    }
  </script>
</body>
</html>
```

#### Usage:

1. Save the HTML file
2. Open it in your browser
3. Enter your JWT token (from Postman)
4. Click "Connect"
5. Enter class ID and click "Join Class"
6. Watch for incoming events in the messages area

---

### Method 3: Node.js Test Script

Create a test script to programmatically test WebSocket events.

#### Create `test-websocket.js`:

```javascript
const io = require('socket.io-client');

// Replace with your token
const token = 'YOUR_JWT_TOKEN_HERE';
const classId = 'YOUR_CLASS_ID_HERE';

console.log('Connecting to Socket.IO server...');

const socket = io('http://localhost:3001', {
  auth: {
    token: token
  },
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connected! Socket ID:', socket.id);
  
  // Join class room (Teacher/Admin)
  socket.emit('join-class', classId);
  console.log(`📚 Joined class room: ${classId}`);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

// Listen for alerts
socket.on('CONFUSION_ALERT', (data) => {
  console.log('🚨 CONFUSION ALERT:', JSON.stringify(data, null, 2));
});

socket.on('ENGAGEMENT_DROP', (data) => {
  console.log('📉 ENGAGEMENT DROP:', JSON.stringify(data, null, 2));
});

socket.on('MASTERY_THRESHOLD', (data) => {
  console.log('📊 MASTERY THRESHOLD:', JSON.stringify(data, null, 2));
});

socket.on('ALERT', (data) => {
  console.log('⚠️ ALERT:', JSON.stringify(data, null, 2));
});

// Keep script running
process.on('SIGINT', () => {
  socket.disconnect();
  process.exit();
});
```

#### Usage:

```bash
# Install Socket.IO client
npm install socket.io-client

# Run the test script
node test-websocket.js
```

---

## 📋 Event Reference

### Client → Server Events

#### `join-class` (Teacher/Admin only)
```javascript
socket.emit('join-class', classId);
```
**Purpose:** Join a class room to receive alerts for that class  
**Parameters:** `classId` (string) - The class ID to join

#### `disconnect`
```javascript
socket.disconnect();
```
**Purpose:** Disconnect from the server  
**Parameters:** None

---

### Server → Client Events

#### `CONFUSION_ALERT`
```javascript
socket.on('CONFUSION_ALERT', (data) => {
  // data: { type, concept, severity, timestamp }
});
```
**Purpose:** Alert when confusion is detected in a class  
**Data:**
```json
{
  "type": "CONFUSION_ALERT",
  "concept": "DFS",
  "severity": "HIGH",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

#### `ENGAGEMENT_DROP`
```javascript
socket.on('ENGAGEMENT_DROP', (data) => {
  // data: { type, studentId, engagementIndex, timestamp }
});
```
**Purpose:** Alert when student engagement drops  
**Data:**
```json
{
  "type": "ENGAGEMENT_DROP",
  "studentId": "s123",
  "engagementIndex": 0.25,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

#### `MASTERY_THRESHOLD`
```javascript
socket.on('MASTERY_THRESHOLD', (data) => {
  // data: { type, conceptId, masteryScore, timestamp }
});
```
**Purpose:** Alert when mastery crosses threshold (to student)  
**Data:**
```json
{
  "type": "MASTERY_THRESHOLD",
  "conceptId": "c123",
  "masteryScore": 45,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

#### `ALERT`
```javascript
socket.on('ALERT', (data) => {
  // data: { type, severity, message, timestamp }
});
```
**Purpose:** General alert notification  
**Data:**
```json
{
  "type": "ENGAGEMENT_DROP",
  "severity": "MEDIUM",
  "message": "Student engagement dropped to 25%",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## 🧪 Testing Workflow

### Test as Teacher

1. **Get Teacher Token:**
   - Register/Login as TEACHER in Postman
   - Copy token

2. **Connect:**
   - Use browser console or HTML page
   - Connect with teacher token

3. **Join Class:**
   - Emit `join-class` with a valid class ID
   - You'll receive alerts for that class

4. **Trigger Alerts:**
   - Create low engagement logs via API
   - Create confusion alerts
   - Watch for `CONFUSION_ALERT`, `ENGAGEMENT_DROP`, `ALERT` events

### Test as Student

1. **Get Student Token:**
   - Register/Login as STUDENT in Postman
   - Copy token

2. **Connect:**
   - Use browser console or HTML page
   - Connect with student token
   - Automatically joins `student:{studentId}` room

3. **Receive Alerts:**
   - Will receive `MASTERY_THRESHOLD` events
   - Triggered when mastery scores cross thresholds

---

## 🔍 Troubleshooting

### Connection Fails
- ✅ Check if backend server is running on port 3001
- ✅ Verify token is valid (not expired)
- ✅ Check CORS settings in backend
- ✅ Ensure Socket.IO is properly initialized in app.ts

### No Events Received
- ✅ Verify you're connected (check socket.id)
- ✅ For teachers: Ensure you've joined a class room
- ✅ Check if alerts exist in database
- ✅ Verify your role matches event requirements

### Authentication Error
- ✅ Token must be in `socket.handshake.auth.token`
- ✅ Or in Authorization header as `Bearer <token>`
- ✅ Token must be valid JWT signed with same secret

---

## 📝 Quick Test Script (Copy-Paste Ready)

Use this in browser console for quick testing:

```javascript
// 1. Load Socket.IO
const s=document.createElement('script');s.src='https://cdn.socket.io/4.6.1/socket.io.min.js';document.head.appendChild(s);

// 2. Wait and connect (replace YOUR_TOKEN and YOUR_CLASS_ID)
setTimeout(()=>{
  const socket=io('http://localhost:3001',{auth:{token:'YOUR_TOKEN'}});
  socket.on('connect',()=>{console.log('✅ Connected:',socket.id);socket.emit('join-class','YOUR_CLASS_ID');});
  socket.on('CONFUSION_ALERT',d=>console.log('🚨',d));
  socket.on('ENGAGEMENT_DROP',d=>console.log('📉',d));
  socket.on('ALERT',d=>console.log('⚠️',d));
  window.socket=socket;
},1000);
```

---

## 📚 Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- Backend Socket Handler: `backend/src/sockets/socket.handler.ts`
