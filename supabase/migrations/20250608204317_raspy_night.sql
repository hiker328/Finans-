/*
  # Personal Finance Application Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `monthly_limit` (numeric, optional)
      - `color` (text)
      - `created_at` (timestamp)
    - `income`
      - `id` (uuid, primary key)
      - `description` (text)
      - `amount` (numeric)
      - `date` (date)
      - `is_recurring` (boolean)
      - `recurring_day` (integer, optional)
      - `active` (boolean)
      - `created_at` (timestamp)
    - `expenses`
      - `id` (uuid, primary key)
      - `name` (text)
      - `amount` (numeric)
      - `due_date` (date)
      - `is_recurring` (boolean)
      - `recurrence_count` (integer, optional)
      - `current_recurrence` (integer)
      - `was_paid` (boolean)
      - `paid_at` (timestamp, optional)
      - `created_at` (timestamp)
    - `transactions`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `amount` (numeric)
      - `description` (text)
      - `date` (date)
      - `created_at` (timestamp)
    - `savings_goals`
      - `id` (uuid, primary key)
      - `name` (text)
      - `goal_amount` (numeric)
      - `current_amount` (numeric)
      - `deadline` (date, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (single user app)
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  monthly_limit numeric DEFAULT 0,
  color text DEFAULT '#F63D68',
  created_at timestamptz DEFAULT now()
);

-- Income table
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL,
  is_recurring boolean DEFAULT false,
  recurring_day integer,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  is_recurring boolean DEFAULT false,
  recurrence_count integer DEFAULT 1,
  current_recurrence integer DEFAULT 1,
  was_paid boolean DEFAULT false,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Savings goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  goal_amount numeric NOT NULL,
  current_amount numeric DEFAULT 0,
  deadline date,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (single user app)
CREATE POLICY "Public access for categories" ON categories FOR ALL USING (true);
CREATE POLICY "Public access for income" ON income FOR ALL USING (true);
CREATE POLICY "Public access for expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "Public access for transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Public access for savings_goals" ON savings_goals FOR ALL USING (true);

-- Insert default categories
INSERT INTO categories (name, color, monthly_limit) VALUES
  ('Mercado', '#F63D68', 800),
  ('Transporte', '#FEA3B4', 400),
  ('Lazer', '#FFE4E8', 300),
  ('Restaurantes', '#F63D68', 500),
  ('Saúde', '#FEA3B4', 200),
  ('Educação', '#FFE4E8', 150)
ON CONFLICT DO NOTHING;