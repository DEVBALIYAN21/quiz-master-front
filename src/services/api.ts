
import { 
  AuthResponse, 
  CreateQuizRequest, 
  DetailedResult,
  LeaderboardEntry, 
  LoginRequest, 
  QuizResult, 
  QuizSubmission, 
  QuizWithQuestions, 
  RegisterRequest, 
  SearchParams, 
  SearchResponse,
  UserStats 
} from "@/types";

// Base API URL - should be configured via environment variable in production
const API_BASE_URL = "http://localhost:8056";

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// Get auth header with JWT token
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

// Authentication APIs
export const authAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },
};

// Quiz APIs
export const quizAPI = {
  createQuiz: async (data: CreateQuizRequest): Promise<QuizWithQuestions> => {
    const response = await fetch(`${API_BASE_URL}/quizzes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<QuizWithQuestions>(response);
  },

  getQuiz: async (quizCode: string): Promise<QuizWithQuestions> => {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizCode}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<QuizWithQuestions>(response);
  },

  submitQuiz: async (data: QuizSubmission): Promise<QuizResult> => {
    const response = await fetch(`${API_BASE_URL}/quizzes/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<QuizResult>(response);
  },

  searchQuizzes: async (params: SearchParams): Promise<SearchResponse> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/quizzes?${queryParams.toString()}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<SearchResponse>(response);
  },

  getLeaderboard: async (quizCode: string): Promise<LeaderboardEntry[]> => {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizCode}/leaderboard`, {
      headers: getAuthHeader(),
    });
    return handleResponse<LeaderboardEntry[]>(response);
  },
};

// User APIs
export const userAPI = {
  getUserStats: async (): Promise<UserStats> => {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      headers: getAuthHeader(),
    });
    return handleResponse<UserStats>(response);
  },
};

// Generate detailed result with correct/incorrect answers
export const generateDetailedResult = (
  result: QuizResult,
  quiz: QuizWithQuestions
): DetailedResult => {
  const answeredCorrectly = result.answers.map((answerIndex, questionIndex) => {
    const question = quiz.questions[questionIndex];
    return answerIndex === question.correctAnswerIndex;
  });

  return {
    ...result,
    quiz: quiz.quiz,
    questions: quiz.questions,
    answeredCorrectly,
  };
};
