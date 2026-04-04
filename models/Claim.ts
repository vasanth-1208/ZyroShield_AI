import mongoose, { Schema } from "mongoose";

const ClaimSchema = new Schema(
  {
    userId: { type: String, required: true },
    risk: { type: String, required: true },
    reason: { type: String, required: true, default: "NONE" },
    fraudStatus: { type: String, required: true },
    status: { type: String, required: true },
    payoutAmount: { type: Number, required: true },
    deductible: { type: Number },
    eligibleAmount: { type: Number },
    approvalReason: { type: String },
    rejectionReason: { type: String },
    confidenceScore: { type: Number },
    timeline: { type: Array, required: true, default: [] }
  },
  { timestamps: true }
);

export const ClaimModel = mongoose.models.Claim || mongoose.model("Claim", ClaimSchema);
