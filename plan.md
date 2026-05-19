````md
# Aplikasi Absensi Face Recognition + GPS
## System Architecture & Implementation Plan

---

# 1. Overview

Aplikasi ini adalah sistem absensi modern menggunakan:

- Face Recognition (Scan Wajah)
- GPS Validation (Deteksi Lokasi)
- Realtime Monitoring
- Shift Management
- Anti Fake GPS
- Anti Titip Absen

Tujuan utama:
- meningkatkan validitas absensi,
- mengurangi kecurangan,
- mempermudah monitoring karyawan.

---

# 2. Recommended Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native |
| Backend API | Laravel |
| Database | PostgreSQL |
| Queue | Redis |
| AI Face Recognition | FastAPI + InsightFace |
| Realtime | Laravel Reverb |
| Admin Panel | Filament |
| Storage | S3 / Local Storage |
| Deployment | Ubuntu + Nginx |

---

# 3. High Level Architecture

```text
                    ┌─────────────────────┐
                    │     Mobile App      │
                    │      Flutter        │
                    └─────────┬───────────┘
                              │ HTTPS API
                              ▼
                    ┌─────────────────────┐
                    │    Laravel API      │
                    │ Authentication      │
                    │ Attendance Engine   │
                    │ GPS Validation      │
                    │ Shift Engine        │
                    └───────┬─────────────┘
                            │
        ┌───────────────────┼──────────────────┐
        ▼                   ▼                  ▼
┌──────────────┐   ┌────────────────┐  ┌────────────────┐
│ PostgreSQL   │   │ Redis Queue    │  │ Object Storage │
│ Main Data    │   │ Async Jobs     │  │ Photo Storage  │
└──────────────┘   └────────────────┘  └────────────────┘

                            │
                            ▼
                  ┌─────────────────┐
                  │ AI Face Service │
                  │ FastAPI Python  │
                  └─────────────────┘

                            │
                            ▼
                  ┌─────────────────┐
                  │ Admin Dashboard │
                  │ Laravel Panel   │
                  └─────────────────┘
````

---

# 4. Main Features

## Employee Features

* Login
* Register Face
* Attendance Check-In
* Attendance Check-Out
* Attendance History
* GPS Validation
* Shift Information
* Permission Request
* Sick Leave Request

---

## Admin Features

* Employee Management
* Shift Management
* Office Geofence
* Attendance Monitoring
* Attendance Approval
* Attendance Reports
* Realtime Dashboard
* Export Excel/PDF

---

# 5. Mobile App Architecture (Flutter)

## Main Modules

### A. Authentication

* Login
* Token Refresh
* Device Validation

---

### B. Camera Module

* Front Camera Access
* Auto Face Detection
* Auto Capture

---

### C. GPS Module

* Get Latitude
* Get Longitude
* Get GPS Accuracy

---

### D. Attendance Module

* Check-In
* Check-Out
* Send Photo + GPS

---

### E. History Module

* Daily Attendance
* Late Status
* Attendance Recap

---

### F. Offline Support

* Temporary Local Cache
* Sync when Internet Available

---

# 6. Backend Laravel Architecture

## Layer Structure

```text
Controller
   ↓
Service
   ↓
Repository
   ↓
Database
```

---

# 7. Backend Modules

---

## A. Authentication Module

### Features

* Login
* Logout
* Token Management
* Device Binding

### Technology

* Laravel Sanctum

---

## B. Attendance Module

### Responsibilities

* Attendance Validation
* Shift Validation
* Duplicate Check
* Attendance Saving

---

## C. Geolocation Module

### Responsibilities

* Distance Calculation
* Geofence Validation
* GPS Accuracy Validation

### Formula

* Haversine Formula

---

## D. Shift Engine

### Responsibilities

* Determine Employee Shift
* Calculate Late Status
* Calculate Attendance Target

---

## E. Notification Module

### Notifications

* Late Attendance
* Permission Approval
* Shift Reminder

---

# 8. AI Face Recognition Service

## Recommended Architecture

Gunakan service terpisah berbasis Python.

### Why?

Karena machine learning lebih optimal di Python.

---

## Tech Stack

| Component      | Technology   |
| -------------- | ------------ |
| API            | FastAPI      |
| Face Detection | InsightFace  |
| Embedding      | FaceNet      |
| Runtime        | ONNX Runtime |

---

# 9. Face Verification Flow

```text
Flutter App
   ↓
Capture Selfie
   ↓
Laravel API
   ↓
Send to AI Service
   ↓
Face Matching
   ↓
Return Similarity Score
   ↓
Laravel Save Attendance
```

---

# 10. Attendance Validation Flow

```text
User Open Attendance
   ↓
Take Selfie
   ↓
Get GPS Location
   ↓
Send to Backend
   ↓
Validate Face
   ↓
Validate GPS
   ↓
Validate Shift
   ↓
Save Attendance
   ↓
