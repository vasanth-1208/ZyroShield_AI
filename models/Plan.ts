import mongoose, { Schema } from "mongoose";

const PlanSchema = new Schema(
  {
    userId: { type: String, required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    premium: { type: Number, required: true },
    coverage: { type: Number, required: true },
    aiAdjustedPremium: { type: Number, required: true },
    status: { type: String, required: true, default: "ACTIVE" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    renewedFromId: { type: String }
  },
  { timestamps: true }
);

export const PlanModel = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
