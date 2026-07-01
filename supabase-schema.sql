-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  is_blocked BOOLEAN DEFAULT false,
  force_logout BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration TEXT,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_phone TEXT,
  event_date DATE,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  total_price NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC GENERATED ALWAYS AS (total_price - paid_amount) STORED,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Galleries table
CREATE TABLE IF NOT EXISTS galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  event_date DATE,
  has_password_protection BOOLEAN DEFAULT false,
  password TEXT,
  photos JSONB DEFAULT '[]',
  total_files_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  show_on_homepage BOOLEAN DEFAULT true,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Deliveries table
CREATE TABLE IF NOT EXISTS client_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  title TEXT NOT NULL,
  password TEXT NOT NULL,
  payment_completed BOOLEAN DEFAULT false,
  photos JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Content table (CMS)
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_galleries_published ON galleries(is_published, show_on_homepage);
CREATE INDEX IF NOT EXISTS idx_galleries_client ON galleries(client_name);
CREATE INDEX IF NOT EXISTS idx_client_deliveries_payment ON client_deliveries(payment_completed);
CREATE INDEX IF NOT EXISTS idx_reviews_gallery ON reviews(gallery_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Only admins can read/write, users can read their own
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Packages: Public read, authenticated write
CREATE POLICY "Packages public read" ON packages FOR SELECT USING (true);
CREATE POLICY "Authenticated can write packages" ON packages FOR ALL USING (auth.role() = 'authenticated');

-- Bookings: Authenticated read, editor/admin write
CREATE POLICY "Authenticated can read bookings" ON bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Editor admin can write bookings" ON bookings FOR ALL USING (
  auth.jwt() ->> 'role' IN ('editor', 'admin')
);

-- Galleries: Public read, authenticated write
CREATE POLICY "Galleries public read" ON galleries FOR SELECT USING (true);
CREATE POLICY "Authenticated can write galleries" ON galleries FOR ALL USING (auth.role() = 'authenticated');

-- Client Deliveries: Public read (for clients), authenticated write
CREATE POLICY "Client deliveries public read" ON client_deliveries FOR SELECT USING (true);
CREATE POLICY "Authenticated can write client deliveries" ON client_deliveries FOR ALL USING (auth.role() = 'authenticated');

-- Reviews: Public read, authenticated write
CREATE POLICY "Reviews public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated can write reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');

-- Page Content: Public read, editor/admin write
CREATE POLICY "Page content public read" ON page_content FOR SELECT USING (true);
CREATE POLICY "Editor admin can write page content" ON page_content FOR ALL USING (
  auth.jwt() ->> 'role' IN ('editor', 'admin')
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_galleries_updated_at BEFORE UPDATE ON galleries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_deliveries_updated_at BEFORE UPDATE ON client_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON page_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
