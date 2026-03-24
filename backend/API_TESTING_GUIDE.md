# CocoaFlow API - Complete Testing Guide

## 🚀 Quick Start

### Start the Server
```bash
cd backend
npm run dev
```

Server will start on: `http://localhost:5000`

---

## 1. AUTHENTICATION & AUTHORIZATION

### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@cocoaflow.com",
    "password": "SecurePass123",
    "name": "John Doe",
    "role": "PRODUCTION"
  }'
```

**Available Roles:**
- `ADMIN` - Full system access
- `MANAGER` - Management dashboard, announcements, tasks
- `PRODUCTION` - Production batches, recipes
- `WAREHOUSE` - Inventory management
- `QC` - Quality control inspections
- `MECHANIC` - Machines, maintenance, SOS alerts
- `CONTROLLER` - Analytics and reports

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid-here",
    "email": "john@cocoaflow.com",
    "role": "PRODUCTION"
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@cocoaflow.com",
    "password": "SecurePass123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@cocoaflow.com",
      "name": "John Doe",
      "role": "PRODUCTION"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-here"
  }
}
```

**💡 Save the token!** You'll need it for all protected endpoints.

### Get Current User Info
```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 2. INVENTORY MANAGEMENT

### List All Inventory Items
```bash
curl http://localhost:5000/api/inventory \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search Inventory
```bash
curl "http://localhost:5000/api/inventory/search?q=cocoa" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Single Item
```bash
curl http://localhost:5000/api/inventory/{item_id} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Add New Inventory Item
```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cocoa Butter",
    "code": "CB-001",
    "category": "Raw Material",
    "quantity": 500,
    "unit": "kg",
    "location": "Warehouse A - Shelf 3 - Box 12",
    "expiryDate": "2026-12-31",
    "supplierId": "supplier-uuid-here",
    "minStockLevel": 50
  }'
```

### Update Stock Level
```bash
curl -X POST http://localhost:5000/api/inventory/{item_id}/stock \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "movementType": "IN",
    "quantity": 100,
    "notes": "Received new shipment"
  }'
```

**Movement Types:**
- `IN` - Stock received
- `OUT` - Stock used/removed
- `ADJUSTMENT` - Correction/count adjustment
- `EXPIRED` - Item expired
- `DAMAGED` - Item damaged

### Get Low Stock Alerts
```bash
curl http://localhost:5000/api/inventory/alerts/low-stock \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Expiry Warnings
```bash
curl http://localhost:5000/api/inventory/alerts/expiry \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### View Item Movement History
```bash
curl http://localhost:5000/api/inventory/{item_id}/movements \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 3. RECIPES & PRODUCTION

### List All Recipes
```bash
curl http://localhost:5000/api/recipes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Recipe Details (with ingredients)
```bash
curl http://localhost:5000/api/recipes/{recipe_id} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create New Recipe
```bash
curl -X POST http://localhost:5000/api/recipes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dark Chocolate Bar 70%",
    "description": "Premium dark chocolate with 70% cocoa",
    "yieldQuantity": 100,
    "yieldUnit": "bars",
    "durationMinutes": 180,
    "instructions": [
      "Melt cocoa butter at 45°C",
      "Mix in cocoa powder gradually",
      "Add sugar and blend for 20 minutes",
      "Temper chocolate to 31°C",
      "Pour into molds",
      "Cool for 60 minutes"
    ],
    "ingredients": [
      {
        "inventoryItemId": "cocoa-butter-id",
        "quantity": 30,
        "unit": "kg"
      },
      {
        "inventoryItemId": "cocoa-powder-id",
        "quantity": 40,
        "unit": "kg"
      },
      {
        "inventoryItemId": "sugar-id",
        "quantity": 30,
        "unit": "kg"
      }
    ]
  }'
```

### List Production Batches
```bash
curl http://localhost:5000/api/production \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Production Batch
```bash
curl -X POST http://localhost:5000/api/production \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "recipeId": "recipe-uuid",
    "targetQuantity": 500,
    "scheduledStart": "2026-01-31T08:00:00Z"
  }'
```

