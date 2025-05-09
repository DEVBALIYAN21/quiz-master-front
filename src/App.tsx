
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "@/components/quiz/CreateQuiz";
import JoinQuiz from "@/components/quiz/JoinQuiz";
import TakeQuiz from "@/components/quiz/TakeQuiz";
import QuizResult from "@/components/quiz/QuizResult";
import UserProfile from "@/components/profile/UserProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateQuiz />} />
            <Route path="/join" element={<JoinQuiz />} />
            <Route path="/quizzes/:quizCode" element={<TakeQuiz />} />
            <Route path="/results/:quizCode" element={<QuizResult />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
