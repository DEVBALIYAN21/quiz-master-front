
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { userAPI } from "@/services/api";
import { UserStats } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, Award, GraduationCap, Users, Clock, Target } from "lucide-react";

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createdQuizzes, setCreatedQuizzes] = useState<any[]>([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState<any[]>([]);
  const [quizDetails, setQuizDetails] = useState<any>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userStats = await userAPI.getUserStats();
        setStats(userStats);
        
        // Fetch created quizzes
        const createdResponse = await fetch(`http://localhost:8056/users/quizzes`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const createdData = await createdResponse.json();
        setCreatedQuizzes(createdData.quizzes || []);
        
        // Fetch attempted quizzes
        const attemptedResponse = await fetch(`http://localhost:8056/users/attempted-quizzes`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const attemptedData = await attemptedResponse.json();
        setAttemptedQuizzes(attemptedData.quizzes || []);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleQuizClick = async (quizCode: string) => {
    try {
      const response = await fetch(`http://localhost:8056/quizzes/${quizCode}/details`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const details = await response.json();
      setQuizDetails(details);
    } catch (error) {
      console.error("Failed to fetch quiz details:", error);
    }
  };
  
  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl mx-auto py-6 px-4">
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-indigo-200">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`} alt={user?.username} />
                <AvatarFallback className="bg-indigo-100 text-indigo-800 text-xl">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {user?.username}'s Profile
                </CardTitle>
                <CardDescription>Your quiz statistics and performance</CardDescription>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Quizzes Taken" 
              value={stats.totalQuizzesTaken} 
              description="Total quizzes attempted"
              color="bg-indigo-50 text-indigo-700 border-indigo-200"
              icon={<Book className="h-4 w-4" />}
            />
            <StatCard 
              title="Quizzes Created" 
              value={stats.totalQuizzesCreated} 
              description="Total quizzes created"
              color="bg-teal-50 text-teal-700 border-teal-200"
              icon={<GraduationCap className="h-4 w-4" />}
            />
            <StatCard 
              title="Highest Score" 
              value={`${stats.highestPercentage}%`} 
              description="Best performance"
              color="bg-pink-50 text-pink-700 border-pink-200"
              icon={<Award className="h-4 w-4" />}
            />
            <StatCard 
              title="Average Score" 
              value={`${stats.averageScore.toFixed(1)}`} 
              description="Overall performance"
              color="bg-amber-50 text-amber-700 border-amber-200"
              icon={<Book className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="created" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="created" className="flex gap-2">
            <GraduationCap className="h-4 w-4" />
            Created Quizzes
          </TabsTrigger>
          <TabsTrigger value="attempted" className="flex gap-2">
            <Book className="h-4 w-4" />
            Attempted Quizzes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {createdQuizzes.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500 mb-4">You haven't created any quizzes yet</p>
                <Button onClick={() => navigate('/create')} className="bg-indigo-600 hover:bg-indigo-700">
                  Create Your First Quiz
                </Button>
              </div>
            ) : (
              createdQuizzes.map((quizData) => (
                <Card key={quizData.quiz.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{quizData.quiz.title}</CardTitle>
                    <CardDescription>{quizData.quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {quizData.quiz.attemptCount || 0} attempts
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {quizData.quiz.timeLimit} minutes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {quizData.quiz.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Book className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {quizData.quiz.category}
                        </span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => handleQuizClick(quizData.quiz.quizCode)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {quizDetails && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quiz Details: {quizDetails.quiz.title}</CardTitle>
                <CardDescription>{quizDetails.quiz.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard 
                      title="Total Attempts"
                      value={quizDetails.attemptCount}
                      description="Number of times taken"
                      color="bg-blue-50 text-blue-700 border-blue-200"
                      icon={<Users className="h-4 w-4" />}
                    />
                    <StatCard 
                      title="Average Score"
                      value={`${quizDetails.averageScore.toFixed(1)}`}
                      description="Average performance"
                      color="bg-green-50 text-green-700 border-green-200"
                      icon={<Target className="h-4 w-4" />}
                    />
                    <StatCard 
                      title="Questions"
                      value={quizDetails.questions.length}
                      description="Total questions"
                      color="bg-purple-50 text-purple-700 border-purple-200"
                      icon={<Book className="h-4 w-4" />}
                    />
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Student Results</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Percentage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Submitted At
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {quizDetails.studentResults.map((result: any, index: number) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {result.username}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {result.score}/{result.totalScore}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {result.percentage}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(result.submittedAt).toLocaleString()}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="attempted" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {attemptedQuizzes.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500 mb-4">You haven't attempted any quizzes yet</p>
                <Button onClick={() => navigate('/explore')} className="bg-indigo-600 hover:bg-indigo-700">
                  Explore Quizzes
                </Button>
              </div>
            ) : (
              attemptedQuizzes.map((quizData) => {
                // Find this user's result for the quiz
                const userResult = quizData.studentResults.find(
                  (result: any) => result.userId === user?.id
                );
                
                return (
                  <Card key={quizData.quiz.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{quizData.quiz.title}</CardTitle>
                      <CardDescription>{quizData.quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {quizData.quiz.timeLimit} minutes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {quizData.quiz.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {quizData.quiz.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Your Score: {userResult?.score}/{userResult?.totalScore} ({userResult?.percentage}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2 p-4 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Taken on: {new Date(userResult?.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-600">
                            Questions: {quizData.questions.length}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Button 
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => navigate(`/quiz/${quizData.quiz.quizCode}`)}
                        >
                          Take Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  color: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, color, icon }) => {
  return (
    <div className={`rounded-lg border p-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">{title}</p>
        {icon && <span className="opacity-80">{icon}</span>}
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs mt-1 opacity-70">{description}</p>
    </div>
  );
};

export default UserProfile;
