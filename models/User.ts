import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    dailyIncome: { type: Number, required: true },
    vehicleType: { type: String, required: true },
    workingZone: { type: String, required: true },
    safeHistoryScore: { type: Number, required: true, default: 70 }
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
