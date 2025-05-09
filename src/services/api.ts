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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';



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
    const userJSON = localStorage.getItem("user");
    if (!userJSON) {
      throw new Error("User not found in localStorage");
    }
    
    const user = JSON.parse(userJSON);
    console.log("User:", user);

    const requestData = {
      ...data,
      quiz: {
        ...data.quiz,
        hostedBy: user.id,
      },
    };
    console.log("Request Data:", requestData);

    const response = await fetch(`${API_BASE_URL}/quizzes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(requestData),
    });

    const savedQuiz = await handleResponse<QuizWithQuestions>(response);
    console.log("Saved Quiz:", savedQuiz);

    return savedQuiz;
  },

  getQuiz: async (quizCode: string): Promise<QuizWithQuestions> => {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizCode}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<QuizWithQuestions>(response);
  },

  getQuizDetails: async (quizCode: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizCode}/details`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getUserQuizzes: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/users/quizzes`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getUserAttemptedQuizzes: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/users/attempted-quizzes`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
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
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/quizzes?${queryParams.toString()}`, {
        headers: getAuthHeader(),
      });
      
      const data = await handleResponse<SearchResponse>(response);
      
      return {
        quizzes: data.quizzes || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10
      };
    } catch (error) {
      console.error("Search quizzes error:", error);
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
      return data || [];
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
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
      const data = await handleResponse<UserStats>(response);
      console.log("User Stats from API:", data);
      return data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
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

  getAttemptedQuizzes: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/attempted-quizzes`, {
        headers: getAuthHeader(),
      });
      const data = await handleResponse<any>(response);
      return data;
    } catch (error) {
      console.error("Error fetching attempted quizzes:", error);
      return {
        quizzes: [],
        total: 0,
        page: 1,
        limit: 10
      };
    }
  }
};

// Generate detailed result with correct/incorrect answers
export const generateDetailedResult = (
  result: QuizResult,
  quiz: QuizWithQuestions
): DetailedResult => {
  if (!result || !quiz || !result.answers || !quiz.questions) {
    console.error("Invalid data for generateDetailedResult", { result, quiz });
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
