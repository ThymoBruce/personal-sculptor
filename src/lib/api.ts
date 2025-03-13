
import { 
  ApiResponse, 
  Category, 
  Project, 
  Link, 
  Attachment,
  Song,
  BlogPost
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
    url: 'https://github.com/ThymoBruce',
    description: 'Check out my code repositories',
    display_order: 1,
    is_active: true,
  },
  {
    id: '2',
    title: 'LinkedIn',
    url: 'https://linkedin.com/in/thymobruce',
    description: 'Professional profile and resume',
    display_order: 2,
    is_active: true,
  },
  {
    id: '3',
    title: 'Instagram',
    url: 'https://instagram.com/thymobruce',
    description: 'My music and daily updates',
    display_order: 3,
    is_active: true,
  },
];

const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Midnight Dreams',
    producer: 'Thymo Bruce',
    coverImage: '/placeholder.svg',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    releaseDate: '2023-05-15',
    duration: 237,
  },
  {
    id: '2',
    title: 'Coastal Waves',
    producer: 'Thymo Bruce',
    coverImage: '/placeholder.svg',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-142.mp3',
    releaseDate: '2023-08-22',
    duration: 185,
  },
  {
    id: '3',
    title: 'Urban Rhythms',
    producer: 'Thymo Bruce ft. DJ Maxwell',
    coverImage: '/placeholder.svg',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-621.mp3',
    releaseDate: '2024-01-10',
    duration: 219,
  },
];

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'My Journey into Full-Stack Development',
    slug: 'journey-into-full-stack-development',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl nec nisl.',
    excerpt: 'A reflection on my path to becoming a Full-Stack Developer and the lessons learned along the way.',
    coverImage: '/placeholder.svg',
    publishedDate: '2023-11-15',
    tags: ['Career', 'Programming', 'Web Development'],
    isPublished: true,
  },
  {
    id: '2',
    title: 'The Intersection of Music Production and Coding',
    slug: 'intersection-music-production-coding',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl nec nisl.',
    excerpt: 'How my background in music production has influenced my approach to software development.',
    coverImage: '/placeholder.svg',
    publishedDate: '2024-01-05',
    tags: ['Music', 'Programming', 'Creativity'],
    isPublished: true,
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

// Songs API
export const getSongs = async (): Promise<ApiResponse<Song[]>> => {
  try {
    await mockDelay();
    return { data: mockSongs };
  } catch (error) {
    return { 
      error: { 
        message: 'Failed to fetch songs', 
        status: 500 
      } 
    };
  }
};

// Blog API
export const getBlogPosts = async (): Promise<ApiResponse<BlogPost[]>> => {
  try {
    await mockDelay();
    return { data: mockBlogPosts };
  } catch (error) {
    return { 
      error: { 
        message: 'Failed to fetch blog posts', 
        status: 500 
      } 
    };
  }
};

export const getBlogPostBySlug = async (slug: string): Promise<ApiResponse<BlogPost>> => {
  try {
    await mockDelay();
    const post = mockBlogPosts.find(p => p.slug === slug);
    if (!post) {
      return { 
        error: { 
          message: 'Blog post not found', 
          status: 404 
        } 
      };
    }
    return { data: post };
  } catch (error) {
    return { 
      error: { 
        message: 'Failed to fetch blog post', 
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
