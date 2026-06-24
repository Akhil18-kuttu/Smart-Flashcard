const express = require("express");
const Flashcard = require("../models/Flashcard");
const { generateFlashcards } = require("../services/nlp");
const auth = require("../middleware/auth");

const router = express.Router();

// Create flashcards
router.post("/create", auth, async (req, res) => {
  try {
    const { notes } = req.body;
    const flashcards = await generateFlashcards(notes);

    const saved = await Flashcard.insertMany(
      flashcards.map(fc => ({ ...fc, userId: req.user.id }))
    );

    res.json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate flashcards" });
  }
});

// List flashcards to review
router.get("/list", auth, async (req, res) => {
  try {
    // Fetch cards where nextReviewDate is less than or equal to now,
    // or just fetch all and sort by nextReviewDate ascending
    const cards = await Flashcard.find({ userId: req.user.id }).sort({ nextReviewDate: 1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch flashcards" });
  }
});

// Review flashcard
router.post("/review", auth, async (req, res) => {
  try {
    const { flashcardId, status } = req.body;
    const flashcard = await Flashcard.findOne({ _id: flashcardId, userId: req.user.id });
    
    if (!flashcard) return res.status(404).json({ error: "Flashcard not found" });

    flashcard.status = status;
    const now = new Date();

    if (status === "known") {
      flashcard.consecutiveKnown += 1;
      // Exponential backoff: next review in 2^consecutiveKnown days
      const daysToAdd = Math.pow(2, flashcard.consecutiveKnown);
      flashcard.nextReviewDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    } else {
      flashcard.consecutiveKnown = 0;
      // Review again very soon (e.g., 1 minute)
      flashcard.nextReviewDate = new Date(now.getTime() + 1 * 60 * 1000);
    }

    await flashcard.save();
    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ error: "Failed to update flashcard" });
  }
});

// Delete flashcard
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Flashcard.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Flashcard not found" });
    res.json({ message: "Flashcard deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete flashcard" });
  }
});

module.exports = router;
