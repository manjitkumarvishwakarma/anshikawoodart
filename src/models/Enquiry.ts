import mongoose, { Schema, model, models } from "mongoose";

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

const EnquirySchema = new Schema(
  {
    designId: { type: Schema.Types.ObjectId, ref: "Design", required: false },

    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },

    template: { type: String, default: "Mandir" },
    sizeKey: { type: String, enum: ["M24", "M30"], required: false },
    materialName: { type: String, default: "" },

    estimatedPrice: { type: Number, default: 0 },
    previewImageUrl: { type: String, default: "" },

    customSize: { type: CustomSizeSchema, default: () => ({ enabled: false }) },

    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "confirmed", "completed", "cancelled"],
      default: "new",
    },
  },
  { timestamps: true }
);

export const Enquiry = models.Enquiry || model("Enquiry", EnquirySchema);