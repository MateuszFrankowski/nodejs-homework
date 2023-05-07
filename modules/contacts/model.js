import { Schema, model } from "mongoose";

const contactSchema = new Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
    unique: true,
  },
  email: { type: String, required: [true, "Email is required"] },
  phone: { type: String, required: [true, "Phone is required"] },
  favorite: { type: Boolean, default: false },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});

export const Contact = model("contacts", contactSchema);
