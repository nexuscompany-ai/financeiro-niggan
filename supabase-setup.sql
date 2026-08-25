-- ═══════════════════════════════════════════════════════════════
-- NIGGAN FINANCES - Setup Supabase
-- Execute este SQL no Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category    TEXT NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  date        DATE NOT NULL,
  processed   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de metas patrimoniais
CREATE TABLE IF NOT EXISTS goals (
  month   TEXT PRIMARY KEY,  -- Ex: 'Ago/2026'
  target  NUMERIC(12, 2) NOT NULL,
  actual  NUMERIC(12, 2)
);

-- Inserir metas iniciais
INSERT INTO goals (month, target) VALUES
  ('Ago/2026', 3000),
  ('Set/2026', 6000),
  ('Out/2026', 9000),
  ('Nov/2026', 12000),
  ('Dez/2026', 15000),
  ('Jan/2027', 18000),
  ('Fev/2027', 21000),
  ('Mar/2027', 24000),
  ('Abr/2027', 27000),
  ('Mai/2027', 30000)
ON CONFLICT (month) DO NOTHING;

-- 3. Tabela de saldo
CREATE TABLE IF NOT EXISTS balance (
  id    INT PRIMARY KEY DEFAULT 1,
  value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO balance (id, value) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- 4. Habilitar RLS (Row Level Security) - Acesso público por enquanto
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (anon key pode ler e escrever)
CREATE POLICY "allow_all_transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_goals"        ON goals        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_balance"      ON balance      FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- PRONTO! Agora configure as variáveis no Vercel:
--   NEXT_PUBLIC_SUPABASE_URL  = https://xxx.supabase.co
--   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
-- ═══════════════════════════════════════════════════════════════
