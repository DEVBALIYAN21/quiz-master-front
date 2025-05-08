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
    // Get the user from localStorage to include the userId in the request
    const userJSON = localStorage.getItem("user");
    if (!userJSON) {
      throw new Error("User not found in localStorage");
    }
    
    const user = JSON.parse(userJSON);
    console.log("User:", user); // Log user object to debug

    // Clone the data object and add the hostedBy field to the quiz
    const requestData = {
      ...data,
      quiz: {
        ...data.quiz,
        hostedBy: user.id,
      },
    };
    console.log("Request Data:", requestData); // Log the request data before sending

    const response = await fetch(`${API_BASE_URL}/quizzes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(requestData),
    });

    const savedQuiz = await handleResponse<QuizWithQuestions>(response);
    console.log("Saved Quiz:", savedQuiz); // Log the saved quiz response to debug

    return savedQuiz;
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
    try {
      const queryParams = new URLSearchParams();
      
      // Only add valid parameters to the query
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/quizzes?${queryParams.toString()}`, {
        headers: getAuthHeader(),
      });
      
      const data = await handleResponse<SearchResponse>(response);
      
      // Ensure we return a valid SearchResponse even if the backend returns partial data
      return {
        quizzes: data.quizzes || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10
      };
    } catch (error) {
      console.error("Search quizzes error:", error);
      // Return a default response on error to prevent null/undefined errors
      return {
        quizzes: [],
        total: 0,
        page: 1,
        limit: 10
      };
    }
  },

  getLeaderboard: async (quizCode: string): Promise<LeaderboardEntry[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/quizzes/${quizCode}/leaderboard`, {
        headers: getAuthHeader(),
      });
      const data = await handleResponse<LeaderboardEntry[]>(response);
      return data || []; // Return empty array if null/undefined
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return []; // Return empty array on error
    }
  },
};

// User APIs
export const userAPI = {
  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        headers: getAuthHeader(),
      });
      // Use handleResponse directly instead of reading the response twice
      const data = await handleResponse<UserStats>(response);
      console.log("User Stats from API:", data);  // Log the API response
      return data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      // Return default user stats on error
      return {
        totalQuizzesTaken: 0,
        totalQuizzesCreated: 0,
        totalPoints: 0,
        averageScore: 0,
        highestScore: 0,
        highestPercentage: 0,
        recentResults: [],
        recentQuizzes: [],
        categoryBreakdown: {},
        scoreDistribution: {}
      };
    }
  },
};


// Generate detailed result with correct/incorrect answers
export const generateDetailedResult = (
  result: QuizResult,
  quiz: QuizWithQuestions
): DetailedResult => {
  if (!result || !quiz || !result.answers || !quiz.questions) {
    console.error("Invalid data for generateDetailedResult", { result, quiz });
    // Return a minimal valid DetailedResult to prevent errors
    return {
      userId: result?.userId || "",
      quizId: result?.quizId || "",
      score: result?.score || 0,
      totalScore: result?.totalScore || 0,
      percentage: result?.percentage || 0,
      answers: result?.answers || [],
      quiz: quiz?.quiz || { 
        title: "Unknown Quiz", 
        description: "Quiz data unavailable", 
        isPublic: false, 
        category: "Unknown", 
        difficulty: "Medium", 
        timeLimit: 0 
      },
      questions: quiz?.questions || [],
      answeredCorrectly: []
    };
  }

  const answeredCorrectly = result.answers.map((answerIndex, questionIndex) => {
    const question = quiz.questions[questionIndex];
    return answerIndex === question?.correctAnswerIndex;
  });

  return {
    ...result,
    quiz: quiz.quiz,
    questions: quiz.questions,
    answeredCorrectly,
  };
};