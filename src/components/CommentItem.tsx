import { memo } from "react";
import ReusableButton from "./ReusableButton";
import { getImagePath } from "../utils/getImagePatch";
import iconPlus from "@/assets/icon-plus.svg";
import iconMinus from "@/assets/icon-minus.svg";
import iconReply from "@/assets/icon-reply.svg";
import iconDelete from "@/assets/icon-delete.svg";
import iconEdit from "@/assets/icon-edit.svg";
import type { 
   User,
   Comment,
   Reply,
   EditComment 
} from '@/utils/types';

export const CommentItem = memo(({ 
   comment,
   profile,
   editUserComment,
   userReplying,
   replyingId,
   setEditUserComment,
   setReplyingId,
   setUserReplying,
   setDisableMainInput,
   // onAddComment,
   onDeleteUserComment,
   onUpdateComment,
   handleReplyChange,
   handleEditChange,
   handleSendReply,
   handleCancelReply
}: {
   comment: Comment | Reply,
   profile: User,
   editUserComment: EditComment,
   userReplying: string,
   replyingId: number | null,
   setEditUserComment: React.Dispatch<React.SetStateAction<EditComment>>,
   setReplyingId: React.Dispatch<React.SetStateAction<number | null>>,
   setUserReplying: React.Dispatch<React.SetStateAction<string>>,
   setDisableMainInput: React.Dispatch<React.SetStateAction<boolean>>,
   // onAddComment: (comment: string, id: number | null, isReplying: boolean) => void,
   onDeleteUserComment: (id: number | null) => void,
   onUpdateComment: (id: number, updatedComment: string) => void,
   handleReplyChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
   handleEditChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
   handleSendReply: () => void,
   handleCancelReply: () => void
}) => {
   const {user} = comment
   const commentDir = comment.replyingTo ? `@${comment.replyingTo} ` : "";
   const currentUser = comment.user.username === profile.username;
   
   return editUserComment.id !== comment.id ? (
      <>
         <div className="p-5 border rounded-md w-full flex gap-4 bg-white border-white">
            <div id="SCORING" className="w-[10%] px-4">
               <div className="h-fit flex flex-col gap-y-4 items-center justify-center bg-[#F5F6FA] border-[#F5F6FA] rounded-lg py-3">
                  <img src={iconPlus} alt="" />
                  <p className="font-semibold text-[#5357B6]">{comment.score}</p>
                  <img src={iconMinus} alt="" />
               </div>
            </div>
            <div id="COMMENT" className="w-[90%]">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 ">
                  <img
                     src={getImagePath(user.image.png)}
                     alt={user.username}
                     className="w-10 h-10 rounded-full"
                  />
                  <p className="font-semibold">{user.username}</p>
                  {currentUser && (
                     <div className="bg-[#5357B6] text-white px-1.5 border-transparent rounded-md">
                        <p>you</p>
                     </div>
                  )}
                  <p className="text-sm text-gray-500">{comment.createdAt}</p>
                  </div>
                  <div className="flex gap-x-1 items-end">
                     {
                        currentUser && (
                           <>
                              <ReusableButton 
                              Icon={iconDelete}
                              label="Delete"
                              color="text-[#ED6368]"
                              hoverColor="hover:bg-[#ed63686e]"
                              buttonFunc={() => onDeleteUserComment(comment.id)}
                              />
                              <ReusableButton 
                              Icon={iconEdit}
                              label="Edit"
                              color="text-[#5357B6]"
                              hoverColor="hover:bg-[#5356b667]"
                              buttonFunc={() => {
                                 setEditUserComment({
                                 id: comment.id,
                                 comment: commentDir ? commentDir + comment.content : comment.content
                                 })
                                 setDisableMainInput(true)
                              }}
                              />
                           </>
                        )
                     }
                     <ReusableButton 
                        Icon={iconReply}
                        label="Reply"
                        color="text-[#5357B6]"
                        hoverColor="hover:bg-[#5356b667]"
                        buttonFunc={() => {
                           setReplyingId(comment.id)
                           setUserReplying(`@${user.username} `)
                           setDisableMainInput(true)
                        }}
                     />
                  </div>
               </div>
               <p className="mt-2 text-gray-500"><span className="font-semibold text-[#5357B6]">{(commentDir ? `${commentDir} ` : "")}</span>{comment.content}</p>
            </div>
         </div>
         {
            replyingId && replyingId === comment.id && (
               <div className="p-6 bg-white flex gap-4 h-[20vh] max-h-[20vh]">
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
                  value={userReplying}
                  onChange={handleReplyChange}
                  />
                  <div className="h-fit space-y-4 w-[6rem]">
                  <button 
                     className="cursor-pointer bg-[#5357B6] text-white uppercase py-2 w-full border-transparent rounded-lg"
                     onClick={handleSendReply}
                  >
                     send
                  </button>
                  <button 
                     className="cursor-pointer bg-[#b65353] text-white uppercase py-2 w-full border-transparent rounded-lg"
                     onClick={handleCancelReply}
                  >
                     Cancel
                  </button>
                  </div>
               </div>
            )
         }
      </>
   ):(
      <div className="p-6 bg-white flex gap-4 h-[20vh] max-h-[20vh]">
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
         value={editUserComment.comment}
         onChange={handleEditChange}
         />
         <div className="h-fit space-y-4 w-[6rem]">
            <button 
               className="cursor-pointer bg-[#5357B6] text-white uppercase py-2 w-full border-transparent rounded-lg"
               onClick={() => {
                  if (editUserComment.id !== null) {
                     onUpdateComment(editUserComment.id, editUserComment.comment);
                     setDisableMainInput(false);
                  }
               }}
            >
               Update
            </button>
            <button 
               className="cursor-pointer bg-[#b65353] text-white uppercase py-2 w-full border-transparent rounded-lg"
               onClick={() => setEditUserComment({
                  id: null,
                  comment: ""
               })}
            >
               Cancel
            </button>
         </div>
      </div>
   )
});