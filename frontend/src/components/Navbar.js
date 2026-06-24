"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll listener for anchor links
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const id = href.substring(1);
        const element = document.getElementById(id);
        if (element) {
          const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          let startTime = null;

          const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, 400);
            window.scrollTo(0, run);
            if (timeElapsed < 400) requestAnimationFrame(animation);
          };

          const ease = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
          };

          requestAnimationFrame(animation);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    setIsAuth(false);
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  if (isLoading) {
    return (
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-brand logo-font">SmartFlash</div>
      </nav>
    );
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link href="/" className="navbar-brand logo-font">SmartFlash</Link>
      <div className="nav-links">
        {isAuth ? (
          <>
            <Link 
              href="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/generate" 
              className={`nav-link ${isActive('/generate') ? 'active' : ''}`}
            >
              Generate
            </Link>
            <Link 
              href="/review" 
              className={`nav-link ${isActive('/review') ? 'active' : ''}`}
            >
              Review
            </Link>
            <button 
              onClick={handleLogout} 
              className="nav-link nav-logout"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/" className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
}
