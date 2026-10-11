/*
# Création des tables de gestion de stock agroalimentaire

## Description
Crée les tables nécessaires pour gérer un catalogue de produits agricoles (fruits, légumes, etc.)
en vente en gros, avec suivi des stocks, catégories, fournisseurs et mouvements de stock.

## Nouvelles tables
- categories (id, name, icon, color, sort_order, created_at)
- suppliers (id, name, region, contact, notes, created_at)
- products (id, name, category_id, supplier_id, unit, quantity, min_threshold, price_per_unit, origin, season, quality_grade, description, image_url, is_available, created_at, updated_at)
- stock_movements (id, product_id, movement_type, quantity, reason, reference, notes, created_at)

## Sécurité
- RLS activée sur toutes les tables.
- Pas d'auth: politiques anon + authenticated pour CRUD (single-tenant, données partagées).
*/

-- Catégories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT 'Apple',
  color text NOT NULL DEFAULT 'emerald',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

-- Fournisseurs
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region text,
  contact text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_suppliers" ON suppliers;
CREATE POLICY "anon_select_suppliers" ON suppliers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_suppliers" ON suppliers;
CREATE POLICY "anon_insert_suppliers" ON suppliers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_suppliers" ON suppliers;
CREATE POLICY "anon_update_suppliers" ON suppliers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_suppliers" ON suppliers;
CREATE POLICY "anon_delete_suppliers" ON suppliers FOR DELETE
  TO anon, authenticated USING (true);

-- Produits
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  unit text NOT NULL DEFAULT 'kg',
  quantity numeric NOT NULL DEFAULT 0,
  min_threshold numeric NOT NULL DEFAULT 0,
  price_per_unit numeric NOT NULL DEFAULT 0,
  origin text,
  season text,
  quality_grade text DEFAULT 'A',
  description text,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- Mouvements de stock
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('in', 'out')),
  quantity numeric NOT NULL,
  reason text,
  reference text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_movements" ON stock_movements;
CREATE POLICY "anon_select_movements" ON stock_movements FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_movements" ON stock_movements;
CREATE POLICY "anon_insert_movements" ON stock_movements FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_movements" ON stock_movements;
CREATE POLICY "anon_delete_movements" ON stock_movements FOR DELETE
  TO anon, authenticated USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_created ON stock_movements(created_at DESC);

-- Données initiales: catégories
INSERT INTO categories (name, icon, color, sort_order) VALUES
  ('Fruits', 'Apple', 'orange', 1),
  ('Légumes', 'Carrot', 'green', 2),
  ('Fruits secs', 'Nut', 'amber', 3),
  ('Agrumes', 'Citrus', 'yellow', 4),
  ('Condiments', 'Pepper', 'red', 5),
  ('Autre', 'Package', 'slate', 6)
ON CONFLICT (name) DO UPDATE SET
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order;

-- Données initiales: produits d'exemple
DELETE FROM products;

-- Données initiales: produits d'exemple
INSERT INTO products (name, category_id, unit, quantity, min_threshold, price_per_unit, origin, season, quality_grade, description, image_url, is_available)
SELECT p.name, c.id, p.unit, p.quantity, p.min_threshold, p.price_per_unit, p.origin, p.season, p.quality_grade, p.description, p.image_url, p.is_available
FROM (VALUES
  ('Tomates', 'Légumes', 'kg', 1200, 200, 8, 'Souss-Massa', 'Automne 2026', 'A', 'Tomates fraîches de la région de Souss, calibre 60-80mm', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop', true),
  ('Oranges', 'Agrumes', 'kg', 3500, 500, 5, 'Souss-Massa', 'Hiver 2026', 'A', 'Oranges Maroc Late, calibre 56-72mm, sucrées et juteuses', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop', true),
  ('Pommes', 'Fruits', 'kg', 800, 150, 12, 'Fès-Meknès', 'Automne 2026', 'Extra', 'Pommes Golden du Moyen Atlas, calibre 70-80mm', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop', true),
  ('Amandes', 'Fruits secs', 'kg', 150, 50, 65, 'Tafilalet', 'Automne 2026', 'A', 'Amandes Marcona décortiquées, calibre 20/22', 'https://images.unsplash.com/photo-1772986797605-f0b52fff45b0?w=400&h=300&fit=crop', true),
  ('Dattes Medjool', 'Fruits secs', 'kg', 500, 100, 90, 'Dra-Tafilalet', 'Automne 2026', 'Extra', 'Dattes Medjool premium, calibre Jumbo', 'https://images.pexels.com/photos/15913411/pexels-photo-15913411.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', true),
  ('Carottes', 'Légumes', 'kg', 2200, 300, 4, 'Souss-Massa', 'Automne 2026', 'A', 'Carottes fraîches, calibre moyen', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop', true)
) AS p(name, cat_name, unit, quantity, min_threshold, price_per_unit, origin, season, quality_grade, description, image_url, is_available)
JOIN categories c ON c.name = p.cat_name;

-- Storage: bucket public pour les images produits
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "public_insert_product_images" ON storage.objects;
CREATE POLICY "public_insert_product_images" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "public_update_product_images" ON storage.objects;
CREATE POLICY "public_update_product_images" ON storage.objects FOR UPDATE
  TO anon, authenticated USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "public_delete_product_images" ON storage.objects;
CREATE POLICY "public_delete_product_images" ON storage.objects FOR DELETE
  TO anon, authenticated USING (bucket_id = 'product-images');
