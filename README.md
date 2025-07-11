# Online Quiz Platform Frontend

This is the front-end for an online quiz platform developed by **Dev Baliyan**. It provides a user interface for users to register, log in, create quizzes, attempt quizzes, view leaderboards, and manage their quiz statistics. The front-end is built with **React**, **TypeScript**, **Vite**, **shadcn-ui**, and **Tailwind CSS**, and it connects to a Go-based backend API for data management.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Editing the Code](#editing-the-code)
- [Testing](#testing)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Authentication**: Register and log in with a clean, responsive interface.
- **Quiz Creation**: Create quizzes with questions and answers, sent to the backend API.
- **Quiz Taking**: Attempt quizzes with a timed interface and immediate feedback.
- **Quiz Management**: View detailed results for quizzes you created, including student performance.
- **User Dashboard**: Display user statistics like quizzes taken, created, and average scores.
- **Leaderboard**: View top performers for each quiz.
- **Quiz Search**: Search public quizzes by title, category, or difficulty.
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS and shadcn-ui components.
- **Type Safety**: Built with TypeScript for robust type checking.

## Tech Stack
- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd quiz-platform-frontend
   ```

2. **Install Node.js**:
   Ensure Node.js (version 16 or later) and npm are installed. Install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) or download from [nodejs.org](https://nodejs.org/).

3. **Install Dependencies**:
   Run the following command to install required npm packages:
   ```bash
   npm install
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in the project root and add the following:
   ```env
   VITE_API_URL=http://localhost:8056
   ```
   - `VITE_API_URL`: URL of the backend API (default matches the Go backend's port).

5. **Ensure Backend is Running**:
   The front-end requires the Go-based backend to be running. Follow the backend's setup instructions to start it (e.g., on `http://localhost:8056`).

## Environment Variables
The application uses the following environment variables:
| Variable        | Description                          | Default                  |
|-----------------|--------------------------------------|--------------------------|
| `VITE_API_URL`  | URL of the backend API              | `http://localhost:8056`  |

## Running the Application
1. Ensure the backend API is running.
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:5173` (or the port shown in the terminal).
4. The application will auto-reload on code changes.

## Editing the Code
There are several ways to edit the application code:

### Use Your Preferred IDE
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd quiz-platform-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Open the project in your IDE (e.g., VS Code, WebStorm).
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
1. Use a browser to interact with the UI and verify functionality (e.g., register, create a quiz, submit answers).
2. Write unit tests using a framework like **Jest** or **Vitest** (if set up in the project).
3. Test API integration by ensuring the front-end correctly communicates with the backend.
4. Example test cases:
   - Verify user registration and login.
   - Ensure quiz creation submits data to the backend.
   - Check that quiz results display correctly for owners.
   - Test responsive design on mobile and desktop.

## Dependencies
The application uses the following npm packages (check `package.json` for exact versions):
- `react`: JavaScript library for building user interfaces.
- `react-dom`: Entry point for React to the DOM.
- `typescript`: TypeScript for type safety.
- `vite`: Build tool for fast development and production builds.
- `@radix-ui/*`: Core of shadcn-ui components.
- `tailwindcss`: Utility-first CSS framework.
- `axios` or `fetch`: For API requests (assumed, adjust based on your project).

Install dependencies:
```bash
npm install
```

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

Please ensure your code follows TypeScript and React best practices and includes tests where applicable.

