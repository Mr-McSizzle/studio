
"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListTodo, PlusCircle, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const handleAddTodo = (e: FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
    };
    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setNewTodoText("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-10">
        <div className="flex items-center gap-4">
          <ListTodo className="h-10 w-10 text-accent" />
          <div>
            <h1 className="text-3xl font-headline text-foreground">
              Founder's Todo List
            </h1>
            <p className="text-muted-foreground">
              Keep track of your tasks and objectives for your startup journey.
            </p>
          </div>
        </div>
      </header>

      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTodo} className="flex items-center gap-4">
            <Input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="e.g., Finalize pitch deck for investors"
              className="flex-grow"
              aria-label="New todo text"
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Todo
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>
            {todos.length > 0
              ? `You have ${todos.filter(t => !t.completed).length} pending task(s).`
              : "No tasks yet. Add some above!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todos.length > 0 ? (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center justify-between p-3 border border-border rounded-md bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      aria-labelledby={`todo-label-${todo.id}`}
                      className="border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground focus-visible:ring-accent"
                    />
                    <label
                      id={`todo-label-${todo.id}`}
                      htmlFor={`todo-${todo.id}`}
                      className={`text-sm font-medium cursor-pointer ${
                        todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {todo.text}
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTodo(todo.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Delete todo: ${todo.text}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Your task list is empty.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
