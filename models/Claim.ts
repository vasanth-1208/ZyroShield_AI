import mongoose, { Schema } from "mongoose";

const ClaimSchema = new Schema(
  {
    userId: { type: String, required: true },
    risk: { type: String, required: true },
    fraudStatus: { type: String, required: true },
    status: { type: String, required: true },
    payoutAmount: { type: Number, required: true }
  },
  { timestamps: true }
);

export const ClaimModel = mongoose.models.Claim || mongoose.model("Claim", ClaimSchema);
