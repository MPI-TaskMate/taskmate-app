## Environment Variables

This project uses environment variables for local configuration.

A `.env.example` file is provided at the project root.  
Create a local `.env` file based on it before running the application.

> Note: `.env` is ignored by Git and should not be committed.

### Setup

Copy `.env.example` to `.env` and adjust the values if needed.

Example variables included in the project:

- `DB_SA_PASSWORD` – SQL Server password used by the database container
- `CONNECTION_STRING` – database connection string used by the backend
- `JWT_KEY` – secret key used to sign JWT tokens
- `JWT_ISSUER` – JWT issuer value
- `JWT_AUDIENCE` – JWT audience value
- `JWT_EXPIRES_IN_HOURS` – token expiration time in hours
- `BACKEND_URL` – backend base URL used for local development/documentation
- `VITE_API_URL` – frontend API base URL used by the frontend application
- `ACCEPT_EULA` – required variable for the SQL Server Docker container

### Local Run with Docker

After creating the `.env` file, start the project with:

```bash
docker compose up --build