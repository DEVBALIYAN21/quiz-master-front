
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, ArrowRight, Book, BarChart } from "lucide-react";
import { toast } from "sonner";
import { quizAPI, generateDetailedResult } from "@/services/api";
import { DetailedResult, LeaderboardEntry, QuizResult, QuizWithQuestions } from "@/types";

const QuizResultPage: React.FC = () => {
  const { quizCode } = useParams<{ quizCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [detailedResult, setDetailedResult] = useState<DetailedResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchResultData = async () => {
      try {
        setIsLoading(true);
        
        // Try to get result from location state first
        if (location.state?.result && location.state?.quiz) {
          const result = location.state.result as QuizResult;
          const quiz = location.state.quiz as QuizWithQuestions;
          setDetailedResult(generateDetailedResult(result, quiz));
        } else if (quizCode) {
          // If no state, fetch the quiz by code and generate a result
          // This is a simplified version - in a real app you'd also need the actual result
          const quiz = await quizAPI.getQuiz(quizCode);
          toast.error("Result information not found", {
            description: "Please contact the quiz creator for your results",
          });
        }
        
        // Fetch leaderboard
        if (quizCode) {
          const leaderboardData = await quizAPI.getLeaderboard(quizCode);
          setLeaderboard(leaderboardData);
        }
      } catch (error) {
        toast.error("Failed to load results", {
          description: error instanceof Error ? error.message : "An unknown error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResultData();
  }, [quizCode, location.state]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quiz-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading results...</p>
        </div>
      </div>
    );
  }
  
  if (!detailedResult) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Results Unavailable</CardTitle>
            <CardDescription>
              We couldn't find your quiz results. Please try taking the quiz again or contact support.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  const scorePercentage = detailedResult.percentage;
  
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">Quiz Results</CardTitle>
          <CardDescription className="text-lg">
            {detailedResult.quiz.title}
          </CardDescription>
          
          <div className="mt-6 flex flex-col items-center">
            <div className="relative w-40 h-40 mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-bold">
                    {scorePercentage}%
                  </span>
                  <p className="text-sm opacity-70">Score</p>
                </div>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="#e5e7eb" 
                  strokeWidth="8" 
                />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke={scorePercentage >= 70 ? "#10B981" : scorePercentage >= 40 ? "#F59E0B" : "#EF4444"} 
                  strokeWidth="8" 
                  strokeDasharray={`${scorePercentage * 2.83} 283`} 
                  strokeDashoffset="0" 
                  strokeLinecap="round" 
                  transform="rotate(-90 50 50)" 
                />
              </svg>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-lg">
                You scored <span className="font-bold">{detailedResult.score}</span> out of <span className="font-bold">{detailedResult.totalScore}</span>
              </p>
              <Badge variant={scorePercentage >= 70 ? "success" : scorePercentage >= 40 ? "warning" : "destructive"} className="mt-2">
                {scorePercentage >= 70 ? "Excellent" : scorePercentage >= 40 ? "Good Effort" : "Needs Improvement"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="answers" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="answers" className="flex gap-2">
            <Book className="h-4 w-4" />
            Question Review
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex gap-2">
            <BarChart className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="answers" className="pt-4">
          <div className="space-y-6">
            {detailedResult.questions.map((question, index) => (
              <Card key={index} className={`
                border-l-4 
                ${detailedResult.answeredCorrectly[index] 
                  ? "border-l-quiz-correct" 
                  : "border-l-quiz-incorrect"}
              `}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    {detailedResult.answeredCorrectly[index] ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex gap-1">
                        <Check size={14} />
                        Correct
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex gap-1">
                        <X size={14} />
                        Incorrect
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="font-medium">{question.questionText}</p>
                  
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex}
                        className={`
                          p-3 rounded-md border flex items-center
                          ${optionIndex === question.correctAnswerIndex 
                            ? "bg-green-50 border-green-200" 
                            : optionIndex === detailedResult.answers[index] && optionIndex !== question.correctAnswerIndex
                              ? "bg-red-50 border-red-200"
                              : "bg-white border-gray-200"}
                        `}
                      >
                        <span className="mr-3 font-mono">{String.fromCharCode(65 + optionIndex)}.</span>
                        <span>{option}</span>
                        {optionIndex === question.correctAnswerIndex && (
                          <Check size={16} className="ml-auto text-green-600" />
                        )}
                        {optionIndex === detailedResult.answers[index] && optionIndex !== question.correctAnswerIndex && (
                          <X size={16} className="ml-auto text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <p className="font-medium text-sm">Explanation:</p>
                    <p className="text-sm text-gray-700 mt-1">{question.explanationText}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="leaderboard" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Leaderboard</CardTitle>
              <CardDescription>Top performers on this quiz</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No entries in the leaderboard yet
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                          ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-800" : "bg-gray-200 text-gray-700"}
                        `}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{entry.username}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.percentage}%</p>
                        <p className="text-sm">
                          {entry.score}/{entry.totalScore} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                variant="outline"
                onClick={() => navigate(`/quizzes/${quizCode}`)}
                className="flex gap-2"
              >
                Retake Quiz
                <ArrowRight size={16} />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center">
        <Button 
          onClick={() => navigate("/dashboard")}
          className="bg-quiz-primary hover:bg-indigo-600"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default QuizResultPage;
