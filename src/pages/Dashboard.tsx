
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, User, LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4 bg-white">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-quiz-primary">Quiz Master</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2"
            >
              <User size={16} />
              {user?.username}
            </Button>
            <Button 
              variant="ghost" 
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
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
              icon={<Plus size={20} />}
            />
            
            <DashboardCard
              title="Join a Quiz"
              description="Enter a quiz code to join and participate in a quiz."
              buttonText="Join Quiz"
              buttonAction={() => navigate("/join")}
              primaryColor="bg-quiz-secondary"
              className="border-quiz-secondary/20"
              icon={<Search size={20} />}
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
                  View Full Profile
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
  icon?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  description, 
  buttonText, 
  buttonAction,
  primaryColor,
  className,
  icon
}) => (
  <Card className={`p-6 border-2 hover:shadow-lg transition-shadow ${className}`}>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    <Button 
      onClick={buttonAction}
      className={`w-full ${primaryColor} hover:brightness-105 flex items-center justify-center gap-2`}
    >
      {icon}
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

export default Dashboard;
