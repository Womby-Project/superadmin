import profilePic from '../assets/lim.png';

export interface Comment {
  id: number;
  author: {
    name: string;
    profilePic: string;
  };
  date: string;
  replyTo?: string;
  content: string;
  likes: number;
  status?: 'Posted' | 'Pending' | 'Under Review' | 'Retained' | 'Removed';
  reportedBy?: {
    count: number;
    severity: 'Low' | 'Medium' | 'High';
    reasons: string[];
  };
}

export interface ForumPost {
  id: number;
  author: {
    name: string;
    profilePic: string;
  };
  date: string;
  content: string;
  replyTo?: string;
  tags: string[];
  likes: number;
  comments: number;
  commentsList?: Comment[]; 
  status?: 'Posted' | 'Pending' | 'Under Review' | 'Retained' | 'Removed';
  reportedBy?: {
    count: number;
    severity: 'Low' | 'Medium' | 'High';
    reasons: string[];
  };
}

export const forumPosts: ForumPost[] = [
  {
    id: 1,
    author: { name: 'Theresa Webb', profilePic },
    date: 'Sep 25, 2025',
    content: 'Just wanted to share a quick tip that helped me with postpartum recovery! Incorporating more iron-rich foods like spinach and lentils really boosted my energy levels. Hope this helps someone else!',
    tags: ['Diet/Nutrition', 'Physical Recovery'],
    likes: 125,
    comments: 2, 
    status: 'Posted',
    commentsList: [ 
      {
        id: 1001,
        author: { name: 'Janilla Conde', profilePic },
        date: '1 hour ago',
        replyTo: '@Theresa Webb',
        content: 'Thanks for sharing! I was looking for ways to improve my energy.',
        likes: 15,
        status: 'Posted',
      },
      {
        id: 1002,
        author: { name: 'Another Mom', profilePic },
        date: '30 minutes ago',
        replyTo: '@Theresa Webb',
        content: 'Great advice! Adding this to my grocery list now.',
        likes: 8,
        status: 'Pending', // Changed status from 'Posted'
        reportedBy: {      // Added 'reportedBy' object
          count: 1,
          severity: 'Low',
          reasons: ['Spam'],
        },
      },
    ],
  },
];

// Updated mock data for reported posts to reflect different states
export const reportedPosts: ForumPost[] = [
  {
    id: 101,
    author: { name: 'Janilla Conde', profilePic },
    date: 'Sep 29, 2025',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed? Ut vel tortor auctor, semper tellus at, rutrum nisl. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam...',
    tags: ['Emotions/Moods', 'Intrusive Thoughts'],
    likes: 1500,
    comments: 104,
    status: 'Pending',
    reportedBy: {
      count: 3,
      severity: 'Low',
      reasons: ['Spam'],
    },
  },
  {
    id: 102,
    author: { name: 'Janilla Conde', profilePic },
    date: 'Sep 29, 2025',
    replyTo: '@TiredMommy99',
    content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore natus error.',
    tags: [],
    likes: 15,
    comments: 0,
    status: 'Under Review',
    reportedBy: {
      count: 10,
      severity: 'High',
      reasons: ['Hate Speech or Discrimination', 'Spam'],
    },
  },
  {
    id: 103,
    author: { name: 'Janilla Conde', profilePic },
    date: 'Sep 29, 2025',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed? Ut vel tortor auctor, semper tellus at, rutrum nisl. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam...',
    tags: ['Emotions/Moods', 'Intrusive Thoughts'],
    likes: 1500,
    comments: 104,
    status: 'Under Review',
    reportedBy: {
      count: 6,
      severity: 'Medium',
      reasons: ['Misinformation'],
    },
  },
  {
    id: 104,
    author: { name: 'Janilla Conde', profilePic },
    date: 'Sep 29, 2025',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed? Ut vel tortor auctor, semper tellus at, rutrum nisl. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam...',
    tags: ['Emotions/Moods', 'Intrusive Thoughts'],
    likes: 1500,
    comments: 104,
    status: 'Retained',
    reportedBy: {
      count: 4,
      severity: 'Medium',
      reasons: ['Hate Speech or Discrimination', 'Spam'],
    },
  },
];

export const approvalQueue: ForumPost[] = [
  {
    id: 201, // New ID to avoid conflicts
    author: { name: 'Janilla Conde', profilePic },
    date: '16 minutes ago', // Represents "Submitted 16 minutes ago"
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed? Ut vel tortor auctor, semper tellus at, rutrum nisl. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam...',
    tags: ['Emotions/Moods', 'Relationships'],
    likes: 0,
    comments: 0,
    status: 'Pending',
  },
  {
    id: 202, // New ID
    author: { name: 'Janilla Conde', profilePic },
    date: '2 hours ago', // Represents "Submitted 2 hours ago"
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed? Ut vel tortor auctor, semper tellus at, rutrum nisl. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam...',
    tags: ['Emotions/Moods', 'Relationships'],
    likes: 0,
    comments: 0,
    status: 'Pending',
  },
  {
    id: 203, // New ID
    author: { name: 'Janilla Conde', profilePic },
    date: '5 hours ago', // Represents "Submitted 5 hours ago"
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed? Ut vel tortor auctor, semper tellus at, rutrum nisl. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam...',
    tags: ['Emotions/Moods', 'Relationships'],
    likes: 0,
    comments: 0,
    status: 'Pending',
  },
];

export const archivedPosts: ForumPost[] = [
  {
    id: 6,
    author: { name: 'Robert Fox', profilePic },
    date: 'Aug 15, 2025',
    content: 'This is an older discussion about choosing a pediatrician in the Davao City area. This thread is now archived as the information may be outdated. Please start a new post for current recommendations.',
    tags: ['Archived', 'Local Advice'],
    likes: 215,
    comments: 32,
    status: 'Removed', 
    reportedBy: {
      count: 0,
      severity: 'Low',
      reasons: ['Outdated Information']
    }
  },
];