import type { Product, Category } from '@/lib/supabase';

type Props = {
  products: Product[];
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  onEdit?: (p: Product) => void;
};

const catColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', gradient: 'from-orange-400 to-amber-500' },
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', gradient: 'from-green-400 to-emerald-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', gradient: 'from-amber-400 to-yellow-500' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', gradient: 'from-yellow-400 to-amber-400' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', gradient: 'from-red-400 to-rose-500' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', gradient: 'from-slate-400 to-slate-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', gradient: 'from-emerald-400 to-green-500' },
};

export function Catalog({ products, categories, activeCategory, setActiveCategory, onEdit }: Props) {
  const availableProducts = products.filter((p) => p.is_available && Number(p.quantity) > 0);
  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? 'Autre';
  const catColor = (id: string | null) => {
    const cat = categories.find((c) => c.id === id);
    return catColors[cat?.color || 'slate'] || catColors.slate;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Catalogue</h1>
        <p className="text-slate-500 text-sm mt-1">Marchandise disponible à la vente en gros</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setActiveCategory('all')}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition flex items-center gap-2
            ${activeCategory === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}
          `}
        >
          Toutes
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>
            {availableProducts.length}
          </span>
        </button>
        {categories.map((cat) => {
          const count = availableProducts.filter((p) => p.category_id === cat.id).length;
          const cc = catColors[cat.color] || catColors.slate;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition flex items-center gap-2
                ${activeCategory === cat.id
                  ? `${cc.bg} ${cc.text} ${cc.border} border`
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}
              `}
            >
              {cat.name}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/50' : 'bg-slate-100'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      {availableProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
          </div>
          <p className="text-slate-500 font-medium">Aucun produit disponible</p>
          <p className="text-slate-400 text-sm mt-1">Les produits apparaîtront ici lorsqu'ils seront en stock</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {availableProducts.map((p) => {
            const cc = catColor(p.category_id);
            const isLow = Number(p.quantity) <= Number(p.min_threshold);
            return (
              <div
                key={p.id}
                onClick={() => onEdit?.(p)}
                className={`bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all group ${onEdit ? 'cursor-pointer' : ''}`}
              >
                {/* Product image */}
                <div className="h-44 relative overflow-hidden">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${cc.gradient} flex items-center justify-center`}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-90">
                        <circle cx="12" cy="12" r="9"/>
                      </svg>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />

                  {/* Edit icon on hover */}
                  {onEdit && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        <span className="text-sm font-medium text-slate-700">Modifier</span>
                      </div>
                    </div>
                  )}

                  {isLow && (
                    <span className="absolute top-3 right-3 text-xs font-semibold text-white bg-red-500/90 px-2 py-1 rounded-lg backdrop-blur-sm">
                      Stock limité
                    </span>
                  )}
                  <span className={`absolute top-3 left-3 text-xs font-medium text-white px-2 py-1 rounded-lg backdrop-blur-sm bg-black/30`}>
                    {p.quality_grade}
                  </span>
                </div>

                {/* Product info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${cc.text} ${cc.bg} px-2 py-0.5 rounded-md`}>
                      {catName(p.category_id)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-1 truncate">{p.name}</h3>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2 min-h-[2rem]">{p.description || '—'}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {p.origin || 'Maroc'}
                    </span>
                    <span>{p.season || '—'}</span>
                  </div>

                  <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400">Prix de gros</p>
                      <p className="text-lg font-bold text-slate-800">
                        {Number(p.price_per_unit).toLocaleString('fr-MA')}
                        <span className="text-sm font-normal text-slate-400"> MAD/{p.unit}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Disponible</p>
                      <p className={`text-sm font-semibold ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>
                        {Number(p.quantity).toLocaleString('fr-MA')} {p.unit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
