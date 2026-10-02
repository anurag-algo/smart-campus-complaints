# Product Requirements Document (PRD)
## Complaint Management System (CMS) — v1.0
**Status:** Development Ready  
**Platform:** Web-based Complaint Management Platform  

---

## 1. Product Overview
The Complaint Management System (CMS) is a web-based application designed to digitize and streamline the complete lifecycle of user complaints. Users can register, submit complaints, upload supporting documents/images, track status, communicate with assigned agents, and review resolutions. Administrators and agents can assign, manage, resolve, and monitor complaints.

---

## 2. Problem Statement
Traditional complaint handling through phone calls, emails, paper forms, or manual registers makes tracking, assignment, monitoring, history management, and transparency difficult. The proposed system provides a centralized digital platform for complaint registration and resolution.

---

## 3. Product Objectives
- Allow users to submit complaints digitally.
- Generate a unique ticket ID for every complaint (e.g., `CMP-10024`).
- Provide complaint tracking and status visibility.
- Enable agents to manage assigned complaints.
- Allow administrators to assign complaints.
- Maintain audit history.
- Support secure file attachments.
- Implement role-based access control (RBAC).
- Provide dashboard statistics and scalable APIs.

---

## 4. Target Users
- **User:** Registers, submits, tracks, comments on, and reopens complaints.
- **Agent:** Handles assigned complaints, updates status, adds resolution notes and comments.
- **Administrator:** Manages all complaints, assignments, statistics, users/agents where applicable, and audit history.

---

## 5. User Roles & Permissions

| Feature | User | Agent | Admin |
| :--- | :---: | :---: | :---: |
| Register | Yes | Yes | No |
| Login | Yes | Yes | Yes |
| View own profile | Yes | Yes | Yes |
| Create complaint | Yes | No | No |
| View own complaints | Yes | No | No |
| View assigned complaints | No | Yes | Yes |
| View all complaints | No | No | Yes |
| Add comment | Yes | Yes | Yes |
| Internal note | No | Yes | Yes |
| Update status | No | Yes | Yes |
| Assign complaint | No | No | Yes |
| Audit trail | Limited | Assigned | All |
| Reopen complaint | Yes | No | Yes |
| Dashboard | No | Limited | Yes |

---

## 6. Authentication & Authorization
The system shall provide:
- JWT-based authentication.
- Secure `bcrypt` password hashing (minimum 10 salt rounds).
- Protected routes and role-based authorization (RBAC).
- HTTP-only cookie support and Bearer token support.
- Token expiration handling.
- Secure password reset flows.

---

## 7. User Profile Management
Authenticated users can view and update permitted profile information. Agents and administrators may additionally have a department associated with their profile.

---

## 8. Complaint Management
Users can create complaints with:
- **Title:** Brief summary of the complaint.
- **Description:** Detailed description.
- **Category:** `Technical`, `Billing`, `Service`, `Other`.
- **Priority:** `Low`, `Medium`, `High`, `Critical` (Default: `Medium`).
- **Initial Status:** `Pending`.
- **Attachments:** Supporting documents/images.
- **Ticket ID Generation:** Auto-generated unique identifier (e.g., `CMP-10024`).

---

## 9. Complaint Status Workflow
```
[Pending] ---> [In Progress] ---> [Resolved] ---> [Closed]
    ^                                 |              |
    |_________________________________|______________|
                              (Reopened)
```
- A resolved or closed complaint may be reopened when permitted, returning it to an active workflow (`In Progress`).
- Backend rules must strictly enforce valid status transitions.

---

## 10. Complaint Tracking & Filtering
- **Access Control:** Users view their own complaints; Agents view assigned complaints; Admins view all complaints.
- **Filtering Options:** Status, Category, Priority, Date range, Ticket ID, and Assigned Agent.
- **Pagination:** All complaint listing endpoints must enforce pagination.

---

## 11. Complaint Assignment
- Administrators can assign complaints to available agents.
- Assignment records include complaint ID, agent ID, assigning administrator ID, and timestamp.
- Assignment actions must be logged in the audit trail.

---

## 12. Comments & Internal Notes
- **Comments:** Public messages between Users, Agents, and Admins.
- **Internal Notes:** Visible **only** to Agents and Administrators. Must **never** be exposed through user-facing APIs. Normal users cannot create or view internal notes.

---

