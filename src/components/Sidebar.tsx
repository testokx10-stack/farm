import type { View } from '@/App';
import type { Category } from '@/lib/supabase';

const navItems: { key: View; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Tableau de bord', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { key: 'inventory', label: 'Inventaire', icon: 'M20 7L12 3 4 7v10l8 4 8-4V7zM12 12L4 7m8 5l8-5m-8 5v10' },
  { key: 'catalog', label: 'Catalogue', icon: 'M3 7h18M3 12h18M3 17h18' },
  { key: 'movements', label: 'Mouvements', icon: 'M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4' },
  { key: 'suppliers', label: 'Fournisseurs', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
];

const iconColors: Record<string, string> = {
  emerald: 'text-emerald-600 bg-emerald-50',
  orange: 'text-orange-600 bg-orange-50',
  green: 'text-green-600 bg-green-50',
  amber: 'text-amber-600 bg-amber-50',
  yellow: 'text-yellow-600 bg-yellow-50',
  red: 'text-red-600 bg-red-50',
  slate: 'text-slate-600 bg-slate-100',
};

type Props = {
  view: View;
  setView: (v: View) => void;
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  productsCount: number;
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ view, setView, categories, activeCategory, setActiveCategory, productsCount, open, onClose }: Props) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-40
        flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.5 2.5-1 3a3 3 0 0 1 3 3v1H6v-1a3 3 0 0 1 3-3c-.5-.5-1-1.5-1-3a4 4 0 0 1 4-4z"/><path d="M6 13c0 4 2 7 6 8 4-1 6-4 6-8"/></svg>
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-base leading-tight">Maroc Sourcing</h1>
              <p className="text-xs text-slate-400">Gestion de stock</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Menu</p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${view === item.key
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={item.icon} />
                </svg>
                {item.label}
                {item.key === 'inventory' && productsCount > 0 && (
                  <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{productsCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Categories filter */}
          {view === 'catalog' || view === 'inventory' ? (
            <>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">Catégories</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${activeCategory === 'all'
                      ? 'bg-slate-100 text-slate-800'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                  `}
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
                  </div>
                  Toutes
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${activeCategory === cat.id
                        ? 'bg-slate-100 text-slate-800'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                    `}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconColors[cat.color] || iconColors.slate}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>
                    </div>
                    {cat.name}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-sm font-semibold">
              MS
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">Manager</p>
              <p className="text-xs text-slate-400">B2B Wholesale</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
