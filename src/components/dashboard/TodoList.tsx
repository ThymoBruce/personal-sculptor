
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Plus, Trash, CheckCheck, CircleEllipsis } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to load todos",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTodoTitle.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          title: newTodoTitle,
          completed: false,
          priority: 'medium',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setTodos([data, ...todos]);
      setNewTodoTitle("");
      toast({
        title: "Task Added",
        description: "Your new task has been added to the list",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add todo";
      toast({
        variant: "destructive",
        title: "Failed to add task",
        description: errorMessage,
      });
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setTodos(todos.map(todo => todo.id === id ? data : todo));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task";
      toast({
        variant: "destructive",
        title: "Failed to update task",
        description: errorMessage,
      });
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTodos(todos.filter(todo => todo.id !== id));
      toast({
        title: "Task Deleted",
        description: "The task has been removed from your list",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete task";
      toast({
        variant: "destructive",
        title: "Failed to delete task",
        description: errorMessage,
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
    }
  };

  const cyclePriority = async (id: string, currentPriority: 'low' | 'medium' | 'high') => {
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(currentPriority);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ priority: nextPriority })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setTodos(todos.map(todo => todo.id === id ? data : todo));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update priority";
      toast({
        variant: "destructive",
        title: "Failed to update priority",
        description: errorMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="flex items-center justify-between p-4 h-12 bg-secondary/40" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button 
          onClick={() => fetchTodos()}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Daily To-Do List</h2>
        
        {todos.length > 0 && todos.some(todo => todo.completed) && (
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={async () => {
              try {
                const { error } = await supabase
                  .from('todos')
                  .delete()
                  .eq('completed', true);
                
                if (error) throw error;
                
                setTodos(todos.filter(todo => !todo.completed));
                toast({
                  title: "Completed Tasks Cleared",
                  description: "All completed tasks have been removed",
                });
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to clear tasks";
                toast({
                  variant: "destructive",
                  title: "Failed to clear tasks",
                  description: errorMessage,
                });
              }
            }}
          >
            <CheckCheck size={14} />
            Clear Completed
          </Button>
        )}
      </div>

      <form onSubmit={addTodo} className="mb-6 flex gap-2">
        <Input
          placeholder="Add a new task..."
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" className="flex items-center gap-1">
          <Plus size={16} />
          Add
        </Button>
      </form>

      {todos.length === 0 ? (
        <div className="text-center py-12 bg-secondary/20 rounded-lg">
          <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Your to-do list is empty. Add your first task to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <Card 
              key={todo.id} 
              className={`transition-colors ${todo.completed ? 'bg-muted/50' : ''}`}
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox 
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
                    className="h-5 w-5"
                  />
                  <span 
                    className={`flex-1 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {todo.title}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-7 px-2 text-xs rounded-full ${getPriorityColor(todo.priority)}`}
                    onClick={() => cyclePriority(todo.id, todo.priority)}
                  >
                    <CircleEllipsis size={12} className="mr-1" />
                    {todo.priority}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    <Trash size={14} />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
