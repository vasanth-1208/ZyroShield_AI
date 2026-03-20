import mongoose, { Schema } from "mongoose";

const PayoutSchema = new Schema(
  {
    claimId: { type: String, required: true },
    amount: { type: Number, required: true }
  },
  { timestamps: true }
);

export const PayoutModel = mongoose.models.Payout || mongoose.model("Payout", PayoutSchema);
