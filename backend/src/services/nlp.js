const nlp = require("compromise");

// Generate flashcards from notes using lightweight NLP (compromise)
async function generateFlashcards(notes) {
  // Parse the text into sentences
  const doc = nlp(notes);
  const sentences = doc.sentences().out('array');
  const flashcards = [];

  for (let i = 0; i < Math.min(sentences.length, 10); i++) {
    const sentence = sentences[i].trim();
    if (sentence.length < 15) continue;
    
    // Use compromise to find nouns/entities in this specific sentence
    const sDoc = nlp(sentence);
    const nouns = sDoc.nouns().out('array');
    
    if (nouns.length > 0) {
      // Pick the most significant noun (often the last or longest one)
      const targetNoun = nouns[Math.floor(Math.random() * nouns.length)];
      
      // Create a fill-in-the-blank question by replacing the noun
      // We use a regex to ensure we only replace the exact word
      const regex = new RegExp(`\\b${targetNoun}\\b`, 'i');
      const questionText = sentence.replace(regex, "______");
      
      if (questionText !== sentence) {
        flashcards.push({
          question: questionText,
          answer: targetNoun
        });
      }
    }
  }

  // Fallback if no valid questions could be generated
  if (flashcards.length === 0) {
    flashcards.push({ question: "What is the main topic of your notes?", answer: notes });
  }

  return flashcards;
}

module.exports = { generateFlashcards };
