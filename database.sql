-- SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS RPG
-- Projeto: Modular UI for RPG Character Sheet

-- 1. TABELA DE PERSONAGENS (E AUTENTICAÇÃO SIMPLES)
CREATE TABLE IF NOT EXISTS public.characters (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    character_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Realtime para characters
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;

-- 2. TABELA DE ITENS GLOBAIS (BASE DE DADOS DO MESTRE)
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Realtime para global_items
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_items;

-- 3. TABELA DE LOJAS NPC (SISTEMA DE COMÉRCIO)
CREATE TABLE IF NOT EXISTS public.shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "npcName" TEXT,
    "npcPortrait" TEXT,
    "welcomeMessage" TEXT,
    inventory JSONB DEFAULT '[]'::jsonb, -- Array de {itemId, priceBronze, stock}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Realtime para shops (Essencial para estoque compartilhado!)
ALTER PUBLICATION supabase_realtime ADD TABLE public.shops;

-- 4. COMENTÁRIOS E DICAS
COMMENT ON TABLE public.characters IS 'Armazena as fichas dos jogadores e credenciais de login.';
COMMENT ON TABLE public.global_items IS 'Base de dados central de itens que podem ser adicionados às fichas ou lojas.';
COMMENT ON TABLE public.shops IS 'Configuração de mercadores e estoque compartilhado em tempo real.';

-- NOTA: Certifique-se de configurar as permissões de RLS (Row Level Security) 
-- no seu painel do Supabase conforme sua necessidade de segurança.