### Get Batch Details
```bash
curl http://localhost:5000/api/production/{batch_id} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Batch Status
```bash
curl -X PUT http://localhost:5000/api/production/{batch_id}/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "MIXING"
  }'
```

**Batch Statuses:**
- `PENDING` - Scheduled
- `MIXING` - Ingredients being mixed
- `COOKING` - Heating/processing
- `COOLING` - Cooling down
- `PACKAGING` - Being packaged
- `COMPLETED` - Finished
- `FAILED` - Production failed
- `QC_PENDING` - Awaiting quality check

---

## 4. QUALITY CONTROL

### List QC Inspections
```bash
curl http://localhost:5000/api/qc \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create QC Inspection
```bash
curl -X POST http://localhost:5000/api/qc \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": "batch-uuid",
    "appearanceScore": 9,
    "textureScore": 8,
    "tasteScore": 9,
    "overallResult": "PASS",
    "notes": "Excellent quality, slight texture variation acceptable",
    "defects": [
      {
        "type": "MINOR_DISCOLORATION",
        "severity": "LOW",
        "quantity": 3,
        "description": "Small spots on 3 bars"
      }
    ]
  }'
```

**QC Results:**
- `PASS` - Approved for sale
- `FAIL` - Rejected
- `CONDITIONAL` - Pass with notes
- `QUARANTINE` - Hold for review

**Defect Types:**
- `DISCOLORATION`, `TEXTURE_ISSUE`, `TASTE_OFF`, `SHAPE_DEFECT`, `PACKAGING_ISSUE`

**Severity:**
- `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

### Get QC Statistics
```bash
curl http://localhost:5000/api/qc/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Batch QC History
```bash
curl http://localhost:5000/api/qc/batch/{batch_id} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 5. MECHANIC & MAINTENANCE

### List All Machines
```bash
curl http://localhost:5000/api/mechanics/machines \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Machine Details
```bash
curl http://localhost:5000/api/mechanics/machines/{machine_id} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create SOS Alert (Emergency!)
```bash
curl -X POST http://localhost:5000/api/mechanics/sos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "machineId": "machine-uuid",
    "priority": "HIGH",
    "problemDescription": "Melting tank overheating - temperature at 95°C!"
  }'
```

**SOS Priorities:**
- `LOW` - Can wait for next shift
- `MEDIUM` - Needs attention today
- `HIGH` - Urgent, affects production
- `CRITICAL` - Emergency shutdown required

### List SOS Alerts
```bash
curl http://localhost:5000/api/mechanics/sos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update SOS Status
```bash
curl -X PUT http://localhost:5000/api/mechanics/sos/{alert_id} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "mechanicNotes": "Checking cooling system"
  }'
```

### Log Maintenance Work
```bash
curl -X POST http://localhost:5000/api/mechanics/maintenance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "machineId": "machine-uuid",
    "maintenanceType": "REPAIR",
    "description": "Replaced cooling fan belt",
    "partsUsed": "Fan belt #4532",
    "duration": 45,
    "cost": 150
  }'
```

**Maintenance Types:**
- `PREVENTIVE` - Scheduled maintenance
- `REPAIR` - Fix broken component
- `INSPECTION` - Safety check
- `UPGRADE` - Improvement/modification

### Get Machine Maintenance History
```bash
curl http://localhost:5000/api/mechanics/machines/{machine_id}/maintenance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 6. MANAGER DASHBOARD

### Get Dashboard Statistics
```bash
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Analytics Data
```bash
curl http://localhost:5000/api/dashboard/analytics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Broadcast Announcement
```bash
curl -X POST http://localhost:5000/api/admin/announcements \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Night Shift Update",
    "content": "New safety procedures start Monday. All staff must attend briefing.",
    "priority": "HIGH",
    "targetRoles": ["PRODUCTION", "WAREHOUSE", "QC"]
  }'
```

### List Announcements
```bash
curl http://localhost:5000/api/admin/announcements \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Task Assignment
```bash
curl -X POST http://localhost:5000/api/admin/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean mixing area",
    "description": "Deep clean all mixing equipment before morning shift",
    "assignedTo": "user-uuid",
    "priority": "MEDIUM",
    "dueDate": "2026-01-31T06:00:00Z"
  }'
```

