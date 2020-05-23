import { Schema, model, Types } from 'mongoose';

interface IComment {
  content: string;
  postedBy: any;
  createdAt: Date;
  updatedAt: Date;
}

export type ICommentDocument = IComment & Document;

const commentSchema = new Schema<ICommentDocument>(
  {
    content: {
      type: String,
      required: true,
    },
    postedBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

export const Comment = model('Comment', commentSchema);
