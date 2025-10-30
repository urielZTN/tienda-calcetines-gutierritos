-- ============================================
-- DATOS DE PRUEBA (SEED) - TIENDA CALCETINES
-- ============================================

-- Categorías
INSERT INTO categories (name, slug, description, is_active) 
VALUES
  ('Azules', 'azules', 'Calcetines en tonos azules', TRUE),
  ('Verdes', 'verdes', 'Calcetines en tonos verdes', TRUE),
  ('Grises', 'grises', 'Tonos grises y neutros', TRUE),
  ('Negros', 'negros', 'Calcetines negros y oscuros', TRUE),
  ('Deportivos', 'deportivos', 'Diseño deportivo y transpirable', TRUE),
  ('Formales', 'formales', 'Calcetines para traje', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Productos
INSERT INTO products (name, slug, description, price, stock, category_id, image_path, is_active)
VALUES
  ('Calcetín Azul Marino', 'calcetin-azul-marino', 'Azul marino clásico', 120.00, 40, 
   (SELECT id FROM categories WHERE slug='azules'), '/img/calcetines1.jpg', TRUE),
  
  ('Calcetín Celeste', 'calcetin-celeste', 'Celeste claro', 110.00, 35, 
   (SELECT id FROM categories WHERE slug='azules'), '/img/calcetines2.jpg', TRUE),
  
  ('Calcetín Verde Oliva', 'calcetin-verde-oliva', 'Verde oliva sobrio', 115.00, 30, 
   (SELECT id FROM categories WHERE slug='verdes'), '/img/calcetines3.jpg', TRUE),
  
  ('Calcetín Verde Menta', 'calcetin-verde-menta', 'Tono menta', 105.00, 25, 
   (SELECT id FROM categories WHERE slug='verdes'), '/img/calcetines4.jpg', TRUE),
  
  ('Calcetín Gris Oscuro', 'calcetin-gris-oscuro', 'Gris elegante', 100.00, 50, 
   (SELECT id FROM categories WHERE slug='grises'), '/img/calcetines5.jpg', TRUE),
  
  ('Calcetín Negro Class', 'calcetin-negro', 'Negro liso', 95.00, 60, 
   (SELECT id FROM categories WHERE slug='negros'), '/img/calcetines6.jpg', TRUE),
  
  ('Calcetín Deportivo Azul', 'calcetin-dep-azul', 'Deportivo con amortiguamiento', 130.00, 20, 
   (SELECT id FROM categories WHERE slug='deportivos'), '/img/calcetines7.jpg', TRUE),
  
  ('Calcetín Formal Gris', 'calcetin-formal-gris', 'Para traje elegante', 140.00, 15, 
   (SELECT id FROM categories WHERE slug='formales'), '/img/calcetines8.jpg', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- USUARIO ADMINISTRADOR
-- ============================================

-- Insertar perfil de administrador
-- Email: admin@calcetines.com
-- Password: Admin123
-- UUID: 26fa9500-915e-447c-aa75-e26dd52fc93d
INSERT INTO profiles (id, full_name, phone, address, role, created_at)
VALUES (
  '26fa9500-915e-447c-aa75-e26dd52fc93d'::uuid,
  'Administrador Principal',
  '+52 55 1234 5678',
  '{"calle": "Av. Reforma 123", "ciudad": "Ciudad de México", "estado": "CDMX", "codigo_postal": "06600"}'::jsonb,
  'admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin',
    full_name = 'Administrador Principal',
    phone = '+52 55 1234 5678',
    address = '{"calle": "Av. Reforma 123", "ciudad": "Ciudad de México", "estado": "CDMX", "codigo_postal": "06600"}'::jsonb;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que el administrador se creó correctamente
SELECT 
  p.id,
  u.email,
  p.full_name,
  p.role,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'admin';