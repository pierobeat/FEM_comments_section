import { useState, useEffect } from "react";
import data from "./dummy-data/data.json";

type User = {
  image: { png: string; webp: string };
  username: string;
};

type Reply = {
  id: number;
  content: string;
  createdAt: string;
  score: number;
  replyingTo: string;
  user: User;
};

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  score: number;
  user: User;
  replies: Reply[];
};

const CommentItem = ({ comment }: { comment: Comment | Reply }) => (
  <div className="p-3 border rounded-md bg-gray-100">
    <div className="flex items-center gap-3">
      <img
        src={comment.user.image.png}
        alt={comment.user.username}
        className="w-10 h-10 rounded-full"
      />
      <p className="font-semibold">{comment.user.username}</p>
    </div>
    <p className="mt-2">{comment.content}</p>
    <p className="text-sm text-gray-500">{comment.createdAt}</p>
    <p className="text-sm font-semibold">Score: {comment.score}</p>
  </div>
);


function App() {
  const [comments] = useState<Comment[]>(data.comments);

  return (
    <div className="w-full h-[100vh] bg-[#F5F6FA] flex justify-center pt-12">
      <div className="w-full max-w-[800px] bg-white p-4 shadow-md">
        <h2 className="text-xl font-bold">Comments</h2>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <CommentItem comment={comment} />
              {comment.replies.length > 0 && (
                <div className="ml-4 space-y-4 border-l-1 pl-4">
                  {comment.replies.map((reply) => (
                    <CommentItem key={reply.id} comment={reply} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
