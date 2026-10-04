import mongoose, { Schema, model, models } from "mongoose";

const CreationImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);

const CreationSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },

    category: {
      type: String,
      required: true,
      enum: ["mandir", "chairs", "tables", "cabinets", "wooden-art", "pillars-posts", "decor"],
    },

    shortDescription: { type: String, default: "" },
    longDescription: { type: String, default: "" },

    tags: { type: [String], default: [] },

    // Pricing:
    // - fixedPrice => ready-made exact price
    // - startingPrice => customizable "starting from"
    fixedPrice: { type: Number, default: 0 },
    startingPrice: { type: Number, default: 0 },

    featured: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },

    // For linking to customizer
    customizable: { type: Boolean, default: false },
    templateSlug: { type: String, default: "" }, // e.g. "mandir-classic"

    images: { type: [CreationImageSchema], default: [] },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CreationSchema.index({ enabled: 1, category: 1, featured: 1 });
CreationSchema.index({ slug: 1 }, { unique: true });

export const Creation = models.Creation || model("Creation", CreationSchema);