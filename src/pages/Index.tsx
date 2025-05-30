
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AuthForm from "@/components/auth/AuthForm";

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return <Landing />;
};

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-quiz-primary">Quiz Master</h1>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 flex flex-col-reverse md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Create and Join <span className="text-quiz-primary">Interactive Quizzes</span> in Minutes
            </h2>
            <p className="text-lg text-gray-600 max-w-lg mx-auto md:mx-0">
              Create challenging quizzes, share them with friends, and test your knowledge with our interactive quiz platform.
            </p>
          </div>

          <div className="md:w-1/2 mb-10 md:mb-0">
            <AuthForm />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                number="1"
                title="Create or Join"
                description="Create your own quiz or join existing ones with a simple 6-character code."
              />
              <FeatureCard
                number="2"
                title="Take the Quiz"
                description="Answer questions within the time limit and test your knowledge."
              />
              <FeatureCard
                number="3"
                title="Get Results"
                description="Instantly see your results and check your ranking on the leaderboard."
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Quiz Master. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ number, title, description }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-12 h-12 bg-quiz-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
      {number}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = (path: string) => window.location.href = path;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4 bg-white">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-quiz-primary">Quiz Master</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/profile")}
            >
              {user?.username}
            </Button>
            <Button 
              variant="ghost" 
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <DashboardCard
              title="Create a Quiz"
              description="Create your own quiz with custom questions and share it with others."
              buttonText="Create Quiz"
              buttonAction={() => navigate("/create")}
              primaryColor="bg-quiz-primary"
              className="border-quiz-primary/20"
            />
            
            <DashboardCard
              title="Join a Quiz"
              description="Enter a quiz code to join and participate in a quiz."
              buttonText="Join Quiz"
              buttonAction={() => navigate("/join")}
              primaryColor="bg-quiz-secondary"
              className="border-quiz-secondary/20"
            />
          </div>

          {user && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Your Statistics</h3>
                <Button 
                  variant="link"
                  onClick={() => navigate("/profile")}
                >
                  View Profile
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                  label="Quizzes Taken" 
                  value={user.quizzesTaken.toString()} 
                  bgColor="bg-indigo-50"
                  textColor="text-indigo-700"
                />
                <StatCard 
                  label="Quizzes Created" 
                  value={user.quizzesCreated.toString()} 
                  bgColor="bg-teal-50"
                  textColor="text-teal-700"
                />
                <StatCard 
                  label="Highest Score" 
                  value={`${user.highestPercentage}%`} 
                  bgColor="bg-pink-50"
                  textColor="text-pink-700"
                />
                <StatCard 
                  label="Average Score" 
                  value={`${user.averageScore}%`} 
                  bgColor="bg-amber-50"
                  textColor="text-amber-700"
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t py-6 bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Quiz Master. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonAction: () => void;
  primaryColor: string;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  description, 
  buttonText, 
  buttonAction,
  primaryColor,
  className
}) => (
  <Card className={`p-6 border-2 hover:shadow-lg transition-shadow ${className}`}>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    <Button 
      onClick={buttonAction}
      className={`w-full ${primaryColor} hover:brightness-105`}
    >
      {buttonText}
    </Button>
  </Card>
);

interface StatCardProps {
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, bgColor, textColor }) => (
  <div className={`p-4 rounded-lg ${bgColor}`}>
    <p className={`text-sm font-medium ${textColor}`}>{label}</p>
    <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
  </div>
);

export default Index;
