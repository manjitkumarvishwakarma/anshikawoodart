import mongoose, { Schema, model, models } from "mongoose";

const DesignItemSchema = new Schema(
  {
    id: { type: String, required: true },      // uuid
    partKey: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    rotation: { type: Number, default: 0 },
    scale: { type: Number, default: 1 },
    snappedTo: {
      targetItemId: { type: String },
      targetAnchorId: { type: String },
      myAnchorId: { type: String },
    },
  },
  { _id: false }
);

const CustomSizeSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    unit: { type: String, enum: ["inch", "mm"], default: "inch" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    depth: { type: Number, default: 0 },
  },
  { _id: false }
);

const DesignSchema = new Schema(
  {
    templateCategory: { type: String, required: true, default: "mandir" },
    sizeKey: { type: String, enum: ["M24", "M30"], required: true },
    materialId: { type: Schema.Types.ObjectId, ref: "Material", required: true },

    items: { type: [DesignItemSchema], default: [] },

    previewImageUrl: { type: String, required: true },
    verifiedEstimate: { type: Number, required: true },

    customSize: { type: CustomSizeSchema, default: () => ({ enabled: false }) },
    templateSlug: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Design = models.Design || model("Design", DesignSchema);