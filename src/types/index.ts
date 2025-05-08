
// User types
export interface User {
  id: string;
  username: string;
  email: string;
  quizzesTaken: number;
  quizzesCreated: number;
  averageScore: number;
  highestScore: number;
  highestPercentage: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Quiz types
export interface Quiz {
  id?: string;
  quizCode?: string;
  title: string;
  description: string;
  hostedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  questions?: string[];
  isPublic: boolean;
  category: string;
  difficulty: string;
  timeLimit: number;
  attemptCount?: number;
  avgScore?: number;
}

export interface Question {
  id?: string;
  quizId?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanationText: string;
  createdAt?: string;
}

export interface QuizWithQuestions {
  quiz: Quiz;
  questions: Question[];
}

export interface CreateQuizRequest {
  quiz: Quiz;
  questions: Question[];
}

// Result types
export interface QuizSubmission {
  userId: string;
  quizId: string;
  answers: number[];
}

export interface QuizResult {
  id?: string;
  userId: string;
  quizId: string;
  score: number;
  totalScore: number;
  percentage: number;
  submittedAt?: string;
  answers: number[];
}

export interface DetailedResult extends QuizResult {
  quiz: Quiz;
  questions: Question[];
  answeredCorrectly: boolean[];
}

// User stats
export interface UserStats {
  totalQuizzesTaken: number;
  totalQuizzesCreated: number;
  totalPoints: number;
  averageScore: number;
  highestScore: number;
  highestPercentage: number;
  recentResults: QuizResult[];
  recentQuizzes: Quiz[];
  categoryBreakdown: Record<string, number>;
  scoreDistribution: Record<string, number>;
}

// Leaderboard
export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  totalScore: number;
  percentage: number;
  submittedAt: string;
}

// Search types
export interface SearchResponse {
  quizzes: Quiz[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchParams {
  q?: string;
  category?: string;
  difficulty?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

// Form state types
export interface QuizFormState {
  title: string;
  description: string;
  isPublic: boolean;
  category: string;
  difficulty: string;
  timeLimit: number;
  questions: {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
    explanationText: string;
  }[];
}