---

## 7. AI ASSISTANT (GEMINI)

### Chat with AI
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Where is cocoa butter stored?",
    "language": "en"
  }'
```

**Supported Languages:**
- `en` - English
- `ar` - Arabic
- `he` - Hebrew
- `am` - Amharic
- `ru` - Russian

### Example AI Queries:
```bash
# Inventory question
"أين الكاكاو؟" (Where is cocoa? - Arabic)

# Production help
"Explain step 3 of dark chocolate recipe"

# Recommendations
"What can I produce with 20kg sugar and 15kg cocoa?"

# QC Analysis
"Summarize defects from this week"

# Machine help
"How do I troubleshoot overheating in melting tank?"
```

### Get Chat History
```bash
curl http://localhost:5000/api/ai/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 8. SYSTEM HEALTH & MONITORING

### Health Check (No Auth Required)
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "alive",
  "timestamp": "2026-01-30T10:00:00.000Z",
  "uptime": 1234.567,
  "environment": "development"
}
```

### Metrics Endpoint
```bash
curl http://localhost:5000/metrics
```

### API Documentation (Swagger)
Open in browser: `http://localhost:5000/api-docs`

---

## 🔒 AUTHENTICATION PATTERNS

### Using JWT Tokens

After login, you receive a token. Use it in all requests:

```bash
# Save token to variable (bash)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use in requests
curl http://localhost:5000/api/inventory \
  -H "Authorization: Bearer $TOKEN"
```

### Token Refresh
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-here"
  }'
```

---

## 📊 HTTP STATUS CODES

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

---

## 🧪 TESTING WORKFLOW

### 1. Register & Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234","name":"Tester","role":"PRODUCTION"}'

# Login & save token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'
```

### 2. Add Inventory
```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Sugar","code":"SUG-001","quantity":100,"unit":"kg","location":"A1"}'
```

### 3. Create Recipe
```bash
curl -X POST http://localhost:5000/api/recipes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Milk Chocolate","yieldQuantity":50,"durationMinutes":120}'
```

### 4. Start Production
```bash
curl -X POST http://localhost:5000/api/production \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipeId":"recipe-id","targetQuantity":100}'
```

### 5. QC Inspection
```bash
curl -X POST http://localhost:5000/api/qc \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"batchId":"batch-id","overallResult":"PASS","appearanceScore":9}'
```

---

## 🐛 TROUBLESHOOTING

### Can't connect to server?
```bash
# Check if running
curl http://localhost:5000/api/health

# Restart server
cd backend && npm run dev
```

### "No token provided"?
- Make sure you're logged in
- Include `Authorization: Bearer YOUR_TOKEN` header

### "Invalid credentials"?
- Check email/password spelling
- Passwords are case-sensitive
- Minimum 8 characters required

### Database errors?
```bash
# Check migrations
cd backend && npm run migrate

# Seed demo data
npm run seed
```

---

## 📝 QUICK REFERENCE CARD

```
BASE_URL: http://localhost:5000

Auth:
  POST   /api/auth/register      Register
  POST   /api/auth/login         Login
  GET    /api/users/me           Get profile

Inventory:
  GET    /api/inventory          List items
  POST   /api/inventory          Add item
  GET    /api/inventory/search   Search
  POST   /api/inventory/:id/stock Update stock

Production:
  GET    /api/recipes            List recipes
  POST   /api/recipes            Create recipe
  GET    /api/production         List batches
  POST   /api/production         Start batch

QC:
  GET    /api/qc                 List inspections
  POST   /api/qc                 Create inspection
  GET    /api/qc/stats           Statistics

Mechanic:
  GET    /api/mechanics/machines List machines
  POST   /api/mechanics/sos      Create alert
  POST   /api/mechanics/maintenance Log work

Manager:
  GET    /api/dashboard/stats    Dashboard
  POST   /api/admin/announcements Broadcast

AI:
  POST   /api/ai/chat            Chat with AI
```

---

**🎯 TIP:** Use [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) for easier API testing with a GUI!
