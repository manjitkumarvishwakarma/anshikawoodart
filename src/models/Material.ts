import mongoose, { Schema, model, models } from "mongoose";

export type MaterialDoc = {
  name: string;
  enabled: boolean;
  multiplier: number;
  previewColor?: string;
};

const MaterialSchema = new Schema<MaterialDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    enabled: { type: Boolean, default: true },
    multiplier: { type: Number, required: true },
    previewColor: { type: String },
  },
  { timestamps: true }
);

export const Material =
  (models.Material as mongoose.Model<MaterialDoc>) ||
  model<MaterialDoc>("Material", MaterialSchema);