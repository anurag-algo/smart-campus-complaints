# ResolveHub — Complaint Management System

ResolveHub is a web-based complaint management system designed to help users submit, track, and manage complaints through a centralized platform.

The project is being developed using a separate frontend and backend architecture.

## Project Status

**Version:** v1.0
**Frontend:** React + Vite
**Backend:** Under Development

## Features

### User Interface

* Responsive dashboard
* Sidebar navigation
* User login and registration screens
* User profile page

### Complaint Management

* Submit new complaints
* View submitted complaints
* Search and filter complaints
* View complaint details
* Display complaint status

### Dashboard

* Complaint statistics
* Total complaints
* Pending complaints
* Resolved complaints

## Tech Stack

### Frontend

* React.js
* Vite
* React Router DOM
* Lucide React
* CSS

### Backend

Backend technology and API specifications will be documented after integration.

## Project Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   └── Status.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── NewComplaint.jsx
│   │   ├── MyComplaints.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Profile.jsx
│   ├── data.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
└── vite.config.js
```

## Getting Started

### Prerequisites

* Node.js
* npm
* Git

### Installation

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal.

## Backend Integration

The current frontend is a UI prototype. Complaint data and demo authentication use browser-side/local demo behavior.

The backend integration will require:

* User registration API
* User login and authentication API
* Create complaint API
* Fetch user complaints API
* Fetch complaint details API
* Update complaint status API
* User profile API

### Suggested Complaint Data Model

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "status": "Pending",
  "createdAt": "ISO-8601 date",
  "userId": "string"
}
```

The final API routes, validation rules, authentication mechanism, and response formats will be decided jointly during backend integration.

## Development Notes

* Keep frontend and backend dependencies separate.
* Use environment variables for API base URLs.
* Do not commit secrets, credentials, or `.env` files.
* Coordinate API contracts before connecting frontend pages to backend endpoints.

## Future Improvements

* Real authentication
* Database integration
* Complaint assignment
* Admin dashboard
* Complaint status updates
* Notifications
* File attachments
* Deployment

## Contributors

* Frontend: Suresh
* Backend: Project collaborator

## License

This project is currently under development.
