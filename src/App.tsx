import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, type Product, type Category, type Supplier } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { Inventory } from '@/components/Inventory';
import { Catalog } from '@/components/Catalog';
import { StockMovements } from '@/components/StockMovements';
import { Suppliers } from '@/components/Suppliers';
import { ProductModal } from '@/components/ProductModal';
import { SupplierModal } from '@/components/SupplierModal';
import { Toast } from '@/components/Toast';
import { LoginPage } from '@/components/LoginPage';

export type View = 'dashboard' | 'inventory' | 'catalog' | 'movements' | 'suppliers';
export type ToastMsg = { id: string; text: string; type: 'success' | 'error' };

function ProtectedApp() {
  const [view, setView] = useState<View>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: cats }, { data: prods }, { data: sups }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*, category:categories(*), supplier:suppliers(*)').order('created_at', { ascending: false }),
      supabase.from('suppliers').select('*').order('name'),
    ]);
    setCategories(cats || []);
    setProducts(prods || []);
    setSuppliers(sups || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session) loadData();
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        loadData();
      } else {
        setProducts([]);
        setCategories([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadData]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSaveProduct = async (data: Partial<Product>) => {
    const { id, category: _cat, supplier: _sup, created_at: _ca, updated_at: _ua, ...rest } = data as any;
    if (editingProduct) {
      const { error } = await supabase.from('products').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', editingProduct.id);
      if (error) { showToast('Erreur lors de la modification', 'error'); return; }
      showToast('Produit modifié avec succès');
    } else {
      const { error } = await supabase.from('products').insert({ ...rest });
      if (error) { showToast('Erreur lors de l\'ajout', 'error'); return; }
      showToast('Produit ajouté avec succès');
    }
    setModalOpen(false);
    loadData();
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { showToast('Erreur lors de la suppression', 'error'); return; }
    showToast('Produit supprimé');
    loadData();
  };

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
    setSupplierModalOpen(false);
    setEditingSupplier(null);
    loadData();
  };

  const handleDeleteSupplier = async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) { showToast('Erreur lors de la suppression', 'error'); return; }
    showToast('Fournisseur supprimé');
    loadData();
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.origin?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchCat = activeCategory === 'all' || p.category_id === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        view={view}
        setView={(v) => { setView(v); setSidebarOpen(false); }}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        productsCount={products.length}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                placeholder="Rechercher un produit, une origine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-400 transition"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAddProduct}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 active:scale-95 transition shadow-sm shadow-emerald-600/20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span className="hidden sm:inline">Nouveau produit</span>
            </button>
            {user && (
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                Déconnexion
              </button>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-sm">Chargement...</p>
            </div>
          ) : (
            <div className="animate-fadeIn">
              {view === 'dashboard' && <Dashboard products={products} categories={categories} setView={setView} />}
              {view === 'inventory' && (
                <Inventory
                  products={filteredProducts}
                  categories={categories}
                  onEdit={openEditProduct}
                  onDelete={handleDeleteProduct}
                  onRefresh={loadData}
                  showToast={showToast}
                />
              )}
              {view === 'catalog' && <Catalog products={filteredProducts} categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} onEdit={openEditProduct} />}
              {view === 'movements' && <StockMovements products={products} onRefresh={loadData} showToast={showToast} />}
              {view === 'suppliers' && <Suppliers suppliers={suppliers} onRefresh={loadData} showToast={showToast} />}
            </div>
          )}
        </main>
      </div>

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}

      {supplierModalOpen && (
        <SupplierModal
          supplier={editingSupplier}
          onClose={() => { setSupplierModalOpen(false); setEditingSupplier(null); }}
          onSave={handleSaveSupplier}
        />
      )}

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} text={t.text} type={t.type} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
    </BrowserRouter>
  );
}