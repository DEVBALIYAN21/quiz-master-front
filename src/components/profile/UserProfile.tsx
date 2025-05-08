import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { userAPI } from "@/services/api";
import { UserStats } from "@/types";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, Legend 
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, BarChart as BarChartIcon, UserRound, Award, GraduationCap, Settings } from "lucide-react";

const COLORS = ["#6366F1", "#14B8A6", "#EC4899", "#F59E0B", "#10B981"];

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const userStats = await userAPI.getUserStats();
        setStats(userStats);
      } catch (error) {
        console.error("Failed to load user stats:", error);
        setError("Unable to load your statistics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Error Loading Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button 
              className="mt-4 w-full" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">No Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We couldn't find any quiz statistics for your profile.</p>
            <Button className="mt-4">Take Your First Quiz</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Format category data for the pie chart
  const categoryData = Object.entries(stats.categoryBreakdown || {}).map(([name, value]) => ({
    name,
    value
  }));
  
  // Format score distribution data for the bar chart
  const scoreData = Object.entries(stats.scoreDistribution || {}).map(([range, count]) => ({
    range,
    count
  }));
  
  // Format recent results for the line chart
  const recentResultsData = (stats.recentResults || []).map((result, index) => ({
    name: `Quiz ${index + 1}`,
    score: result.percentage
  })).slice(-10); // Only show last 10 entries
  
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
              value={`${stats.averageScore.toFixed(1)}%`} 
              description="Overall performance"
              color="bg-amber-50 text-amber-700 border-amber-200"
              icon={<BarChartIcon className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="statistics" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="statistics" className="flex gap-2">
            <BarChartIcon className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="history" className="flex gap-2">
            <Book className="h-4 w-4" />
            Quiz History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="statistics" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories Pie Chart */}
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
            
            {/* Score Distribution Bar Chart */}
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
            
            {/* Performance Trend Chart */}
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

// Stat card component
interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  color: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, color, icon }) => {
  return (
    <div className={`rounded-lg border p-4 ${color} transition-all duration-300 hover:shadow-md`}>
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