## 13. Resolution & Reopening
- Agents or Admins can update status and append resolution notes.
- Users may reopen eligible resolved/closed complaints with a reason.
- Reopening actions must be recorded in the audit trail.

---

## 14. Audit Trail
Important events must be recorded in the audit log:
- **Triggers:** Complaint creation, assignment, status changes, comments/internal notes (where required), resolution, closure, and reopening.
- **Audit Schema Attributes:** Actor (`performedBy`), Action, Previous Value, New Value, Description, Complaint ID, and Timestamp.

---

## 15. Dashboard
- **Admin Dashboard:** Total complaints, pending, in-progress, resolved, closed, critical complaints, category/priority breakdowns, recent complaints, and agent workload.
- **Agent Dashboard:** Assigned totals, pending/in-progress/resolved counts, and recently assigned complaints.

---

## 16. File Attachments
- **Supported Formats:** Common document/image formats (`JPG`, `JPEG`, `PNG`, `PDF`).
- **Validation:** Enforce MIME type checking and file size limits (default 5 MB).
- **Storage & Security:** Generate safe filenames, restrict unauthorized file access, and reject dangerous file types. Local storage initially; extensible to cloud object storage.

---

## 17. Database Design

### User Collection
| Field | Type | Details |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `name` | String | Required, trimmed |
| `email` | String | Unique, lowercase, required |
| `password` | String | Hashed (bcrypt) |
| `role` | String | Enum: `user`, `agent`, `admin` |
| `department` | String | Optional |
| `createdAt` / `updatedAt` | Date | Timestamps |

### Complaint Collection
| Field | Type | Details |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `ticketId` | String | Unique identifier (e.g., `CMP-10024`) |
| `title` | String | Required, max 150 chars |
| `description` | String | Required |
| `category` | String | Enum: `Technical`, `Billing`, `Service`, `Other` |
| `priority` | String | Enum: `Low`, `Medium`, `High`, `Critical` |
| `status` | String | Enum: `Pending`, `In Progress`, `Resolved`, `Closed` |
| `createdBy` | ObjectId | Reference to `User` |
| `assignedTo` | ObjectId | Reference to `User` (Agent) |
| `attachments` | Array | URLs / File paths |
| `resolutionNotes` | String | Resolution details |
| `createdAt` / `updatedAt` | Date | Timestamps |

### Comment Collection
| Field | Type | Details |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `complaintId` | ObjectId | Reference to `Complaint` |
| `author` | ObjectId | Reference to `User` |
| `message` | String | Required |
| `isInternal` | Boolean | Default: `false` |
| `createdAt` | Date | Timestamp |

### Audit Collection
| Field | Type | Details |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `complaintId` | ObjectId | Reference to `Complaint` |
| `performedBy` | ObjectId | Reference to `User` (Actor) |
| `action` | String | Action performed |
| `previousValue` | Mixed | Previous value |
| `newValue` | Mixed | New value |
| `description` | String | Detailed description |
| `createdAt` | Date | Timestamp |

---

## 18. REST API Specification

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register a new user |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & return JWT |
| `POST` | `/api/v1/auth/logout` | Authenticated | Logout user |
| `POST` | `/api/v1/auth/forgot-password` | Public | Request password reset |
| `POST` | `/api/v1/auth/reset-password` | Public + Token | Reset password using token |
| `GET` | `/api/v1/users/me` | Authenticated | Fetch current user profile |
| `PUT` | `/api/v1/users/me` | Authenticated | Update user profile |
| `POST` | `/api/v1/complaints` | User | Create complaint with attachments |
| `GET` | `/api/v1/complaints` | User / Agent / Admin | List & filter complaints |
| `GET` | `/api/v1/complaints/:id` | Authorized | Fetch specific complaint details |
| `PATCH` | `/api/v1/complaints/:id/status` | Agent / Admin | Update complaint status |
| `PATCH` | `/api/v1/complaints/:id/assign` | Admin | Assign agent to complaint |
| `POST` | `/api/v1/complaints/:id/comments` | Authorized | Add public or internal comment |
| `PATCH` | `/api/v1/complaints/:id/reopen` | Owner / Admin | Reopen resolved/closed complaint |
| `GET` | `/api/v1/complaints/:id/audit` | Agent / Admin | View complaint audit history |

---

## 19. Standard API Responses

### Success Response
```json
{
  "success": true,
  "message": "Complaint created successfully",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid request",
  "errors": []
}
```

---

