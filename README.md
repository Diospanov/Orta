# Orta

A full-stack team management web application with a FastAPI backend and a React frontend.

## Problem Statement

Many student and small team projects need a simple way to manage users, teams, and join requests in one place. Orta aims to solve this by providing a web application where users can register, log in, create teams, browse teams, and manage membership requests.

## Project Structure

```text
Orta/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
```

## Features

- User registration and login
- Profile management
- Team creation
- Browse available teams
- View joined or created teams
- Send join requests
- Manage team membership requests
- Separate backend and frontend structure

## Installation Steps

### 1. Clone the repository

```bash
git clone https://github.com/K-Abdulazym/Orta.git
cd Orta/Orta
```
## Usage Instructions

1. Install requirements
2. Start the backend server. cd Orta\backend, uvicorn app.main:app --reload
3. Start the frontend server. new terminal cd Orta\frontend, npm run dev   -> nodejs required
4. Open the frontend in your browser. open index.html
5. Register a new account or log in.
6. Browse teams, create a team, and manage join requests.

## Technology Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS