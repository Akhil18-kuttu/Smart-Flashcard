const mongoose = require("mongoose");

const FlashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  status: { type: String, enum: ["known", "not_known"], default: "not_known" },
  nextReviewDate: { type: Date, default: Date.now },
  consecutiveKnown: { type: Number, default: 0 }
});

module.exports = mongoose.model("Flashcard", FlashcardSchema);
