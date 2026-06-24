"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnimatedCard from "@/components/AnimatedCard";

export default function Dashboard() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
            return null;
          }
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data === null) return; // redirecting, do nothing
        if (Array.isArray(data)) setCards(data);
        else setCards([]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Could not connect to the server. Make sure the backend is running.");
        setLoading(false);
      });
  }, [router, API_URL]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this flashcard?")) return;
    try {
      const res = await fetch(`${API_URL}/flashcards/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCards(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="title">Your Dashboard</h1>
        <Link href="/generate" className="btn-create-cards">Create New Cards</Link>
      </div>

      {loading ? (
        <AnimatedCard className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading your flashcards…</p>
        </AnimatedCard>
      ) : error ? (
        <AnimatedCard className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '20px', marginBottom: '1rem', color: '#e05c5c' }}>Connection Error</h2>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        </AnimatedCard>
      ) : cards.length === 0 ? (
        <AnimatedCard className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '20px', marginBottom: '1rem' }}>No flashcards yet!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Generate your first set from your study notes.</p>
        </AnimatedCard>
      ) : (
        <div>
          <div style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-inter)', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: '500', color: 'var(--text-ink)' }}>Total Cards:</span> {cards.length}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {cards.map((card, index) => (
              <AnimatedCard key={card._id} index={index}>
                <h3 style={{ marginBottom: '0.5rem' }}>Q: {card.question}</h3>
                <p>A: {card.answer}</p>
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div className="status-dot-container" style={{ marginBottom: '0.25rem' }}>
                    <span>Status:</span>
                    <span className={`status-dot ${card.status === "known" ? "known" : "not-known"}`}></span>
                    <span style={{ color: 'var(--text-ink)', fontWeight: '500' }}>
                      {card.status === "known" ? "Known" : "Not Known"}
                    </span>
                  </div>
                  <div>
                    Next Review: {new Date(card.nextReviewDate).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(card._id)}
                  className="btn btn-danger"
                  style={{ marginTop: '1rem', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  Delete
                </button>
              </AnimatedCard>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
