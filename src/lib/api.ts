
import { 
  ApiResponse, 
  Category, 
  Project, 
  Link, 
  Attachment 
} from './types';

// This is a placeholder for the Supabase client
// We're mocking it for now and will be replaced with actual Supabase client
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 800));

// Mock data
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Web Development',
    description: 'Web application projects',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mobile Apps',
    description: 'Mobile application projects',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'UI/UX Design',
    description: 'Design projects',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Portfolio Website',
    description: 'Personal portfolio website built with React and Tailwind CSS',
    category_id: '1',
    tags: ['React', 'Tailwind CSS', 'Vite'],
    is_deleted: false,
    status: 'published',
    author_id: 'user123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user123',
    modified_by: 'user123',
    category: mockCategories[0],
  },
  {
    id: '2',
    name: 'E-commerce App',
    description: 'Mobile e-commerce application with React Native',
    category_id: '2',
    tags: ['React Native', 'Redux', 'Node.js'],
    is_deleted: false,
    status: 'published',
    author_id: 'user123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user123',
    modified_by: 'user123',
    category: mockCategories[1],
  },
  {
    id: '3',
    name: 'Banking Dashboard',
    description: 'UI design for a banking dashboard',
    category_id: '3',
    tags: ['Figma', 'UI Design', 'UX Research'],
    is_deleted: false,
    status: 'published',
    author_id: 'user123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user123',
    modified_by: 'user123',
    category: mockCategories[2],
  },
];

const mockLinks: Link[] = [
  {
    id: '1',
    title: 'GitHub',
    url: 'https://github.com/yourusername',
    description: 'Check out my code repositories',
    order: 1,
    is_active: true,
  },
  {
    id: '2',
    title: 'LinkedIn',
    url: 'https://linkedin.com/in/yourusername',
    description: 'Professional profile and resume',
    order: 2,
    is_active: true,
  },
  {
    id: '3',
    title: 'Twitter',
    url: 'https://twitter.com/yourusername',
    description: 'Thoughts and updates',
    order: 3,
    is_active: true,
  },
  {
    id: '4',
    title: 'Medium',
    url: 'https://medium.com/@yourusername',
    description: 'Articles and blog posts',
    order: 4,
    is_active: true,
  },
];

// Categories API
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  try {
    await mockDelay();
    return { data: mockCategories };
  } catch (error) {
    return { 
      error: { 
        message: 'Failed to fetch categories', 
        status: 500 
      } 
    };
  }
};

// Projects API
export const getProjects = async (): Promise<ApiResponse<Project[]>> => {
  try {
    await mockDelay();
    return { data: mockProjects };
  } catch (error) {
    return { 
      error: { 
        message: 'Failed to fetch projects', 
        status: 500 
      } 
    };
  }
};

export const getProjectById = async (id: string): Promise<ApiResponse<Project>> => {
  try {
    await mockDelay();
    const project = mockProjects.find(p => p.id === id);
    if (!project) {
      return { 
        error: { 
          message: 'Project not found', 
          status: 404 
        } 
      };
    }
    return { data: project };
  } catch (error) {
    return { 
      error: { 
        message: 'Failed to fetch project', 
        status: 500 
      } 
    };
  }
};

// Links API
export const getLinks = async (): Promise<ApiResponse<Link[]>> => {
  try {
    await mockDelay();
    return { data: mockLinks };
  } catch (error) {
    return { 
      error: { 
        message: 'Failed to fetch links', 
        status: 500 
      } 
    };
  }
};

// This will be replaced with actual authentication logic
export const isAuthenticated = (): boolean => {
  // Just for demo purposes
  return false;
}

// Helper to check if user is admin
export const isAdmin = (): boolean => {
  // Just for demo purposes
  return false;
}
