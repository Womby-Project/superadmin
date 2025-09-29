import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const posts = [
  {
    author: "Janilla Conde",
    avatar: "/src/assets/lim.png",
    date: "Posted on Aug 29, 2025",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed? Ut vel tortor auctor, semper... Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    tags: ["Emotions/Moods"],
    reported: 3,
  },
  {
    author: "Janilla Conde",
    avatar: "/src/assets/mother.png",
    date: "Posted on Aug 29, 2025",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed? Ut vel tortor auctor, semper... Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    tags: ["Emotions/Moods"],
  },
    {
    author: "Janilla Conde",
    avatar: "/src/assets/lim.png",
    date: "Posted on Aug 29, 2025",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed? Ut vel tortor auctor, semper... Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    tags: ["Emotions/Moods"],
  },
];

export default function ForumPostsReview() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Forum Posts Under Review</h3>
          <p className="text-sm text-gray-500">Today's New Posts & Reported Posts</p>
        </div>
        <Link
          to="forum-management"
          className="text-sm font-medium text-red-500 hover:text-pink-600"
        >
          View All
        </Link>
      </div>
      <div className="space-y-6">
        {posts.map((post, index) => (
          <div key={index} className="border-t border-gray-100 pt-4">
            <div className="flex items-start space-x-4">
                <img 
                    className="h-10 w-10 rounded-full object-cover" 
                    src={post.avatar} 
                    alt={post.author} 
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; 
                        target.src = `https://placehold.co/40x40/EFEFEF/333333?text=${post.author.charAt(0)}`;
                    }}
                />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">{post.author}</p>
                        <p className="text-xs text-gray-400">{post.date}</p>
                    </div>
                    {post.reported && (
                         <div className="flex items-center text-red-500 text-xs font-medium">
                            <Icon icon="mdi:flag" className="h-4 w-4 mr-1" />
                            <span>Reported by {post.reported} users</span>
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-600 mt-2 mb-3 leading-relaxed">
                    {post.content}
                </p>
                <div>
                  {post.tags.map(tag => (
                    <span key={tag} className="inline-block bg-gray-100 text-gray-600 text-xs font-medium mr-2 px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
