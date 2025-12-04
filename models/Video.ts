import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  description?: string;
  category: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    youtubeUrl: {
      type: String,
      required: [true, 'YouTube URL is required'],
      trim: true,
    },
    youtubeId: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Extract YouTube ID from URL before saving (only if not already set)
VideoSchema.pre('save', function (next) {
  // Only extract if youtubeId is not already set
  if (!this.youtubeId && this.youtubeUrl) {
    // Improved regex to match various YouTube URL formats
    const youtubeIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = this.youtubeUrl.match(youtubeIdRegex);
    if (match && match[1]) {
      this.youtubeId = match[1];
      this.thumbnail = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    } else {
      // If regex fails, try to extract from URL directly
      const urlParts = this.youtubeUrl.split(/[?&]/);
      for (const part of urlParts) {
        if (part.startsWith('v=')) {
          const id = part.substring(2).split('&')[0];
          if (id.length === 11) {
            this.youtubeId = id;
            this.thumbnail = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
            break;
          }
        }
      }
    }
  }
  next();
});

// Index for faster queries
VideoSchema.index({ category: 1, createdAt: -1 });

// Delete the model if it exists to avoid cache issues
if (mongoose.models.Video) {
  delete mongoose.models.Video;
}

export default mongoose.model<IVideo>('Video', VideoSchema);

