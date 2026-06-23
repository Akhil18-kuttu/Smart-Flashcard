"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [cards, setCards] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:5000/flashcards/list", {
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
        if (Array.isArray(data)) setCards(data);
        else setCards([]);
      })
      .catch(err => console.error(err));
  }, [router]);

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="title">Your Dashboard</h1>
        <Link href="/generate" className="btn btn-primary">Create New Cards</Link>
      </div>

      {cards.length === 0 ? (
        <div className="card glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2>No flashcards yet!</h2>
          <p style={{ marginTop: '1rem', color: 'var(--border-color)' }}>Generate your first set from your study notes.</p>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontWeight: 'bold' }}>Total Cards:</span> {cards.length}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {cards.map(card => (
              <div key={card._id} className="card">
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Q: {card.question}</h3>
                <p style={{ color: 'var(--text-color)', opacity: 0.8 }}>A: {card.answer}</p>
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--border-color)' }}>
                  Status: {card.status === "known" ? "🟢 Known" : "🔴 Not Known"}<br/>
                  Next Review: {new Date(card.nextReviewDate).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
