import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function PublicLayout() {
  return (
    <div className="min-h-screen app-bg">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="text-slate-100 font-semibold tracking-tight">
          AutoBidGo <span className="text-slate-400 font-medium">AI Training Platform</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/about" className="text-sm text-slate-300 hover:text-white px-3 py-2">
            About
          </Link>
          <Link to="/faq" className="text-sm text-slate-300 hover:text-white px-3 py-2">
            FAQ
          </Link>
          <Link to="/help" className="text-sm text-slate-300 hover:text-white px-3 py-2">
            Help
          </Link>
          <Link to="/login">
            <Button variant="secondary">Log In</Button>
          </Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <Outlet />
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-sm text-slate-400">
        <div className="flex flex-wrap gap-4">
          <Link to="/privacy" className="hover:text-slate-200">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-slate-200">
            Terms
          </Link>
          <span className="text-slate-500">autobidgo.com</span>
        </div>
        <div className="mt-3">© {new Date().getFullYear()} AutoBidGo</div>
      </footer>
    </div>
  );
}
