-- Create the allowed_cities table
CREATE TABLE IF NOT EXISTS allowed_cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL UNIQUE,
  province TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert initial allowed cities
INSERT INTO allowed_cities (city_name, province, is_active)
VALUES 
  ('Brampton', 'Ontario', true),
  ('Mississauga', 'Ontario', true),
  ('Toronto', 'Ontario', true)
ON CONFLICT (city_name) DO NOTHING;