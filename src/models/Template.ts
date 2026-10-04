import mongoose, { Schema, model, models } from "mongoose";

export type SizePreset = {
  key: string;   // "M24", "M30"
  label: string; // '24"', '30"'
  basePrice: number;
};

export type TemplateDoc = {
  name: string;       // "Mandir Classic"
  slug: string;       // "mandir-classic" (unique)
  category: string;   // "mandir" (NOT unique)
  isDefault: boolean; // only one default per category
  enabled: boolean;
  description?: string;
  sizePresets: SizePreset[];
};

const SizePresetSchema = new Schema<SizePreset>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    basePrice: { type: Number, required: true },
  },
  { _id: false }
);

const TemplateSchema = new Schema<TemplateDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    category: { type: String, required: true, trim: true }, // NOT unique anymore
    isDefault: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },

    description: { type: String, default: "" },

    sizePresets: { type: [SizePresetSchema], default: [] },
  },
  { timestamps: true }
);

// Only one default per category
TemplateSchema.index(
  { category: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

export const Template =
  (models.Template as mongoose.Model<TemplateDoc>) ||
  model<TemplateDoc>("Template", TemplateSchema);