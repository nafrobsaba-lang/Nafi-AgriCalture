
/*
  # Agricultural Marketplace - Complete Schema

  ## Tables Created:
  1. `profiles` - Extended user profiles (farmer/merchant/admin)
     - Full name, phone, role, location, region
  2. `products` - Farmer product listings
     - Name, category, price, quantity, unit, images, urgent sale flag
  3. `orders` - Merchant purchase orders
     - Product, quantity, status, payment method
  4. `reviews` - Mutual rating system
     - Star rating, comments, reviewer role

  ## Security:
  - RLS enabled on all tables
  - Policies enforce role-based access
  - Farmers manage own products/orders
  - Merchants browse and order
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'merchant' CHECK (role IN ('farmer', 'merchant', 'admin')),
  region text NOT NULL DEFAULT '',
  location_lat double precision,
  location_lng double precision,
  avatar_url text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'vegetables' CHECK (category IN ('vegetables', 'fruits', 'grains', 'livestock', 'dairy', 'other')),
  price decimal(10,2) NOT NULL DEFAULT 0,
  quantity decimal(10,2) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg' CHECK (unit IN ('kg', 'quintal', 'piece', 'liter', 'ton')),
  description text DEFAULT '',
  harvest_date date,
  urgent_sale boolean DEFAULT false,
  images text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  region text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (status = 'active' OR farmer_id = auth.uid());

CREATE POLICY "Farmers can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = farmer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'farmer')
  );

CREATE POLICY "Farmers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = farmer_id);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES profiles(id),
  merchant_id uuid NOT NULL REFERENCES profiles(id),
  quantity decimal(10,2) NOT NULL DEFAULT 1,
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'delivered', 'cancelled')),
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'telebirr', 'bank_transfer')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view their orders"
  ON orders FOR SELECT
  TO authenticated
  USING (farmer_id = auth.uid() OR merchant_id = auth.uid());

CREATE POLICY "Merchants can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = merchant_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('merchant', 'admin'))
  );

CREATE POLICY "Farmers can update order status"
  ON orders FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid() OR merchant_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid() OR merchant_id = auth.uid());

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES profiles(id),
  reviewee_id uuid NOT NULL REFERENCES profiles(id),
  order_id uuid REFERENCES orders(id),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text DEFAULT '',
  reviewer_role text NOT NULL CHECK (reviewer_role IN ('farmer', 'merchant')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_region ON products(region);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
