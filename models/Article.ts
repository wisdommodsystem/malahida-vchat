import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IArticle extends Document {
  title: string;
  content: string;
  author: string;
  slug: string;
  imageUrl?: string;
  views: number;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Image URL cannot exceed 500 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
ArticleSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    const baseSlug = slugify(this.title as string, { lower: true, strict: true });
    this.slug = `${baseSlug}-${Date.now()}`;
  }
  next();
});

// Index for faster queries
ArticleSchema.index({ approved: 1, createdAt: -1 });
ArticleSchema.index({ slug: 1 });

export default mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);