Broadcast Realtime
```

---

# 11. GPS Validation

## Office Location Example

```text
Office:
Latitude  : -6.12345
Longitude : 106.12345
Radius    : 50 meters
```

---

## Validation

```text
IF distance <= radius
THEN attendance valid
ELSE rejected
```

---

# 12. Anti Fraud System

## A. Liveness Detection

Prevent:

* printed photos,
* screenshots,
* video replay.

### Methods

* Blink Detection
* Head Movement
* Smile Detection

---

## B. Fake GPS Detection

Detect:

* Mock Location
* GPS Manipulation
* Unrealistic Position Jump

---

## C. Device Binding

Rules:

* 1 account = limited devices
* login history logging

---

# 13. Database Design

---

# employees

```sql
id
employee_code
name
email
department_id
shift_group_id
status
created_at
updated_at
```

---

# face_templates

```sql
id
employee_id
embedding_vector
photo_path
created_at
```

---

# attendance_logs

```sql
id
employee_id
attendance_type
scan_time
latitude
longitude
distance
face_confidence
photo_path
device_id
status
created_at
```

---

# office_locations

```sql
id
name
latitude
longitude
radius_meter
created_at
```

---

# devices

```sql
id
employee_id
device_uuid
device_name
last_login
created_at
```

---

# shifts

```sql
id
shift_name
start_time
end_time
break_time
created_at
```

---

# shift_schedules

```sql
id
employee_id
shift_id
work_date
created_at
```

---

# attendance_requests

```sql
id
employee_id
request_type
description
status
approved_by
created_at
```

---

# 14. Queue System

## Technology

* Redis
* Laravel Queue

---

## Async Jobs

### Processed in Queue

* Face Verification
* Upload Image
* Notifications
* Export Reports

---

# 15. Realtime System

## Technology

* Laravel Reverb
* Laravel Echo

---

## Features

* Live Attendance Feed
* Live Employee Count
* Late Attendance Notification

---

# 16. Admin Dashboard

## Recommended

* Filament

---

## Main Features

* Employee CRUD
* Shift CRUD
* Geofence CRUD
* Attendance Monitoring
* Approval System
* Report Export
* Analytics

---

# 17. API Structure

## Authentication

```http
POST /api/login
POST /api/logout
POST /api/refresh
```

---

## Face Registration

```http
POST /api/face/register
```

---

## Attendance

```http
POST /api/attendance/checkin
POST /api/attendance/checkout
GET  /api/attendance/history
```

---

## Employee

```http
GET /api/profile
GET /api/shift
```

---

# 18. Security

## Required Security Features

* HTTPS
* Token Authentication
* Rate Limiting
* Device Validation
* Audit Logging
* Encrypted Face Template

---

# 19. Deployment Architecture

## Initial VPS Setup

```text
Ubuntu Server
   ├── Nginx
   ├── Laravel API
   ├── Redis
   ├── PostgreSQL
   ├── Supervisor
   └── FastAPI AI Service
```

---

# 20. Scalability Plan

## If Users Grow

### Separate Services

| Server   | Responsibility      |
| -------- | ------------------- |
| Server 1 | Laravel API         |
| Server 2 | PostgreSQL          |
| Server 3 | Redis Queue         |
| Server 4 | AI Face Recognition |
| Server 5 | Realtime WebSocket  |

---

# 21. Recommended MVP

## Phase 1 (MVP)

### Must Have

* Login
* Face Registration
* Check-In
* Check-Out
* GPS Validation
* Attendance History
* Admin Dashboard

---

## Phase 2

### Additional Features

* Shift Rotation
* Permission System
* Overtime
* Notifications
* Realtime Monitoring

---

## Phase 3

### Advanced Features

* Payroll Integration
* AI Analytics
* Attendance Prediction
* Advanced Anti Spoofing

---

# 22. Recommended Development Timeline

| Week | Target                    |
| ---- | ------------------------- |
| 1    | Database & Backend Setup  |
| 2    | Authentication & Employee |
| 3    | Face Registration         |
| 4    | GPS Validation            |
| 5    | Attendance Flow           |
| 6    | Admin Dashboard           |
| 7    | Realtime System           |
| 8    | Testing & Deployment      |

---

# 23. Final Recommendation

Recommended stack for this project:

| Layer       | Recommended           |
| ----------- | --------------------- |
| Mobile      | React Native          |
| Backend     | Laravel               |
| Database    | PostgreSQL            |
| Queue       | Redis                 |
| AI          | FastAPI + InsightFace |
| Admin Panel | Filament              |
| Realtime    | Laravel Reverb        |

---

# 24. Future Potential

Sistem ini nantinya dapat dikembangkan menjadi:

* Full HRIS
* Payroll System
* Smart Shift Management
* AI Productivity Analytics
* Smart Workforce Monitoring

---

# 25. Conclusion

Sistem absensi berbasis:

* Face Recognition,
* GPS Validation,
* Realtime Monitoring,

adalah solusi modern yang:

* scalable,
* secure,
* efisien,
* dan sangat relevan untuk perusahaan modern.

Dengan kombinasi:

* Laravel,
* Flutter,
* Redis,
* PostgreSQL,
* FastAPI AI,

aplikasi ini bisa berkembang dari MVP sederhana menjadi enterprise-grade attendance platform.

```
```
