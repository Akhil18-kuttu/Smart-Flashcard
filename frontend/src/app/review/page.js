"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AnimatedCard from "@/components/AnimatedCard";

export default function Review() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/flashcards/list`, {
      credentials: "include"
    })
      .then(async res => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/");
          }
          throw new Error("Failed to fetch");
        }
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          setCards([]);
          setIsDone(true);
          return;
        }
        // Filter cards that are due for review
        const now = new Date();
        const due = data.filter(c => new Date(c.nextReviewDate) <= now);
        setCards(due);
        if (due.length === 0) setIsDone(true);
      })
      .catch(err => console.error(err));
  }, [router, API_URL]);

  const handleReview = async (status) => {
    const card = cards[currentIndex];

    try {
      await fetch(`${API_URL}/flashcards/review`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ flashcardId: card._id, status }),
      });
      
      setFlipped(false);
      
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsDone(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isDone) {
    return (
      <main className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h1 className="title">You're all caught up!</h1>
        <p style={{ marginTop: '1rem', marginBottom: '2rem', color: 'var(--text-muted)' }}>Come back later to review more cards.</p>
        <button onClick={() => router.push('/dashboard')} className="btn btn-primary">Go to Dashboard</button>
      </main>
    );
  }

  if (cards.length === 0) {
    return <main className="container" style={{ textAlign: 'center', marginTop: '10vh', color: 'var(--text-muted)' }}>Loading...</main>;
  }

  const currentCard = cards[currentIndex];

  return (
    <main className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5vh' }}>
      <h1 className="title" style={{ marginBottom: '2rem', fontSize: '2rem' }}>Review Session</h1>
      <div style={{ marginBottom: '1.5rem', color: 'var(--accent-sage)', fontWeight: '500', fontFamily: 'var(--font-inter)' }}>
        Card {currentIndex + 1} of {cards.length}
      </div>

      <div 
        className={`flashcard ${flipped ? 'flipped' : ''}`} 
        style={{ width: '100%', maxWidth: '600px', height: '300px', cursor: 'pointer', perspective: '1000px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <h2>{currentCard.question}</h2>
            <p style={{ position: 'absolute', bottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to reveal answer</p>
          </div>
          <div className="flashcard-back">
            <h2>{currentCard.answer}</h2>
          </div>
        </div>
      </div>

      {flipped && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={() => handleReview('not_known')} className="btn btn-danger" style={{ minWidth: '120px' }}>
            Not Known
          </button>
          <button onClick={() => handleReview('known')} className="btn btn-success" style={{ minWidth: '120px' }}>
            Known
          </button>
        </div>
      )}
    </main>
  );
}
