import { useState, useCallback, memo } from "react";
import data from "@/dummy-data/data.json";
import { getImagePath } from "../utils/getImagePatch";
import Swal from "sweetalert2";
import type { 
  User,
  Comment,
  Reply,
  EditComment 
} from '@/utils/types';
import { CommentItem } from "./CommentItem";

function CommentSection() {
  const [profile] = useState<User>(data.currentUser);
  const [comments] = useState<Comment[]>(data.comments);
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

  function onAddComment(comment: string, id: number | null, isReplying: boolean) {
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
  
    const getLastId = Math.max(...getIds(comments));
    
    const repliedComment = isReplying && id ? findCommentById(comments, id) : null;
  
    if (repliedComment) {
      const mentions = comment.match(/@(\w+)/g) || [];
      
      const mentionedUsernames = mentions.map(mention => mention.substring(1));
      
      console.log('Membalas komentar:', repliedComment.content);
      console.log('User yang di-reply:', repliedComment.user.username);
      console.log('Mentioned users:', mentionedUsernames);
      
      if ('replyingTo' in repliedComment) {
        console.log('Ini adalah balasan untuk:', repliedComment.replyingTo);
      }
      
      const pureComment = comment.replace(/@\w+/g, '').trim();
      console.log('Komentar tanpa mention:', pureComment);
    }
  }

  function onDeleteUserComment(id: number | null) { 
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
        Swal.fire("Deleted!", "", "success");
      } else if (result.isDenied) {
        Swal.fire("Cancelled", "", "info");
      }
    });
  }

  return (
    <section className="w-full max-w-[800px] h-[100vh] flex flex-col relative py-4">
      <h2 className="text-xl font-bold">Comments</h2>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              handleReplyChange={handleReplyChange}
              handleEditChange={handleEditChange}
              handleSendReply={handleSendReply}
              handleCancelReply={handleCancelReply}
            />
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-4 space-y-4 border-l pl-4">
                {comment.replies.map((reply: Reply) => (
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
                      handleReplyChange={handleReplyChange}
                      handleEditChange={handleEditChange}
                      handleSendReply={handleSendReply}
                      handleCancelReply={handleCancelReply}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div name="MAIN-INPUT" className="p-6 bg-white flex gap-4 h-[20vh] max-h-[20vh]">
        <div>
          <img
            src={getImagePath(profile.image.png)}
            alt={profile.username}
            className="rounded-full"
          />
        </div>
        <textarea
          placeholder="Add a comment..."
          className="w-full p-2 border rounded-md h-full resize-none overflow-y-auto"
          value={userComment}
          onChange={(e) => {
            e.preventDefault()
            setUserComment(e.target.value)
          }}
          disabled={disableMainInput}
        />
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
    </section>
  );
}

export default CommentSection