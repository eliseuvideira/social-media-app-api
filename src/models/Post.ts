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
  comments: {
    content: string;
    postedBy: any;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost & Document>(
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
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        postedBy: {
          type: Types.ObjectId,
          ref: 'User',
        },
      },
    ],
  },
  { timestamps: true },
);

export type IPostDocument = IPost & Document;

export const Post = model<IPost & Document>('Post', postSchema);
