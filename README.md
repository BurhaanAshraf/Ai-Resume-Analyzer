# AI Resume Analyser

AI Resume Analyser is a full stack application that lets users upload resume PDFs and receive AI powered ATS feedback. The backend provides authentication, resume upload, cloud storage, and analysis services. The frontend delivers a React interface for user registration, login, dashboard viewing, and analysis details.

## Project Structure

- `backend` contains the Express API, MongoDB models, Redis token storage, Cloudinary upload service, and AI analysis integration.
- `frontend` contains the Vite React app, authentication context, file upload UI, resume dashboard, and analysis pages.

## Backend Features

- User registration and login with JWT access token and Redis backed refresh tokens.
- Resume upload endpoint for PDF files with file validation and size limit.
- Cloudinary storage for uploaded PDF resumes.
- PDF text extraction service.
- AI resume analysis service using Groq.
- Protected resume and analysis routes.
- Central error handling middleware.

## Frontend Features

- React application built with Vite.
- Authentication flow with login and signup pages.
- Protected routes for dashboard and analysis pages.
- Resume upload modal with drag and drop support.
- Resume list with processing status and delete action.
- Analysis page with ATS score, feedback, strengths, improvements, and keyword match.

## Local Setup

### Backend

1. Open a terminal and navigate to `backend`.
2. Install dependencies with `npm install`.
3. Create a `.env` file with these environment variables:
   - `MONGODB_URI`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `GROQ_API_KEY`
   - `FRONTEND_URL` (optional, defaults to `http://localhost:5173`)

4. Start the backend server with:

   ```bash
   npm run dev
   ```

### Frontend

1. Open a terminal and navigate to `frontend`.
2. Install dependencies with `npm install`.
3. Update `frontend/.env.production` if needed to point to the backend API.
4. Start the frontend development server with:

   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/auth/register` for user signup.
- `POST /api/auth/login` for user login.
- `POST /api/auth/refresh` for refresh token rotation.
- `POST /api/auth/logout` to clear the refresh token.
- `GET /api/auth/me` to fetch current user details.
- `POST /api/resumes` to upload a resume PDF.
- `GET /api/resumes` to list user resumes.
- `GET /api/resumes/:id` to fetch a resume record.
- `DELETE /api/resumes/:id` to delete a resume and related analysis.
- `GET /api/analysis/:resumeId` to get analysis results.
- `POST /api/analysis/:resumeId/retry` to retry analysis for a resume.

## Notes

- The backend uses `cookie-parser` to manage refresh tokens.
- The frontend uses Axios interceptors to refresh access tokens automatically.
- Uploaded resumes are stored as raw files in Cloudinary.
- Analysis results are stored in MongoDB and linked to resume records.

## Recommended Run Order

1. Start the backend server.
2. Start the frontend app.
3. Open the frontend in the browser and register a new user.
4. Upload a resume PDF and view analysis once processing completes.
