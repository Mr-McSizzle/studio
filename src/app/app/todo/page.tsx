
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Added missing import
import { Badge } from "@/components/ui/badge";
import { ListTodo, PlusCircle, Trash2, Star, TrendingUp, GripVertical, Tag, ShieldAlert, ChevronsUpDown, Zap } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import type { TodoItem, TaskDifficulty, TaskPriority } from "@/types/todo";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const POINTS_MAP: Record<TaskDifficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 20,
};

const priorityColorMap: Record<TaskPriority, string> = {
  low: "bg-green-500/20 text-green-700 border-green-500/50",
  medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
  high: "bg-red-500/20 text-red-700 border-red-500/50",
};

const difficultyColorMap: Record<TaskDifficulty, string> = {
  easy: "bg-blue-500/20 text-blue-700 border-blue-500/50",
  medium: "bg-purple-500/20 text-purple-700 border-purple-500/50",
  hard: "bg-pink-500/20 text-pink-700 border-pink-500/50",
};


export default function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDifficulty, setNewTodoDifficulty] = useState<TaskDifficulty>('medium');
  const [newTodoPriority, setNewTodoPriority] = useState<TaskPriority>('medium');
  const [newTodoCategory, setNewTodoCategory] = useState("");
  const [totalXp, setTotalXp] = useState(0);

  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
    // Load todos and XP from localStorage if needed
    // For now, we'll keep it session-based for simplicity
  }, [isAuthenticated, router]);

  const handleAddTodo = (e: FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const points = POINTS_MAP[newTodoDifficulty];
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      priority: newTodoPriority,
      difficulty: newTodoDifficulty,
      points: points,
      category: newTodoCategory.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setNewTodoText("");
    setNewTodoCategory("");
    // Keep difficulty and priority as is for next task, or reset:
    // setNewTodoDifficulty('medium');
    // setNewTodoPriority('medium');
    toast({
      title: "Task Added!",
      description: `"${newTodo.text}" added. Worth ${newTodo.points} XP.`,
    });
  };

  const toggleTodo = (id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) => {
        if (todo.id === id) {
          const wasCompleted = todo.completed;
          const updatedTodo = { ...todo, completed: !todo.completed, completedAt: !todo.completed ? new Date().toISOString() : undefined };
          if (updatedTodo.completed && !wasCompleted) { // Just completed
            setTotalXp((prevXp) => prevXp + updatedTodo.points);
            toast({
              title: "Task Complete!",
              description: (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span>+{updatedTodo.points} XP earned for "{updatedTodo.text}"</span>
                </div>
              ),
            });
          } else if (!updatedTodo.completed && wasCompleted) { // Uncompleted
            setTotalXp((prevXp) => Math.max(0, prevXp - updatedTodo.points));
            // Optional: Toast for uncompleting
          }
          return updatedTodo;
        }
        return todo;
      })
    );
  };

  const deleteTodo = (id: string) => {
    const todoToDelete = todos.find(t => t.id === id);
    if (todoToDelete && todoToDelete.completed) {
      // If deleting a completed task, optionally deduct points or leave as is
      // setTotalXp(prevXp => Math.max(0, prevXp - todoToDelete.points));
    }
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    toast({
      title: "Task Deleted",
      description: `Task "${todoToDelete?.text || ''}" removed.`,
      variant: "destructive"
    });
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }
  
  const pendingTasks = todos.filter(t => !t.completed).length;

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-10">
        <div className="flex items-center gap-4">
          <ListTodo className="h-10 w-10 text-accent" />
          <div>
            <h1 className="text-3xl font-headline text-foreground">
              Founder's Quest Log
            </h1>
            <p className="text-muted-foreground">
              Track strategic tasks, complete objectives, and gain XP to level up your founder skills.
            </p>
          </div>
        </div>
        <Card className="mt-6 shadow-md bg-card/70 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-400" />
                <span className="text-xl font-semibold text-foreground">Total XP Earned:</span>
                <span className="text-2xl font-bold text-yellow-400 text-glow-accent">{totalXp}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {pendingTasks > 0 ? `${pendingTasks} pending task(s)` : "All tasks cleared!"}
              </div>
            </div>
          </CardContent>
        </Card>
      </header>

      <Card className="shadow-xl mb-8 border-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PlusCircle className="text-accent h-6 w-6"/>Add New Strategic Task</CardTitle>
          <CardDescription>Define your next objective. Assign difficulty and priority to plan effectively.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTodo} className="space-y-4">
            <div>
              <Label htmlFor="new-todo-text">Task Description</Label>
              <Input
                id="new-todo-text"
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="e.g., Research top 3 competitor marketing strategies"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="new-todo-difficulty" className="flex items-center gap-1.5"><ShieldAlert className="h-4 w-4 text-muted-foreground"/>Difficulty</Label>
                <Select value={newTodoDifficulty} onValueChange={(value) => setNewTodoDifficulty(value as TaskDifficulty)}>
                  <SelectTrigger id="new-todo-difficulty" className="w-full mt-1">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy ({POINTS_MAP.easy} XP)</SelectItem>
                    <SelectItem value="medium">Medium ({POINTS_MAP.medium} XP)</SelectItem>
                    <SelectItem value="hard">Hard ({POINTS_MAP.hard} XP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-todo-priority" className="flex items-center gap-1.5"><ChevronsUpDown className="h-4 w-4 text-muted-foreground"/>Priority</Label>
                <Select value={newTodoPriority} onValueChange={(value) => setNewTodoPriority(value as TaskPriority)}>
                  <SelectTrigger id="new-todo-priority" className="w-full mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-todo-category" className="flex items-center gap-1.5"><Tag className="h-4 w-4 text-muted-foreground"/>Category (Optional)</Label>
                <Input
                  id="new-todo-category"
                  type="text"
                  value={newTodoCategory}
                  onChange={(e) => setNewTodoCategory(e.target.value)}
                  placeholder="e.g., Marketing, R&D"
                  className="mt-1"
                />
              </div>
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Task to Quest Log
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GripVertical className="text-muted-foreground h-6 w-6"/>Your Active Tasks</CardTitle>
          <CardDescription>
            {todos.length > 0
              ? `Focus on these objectives to advance your startup. (${pendingTasks} pending)`
              : "Your quest log is empty. Add some tasks above!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todos.length > 0 ? (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className={cn(
                    "flex items-start gap-3 p-4 border rounded-lg bg-card hover:border-primary/70 transition-all duration-200 ease-in-out",
                    todo.completed && "bg-muted/50 opacity-70 hover:opacity-90"
                  )}
                >
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    aria-labelledby={`todo-label-${todo.id}`}
                    className="mt-1 shrink-0 border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground focus-visible:ring-accent"
                  />
                  <div className="flex-grow">
                    <label
                      id={`todo-label-${todo.id}`}
                      htmlFor={`todo-${todo.id}`}
                      className={cn(
                        "text-base font-medium cursor-pointer",
                        todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {todo.text}
                    </label>
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <Badge variant="outline" className={cn("font-mono", priorityColorMap[todo.priority])}>P: {todo.priority}</Badge>
                      <Badge variant="outline" className={cn("font-mono", difficultyColorMap[todo.difficulty])}>D: {todo.difficulty}</Badge>
                      {todo.category && <Badge variant="secondary" className="font-mono bg-muted text-muted-foreground">{todo.category}</Badge>}
                      <Badge variant="outline" className="font-mono border-yellow-500/50 text-yellow-600 bg-yellow-500/10">{todo.points} XP</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground/70 mt-1">Added: {new Date(todo.createdAt).toLocaleDateString()}</p>
                     {todo.completed && todo.completedAt && <p className="text-xs text-green-600 mt-0.5">Completed: {new Date(todo.completedAt).toLocaleDateString()}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTodo(todo.id)}
                    className="text-destructive/70 hover:bg-destructive/10 hover:text-destructive shrink-0"
                    aria-label={`Delete todo: ${todo.text}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-6">
              No tasks in your log. Time to strategize and add some!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
