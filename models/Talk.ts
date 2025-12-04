import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  nickname: string;
  text: string;
  date: Date;
}

export interface ITalk extends Document {
  title?: string;
  text: string;
  nickname?: string;
  category?: string;
  visibility: 'public' | 'private';
  date: Date;
  likes: number;
  comments: IComment[];
  status: 'pending' | 'approved' | 'responded' | 'deleted';
  slug?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    nickname: { type: String, trim: true, maxlength: 100 },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TalkSchema: Schema = new Schema(
  {
    title: { type: String, trim: true, maxlength: 200 },
    text: { type: String, required: true },
    nickname: { type: String, trim: true, maxlength: 100 },
    category: { type: String, trim: true, maxlength: 100 },
    visibility: { type: String, enum: ['public', 'private'], required: true },
    date: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    comments: { type: [CommentSchema], default: [] },
    status: { type: String, enum: ['pending', 'approved', 'responded', 'deleted'], default: 'pending' },
    slug: { type: String, lowercase: true, unique: false },
    email: { type: String, trim: true },
  },
  { timestamps: true }
);

TalkSchema.index({ visibility: 1, status: 1, date: -1 });
TalkSchema.index({ slug: 1 });

export default mongoose.models.Talk || mongoose.model<ITalk>('Talk', TalkSchema);