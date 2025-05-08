
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { quizAPI } from "@/services/api";

const quizCodeSchema = z.object({
  quizCode: z
    .string()
    .min(6, { message: "Quiz code must be 6 characters" })
    .max(6, { message: "Quiz code must be 6 characters" })
    .regex(/^[A-Za-z0-9]+$/, { message: "Quiz code must contain only letters and numbers" })
});

type QuizCodeFormValues = z.infer<typeof quizCodeSchema>;

const JoinQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<QuizCodeFormValues>({
    resolver: zodResolver(quizCodeSchema),
    defaultValues: {
      quizCode: "",
    },
  });

  const onSubmit = async (data: QuizCodeFormValues) => {
    setIsLoading(true);

    try {
      // First, verify that the quiz exists
      const quizCode = data.quizCode.toUpperCase();
      await quizAPI.getQuiz(quizCode);
      
      // If successful, navigate to the quiz page
      toast.success("Quiz found!");
      navigate(`/quizzes/${quizCode}`);
    } catch (error) {
      toast.error("Failed to find quiz", {
        description: "Please check the quiz code and try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl text-center">Join a Quiz</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-character quiz code to join
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="quizCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 6-character code"
                        {...field}
                        value={field.value.toUpperCase()}
                        className="text-center text-lg tracking-widest font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      This is the code shared by the quiz creator
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full bg-quiz-primary hover:bg-indigo-600"
                disabled={isLoading}
              >
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? "Searching..." : "Join Quiz"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinQuiz;
