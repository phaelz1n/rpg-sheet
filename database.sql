-- SCRIPT DE INICIALIZAÇÃO E ATUALIZAÇÃO DO BANCO DE DADOS RPG
-- Este script é seguro para ser executado múltiplas vezes.

-- 1. TABELA DE PERSONAGENS
CREATE TABLE IF NOT EXISTS public.characters (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    character_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE ITENS GLOBAIS
CREATE TABLE IF NOT EXISTS public.global_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    "attributeType" TEXT,
    bonus INTEGER DEFAULT 0,
    damage TEXT,
    category TEXT,
    description TEXT,
    rarity TEXT DEFAULT 'common',
    "corruptionLimitBonus" INTEGER DEFAULT 0,
    "statBonus" TEXT,
    "beltCapacity" INTEGER DEFAULT 0,
    particles TEXT DEFAULT 'none', -- none, embers, sparks, void, frost, gold_dust
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE LOJAS NPC
CREATE TABLE IF NOT EXISTS public.shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "npcName" TEXT,
    "npcPortrait" TEXT,
    "welcomeMessage" TEXT,
    inventory JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ATUALIZAÇÃO DE COLUNAS (Idempotência para colunas novas)
DO $$ 
BEGIN 
    -- Colunas para Shops
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='location') THEN
        ALTER TABLE public.shops ADD COLUMN location TEXT DEFAULT 'Geral';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='is_visible') THEN
        ALTER TABLE public.shops ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;
    END IF;

    -- Colunas para Global Items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='global_items' AND column_name='particles') THEN
        ALTER TABLE public.global_items ADD COLUMN particles TEXT DEFAULT 'none';
    END IF;
END $$;

-- 5. TABELA DE CONFIGURAÇÕES GLOBAIS (RP Config)
CREATE TABLE IF NOT EXISTS public.global_configs (
    id TEXT PRIMARY KEY,
    data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HABILITAR REALTIME
-- Nota: Executamos em blocos separados para evitar que falhas em uma tabela travem as outras
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.global_items;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shops;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.global_configs;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 7. COMENTÁRIOS
COMMENT ON TABLE public.characters IS 'Fichas dos jogadores e credenciais.';
COMMENT ON TABLE public.global_items IS 'Base de dados central de itens do mestre.';
COMMENT ON TABLE public.shops IS 'Mercadores e estoque compartilhado.';
COMMENT ON TABLE public.global_configs IS 'Configurações globais (ex: Mercado Ativo).';
