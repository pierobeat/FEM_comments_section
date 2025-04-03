import { useState, useCallback, memo } from "react";
import data from "../dummy-data/data.json";
import { getImagePath } from "../utils/getImagePatch";
import Swal from "sweetalert2";
import type { 
  User,
  Comment,
  Reply,
  EditComment 
} from '../utils/types';
import { CommentItem } from "./CommentItem";

function CommentSection() {
  const [profile] = useState<User>(data.currentUser);
  const [comments, setComments] = useState<Comment[]>(data.comments);  
  const [userComment, setUserComment] = useState<string>("");
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [userReplying, setUserReplying] = useState<string>("");
  const [editUserComment, setEditUserComment] = useState<EditComment>({
    id: null,
    comment: ""
  })
  const [disableMainInput, setDisableMainInput] = useState<boolean>(false);

  const handleReplyChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setUserReplying(e.target.value);
  }, []);

  const handleEditChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setEditUserComment((dt: EditComment) => ({...dt, comment: e.target.value}));
  }, []);

  const handleSendReply = useCallback(() => {
    onAddComment(userReplying, replyingId, true);
  }, [userReplying, replyingId]);

  const handleCancelReply = useCallback(() => {
    setReplyingId(null);
    setDisableMainInput(false);
  }, []);

  function onAddComment(comment: string, replyingId: number | null, isReplying: boolean) {
    if (!comment.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Comment cannot be empty!",
      });
      return;
    }
  
    try {
      const getIds = (data: (Comment | Reply)[]): number[] => {
        let ids: number[] = [];
        data.forEach((dt: Comment | Reply) => {
          ids.push(dt.id);
          if (dt.replies && dt.replies.length > 0) {
            ids = ids.concat(getIds(dt.replies));
          }
        });
        return ids;
      };
  
      const findCommentById = (data: (Comment | Reply)[], targetId: number): Comment | Reply | null => {
        for (const item of data) {
          if (item.id === targetId) return item;
          if (item.replies && item.replies.length > 0) {
            const found = findCommentById(item.replies, targetId);
            if (found) return found;
          }
        }
        return null;
      };
  
      const getLastId = Math.max(...getIds(comments), 0);
      const repliedComment = replyingId !== null ? findCommentById(comments, replyingId) : null;
      
      const replyingTo = repliedComment ? repliedComment.user.username : "";
      
      // Remove mention from the comment if it matches replyingTo
      const pureComment = comment.replace(new RegExp(`^@${replyingTo}\\s*`, "i"), "").trim();
  
      const newComment: Comment | Reply = {
        id: getLastId + 1,
        content: pureComment,
        createdAt: "Just now",
        score: 0,
        user: profile,
        replies: [],
        ...(isReplying ? { replyingTo } : {}),
      };
  
      if (isReplying && replyingId !== null) {
        setComments((prevComments) => {
          const updateReplies = (data: Comment[]): Comment[] => {
            return data.map((item) => {
              if (item.id === replyingId) {
                return {
                  ...item,
                  replies: [...(item.replies || []), newComment],
                };
              } else if (item.replies && item.replies.length > 0) {
                return { ...item, replies: updateReplies(item.replies) };
              }
              return item;
            });
          };
          return updateReplies(prevComments);
        });
      } else {
        setComments((prevComments) => [...prevComments, newComment]);
      }
  
      setUserComment("");
      setUserReplying("");
      setReplyingId(null);
      setDisableMainInput(false);
  
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: isReplying ? "Your reply has been added." : "Your comment has been added.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong while adding your comment.",
      });
      console.error("Error adding comment:", error);
    }
  }
  
  function onDeleteUserComment(id: number | null) {
    if (id === null) return;
  
    Swal.fire({
      html: `<div class="text-left space-y-2">
              <h1 class="font-semibold text-xl">Delete Comment</h1>
              <p>Are you sure you want to delete this comment? this will remove the comment and can't be undone</p>
            </div>`,
      showDenyButton: true,
      confirmButtonText: "YES, DELETE",
      denyButtonText: "NO, CANCEL",
      reverseButtons: true,
      buttonsStyling: true,
      width: 380,
      customClass: {
        popup: "w-[300px] max-w-[90%] p-4",
        confirmButton: "swal2-deny",
        denyButton: "swal2-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setComments((prevComments) => {
          const deleteComment = (data: (Comment | Reply)[]): (Comment | Reply)[] => {
            return data
              .map((item) => ({
                ...item,
                replies: item.replies ? deleteComment(item.replies) : [],
              }))
              .filter((item) => item.id !== id); // Hapus jika id cocok
          };
  
          return deleteComment(prevComments);
        });
  
        Swal.fire("Deleted!", "", "success");
      } else if (result.isDenied) {
        Swal.fire("Cancelled", "", "info");
      }
    });
  }

  function onUpdateComment(id: number | null, updatedComment: string) {
    if (id === null) return;
  
    if (!updatedComment.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Comment cannot be empty!",
      });
      return;
    }
  
    try {
      setComments((prevComments) => {
        const updateComment = (data: (Comment | Reply)[]): (Comment | Reply)[] => {
          return data.map((item) => {
            if (item.id === id) {
              return { ...item, content: updatedComment };
            } else if (item.replies && item.replies.length > 0) {
              return { ...item, replies: updateComment(item.replies) };
            }
            return item;
          });
        };
        return updateComment(prevComments);
      });
  
      setEditUserComment({ id: null, comment: "" });
  
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Your comment has been updated successfully.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong while updating your comment.",
      });
      console.error("Error updating comment:", error);
    }
  }

  const repliesDesign = (replies: Reply[], level = 1) => (
    <div className="space-y-4 border-l-2 border-[#EDEEF2] pl-4 mt-4" style={{ marginLeft: `${level * 30}px` }}>
      {replies.map((reply) => (
        <div key={`reply-${reply.id}`}>
          <CommentItem 
            comment={reply}
            profile={profile}
            editUserComment={editUserComment}
            userReplying={userReplying}
            replyingId={replyingId}
            setEditUserComment={setEditUserComment}
            setReplyingId={setReplyingId}
            setUserReplying={setUserReplying}
            setDisableMainInput={setDisableMainInput}
            onAddComment={onAddComment}
            onDeleteUserComment={onDeleteUserComment}
            onUpdateComment={onUpdateComment}
            handleReplyChange={handleReplyChange}
            handleEditChange={handleEditChange}
            handleSendReply={handleSendReply}
            handleCancelReply={handleCancelReply}
          />
          {reply.replies && reply.replies.length > 0 && repliesDesign(reply.replies, level + 1)}
        </div>
      ))}
    </div>
  );

  return (
    <section className="w-full max-w-[800px] h-[100vh] flex flex-col relative py-4">
      <h2 className="text-xl font-bold">Comments</h2>
      <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-4">
        {comments.map((comment) => (
          <div key={`comment-${comment.id}`} className="space-y-4">
            <CommentItem 
              comment={comment}
              profile={profile}
              editUserComment={editUserComment}
              userReplying={userReplying}
              replyingId={replyingId}
              setEditUserComment={setEditUserComment}
              setReplyingId={setReplyingId}
              setUserReplying={setUserReplying}
              setDisableMainInput={setDisableMainInput}
              onAddComment={onAddComment}
              onDeleteUserComment={onDeleteUserComment}
              onUpdateComment={onUpdateComment}
              handleReplyChange={handleReplyChange}
              handleEditChange={handleEditChange}
              handleSendReply={handleSendReply}
              handleCancelReply={handleCancelReply}
            />
            {comment.replies && comment.replies.length > 0 && repliesDesign(comment.replies, 1)}
          </div>
        ))}
      </div>
      <div name="MAIN-INPUT" className="p-6 bg-white flex gap-4 mobile:h-[20vh] border-transparent rounded-xl">
        <div className="max-[700px]:hidden">
          <img
            src={getImagePath(profile.image.png)}
            alt={profile.username}
            className="rounded-full"
          />
        </div>
        <div className="flex w-full gap-x-2 gap-y-4 flex-col mobile:flex-row">
          <textarea
            placeholder="Add a comment..."
            className="w-full p-2 border rounded-md h-full resize-none overflow-y-auto max-[700px]:h-[100px]"
            value={userComment}
            onChange={(e) => {
              e.preventDefault()
              setUserComment(e.target.value)
            }}
            disabled={disableMainInput}
          />
          <div className="flex justify-between">
            <div className="min-[700px]:hidden">
              <img
                src={getImagePath(profile.image.png)}
                alt={profile.username}
                className="rounded-full"
              />
            </div>
            <div className="h-fit">
              <button 
                className={`cursor-pointer text-white uppercase py-2 w-[6rem] border-transparent rounded-lg ${disableMainInput ? "bg-[#5356b66e]" : "bg-[#5357B6]"}`}
                onClick={() => onAddComment(userComment, null, false)}
                disabled={disableMainInput}
              >
                send
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(CommentSection);