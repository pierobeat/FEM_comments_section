export type User = {
   image: { 
   png: string
   webp: string 
   }
   username: string
}

type BaseInteraction = {
   id: number
   content: string
   createdAt: string
   score: number
   user: User,
   replies?: Reply[]
}

export type Comment = BaseInteraction & {
   replyingTo?: string | null,
   replies?: Reply[]
}
export type Reply = BaseInteraction & {
   replyingTo?: string | null,
   replies?: Reply[]
}

export type EditComment = {
   id: number | null
   comment: string
}