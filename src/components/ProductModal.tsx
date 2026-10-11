import { useState, useEffect, useRef } from 'react';
import type { Product, Category } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

type Props = {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
};

const units = ['kg', 'tonne', 'litre', 'carton', 'caisse', 'sac', 'unité'];
const grades = ['Extra', 'A', 'B', 'C'];

export function ProductModal({ product, categories, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    unit: 'kg',
    quantity: '',
    min_threshold: '',
    price_per_unit: '',
    origin: '',
    season: '',
    quality_grade: 'A',
    description: '',
    image_url: '',
    is_available: true,
  });
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('suppliers').select('id, name').order('name').then(({ data }) => {
      if (data) setSuppliers(data);
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
    } catch (err: any) {
      alert(`Erreur upload: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category_id: product.category_id || '',
        unit: product.unit,
        quantity: String(product.quantity),
        min_threshold: String(product.min_threshold),
        price_per_unit: String(product.price_per_unit),
        origin: product.origin || '',
        season: product.season || '',
        quality_grade: product.quality_grade,
        description: product.description || '',
        image_url: product.image_url || '',
        is_available: product.is_available,
      });
      setSupplierId(product.supplier_id || '');
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      supplier_id: supplierId || null,
      category_id: form.category_id || null,
      quantity: parseFloat(form.quantity) || 0,
      min_threshold: parseFloat(form.min_threshold) || 0,
      price_per_unit: parseFloat(form.price_per_unit) || 0,
    });
  };

  const field = (key: keyof typeof form, label: string, type: string = 'text', placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: type === 'number' ? e.target.value : e.target.value })}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full my-8 animate-scaleIn max-h-[90vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-slate-800">{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {field('name', 'Nom du produit', 'text', 'Ex: Tomates, Oranges, Amandes...')}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Catégorie</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
              >
                <option value="">— Sélectionner —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Fournisseur</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
              >
                <option value="">— Aucun —</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {field('quantity', 'Quantité en stock', 'number', '0')}
            {field('min_threshold', 'Seuil minimum', 'number', '0')}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Unité</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
              >
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('price_per_unit', 'Prix de gros (MAD)', 'number', '0')}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Grade qualité</label>
              <select
                value={form.quality_grade}
                onChange={(e) => setForm({ ...form, quality_grade: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
              >
                {grades.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('origin', 'Origine / Terroir', 'text', 'Ex: Souss-Massa')}
            {field('season', 'Saison', 'text', 'Ex: Automne 2026')}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Image du produit</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-500">Envoi en cours...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="text-sm font-medium text-emerald-700">Choisir une image</p>
                  <p className="text-xs text-slate-400">Depuis votre appareil (JPG, PNG...)</p>
                </div>
              )}
            </div>

            {form.image_url && (
              <div className="mt-2 relative">
                <img src={form.image_url} alt="Aperçu" className="w-full h-40 object-cover rounded-lg border border-slate-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition"
                  title="Retirer l'image"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )}

            <details className="mt-2">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">ou coller une URL</summary>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://exemple.com/image.jpg"
                className="mt-1.5 w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition"
              />
            </details>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Description du produit, calibre, caractéristiques..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setForm({ ...form, is_available: !form.is_available })}
              className={`relative w-11 h-6 rounded-full transition ${form.is_available ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${form.is_available ? 'left-5' : 'left-0.5'}`} />
            </button>
            <span className="text-sm text-slate-600">Disponible à la vente</span>
          </label>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">Annuler</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition">
              {product ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
