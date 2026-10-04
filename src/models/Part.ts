import mongoose, { Schema, model, models } from "mongoose";

export type Anchor = {
  id: string;
  type: string;
  gender: "male" | "female";
  x: number;
  y: number;
};

export type PartDoc = {
  key: string;                 // stable string key e.g. "base_a"
  name: string;                // display name
  category: "mandir";
  enabled: boolean;
  group: string;               // UI grouping (Base, Pillars, Canopy, etc.)
  layerOrder: number;          // drawing order on canvas
  imageBySize: { M24: string; M30: string };
  pricesBySize: { M24: number; M30: number };
  anchors: Anchor[];
};

const AnchorSchema = new Schema<Anchor>(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false }
);

const PartSchema = new Schema<PartDoc>(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: ["mandir"], required: true },
    enabled: { type: Boolean, default: true },
    group: { type: String, required: true },
    layerOrder: { type: Number, default: 0 },
    imageBySize: {
      M24: { type: String, required: true },
      M30: { type: String, required: true },
    },
    pricesBySize: {
      M24: { type: Number, required: true },
      M30: { type: Number, required: true },
    },
    anchors: { type: [AnchorSchema], default: [] },
  },
  { timestamps: true }
);

export const Part =
  (models.Part as mongoose.Model<PartDoc>) || model<PartDoc>("Part", PartSchema);