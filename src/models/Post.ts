import { Schema, Document, Types, model } from 'mongoose';

interface IPost {
  content: string;
  photo?: {
    url: string;
    filename: string;
    contentType: string;
  };
  postedBy: any;
  likes: any[];
  comments: any[];
  createdAt: Date;
  updatedAt: Date;
}

export type IPostDocument = IPost & Document;

const postSchema = new Schema<IPostDocument>(
  {
    content: {
      type: String,
      required: true,
    },
    photo: {
      type: {
        url: {
          type: String,
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
        contentType: {
          type: String,
          required: true,
        },
      },
      required: false,
    },
    postedBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
    likes: [
      {
        type: Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { timestamps: true },
);

export const Post = model<IPost & Document>('Post', postSchema);
