-- Cafes table
CREATE TABLE cafes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  customer_name TEXT,
  status TEXT DEFAULT 'pending', -- pending, preparing, completed, cancelled
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime with full data replica
ALTER TABLE orders REPLICA IDENTITY FULL;

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_menu_items_cafe ON menu_items(cafe_id);
CREATE INDEX idx_orders_cafe ON orders(cafe_id);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_ratings_menu_item ON ratings(menu_item_id);

-- Enable Row Level Security
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cafes
CREATE POLICY "Cafe owners can view their own cafes" ON cafes
  FOR SELECT USING (auth.uid() = owner_id);

-- ADDED: Allow public to view cafes (for Menu page)
CREATE POLICY "Anyone can view cafes" ON cafes
  FOR SELECT USING (true);
CREATE POLICY "Cafe owners can insert their own cafes" ON cafes
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Cafe owners can update their own cafes" ON cafes
  FOR UPDATE USING (auth.uid() = owner_id);

-- RLS Policies for menu_items (public can read, owners can modify)
CREATE POLICY "Anyone can view available menu items" ON menu_items
  FOR SELECT USING (true);
CREATE POLICY "Cafe owners can manage menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cafes WHERE cafes.id = menu_items.cafe_id AND cafes.owner_id = auth.uid()
    )
  );

-- RLS Policies for orders (public can create, owners can view their cafe's orders)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Cafe owners can view their orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cafes WHERE cafes.id = orders.cafe_id AND cafes.owner_id = auth.uid()
    )
  );
CREATE POLICY "Cafe owners can update their orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cafes WHERE cafes.id = orders.cafe_id AND cafes.owner_id = auth.uid()
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view order items" ON order_items
  FOR SELECT USING (true);

-- RLS Policies for ratings
CREATE POLICY "Anyone can create ratings" ON ratings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view ratings" ON ratings
  FOR SELECT USING (true);

-- Storage setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for menu-images bucket
CREATE POLICY "Public read access" ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- Subscription Management
ALTER TABLE cafes ADD COLUMN subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro'));

-- Super Admins table
CREATE TABLE super_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for super_admins (read-only for everyone to check status, restricted insert/update)
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read super_admins" ON super_admins
  FOR SELECT USING (true); -- Need public read to check if user is admin in client

-- Admin Policies for Cafes
CREATE POLICY "Super admins can manage all cafes" ON cafes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM super_admins WHERE email = auth.email())
  );

-- Admin Policies for Menu Items
CREATE POLICY "Super admins can manage all menu items" ON menu_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM super_admins WHERE email = auth.email())
  );
