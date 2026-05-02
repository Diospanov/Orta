# Orta

Orta is a full-stack team collaboration platform built with **FastAPI** and **React**.

It helps users create teams, browse available teams, request to join teams, manage members, and collaborate inside a team workspace using messages, goals, schedules, and file sharing.

---

## Live Demo

- **Frontend:** https://orta-tau.vercel.app
- **Backend API:** Add your Render backend URL here
- **API Documentation:** Add your backend URL with `/docs`

Example:

```txt
https://your-backend.onrender.com/docs
```

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project Locally](#running-the-project-locally)
- [Main API Endpoints](#main-api-endpoints)
- [Deployment](#deployment)
- [Common Problems](#common-problems)
- [Future Improvements](#future-improvements)
- [Team Members](#team-members)
- [Project Status](#project-status)

---

## About the Project

Many student projects, university groups, and small teams need a simple platform where they can organize members, manage join requests, communicate, and track team activities.

**Orta** solves this problem by providing a web application where users can:

- Register and log in
- Create their own teams
- Browse public teams
- Request to join teams
- Manage team members
- Communicate in a team workspace
- Track team goals and schedules
- Upload and share team files

The project is separated into two main parts:

- **Backend:** FastAPI REST API with PostgreSQL database support
- **Frontend:** React + Vite user interface styled with Tailwind CSS

---

## Features

### Authentication

- User registration
- User login
- JWT-based authentication
- Protected routes for authenticated users
- User profile page

### Team Management

- Create teams
- Browse public teams
- Search teams
- Paginated team browsing
- View teams joined by the current user
- View team details
- Leave a team
- Owner/admin team management

### Join Requests

- Send join requests to teams
- View join requests for a team
- Accept join requests
- Reject join requests
- Prevent duplicate team membership logic

### Team Workspace

Inside a team workspace, members can collaborate using:

- Team overview
- Team member list
- Team messages
- Real-time WebSocket communication
- Team goals
- Team schedule/events
- Team file uploads
- Team settings

### Team Admin Features

Team owners can:

- Edit team information
- Update member roles
- Remove members
- Manage join requests
- Transfer ownership, if enabled in the backend

### File Sharing

- Upload team files
- Store files using Supabase Storage
- View uploaded files
- Delete team files

---

## Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- Async SQLAlchemy
- PostgreSQL
- Alembic
- Pydantic
- JWT authentication
- WebSockets
- Supabase Storage

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- JavaScript

### Tools and Services

- Git and GitHub
- Render or similar backend hosting
- Vercel or similar frontend hosting
- Supabase for file storage
- PostgreSQL database

---

## Project Structure

```bash
Orta/
├── Orta/
│   ├── backend/
│   │   ├── alembic/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   ├── models/
│   │   │   ├── routers/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   └── main.py
│   │   ├── alembic.ini
│   │   └── requirements.txt
│   │
│   └── frontend/
│       ├── public/
│       ├── src/
│       │   ├── assets/
│       │   ├── components/
│       │   ├── context/
│       │   ├── pages/
│       │   ├── App.jsx
│       │   ├── api.js
│       │   └── main.jsx
│       ├── package.json
│       └── vite.config.js
│
├── .gitignore
├── AUTID.md
└── README.md
```

---

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- Python
- Node.js and npm
- PostgreSQL database
- Git

Optional services:

- Supabase account for file storage
- Render account for backend deployment
- Vercel account for frontend deployment

---

## Environment Variables

Create a `.env` file inside the backend folder:

```bash
Orta/Orta/backend/.env
```

Example:

```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/orta_db

SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_BUCKET=team-files
```

### Important Notes

- Do not commit your `.env` file to GitHub.
- Use a strong value for `SECRET_KEY`.
- For Supabase, use a service role key only on the backend, never in frontend code.
- If you deploy the backend, add the same environment variables in your hosting provider.

---

## Running the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Diospanov/Orta.git
cd Orta
```

### 2. Run the Backend

Go to the backend folder:

```bash
cd Orta/backend
```

Create and activate a virtual environment.

#### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

#### macOS/Linux

```bash
python -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
alembic upgrade head
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The backend should run at:

```txt
http://127.0.0.1:8000
```

FastAPI documentation:

```txt
http://127.0.0.1:8000/docs
```

### 3. Run the Frontend

Open another terminal and go to the frontend folder:

```bash
cd Orta/frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend should run at:

```txt
http://localhost:5173
```

---

## Main API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Log in and receive access token |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update current user profile |

### Teams

| Method | Endpoint | Description |
|---|---|---|
| POST | `/teams/` | Create a new team |
| GET | `/teams/` | Browse public teams |
| GET | `/teams/?page=1&size=9` | Browse teams with pagination |
| GET | `/teams/?search=value` | Search teams |
| GET | `/teams/me` | Get teams joined by current user |
| GET | `/teams/{team_id}` | Get team details |
| PATCH | `/teams/{team_id}` | Update team information |
| POST | `/teams/{team_id}/join` | Request to join a team |
| DELETE | `/teams/{team_id}/leave` | Leave a team |
| GET | `/teams/{team_id}/members` | Get team members |
| DELETE | `/teams/{team_id}/members/{member_user_id}` | Remove a team member |
| PATCH | `/teams/{team_id}/members/{member_user_id}/role` | Update a member role |

### Team Workspace

| Method | Endpoint | Description |
|---|---|---|
| GET | `/teams/{team_id}/workspace` | Open team workspace |
| GET | `/teams/{team_id}/messages` | Get team messages |
| WebSocket | `/teams/{team_id}/ws?token=ACCESS_TOKEN` | Real-time team communication |

### Join Requests

| Method | Endpoint | Description |
|---|---|---|
| GET | `/join-requests/team/{team_id}` | Get join requests for a team |
| POST | `/join-requests/{request_id}/accept` | Accept a join request |
| POST | `/join-requests/{request_id}/reject` | Reject a join request |

### Goals, Schedule, and Files

If the team workspace feature router is enabled in the backend, the project can also support:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/teams/{team_id}/goals` | Get team goals |
| POST | `/teams/{team_id}/goals` | Create a team goal |
| PATCH | `/teams/{team_id}/goals/{goal_id}` | Update a team goal |
| DELETE | `/teams/{team_id}/goals/{goal_id}` | Delete a team goal |
| GET | `/teams/{team_id}/schedule` | Get team schedule |
| POST | `/teams/{team_id}/schedule` | Create schedule event |
| PATCH | `/teams/{team_id}/schedule/{event_id}` | Update schedule event |
| DELETE | `/teams/{team_id}/schedule/{event_id}` | Delete schedule event |
| GET | `/teams/{team_id}/files` | Get team files |
| POST | `/teams/{team_id}/files` | Upload team file |
| DELETE | `/teams/{team_id}/files/{file_id}` | Delete team file |

---

## Deployment

### Backend Deployment

The backend can be deployed on services such as Render.

General steps:

1. Create a new web service.
2. Connect the GitHub repository.
3. Set the backend root directory:

```txt
Orta/backend
```

4. Add environment variables from the `.env` file.
5. Use this build command:

```bash
pip install -r requirements.txt
```

6. Use this start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

7. After deployment, open:

```txt
https://your-backend-url.onrender.com/docs
```

### Frontend Deployment

The frontend can be deployed on Vercel.

General steps:

1. Create a new Vercel project.
2. Connect the GitHub repository.
3. Set the frontend root directory:

```txt
Orta/frontend
```

4. Use this build command:

```bash
npm run build
```

5. Use this output directory:

```txt
dist
```

6. Make sure the frontend API base URL points to the deployed backend URL.

---

## Common Problems

### CORS Error

If the frontend cannot connect to the backend, check the allowed origins in the backend CORS configuration.

For local development, these should be allowed:

```txt
http://localhost:5173
http://127.0.0.1:5173
```

For deployment, your Vercel frontend URL should also be allowed.

### Database Connection Error

Check that:

- `DATABASE_URL` is correct
- PostgreSQL is running
- The database exists
- Alembic migrations were applied

Run:

```bash
alembic upgrade head
```

### Environment Variable Error

If the backend does not start, make sure the backend `.env` file contains all required values:

```env
DATABASE_URL=
SECRET_KEY=
ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=
```

### WebSocket Connection Error

For team chat and call signaling, make sure:

- The user is authenticated
- The token is passed in the WebSocket URL
- Both users are inside the same team workspace
- The deployed backend supports WebSocket connections
- The frontend uses `wss://` for deployed HTTPS websites

---

## Future Improvements

Possible improvements for future versions:

- Better notification system for join requests and calls
- More advanced team roles and permissions
- Improved real-time calling reliability using TURN servers
- Better file preview support
- Message read receipts
- Team activity history
- Advanced search and filters
- Unit and integration tests
- Better mobile responsiveness
- CI/CD workflow for automatic deployment

---

## Team Members

- 230103163
- 230103300
- 230103218
- 230107142

---

## Project Status

This project was developed as a full-stack web application for team collaboration. It demonstrates backend API development, authentication, database management, frontend routing, real-time communication, deployment, and file storage integration.
