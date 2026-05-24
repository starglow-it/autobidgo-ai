import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

function SideLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-xl px-3 py-2 text-sm ${
          isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export function UserLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen app-bg">
      <header className="border-b border-slate-800/70">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/dashboard" className="text-slate-100 font-semibold tracking-tight">
            AutoBidGo <span className="text-slate-400 font-medium">Contributor Portal</span>
          </Link>
          <Button variant="ghost" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3 h-fit">
          <div className="px-3 py-2 text-xs uppercase tracking-wider text-slate-400">Menu</div>
          <div className="space-y-1">
            <SideLink to="/dashboard" label="Dashboard" />
            <SideLink to="/training" label="Training" />
            <SideLink to="/balance" label="Balance" />
            <SideLink to="/withdraw" label="Withdraw" />
          </div>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
