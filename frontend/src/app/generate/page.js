"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Generate() {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!notes.trim()) return;
    
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/flashcards/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ notes }),
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) router.push("/");
        throw new Error("Failed to generate");
      }
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error generating cards");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="card glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="title">Generate Flashcards</h1>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-color)', opacity: 0.8 }}>
          Paste your study notes below. Our local AI will analyze the text and automatically generate question/answer pairs for you.
        </p>

        <form onSubmit={handleGenerate}>
          <textarea
            className="input-field"
            placeholder="e.g. Mitochondria is the powerhouse of the cell..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading || !notes.trim()}
            style={{ width: '100%', fontSize: '1.1rem' }}
          >
            {isLoading ? "Generating with AI..." : "Generate Flashcards 🪄"}
          </button>
        </form>
      </div>
    </main>
  );
}
