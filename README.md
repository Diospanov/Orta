# Orta

Orta is a full-stack team collaboration platform built with **FastAPI** and **React**.  
It helps users create teams, browse available teams, request to join teams, manage members, and work inside a team workspace with messages, goals, schedules, and file sharing.

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Main API Endpoints](#main-api-endpoints)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [Author](#author)

## About the Project

Many student projects, university groups, and small teams need a simple platform where they can organize members, manage join requests, communicate, and track team activities.

Orta solves this by providing a web application where users can:

- Register and log in
- Create their own teams
- Browse public teams
- Request to join teams
- Manage team members
- Use a team workspace for collaboration

The project is separated into two main parts:

- **Backend**: FastAPI REST API with PostgreSQL database support
- **Frontend**: React + Vite user interface styled with Tailwind CSS

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

- Send join requests
- View requests for a team
- Accept join requests
- Reject join requests

### Team Workspace

Inside a team workspace, members can use collaboration features such as:

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
- Transfer ownership

### File Sharing

- Upload team files
- Store files using Supabase Storage
- View uploaded files
- Delete team files

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

### Tools

- Git and GitHub
- Render or similar backend hosting
- Vercel or similar frontend hosting
- Supabase for file storage
- PostgreSQL database

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

## Team Members

- 230103163
- 230103300
- 230103218
- 230107142