# Online Quiz Platform Backend

This is the backend for an online quiz platform developed by **Dev Baliyan**. It provides a RESTful API for user authentication, quiz creation, quiz submission, and quiz management, built with **Go**, **Gin**, and **MongoDB**. Users can register, create quizzes, attempt quizzes, view their statistics, and retrieve detailed results for quizzes they have hosted.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Running the Application](#running-the-application)
- [Editing the Code](#editing-the-code)
- [Testing](#testing)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Authentication**: Register and login with JWT-based authentication.
- **Quiz Management**: Create, retrieve, and manage quizzes with questions and answers.
- **Quiz Submission**: Submit quiz answers and calculate scores with percentage.
- **Quiz Details**: View detailed quiz results, including student performance, for quiz owners.
- **User Statistics**: Track user performance with metrics like quizzes taken, average score, and highest score.
- **Leaderboard**: View top performers for a specific quiz.
- **Search Quizzes**: Search public quizzes by title, category, or difficulty.
- **User Quizzes**: Retrieve all quizzes created by a user with detailed information.
- **Pagination**: Support for paginated responses in search and user quizzes endpoints.
- **CORS Support**: Configurable Cross-Origin Resource Sharing for front-end integration.

## Tech Stack
- **Language**: Go (Golang)
- **Web Framework**: Gin
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Environment Management**: godotenv
- **CORS**: gin-contrib/cors

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd onlinequiz
   ```

2. **Install Go**:
   Ensure Go (version 1.16 or later) is installed. Download from [golang.org](https://golang.org/dl/).

3. **Install MongoDB**:
   Install MongoDB (Community Edition) and ensure it's running locally or on a remote server. Follow instructions at [mongodb.com](https://www.mongodb.com/docs/manual/installation/).

4. **Install Dependencies**:
   Run the following command to install required Go modules:
   ```bash
   go mod tidy
   ```

5. **Configure Environment Variables**:
   Create a `.env` file in the project root and add the following:
   ```env
   MONGO_URI=mongodb://localhost:27017
   DB_NAME=quizdb
   JWT_SECRET=your_jwt_secret_key
   ALLOWED_ORIGIN=http://localhost:3000
   PORT=8056
   ```
   - `MONGO_URI`: MongoDB connection string.
   - `DB_NAME`: Name of the MongoDB database.
   - `JWT_SECRET`: Secret key for JWT signing (use a strong, unique key).
   - `ALLOWED_ORIGIN`: Allowed origin for CORS (e.g., front-end URL or `*` for all).
   - `PORT`: Port for the API server (default: 8056).

6. **Run MongoDB**:
   Start your MongoDB server:
   ```bash
   mongod
   ```

## Environment Variables
The application uses the following environment variables:
| Variable         | Description                                      | Default       |
|------------------|--------------------------------------------------|---------------|
| `MONGO_URI`      | MongoDB connection string                       | -             |
| `DB_NAME`        | MongoDB database name                           | -             |
| `JWT_SECRET`     | Secret key for JWT authentication               | -             |
| `ALLOWED_ORIGIN` | Allowed origin for CORS (e.g., front-end URL)   | -             |
| `PORT`           | Port for the API server                         | `8056`        |

## API Endpoints
All endpoints are prefixed with `/`. Protected endpoints require a `Bearer` token in the `Authorization` header.

### Authentication
- **POST /register**
  - Register a new user.
  - Body: `{ "username": "string", "email": "string", "password": "string" }`
  - Response: `201 Created` with user details and JWT token.

- **POST /login**
  - Login an existing user.
  - Body: `{ "email": "string", "password": "string" }`
  - Response: `200 OK` with user details and JWT token.

### Quiz Management
- **POST /quizzes** (Protected)
  - Create a new quiz with questions.
  - Body: `{ "quiz": { "title": "string", "description": "string", "isPublic": bool, "category": "string", "difficulty": "string", "timeLimit": int }, "questions": [{ "questionText": "string", "options": ["string"], "correctAnswerIndex": int, "explanationText": "string" }] }`
  - Response: `201 Created` with quiz details and questions.

- **GET /quizzes/:quizCode** (Protected)
  - Retrieve a quiz by its code.
  - Response: `200 OK` with quiz and questions.

- **GET /quizzes/:quizCode/details** (Protected)
  - Retrieve detailed results for a quiz (only for the quiz owner).
  - Response: `200 OK` with quiz, questions, attempt count, average score, and student results.

- **GET /users/quizzes** (Protected)
  - Retrieve all quizzes created by the authenticated user with detailed information.
  - Query Params: `limit` (default: 10), `page` (default: 1)
  - Response: `200 OK` with a list of quiz details, total count, and pagination info.

- **POST /quizzes/submit** (Protected)
  - Submit answers for a quiz.
  - Body: `{ "userId": "string", "quizId": "string", "answers": [int] }`
  - Response: `200 OK` with quiz result (score, percentage, etc.).

- **GET /quizzes** (Protected)
  - Search public quizzes.
  - Query Params: `q` (search query), `category`, `difficulty`, `sort_by`, `order`, `limit`, `page`
  - Response: `200 OK` with a list of quizzes, total count, and pagination info.

- **GET /quizzes/:quizCode/leaderboard** (Protected)
  - Retrieve the leaderboard for a quiz.
  - Response: `200 OK` with a list of top performers.

### User Management
- **GET /users/stats** (Protected)
  - Retrieve statistics for the authenticated user.
  - Response: `200 OK` with user stats (quizzes taken, created, scores, etc.).

## Running the Application
1. Ensure MongoDB is running and the `.env` file is configured.
2. Run the application:
   ```bash
   go run main.go
   ```
3. The server will start on the specified port (default: `http://localhost:8056`).
4. Test the API using tools like **Postman** or **curl**.

## Editing the Code
There are several ways to edit the application code:

### Use Your Preferred IDE
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd onlinequiz
   ```
2. Install dependencies:
   ```bash
   go mod tidy
   ```
3. Open the project in your IDE (e.g., VS Code, GoLand).
4. Make changes, test locally, and push to the repository:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

### Edit Directly in GitHub
1. Navigate to the desired file in the GitHub repository.
2. Click the "Edit" button (pencil icon) at the top right of the file view.
3. Make changes and commit with a descriptive message.

### Use GitHub Codespaces
1. Go to the main page of the repository on GitHub.
2. Click the "Code" button (green button) and select the "Codespaces" tab.
3. Click "New codespace" to launch an online development environment.
4. Edit files, commit, and push changes directly from Codespaces.

## Testing
To test the application:
1. Use a tool like **Postman** or **curl** to send requests to the API endpoints.
2. Write unit tests using Go's `testing` package or a framework like `testify`.
3. Example test cases:
   - Register a user and verify the JWT token.
   - Create a quiz and retrieve it by quiz code.
   - Submit quiz answers and check the calculated score.
   - Verify quiz details are accessible only to the owner.
   - Test pagination in `/users/quizzes` and `/quizzes`.

## Dependencies
The application uses the following Go modules:
- `github.com/dgrijalva/jwt-go`: For JWT authentication.
- `github.com/gin-contrib/cors`: For CORS support.
- `github.com/gin-gonic/gin`: Web framework.
- `github.com/joho/godotenv`: For environment variable management.
- `go.mongodb.org/mongo-driver`: MongoDB driver.
- `golang.org/x/crypto/bcrypt`: For password hashing.

Install dependencies:
```bash
go mod tidy
```

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

Please ensure your code follows Go best practices and includes tests.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.