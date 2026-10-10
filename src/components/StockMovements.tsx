import { useEffect, useState } from 'react';
import type { Product } from '@/lib/supabase';
import { supabase, type StockMovement } from '@/lib/supabase';

type Props = {
  products: Product[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
};

export function StockMovements({ products, onRefresh, showToast }: Props) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('stock_movements')
      .select('*, product:products(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    setMovements(data || []);
    setLoading(false);
  };

  const productName = (id: string) => products.find((p) => p.id === id)?.name || movements.find((m) => m.product_id === id)?.product?.name || 'Produit supprimé';

  const filtered = movements.filter((m) => filterType === 'all' || m.movement_type === filterType);

  const totalIn = movements.filter((m) => m.movement_type === 'in').reduce((s, m) => s + Number(m.quantity), 0);
  const totalOut = movements.filter((m) => m.movement_type === 'out').reduce((s, m) => s + Number(m.quantity), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mouvements de stock</h1>
        <p className="text-slate-500 text-sm mt-1">Historique des entrées et sorties</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M7 16V4m0 0L3 8m4-4l4 4"/></svg>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total entrées</p>
              <p className="text-xl font-bold text-emerald-600">{totalIn.toLocaleString('fr-MA')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total sorties</p>
              <p className="text-xl font-bold text-red-600">{totalOut.toLocaleString('fr-MA')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: 'all' as const, label: 'Tous' },
          { key: 'in' as const, label: 'Entrées' },
          { key: 'out' as const, label: 'Sorties' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterType(f.key)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition
              ${filterType === f.key ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Movements list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <p className="text-slate-500 font-medium">Aucun mouvement</p>
          <p className="text-slate-400 text-sm mt-1">Les entrées et sorties de stock apparaîtront ici</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filtered.map((m) => {
              const isIn = m.movement_type === 'in';
              return (
                <div key={m.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isIn ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isIn ? '#059669' : '#dc2626'} strokeWidth="2">
                      {isIn ? <path d="M7 16V4m0 0L3 8m4-4l4 4"/> : <path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{productName(m.product_id)}</p>
                    <p className="text-xs text-slate-400">
                      {m.reason || (isIn ? 'Entrée' : 'Sortie')}
                      {m.reference && ` · ${m.reference}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isIn ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isIn ? '+' : '−'}{Number(m.quantity).toLocaleString('fr-MA')}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(m.created_at).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
