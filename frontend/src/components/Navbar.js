"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then(res => {
        if (res.ok) setIsAuth(true);
        else setIsAuth(false);
      })
      .catch(() => setIsAuth(false))
      .finally(() => setIsLoading(false));
  }, [API_URL]);

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    setIsAuth(false);
    router.push('/');
  };

  if (isLoading) return <nav className="navbar"><div className="navbar-brand">⚡ SmartFlash</div></nav>;

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">⚡ SmartFlash</Link>
      <div className="nav-links">
        {isAuth ? (
          <>
            <Link href="/dashboard" className="btn btn-outline">Dashboard</Link>
            <Link href="/generate" className="btn btn-outline">Generate</Link>
            <Link href="/review" className="btn btn-accent">Review</Link>
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          </>
        ) : (
          <Link href="/" className="btn btn-primary">Login</Link>
        )}
      </div>
    </nav>
  );
}
