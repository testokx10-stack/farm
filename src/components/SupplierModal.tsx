import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Supplier } from '@/lib/supabase';

type Props = {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (data: Partial<Supplier>) => void;
};

export function SupplierModal({ supplier, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: '',
    region: '',
    contact: '',
    notes: '',
  });

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name,
        region: supplier.region || '',
        contact: supplier.contact || '',
        notes: supplier.notes || '',
      });
    } else {
      setForm({ name: '', region: '', contact: '', notes: '' });
    }
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const field = (key: keyof typeof form, label: string, placeholder?: string, multiline = false) => (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition resize-none"
        />
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full my-8 animate-scaleIn max-h-[90vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-slate-800">{supplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {field('name', 'Nom du fournisseur *', 'Ex: Coopérative Atlas')}

          <div className="grid grid-cols-2 gap-4">
            {field('region', 'Région', 'Ex: Souss-Massa')}
            {field('contact', 'Contact', 'Email / Téléphone')}
          </div>

          {field('notes', 'Notes', 'Informations complémentaires...', true)}

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">Annuler</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition">
              {supplier ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}