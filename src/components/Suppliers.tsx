import { useState } from 'react';
import type { Supplier } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { SupplierModal } from '@/components/SupplierModal';

type Props = {
  suppliers: Supplier[];
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
};

export function Suppliers({ suppliers, onRefresh, showToast }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSaveSupplier = async (data: Partial<Supplier>) => {
    if (editingSupplier) {
      const { error } = await supabase.from('suppliers').update(data).eq('id', editingSupplier.id);
      if (error) { showToast('Erreur lors de la modification', 'error'); return; }
      showToast('Fournisseur modifié avec succès');
    } else {
      const { error } = await supabase.from('suppliers').insert(data);
      if (error) { showToast('Erreur lors de l\'ajout', 'error'); return; }
      showToast('Fournisseur ajouté avec succès');
    }
    setModalOpen(false);
    setEditingSupplier(null);
    onRefresh();
  };

  const handleDeleteSupplier = async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) { showToast('Erreur lors de la suppression', 'error'); return; }
    showToast('Fournisseur supprimé');
    setConfirmDelete(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fournisseurs</h1>
          <p className="text-slate-500 text-sm mt-1">{suppliers.length} fournisseur{suppliers.length > 1 ? 's' : ''} enregistré{suppliers.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditingSupplier(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 active:scale-95 transition shadow-sm shadow-emerald-600/20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouveau fournisseur
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p className="text-slate-500 font-medium">Aucun fournisseur</p>
          <p className="text-slate-400 text-sm mt-1">Ajoutez votre premier fournisseur pour l'associer aux produits</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Fournisseur</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Région</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Contact</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.name}</p>
                        {s.notes && <p className="text-xs text-slate-400 truncate max-w-xs">{s.notes}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{s.region || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{s.contact || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingSupplier(s); setModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          onClick={() => setConfirmDelete(s.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Supprimer ce fournisseur ?</h3>
            <p className="text-sm text-slate-500 mb-6">Cette action est irréversible. Les produits associés perdront leur référence fournisseur.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">Annuler</button>
              <button onClick={() => handleDeleteSupplier(confirmDelete)} className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <SupplierModal
          supplier={editingSupplier}
          onClose={() => { setModalOpen(false); setEditingSupplier(null); }}
          onSave={handleSaveSupplier}
        />
      )}
    </div>
  );
}