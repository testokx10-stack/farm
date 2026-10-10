import type { Product, Category } from '@/lib/supabase';
import type { View } from '@/App';

type Props = {
  products: Product[];
  categories: Category[];
  setView: (v: View) => void;
};

export function Dashboard({ products, categories, setView }: Props) {
  const totalStock = products.reduce((sum, p) => sum + Number(p.quantity), 0);
  const totalValue = products.reduce((sum, p) => sum + Number(p.quantity) * Number(p.price_per_unit), 0);
  const lowStock = products.filter((p) => Number(p.quantity) <= Number(p.min_threshold) && p.is_available);
  const available = products.filter((p) => p.is_available && Number(p.quantity) > 0);

  const stats = [
    {
      label: 'Produits en stock',
      value: products.length.toString(),
      sub: `${available.length} disponibles`,
      icon: 'M20 7L12 3 4 7v10l8 4 8-4V7zM12 12L4 7m8 5l8-5m-8 5v10',
      gradient: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Volume total',
      value: totalStock.toLocaleString('fr-MA'),
      sub: 'unités en stock',
      icon: 'M3 3v18h18M7 12l4-4 4 4 4-4',
      gradient: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Valeur du stock',
      value: `${Math.round(totalValue).toLocaleString('fr-MA')} MAD`,
      sub: 'prix de gros',
      icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      gradient: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Alertes stock bas',
      value: lowStock.length.toString(),
      sub: lowStock.length === 0 ? 'Aucune alerte' : 'à réapprovisionner',
      icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
      gradient: 'from-red-500 to-rose-600',
      bg: 'bg-red-50',
    },
  ];

  // Top products by value
  const topProducts = [...products]
    .map((p) => ({ ...p, value: Number(p.quantity) * Number(p.price_per_unit) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Category distribution
  const catDist = categories.map((cat) => {
    const catProducts = products.filter((p) => p.category_id === cat.id);
    const qty = catProducts.reduce((s, p) => s + Number(p.quantity), 0);
    return { name: cat.name, count: catProducts.length, qty, color: cat.color };
  }).filter((c) => c.count > 0).sort((a, b) => b.qty - a.qty);

  const maxQty = Math.max(...catDist.map((c) => c.qty), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mt-1">Vue d'ensemble de votre stock agroalimentaire</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d={stat.icon}/></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800">Top produits par valeur</h2>
            <button onClick={() => setView('inventory')} className="text-xs text-emerald-600 font-medium hover:text-emerald-700 transition">
              Voir tout →
            </button>
          </div>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Aucun produit</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-100 text-slate-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{Number(p.quantity).toLocaleString('fr-MA')} {p.unit} × {Number(p.price_per_unit).toLocaleString('fr-MA')} MAD</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                    {Math.round(p.value).toLocaleString('fr-MA')} MAD
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-5">Stock par catégorie</h2>
          <div className="space-y-4">
            {catDist.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
            ) : (
              catDist.map((cat, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-600">{cat.name}</span>
                    <span className="text-xs text-slate-400">{cat.qty.toLocaleString('fr-MA')} unités</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.color === 'orange' ? 'bg-orange-400' :
                        cat.color === 'green' ? 'bg-green-400' :
                        cat.color === 'amber' ? 'bg-amber-400' :
                        cat.color === 'yellow' ? 'bg-yellow-400' :
                        cat.color === 'red' ? 'bg-red-400' :
                        'bg-slate-400'
                      }`}
                      style={{ width: `${(cat.qty / maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01"/></svg>
            </div>
            <h2 className="font-semibold text-slate-800">Alertes de stock bas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                  <p className="text-xs text-red-500 mt-0.5">
                    {Number(p.quantity).toLocaleString('fr-MA')} / {Number(p.min_threshold).toLocaleString('fr-MA')} {p.unit}
                  </p>
                </div>
                <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-lg">Bas</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
