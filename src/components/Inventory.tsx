import { useState } from 'react';
import type { Product, Category } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

type Props = {
  products: Product[];
  categories: Category[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
};

export function Inventory({ products, categories, onEdit, onDelete, onRefresh, showToast }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustReason, setAdjustReason] = useState('');

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? '—';

  const toggleAvailable = async (p: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !p.is_available, updated_at: new Date().toISOString() })
      .eq('id', p.id);
    if (error) { showToast('Erreur', 'error'); return; }
    showToast(p.is_available ? 'Produit marqué indisponible' : 'Produit marqué disponible');
    onRefresh();
  };

  const submitAdjust = async () => {
    if (!adjusting || !adjustQty) return;
    const qty = parseFloat(adjustQty);
    if (isNaN(qty) || qty <= 0) return;

    const newQty = adjustType === 'in'
      ? Number(adjusting.quantity) + qty
      : Math.max(0, Number(adjusting.quantity) - qty);

    const { error: pErr } = await supabase
      .from('products')
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', adjusting.id);
    if (pErr) { showToast('Erreur lors du mouvement', 'error'); return; }

    const { error: mErr } = await supabase
      .from('stock_movements')
      .insert({
        product_id: adjusting.id,
        movement_type: adjustType,
        quantity: qty,
        reason: adjustReason || (adjustType === 'in' ? 'Réapprovisionnement' : 'Sortie'),
      });
    if (mErr) { showToast('Mouvement non enregistré', 'error'); return; }

    showToast(`Stock ${adjustType === 'in' ? 'augmenté' : 'réduit'} de ${qty} ${adjusting.unit}`);
    setAdjusting(null);
    setAdjustQty('');
    setAdjustReason('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventaire</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} produit{products.length > 1 ? 's' : ''} en stock</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 7L12 3 4 7v10l8 4 8-4V7zM12 12L4 7m8 5l8-5m-8 5v10"/></svg>
          </div>
          <p className="text-slate-500 font-medium">Aucun produit trouvé</p>
          <p className="text-slate-400 text-sm mt-1">Ajoutez votre premier produit pour commencer</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Produit</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Catégorie</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Stock</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Seuil min.</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Prix / unité</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Statut</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isLow = Number(p.quantity) <= Number(p.min_threshold);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                            <p className="text-xs text-slate-400 truncate">{p.origin || '—'} · {p.quality_grade}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{catName(p.category_id)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-semibold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                          {Number(p.quantity).toLocaleString('fr-MA')}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">{p.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-500">
                        {Number(p.min_threshold).toLocaleString('fr-MA')} {p.unit}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-slate-700">{Number(p.price_per_unit).toLocaleString('fr-MA')}</span>
                        <span className="text-xs text-slate-400 ml-1">MAD</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleAvailable(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                            p.is_available
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.is_available ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {p.is_available ? 'Disponible' : 'Indispo.'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setAdjusting(p); setAdjustType('in'); setAdjustQty(''); setAdjustReason(''); }}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Ajuster le stock"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                          </button>
                          <button
                            onClick={() => onEdit(p)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Modifier"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(p.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {products.map((p) => {
              const isLow = Number(p.quantity) <= Number(p.min_threshold);
              return (
                <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">{catName(p.category_id)} · {p.origin || '—'}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.is_available ? 'Dispo.' : 'Indispo.'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="bg-slate-50 rounded-lg py-2">
                      <p className={`text-sm font-bold ${isLow ? 'text-red-600' : 'text-slate-700'}`}>{Number(p.quantity).toLocaleString('fr-MA')}</p>
                      <p className="text-xs text-slate-400">Stock {p.unit}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg py-2">
                      <p className="text-sm font-bold text-slate-700">{Number(p.price_per_unit).toLocaleString('fr-MA')}</p>
                      <p className="text-xs text-slate-400">MAD/{p.unit}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg py-2">
                      <p className="text-sm font-bold text-slate-700">{Number(p.min_threshold).toLocaleString('fr-MA')}</p>
                      <p className="text-xs text-slate-400">Seuil</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setAdjusting(p); setAdjustType('in'); setAdjustQty(''); setAdjustReason(''); }} className="flex-1 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition">Stock</button>
                    <button onClick={() => onEdit(p)} className="flex-1 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition">Modifier</button>
                    <button onClick={() => setConfirmDelete(p.id)} className="py-2 px-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Supprimer ce produit ?</h3>
            <p className="text-sm text-slate-500 mb-6">Cette action est irréversible. Tous les mouvements de stock associés seront également supprimés.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">Annuler</button>
              <button onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Stock adjustment modal */}
      {adjusting && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={() => setAdjusting(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Ajuster le stock</h3>
            <p className="text-sm text-slate-500 mb-5">{adjusting.name} — Stock actuel: {Number(adjusting.quantity).toLocaleString('fr-MA')} {adjusting.unit}</p>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setAdjustType('in')}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${adjustType === 'in' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Entrée (+)
                </button>
                <button
                  onClick={() => setAdjustType('out')}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${adjustType === 'out' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Sortie (−)
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Quantité ({adjusting.unit})</label>
                <input
                  type="number"
                  step="0.01"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="0"
                  autoFocus
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Raison (optionnel)</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder={adjustType === 'in' ? 'Réapprovisionnement' : 'Vente / Perte / Ajustement'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setAdjusting(null)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">Annuler</button>
              <button onClick={submitAdjust} className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
