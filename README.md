# TaskMate Student Planner

## Overview

TaskMate is a web application for managing academic tasks in a centralized and structured way.
It helps students track deadlines, priorities, and progress using a simple workflow (Todo → In Progress → Done).

---

## Features

* Create, edit and delete tasks
* Task status management (Todo / In Progress / Done)
* Deadlines and priorities
* Highlight overdue and due-today tasks
* Organize tasks by subjects
* Filtering and sorting
* Progress tracking

---

## Architecture

The application follows a client–server architecture:

* **Frontend**: React (Vite, TypeScript)
* **Backend**: ASP.NET Core Web API
* **Database**: SQL Server
* **Infrastructure**: Docker & Docker Compose

---

## Technologies

* React
* TypeScript
* ASP.NET Core Web API
* SQL Server
* Docker & Docker Compose
* JWT Authentication

---

## Setup & Running the Project

### Prerequisites

* Docker
* Docker Compose

---

### 1. Configure environment variables

This project uses environment variables for local configuration.

A `.env.example` file is provided at the project root.
Create a local `.env` file based on it before running the application.

> Note: `.env` is ignored by Git and should not be committed.

#### Setup

Copy `.env.example` to `.env` and adjust the values if needed.

Example variables included in the project:

* `DB_SA_PASSWORD` – SQL Server password used by the database container
* `CONNECTION_STRING` – database connection string used by the backend
* `JWT_KEY` – secret key used to sign JWT tokens
* `JWT_ISSUER` – JWT issuer value
* `JWT_AUDIENCE` – JWT audience value
* `JWT_EXPIRES_IN_HOURS` – token expiration time in hours
* `BACKEND_URL` – backend base URL used for local development/documentation
* `VITE_API_URL` – frontend API base URL used by the frontend application
* `ACCEPT_EULA` – required variable for the SQL Server Docker container

---

### 2. Start the application

Run the following command from the project root:

```bash id="6r0t8b"
docker compose up --build
```

---

### 3. Access the application

* Frontend: http://localhost:5173
* Backend API: http://localhost:8080
* Swagger: http://localhost:8080/swagger

---

### 4. View logs

```bash id="m0zj7c"
docker compose logs -f
```

For backend only:

```bash id="rmtc9r"
docker compose logs -f backend
```

---

## Logging

The backend uses ASP.NET Core built-in logging.

* Request logging
* Authentication events
* Error and exception logging
* Logs available via Docker

---

## Production

Production configuration and URLs will be added after deployment is implemented.
