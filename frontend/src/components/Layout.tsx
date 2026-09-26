import { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Box, MapPin, ArrowRightLeft, SlidersHorizontal, BookOpen } from 'lucide-react';

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface-base)]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 text-[var(--color-text-primary)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
              <Box size={18} className="text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">StockSense</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
          <div>
            <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 px-3">
              Configuration
            </div>
            <div className="space-y-1">
              <NavItem to="/warehouses" icon={<Box size={18} />} label="Warehouses" />
              <NavItem to="/locations" icon={<MapPin size={18} />} label="Locations" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 px-3">
              Operations
            </div>
            <div className="space-y-1">
              <NavItem to="/transfers" icon={<ArrowRightLeft size={18} />} label="Transfers" />
              <NavItem to="/adjustments" icon={<SlidersHorizontal size={18} />} label="Adjustments" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 px-3">
              Tracking
            </div>
            <div className="space-y-1">
              <NavItem to="/stock-ledger" icon={<BookOpen size={18} />} label="Stock Ledger" />
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-6xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
          isActive
            ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
        }`
      }
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </NavLink>
  );
}
