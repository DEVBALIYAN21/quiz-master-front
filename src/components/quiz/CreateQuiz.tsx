
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, X } from "lucide-react";
import { quizAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { QuizFormState } from "@/types";

const MAX_QUESTIONS = 20;
const MIN_QUESTIONS = 1;
const MAX_OPTIONS = 6;
const MIN_OPTIONS = 2;

// Validation schema for the quiz form
const quizFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(500),
  isPublic: z.boolean(),
  category: z.string().min(1, { message: "Please select a category" }),
  difficulty: z.string().min(1, { message: "Please select a difficulty level" }),
  timeLimit: z.number().min(1).max(120),
  questions: z.array(
    z.object({
      questionText: z.string().min(5, { message: "Question must be at least 5 characters" }).max(200),
      options: z.array(z.string().min(1)).min(2, { message: "At least 2 options are required" }),
      correctAnswerIndex: z.number().min(0),
      explanationText: z.string().min(5, { message: "Explanation must be at least 5 characters" }).max(300),
    })
  ).min(MIN_QUESTIONS, { message: `At least ${MIN_QUESTIONS} question is required` })
});

type QuizFormSchemaType = z.infer<typeof quizFormSchema>;

const categories = [
  "General Knowledge", 
  "Science", 
  "History", 
  "Geography", 
  "Literature", 
  "Movies", 
  "Music", 
  "Sports", 
  "Technology",
  "Mathematics"
];

const difficulties = ["Easy", "Medium", "Hard"];

const CreateQuiz: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values
  const form = useForm<QuizFormSchemaType>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: "",
      description: "",
      isPublic: true,
      category: "",
      difficulty: "",
      timeLimit: 30,
      questions: [
        {
          questionText: "",
          options: ["", ""],
          correctAnswerIndex: 0,
          explanationText: "",
        },
      ],
    },
  });

  // Get form values
  const { fields: questionFields, append, remove } = form.useFieldArray({
    name: "questions",
  });

  const addQuestion = () => {
    if (questionFields.length < MAX_QUESTIONS) {
      append({
        questionText: "",
        options: ["", ""],
        correctAnswerIndex: 0,
        explanationText: "",
      });
    } else {
      toast.error(`You can add a maximum of ${MAX_QUESTIONS} questions`);
    }
  };

  const removeQuestion = (index: number) => {
    if (questionFields.length > MIN_QUESTIONS) {
      remove(index);
    } else {
      toast.error(`At least ${MIN_QUESTIONS} question is required`);
    }
  };

  const addOption = (questionIndex: number) => {
    const questions = form.getValues().questions;
    const currentOptions = questions[questionIndex].options;
    
    if (currentOptions.length < MAX_OPTIONS) {
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].options = [...currentOptions, ""];
      form.setValue("questions", updatedQuestions);
    } else {
      toast.error(`You can add a maximum of ${MAX_OPTIONS} options per question`);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const questions = form.getValues().questions;
    const currentOptions = questions[questionIndex].options;
    
    if (currentOptions.length > MIN_OPTIONS) {
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].options = currentOptions.filter((_, i) => i !== optionIndex);
      
      // If the correct answer index is the removed option or greater, adjust it
      if (questions[questionIndex].correctAnswerIndex === optionIndex) {
        updatedQuestions[questionIndex].correctAnswerIndex = 0;
      } else if (questions[questionIndex].correctAnswerIndex > optionIndex) {
        updatedQuestions[questionIndex].correctAnswerIndex -= 1;
      }
      
      form.setValue("questions", updatedQuestions);
    } else {
      toast.error(`At least ${MIN_OPTIONS} options are required`);
    }
  };

  const onSubmit = async (data: QuizFormSchemaType) => {
    if (!user) {
      toast.error("You must be logged in to create a quiz");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Format the data for the API
      const formattedData = {
        quiz: {
          title: data.title,
          description: data.description,
          isPublic: data.isPublic,
          category: data.category,
          difficulty: data.difficulty,
          timeLimit: data.timeLimit,
        },
        questions: data.questions.map((question) => ({
          questionText: question.questionText,
          options: question.options,
          correctAnswerIndex: question.correctAnswerIndex,
          explanationText: question.explanationText,
        })),
      };
      
      // Create the quiz
      const response = await quizAPI.createQuiz(formattedData);
      
      toast.success("Quiz created successfully", {
        description: `Your quiz code is: ${response.quiz.quizCode}`,
      });
      
      navigate(`/quizzes/${response.quiz.quizCode}`);
    } catch (error) {
      toast.error("Failed to create quiz", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold">Create a New Quiz</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Quiz Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>
                Set the basic information about your quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Geography Trivia" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your quiz a descriptive title
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what your quiz is about..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of the quiz content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose a category for your quiz
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficulties.map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Set the difficulty level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Time Limit (minutes): {value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={120}
                        step={1}
                        value={[value]}
                        onValueChange={(vals) => onChange(vals[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Set how long participants have to complete the quiz
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Public Quiz</FormLabel>
                      <FormDescription>
                        If enabled, your quiz will be visible in public search results
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Questions Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Questions</h2>
              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Question
              </Button>
            </div>
            
            {questionFields.map((question, questionIndex) => (
              <Card key={question.id} className="relative">
                {questionFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    <X size={18} />
                  </Button>
                )}
                
                <CardHeader>
                  <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`questions.${questionIndex}.questionText`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your question here" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <FormLabel>Options</FormLabel>
                    
                    {form.getValues().questions[questionIndex].options.map((_, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`questions.${questionIndex}.options.${optionIndex}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    placeholder={`Option ${optionIndex + 1}`} 
                                    {...field} 
                                  />
                                  {form.getValues().questions[questionIndex].options.length > MIN_OPTIONS && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeOption(questionIndex, optionIndex)}
                                    >
                                      <X size={14} />
                                    </Button>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`questions.${questionIndex}.correctAnswerIndex`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    checked={field.value === optionIndex}
                                    onChange={() => field.onChange(optionIndex)}
                                    className="h-4 w-4 border-gray-300 text-quiz-primary focus:ring-quiz-primary"
                                  />
                                  <span className="ml-2 text-sm">
                                    {field.value === optionIndex ? "Correct" : ""}
                                  </span>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    
                    {form.getValues().questions[questionIndex].options.length < MAX_OPTIONS && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(questionIndex)}
                        className="mt-2"
                      >
                        Add Option
                      </Button>
                    )}
                    
                    <FormMessage>
                      {form.formState.errors.questions?.[questionIndex]?.options?.message}
                    </FormMessage>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`questions.${questionIndex}.explanationText`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Explanation</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Explain why this is the correct answer" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          This will be shown after answering the question
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-quiz-primary hover:bg-indigo-600"
            >
              {isSubmitting ? "Creating Quiz..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateQuiz;
