import { useState, useEffect } from "react";
import data from "@/dummy-data/data.json";
import iconPlus from "@/assets/icon-plus.svg"
import iconMinus from "@/assets/icon-minus.svg"
import iconReply from "@/assets/icon-reply.svg"

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

const images: Record<string, string> = import.meta.glob('/src/assets/avatars/*.{png,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

function CommentSection() {
  const [profile] = useState<any[]>(data.currentUser);
  const [comments] = useState<Comment[]>(data.comments);

  const CommentItem = ({ comment }: { comment: Comment | Reply | User }) => {
    function getImagePath(imagePath: string): string {
      const filename = imagePath.split('/').pop();
      return images[`/src/assets/avatars/${filename}`] || imagePath; 
    }
    const commentDir = comment?.replyingTo ?? null;
    const currentUser = comment.user.username === profile.username;
    
  
    return (
      <div className="p-5 border rounded-md w-full flex gap-4 bg-white border-white">
        <div id="SCORING" className="w-[10%]">
          <div className=" h-fit flex flex-col gap-y-4 items-center justify-center bg-[#F5F6FA] border-[#F5F6FA] rounded-lg py-3">
            <img src={iconPlus} alt="" />
            <p className="font-semibold text-[#5357B6]">{comment.score}</p>
            <img src={iconMinus} alt="" />
          </div>
        </div>
        <div id="COMMENT" className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 ">
              <img
                src={getImagePath(comment.user.image.png)}
                alt={comment.user.username}
                className="w-10 h-10 rounded-full"
              />
              <p className="font-semibold">{comment.user.username}</p>
              {currentUser && (
                <div className="bg-[#5357B6] text-white px-1.5">
                  <p>you</p>
                </div>
              )}
              <p className="text-sm text-gray-500">{comment.createdAt}</p>
            </div>
            <div className="flex gap-2 items-end">
              <img src={iconReply} alt="" className="h-fit pb-1" />
              <p className="font-semibold text-[#5357B6]">Reply</p>
            </div>
          </div>
          <p className="mt-2"><span className="font-semibold text-[#5357B6]">{(commentDir ? `@${commentDir} ` : "")}</span>{comment.content}</p>
        </div>
      </div>
  )};
  

  return (
    <>
      <section className="w-full max-w-[800px] p-4">
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
      </section>
    </>
  );
}

export default CommentSection