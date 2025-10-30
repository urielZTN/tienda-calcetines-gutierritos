-- ============================================
-- ESQUEMA DE BASE DE DATOS - TIENDA CALCETINES
-- ============================================

-- 1) Tabla profiles (vinculada a auth.users)
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address JSONB,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "profiles_select_self_or_admin" ON profiles;
CREATE POLICY "profiles_select_self_or_admin" ON profiles 
  FOR SELECT 
  USING (
    auth.uid() = id OR auth.jwt() ->> 'role' = 'admin'
  );

DROP POLICY IF EXISTS "profiles_update_self" ON profiles;
CREATE POLICY "profiles_update_self" ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_self" ON profiles;
CREATE POLICY "profiles_insert_self" ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 2) Tabla categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas para categories
DROP POLICY IF EXISTS "categories_select_public_or_admin" ON categories;
CREATE POLICY "categories_select_public_or_admin" ON categories 
  FOR SELECT 
  USING (
    is_active = TRUE OR auth.jwt() ->> 'role' = 'admin'
  );

DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
CREATE POLICY "categories_insert_admin" ON categories 
  FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "categories_update_admin" ON categories;
CREATE POLICY "categories_update_admin" ON categories 
  FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin') 
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "categories_delete_admin" ON categories;
CREATE POLICY "categories_delete_admin" ON categories 
  FOR DELETE 
  USING (auth.jwt() ->> 'role' = 'admin');

-- 3) Tabla products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INT NOT NULL DEFAULT 0,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  image_path TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deshabilitar RLS para products (acceso público)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 4) Tabla carts
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Políticas para carts
DROP POLICY IF EXISTS "carts_select_user" ON carts;
CREATE POLICY "carts_select_user" ON carts 
  FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "carts_insert_user" ON carts;
CREATE POLICY "carts_insert_user" ON carts 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "carts_update_user" ON carts;
CREATE POLICY "carts_update_user" ON carts 
  FOR UPDATE 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "carts_delete_user" ON carts;
CREATE POLICY "carts_delete_user" ON carts 
  FOR DELETE 
  USING (user_id = auth.uid());

-- 5) Tabla cart_items
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  price_snapshot NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Políticas para cart_items
DROP POLICY IF EXISTS "cart_items_per_cart_owner" ON cart_items;
CREATE POLICY "cart_items_per_cart_owner" ON cart_items 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM carts c 
      WHERE c.id = cart_items.cart_id 
      AND c.user_id = auth.uid()
    )
  ) 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts c 
      WHERE c.id = cart_items.cart_id 
      AND c.user_id = auth.uid()
    )
  );

-- 6) Tabla orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT CHECK (payment_method IN ('efectivo', 'tarjeta', 'transferencia')),
  shipping_address JSONB,
  payment_info JSONB,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas para orders
DROP POLICY IF EXISTS "orders_select_owner_or_admin" ON orders;
CREATE POLICY "orders_select_owner_or_admin" ON orders 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
  );

DROP POLICY IF EXISTS "orders_insert_user" ON orders;
CREATE POLICY "orders_insert_user" ON orders 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "orders_update_admin" ON orders;
CREATE POLICY "orders_update_admin" ON orders 
  FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 7) Tabla order_items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  price_snapshot NUMERIC(10,2) NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para order_items
DROP POLICY IF EXISTS "order_items_per_order_owner" ON order_items;
CREATE POLICY "order_items_per_order_owner" ON order_items 
  FOR ALL 
  USING (
    EXISTS(
      SELECT 1 FROM orders o 
      WHERE o.id = order_items.order_id 
      AND (o.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    )
  ) 
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM orders o 
      WHERE o.id = order_items.order_id 
      AND o.user_id = auth.uid()
    )
  );

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);