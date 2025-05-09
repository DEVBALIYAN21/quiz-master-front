import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Timer, Check } from "lucide-react";
import { toast } from "sonner";
import { quizAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { QuizWithQuestions, QuizSubmission } from "@/types";

const TakeQuiz: React.FC = () => {
  const { quizCode } = useParams<{ quizCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizCode) return;
      
      try {
        setIsLoading(true);
        const quizData = await quizAPI.getQuiz(quizCode);
        setQuiz(quizData);
        
        // Initialize selected answers array with -1 (no selection) for each question
        setSelectedAnswers(new Array(quizData.questions.length).fill(-1));
        
        // Set the time remaining in seconds
        setTimeRemaining(quizData.quiz.timeLimit * 60);
      } catch (error) {
        toast.error("Failed to load quiz", {
          description: error instanceof Error ? error.message : "An unknown error occurred",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuiz();
  }, [quizCode, navigate]);
  
  useEffect(() => {
    if (!quiz || timeRemaining <= 0) return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz, timeRemaining]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSelectAnswer = (answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmitQuiz = async () => {
    if (!quiz || !user) return;
    
    const unansweredCount = selectedAnswers.filter(ans => ans === -1).length;
    if (unansweredCount > 0 && timeRemaining > 0) {
      const confirmed = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirmed) return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Replace any unanswered questions (-1) with 0
      const finalAnswers = selectedAnswers.map(ans => ans === -1 ? 0 : ans);
      
      const submission: QuizSubmission = {
        userId: user.id,
        quizId: quiz.quiz.id!,
        answers: finalAnswers
      };

      console.log("Submitting answers:", submission); // Debug log
      
      const result = await quizAPI.submitQuiz(submission);
      console.log("Quiz submission result:", result); // Debug log
      
      // Store the result in localStorage
      localStorage.setItem('quiz_result', JSON.stringify(result));
      
      // Clear the timer
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Navigate to result page
      navigate(`/results/${quiz.quiz.quizCode}`);
      
    } catch (error) {
      toast.error("Failed to submit quiz", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quiz-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{quiz.quiz.title}</h1>
            <p className="text-gray-500">{quiz.quiz.description}</p>
          </div>
          <div className="flex flex-col items-end">
            <Badge variant={timeRemaining < 60 ? "destructive" : "outline"} className="flex gap-1 text-lg py-2 px-3">
              <Timer size={18} />
              {formatTime(timeRemaining)}
            </Badge>
            <p className="text-sm mt-1">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
        </div>
        
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">
            Question {currentQuestionIndex + 1}
          </CardTitle>
          <CardDescription>
            Select the correct answer below
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium">{currentQuestion.questionText}</h3>
          </div>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                type="button"
                variant={selectedAnswers[currentQuestionIndex] === index ? "default" : "outline"}
                className={`w-full justify-start text-left p-4 h-auto text-base ${
                  selectedAnswers[currentQuestionIndex] === index ? "bg-quiz-primary hover:bg-indigo-600" : ""
                }`}
                onClick={() => handleSelectAnswer(index)}
              >
                <span className="mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex gap-2"
          >
            <ArrowLeft size={16} />
            Previous
          </Button>
          
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button
              onClick={handleNextQuestion}
              className="flex gap-2 bg-quiz-primary hover:bg-indigo-600"
            >
              Next
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="flex gap-2 bg-quiz-secondary hover:bg-teal-700"
            >
              <Check size={16} />
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {quiz.questions.map((_, index) => (
          <Button
            key={index}
            variant={selectedAnswers[index] !== -1 ? "default" : "outline"}
            className={`w-10 h-10 p-0 ${
              index === currentQuestionIndex ? "ring-2 ring-quiz-accent" : ""
            } ${
              selectedAnswers[index] !== -1 ? "bg-quiz-primary" : ""
            }`}
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center">
        <Button 
          variant="secondary"
          onClick={handleSubmitQuiz} 
          className="bg-quiz-secondary hover:bg-teal-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </div>
    </div>
  );
};

export default TakeQuiz;