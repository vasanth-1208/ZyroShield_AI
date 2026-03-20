import mongoose, { Schema } from "mongoose";

const PlanSchema = new Schema(
  {
    userId: { type: String, required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    premium: { type: Number, required: true },
    coverage: { type: Number, required: true }
  },
  { timestamps: true }
);

export const PlanModel = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
