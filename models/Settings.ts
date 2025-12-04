import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  footerText: string;
  aboutText: string;
  communityDescription: string;
  socialLinks: {
    discord?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
  };
  podcastHighlights: string[];
}

const SettingsSchema: Schema = new Schema(
  {
    footerText: {
      type: String,
      default: 'This website does not collect or store personal user information. All content is shared by the community for educational and philosophical discussion.',
    },
    aboutText: {
      type: String,
      default: 'Wisdom Circle – Malahida is a community dedicated to philosophy, freethought, atheism, rationalism, and Amazigh intellectual culture.',
    },
    communityDescription: {
      type: String,
      default: 'A space for Moroccan atheists, Amazigh philosophers, freethinkers, and rationalists to share ideas and engage in meaningful discourse.',
    },
    socialLinks: {
      discord: {
        type: String,
        default: 'https://discord.gg/W5qJ4hgFxp',
      },
      youtube: String,
      instagram: {
        type: String,
        default: 'https://www.instagram.com/wisdom_circle0?igsh=aXFyam5iMWl2ZzZ0',
      },
      twitter: String,
      facebook: {
        type: String,
        default: 'https://web.facebook.com/mazigh.apollo',
      },
      tiktok: {
        type: String,
        default: 'https://www.tiktok.com/@wisdomcircle1',
      },
    },
    podcastHighlights: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    // Create with default socialLinks
    settings = await this.create({
      socialLinks: {
        discord: 'https://discord.gg/W5qJ4hgFxp',
        instagram: 'https://www.instagram.com/wisdom_circle0?igsh=aXFyam5iMWl2ZzZ0',
        facebook: 'https://web.facebook.com/mazigh.apollo',
        tiktok: 'https://www.tiktok.com/@wisdomcircle1',
      },
    });
  } else {
    // Ensure socialLinks exists
    if (!settings.socialLinks) {
      settings.socialLinks = {
        discord: 'https://discord.gg/W5qJ4hgFxp',
        instagram: 'https://www.instagram.com/wisdom_circle0?igsh=aXFyam5iMWl2ZzZ0',
        facebook: 'https://web.facebook.com/mazigh.apollo',
        tiktok: 'https://www.tiktok.com/@wisdomcircle1',
      };
      await settings.save();
    }
  }
  return settings;
};

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

