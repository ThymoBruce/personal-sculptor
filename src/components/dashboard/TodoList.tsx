
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Todo } from "@/lib/types";
import { 
  PlusCircle, 
  Trash, 
  Flag, 
  CheckCircle, 
  Circle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TodoList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("medium");

  const fetchTodos = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setTodos(data as Todo[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch todos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [user]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            title: newTask,
            priority,
            user_id: user.id
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      setTodos([data as Todo, ...todos]);
      setNewTask("");
      setPriority("medium");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add task",
        variant: "destructive"
      });
    }
  };

  const toggleTodoStatus = async (id: string, completed: boolean) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setTodos(todos.map(todo => (todo.id === id ? (data as Todo) : todo)));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive"
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
        title: "Task deleted",
        description: "The task has been removed."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const updatePriority = async (id: string, newPriority: string) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ priority: newPriority })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setTodos(todos.map(todo => (todo.id === id ? (data as Todo) : todo)));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update priority",
        variant: "destructive"
      });
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const renderPriorityFlag = (priority: string) => {
    return <Flag className={`${getPriorityColor(priority)}`} size={16} />;
  };

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">To-Do List</h2>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addTodo} className="flex flex-col sm:flex-row gap-3">
              <Input 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter a new task..."
                className="flex-grow"
              />
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="flex items-center gap-2">
                <PlusCircle size={16} />
                <span>Add</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {todos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-center text-muted-foreground mb-4">
              You don't have any tasks yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {todos.map(todo => (
            <Card key={todo.id} className={`transition-opacity ${todo.completed ? 'opacity-50' : ''}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <button
                  onClick={() => toggleTodoStatus(todo.id, todo.completed)}
                  className="mt-1.5 flex-shrink-0"
                >
                  {todo.completed ? (
                    <CheckCircle className="text-green-500" size={18} />
                  ) : (
                    <Circle className="text-gray-400 hover:text-gray-600" size={18} />
                  )}
                </button>
                
                <div className="flex-grow">
                  <p className={`${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {todo.title}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <Select 
                      defaultValue={todo.priority} 
                      onValueChange={(value) => updatePriority(todo.id, value)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            {renderPriorityFlag('low')}
                            <span>Low</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            {renderPriorityFlag('medium')}
                            <span>Medium</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            {renderPriorityFlag('high')}
                            <span>High</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
