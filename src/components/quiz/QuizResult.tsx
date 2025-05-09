
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, X as XIcon } from "lucide-react";
import { quizAPI, generateDetailedResult } from "@/services/api";
import { DetailedResult, QuizResult as QuizResultType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const QuizResult: React.FC = () => {
  const { quizCode } = useParams<{ quizCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [detailedResult, setDetailedResult] = useState<DetailedResult | null>(null);

  // Get quiz results from local storage
  useEffect(() => {
    if (!quizCode) return;
  
    const savedResult = localStorage.getItem(`quiz_result`);
    console.log("Saved Result:", savedResult); // Verify data from localStorage
  
    if (savedResult) {
      try {
        const result = JSON.parse(savedResult);
        console.log("Parsed Result:", result); // Check parsed result
  
        const fetchQuizDetails = async () => {
          try {
            const quizData = await quizAPI.getQuiz(quizCode);
            console.log("Quiz Data:", quizData); // Check quiz data
            const detailedResult = generateDetailedResult(result, quizData);
            setDetailedResult(detailedResult);
          } catch (error) {
            toast.error("Failed to load quiz details");
          }
        };
  
        fetchQuizDetails();
      } catch (error) {
        toast.error("Failed to load quiz results");
      }
    } else {
      toast.error("No quiz results found");
      navigate("/");
    }
  }, [quizCode, navigate]);
  

  // Get the leaderboard for the quiz
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["leaderboard", quizCode],
    queryFn: () => quizAPI.getLeaderboard(quizCode || ""),
    enabled: !!quizCode,
  });

  // Find the current user's rank
  const userRank = user && leaderboard.findIndex(entry => entry.userId === user.id) + 1;

  if (!detailedResult) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center items-center">
              <div className="animate-pulse">Loading results...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { quiz, questions, answers, score, totalScore, percentage } = detailedResult;
  
  // Performance text and color based on percentage
  const getPerformanceDetails = (percentage: number) => {
    if (percentage >= 80) {
      return {
        text: "Excellent!",
        color: "text-green-600",
        variant: "outline",
      };
    } else if (percentage >= 60) {
      return {
        text: "Great job!",
        color: "text-blue-600",
        variant: "outline",
      };
    } else if (percentage >= 40) {
      return {
        text: "Good effort!",
        color: "text-yellow-600",
        variant: "outline",
      };
    } else {
      return {
        text: "Keep practicing!",
        color: "text-red-600",
        variant: "outline",
      };
    }
  };

  const performanceDetails = getPerformanceDetails(percentage);

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Quiz Results</h1>
      </div>

      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{quiz.title}</CardTitle>
          <CardDescription>{quiz.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Your Score</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-3xl font-bold">
                    {score}/{totalScore}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Percentage</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className={`text-3xl font-bold ${performanceDetails.color}`}>
                    {percentage}%
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Performance</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className={`text-xl font-medium ${performanceDetails.color}`}>
                    {performanceDetails.text}
                  </p>
                </CardContent>
              </Card>
            </div>

            {userRank && (
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <p className="text-indigo-700">
                  Your rank on the leaderboard: <span className="font-bold">#{userRank}</span> out of {leaderboard.length}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Detailed Analysis</h2>
      
      <div className="space-y-6">
        {questions.map((question, index) => {
          const isCorrect = detailedResult.answeredCorrectly[index];
          const selectedAnswer = answers[index];
          
          return (
            <Card key={index} className={isCorrect ? "border-green-200" : "border-red-200"}>
              <CardHeader className={isCorrect ? "bg-green-50" : "bg-red-50"}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isCorrect ? (
                      <div className="rounded-full bg-green-100 p-1">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="rounded-full bg-red-100 p-1">
                        <XIcon className="h-5 w-5 text-red-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-medium">
                      Question {index + 1}: {question.questionText}
                    </CardTitle>
                    {!isCorrect && (
                      <CardDescription className="text-red-500 mt-1">
                        Incorrect Answer
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-3 rounded-md ${
                        optionIndex === question.correctAnswerIndex
                          ? "bg-green-100 border border-green-200"
                          : optionIndex === selectedAnswer && optionIndex !== question.correctAnswerIndex
                          ? "bg-red-100 border border-red-200"
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                            optionIndex === question.correctAnswerIndex
                              ? "bg-green-500 text-white"
                              : optionIndex === selectedAnswer && optionIndex !== question.correctAnswerIndex
                              ? "bg-red-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </div>
                        <span className={`flex-grow ${
                          optionIndex === question.correctAnswerIndex
                            ? "font-medium text-green-800"
                            : optionIndex === selectedAnswer && optionIndex !== question.correctAnswerIndex
                            ? "font-medium text-red-800"
                            : ""
                        }`}>
                          {option}
                        </span>
                        {optionIndex === selectedAnswer && (
                          <span className="text-sm">(Your answer)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
                  <p className="text-blue-700">{question.explanationText}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center space-x-4">
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
        
        {quiz.quizCode && (
          <Button 
            onClick={() => navigate(`/quizzes/${quiz.quizCode}`)}
            className="bg-quiz-primary hover:bg-indigo-600"
          >
            Take Quiz Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizResult;