## 20. Security Requirements
- Protect against **NoSQL Injection**, **XSS**, and **Malicious File Uploads**.
- Validate and handle expired or invalid JWTs safely.
- Restrict unauthorized resource access via dynamic dynamic authorization checks.
- Guard against brute-force login attempts and excessive requests using rate limiting.
- Recommended tools & middleware: **Helmet**, **CORS**, Rate Limiting, Input Validation/Sanitization.

---

## 21. Performance & Scalability
- **Processing:** Asynchronous, non-blocking processing.
- **Indexing:** Database indexes on `email`, `ticketId`, `createdBy`, `assignedTo`, `status`, `category`, and `createdAt`.
- **Scaling:** Designed to support horizontal scaling, Redis caching, background job queues, load balancing, and cloud storage in future phases.

---

## 22. Error Handling
Centralized error-handling middleware to handle:
- Validation errors
- Authentication and Authorization errors
- Database errors
- File upload errors
- Resource Not Found errors
- Unexpected server errors

**Standard Status Codes:** `200`, `201`, `400`, `401`, `403`, `404`, `409`, `422`, `500`.

---

## 23. Recommended Backend Architecture
```text
backend/
├── public/
│   └── uploads/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── multer.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   └── complaint.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── upload.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── complaint.model.js
│   │   ├── comment.model.js
│   │   └── audit.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   └── complaint.routes.js
│   ├── utils/
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   ├── generateTicket.js
│   │   └── sendEmail.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 24. Environment Configuration
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/complaint_management
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
```

---

## 25. Key Workflows

### Complaint Creation Workflow
1. User Logged In $\rightarrow$ Submit Complaint Request.
2. Validate Input Fields $\rightarrow$ Validate File Attachments.
3. Generate Unique Ticket ID (e.g., `CMP-10024`).
4. Save Complaint to Database $\rightarrow$ Create Audit Log Entry.
5. Return Success Response with Complaint Details.

### Complaint Resolution Workflow
1. Initial Status: `Pending` $\rightarrow$ Assigned to Agent $\rightarrow$ Status: `In Progress`.
2. Resolution details added $\rightarrow$ Status: `Resolved` $\rightarrow$ Status: `Closed`.
3. *(Optional)* User Reopens Complaint $\rightarrow$ Status: `In Progress` $\rightarrow$ Resolution updated $\rightarrow$ `Resolved`.

---

## 26. Testing Requirements
- **Unit Tests:** Authentication, ticket generation utility, input validation schemas, authorization rules.
- **API Tests:** Registration, login, complaint creation/retrieval, assignment, status transition enforcement, comments, and reopening.
- **Security Tests:** Invalid JWTs, unauthorized endpoint access, malicious file upload attempts, NoSQL injection prevention.
- **Integration Tests:** Complete end-to-end complaint lifecycle.

---

## 27. Future Scope
- React / Next.js frontend implementation.
- WebSocket integration for real-time notifications and chat.
- Email, SMS, and WhatsApp notifications.
- Mobile applications (iOS / Android).
- AI-based complaint categorization, priority detection, and sentiment analysis.
- SLA monitoring and SLA breach warnings.
- Advanced analytics with CSV/PDF exports.
- Cloud object storage (AWS S3 / Cloudinary), Redis caching, background job queues, and multi-tenant support.

---

## 28. Success Metrics
- Average resolution time.
- SLA compliance rate.
- Agent response time.
- Reopened complaint percentage.
- User satisfaction score (CSAT).
- Pending complaint volume.
- Complaint volume categorized by type/department.

---

## 29. MVP Scope Matrix

| Phase | Features Included |
| :--- | :--- |
| **Must Have (MVP)** | Authentication, RBAC, Complaint Creation/List/Details, Agent Assignment, Status Updates, Comments, Internal Notes, Attachments, Audit Trail, Dashboard, Filtering & Pagination, Centralized Error Handling. |
| **Should Have** | Password Reset, Email Notifications, Advanced Analytics, Reopening Flow. |
| **Future** | Real-time Notifications (Sockets), Mobile App, AI Classification, SMS/WhatsApp Integration, Multi-tenancy. |

---

## 30. Final Product Vision
The Complaint Management System will provide a secure, transparent, and scalable complaint-resolution platform where users can easily submit and track grievances while agents and administrators efficiently manage the complete resolution lifecycle. The architecture remains modular so that future enhancements—such as AI automation and real-time updates—can be introduced seamlessly without major redesigns.