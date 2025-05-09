import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { userAPI } from "@/services/api";
import { UserStats, QuizWithQuestions } from "@/types";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, Legend 
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, BarChart as BarChartIcon, UserRound, Award, GraduationCap, Settings, Users, Clock, Target } from "lucide-react";

const COLORS = ["#6366F1", "#14B8A6", "#EC4899", "#F59E0B", "#10B981"];

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createdQuizzes, setCreatedQuizzes] = useState<any[]>([]);
  const [quizDetails, setQuizDetails] = useState<any>(null);
  
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userStats = await userAPI.getUserStats();
        setStats(userStats);
        
        // Fetch created quizzes
        const response = await fetch(`http://localhost:8056/users/quizzes`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setCreatedQuizzes(data.quizzes || []); // Access the quizzes array from the response
      } catch (error) {
        console.error("Failed to load user stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
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
  
  const categoryData = Object.entries(stats.categoryBreakdown || {}).map(([name, value]) => ({
    name,
    value
  }));
  
  const scoreData = Object.entries(stats.scoreDistribution || {}).map(([range, count]) => ({
    range,
    count
  }));
  
  const recentResultsData = (stats.recentResults || []).map((result, index) => ({
    name: `Quiz ${index + 1}`,
    score: result.percentage
  })).slice(-10);
  
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
              icon={<BarChartIcon className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="created" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          
          <TabsTrigger value="created" className="flex gap-2">
            <GraduationCap className="h-4 w-4" />
            Created Quizzes
          </TabsTrigger>
          
        </TabsList>
        
        <TabsContent value="statistics" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quiz Categories</CardTitle>
                <CardDescription>Distribution of quizzes by category</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No category data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Score Distribution</CardTitle>
                <CardDescription>How your scores are distributed</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {scoreData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={scoreData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366F1" name="Quizzes" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No score data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Performance Trend</CardTitle>
                <CardDescription>Your recent quiz results</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {recentResultsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={recentResultsData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#6366F1"
                        activeDot={{ r: 8 }}
                        name="Score (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No performance data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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
        
        <TabsContent value="history" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Quizzes</CardTitle>
              <CardDescription>Your quiz history</CardDescription>
            </CardHeader>
            <CardContent>
              {!stats.recentResults || stats.recentResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>You haven't taken any quizzes yet</p>
                  <Button variant="link" className="mt-2">
                    Join a Quiz
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentResults.map((result, index) => {
                    const matchingQuiz = stats.recentQuizzes?.find(q => q.id === result.quizId);
                    return (
                      <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div>
                          <h3 className="font-medium">
                            {matchingQuiz?.title || "Unknown Quiz"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : "N/A"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {matchingQuiz?.category || "Uncategorized"} · {matchingQuiz?.difficulty || "Unknown"} difficulty
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{result.percentage}%</p>
                          <p className="text-sm">
                            Score: {result.score}/{result.totalScore}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
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