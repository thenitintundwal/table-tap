-- Admin Policies for Orders
CREATE POLICY "Super admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM super_admins WHERE email = auth.email())
  );

-- Admin Policies for Order Items
CREATE POLICY "Super admins can manage all order items" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM super_admins WHERE email = auth.email())
  );

-- Admin Policies for Ratings
CREATE POLICY "Super admins can manage all ratings" ON ratings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM super_admins WHERE email = auth.email())
  );
