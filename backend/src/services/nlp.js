const { pipeline } = require("@xenova/transformers");

let generator;

// Generate flashcards from notes using local t5-small
async function generateFlashcards(notes) {
  if (!generator) {
    // Lazy load the pipeline
    // using text2text-generation for t5
    generator = await pipeline("text2text-generation", "Xenova/t5-small");
  }

  // Split notes roughly by sentences for multiple flashcards if needed, 
  // or simply generate one summary/question. For a smart generator, we extract a summary.
  // In a real app we might chunk the text.
  const chunks = notes.match(/[^\.!\?]+[\.!\?]+/g) || [notes];
  const flashcards = [];

  for (let i = 0; i < Math.min(chunks.length, 5); i++) {
    const chunk = chunks[i].trim();
    if (chunk.length < 10) continue;
    
    // T5 can do summarization or other tasks. 
    // We can use it to generate a shorter version of the sentence to act as a "fill in the blank" or just question-like text.
    const res = await generator(`summarize: ${chunk}`, {
      max_new_tokens: 30
    });
    
    const summary = res[0].generated_text;
    flashcards.push({
      question: `What is the summary of: "${chunk.substring(0, 30)}..."?`,
      answer: summary || chunk
    });
  }

  // Fallback if empty
  if (flashcards.length === 0) {
    flashcards.push({ question: "Key takeaway?", answer: notes });
  }

  return flashcards;
}

module.exports = { generateFlashcards };
