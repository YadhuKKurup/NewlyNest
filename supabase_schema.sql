-- ========================================================
-- NEWLYNEST BUDGET PLANNER - SUPABASE DATABASE SCHEMA
-- Copy and paste this script into Supabase Dashboard -> SQL Editor
-- ========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Workspaces Table (Couples Budget Workspace)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL DEFAULT 'Our Home Budget',
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_target_budget NUMERIC DEFAULT 500000,
    currency TEXT NOT NULL DEFAULT '₹'
);

-- 3. Workspace Members Table (Partner Invite & Sharing)
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'partner'
    UNIQUE(workspace_id, user_id)
);

-- 4. Dynamic Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT DEFAULT 'Layers',
    gradient TEXT DEFAULT 'from-purple-500 to-indigo-600',
    sort_order INT DEFAULT 0
);

-- 5. Budget Items Table
CREATE TABLE IF NOT EXISTS public.budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    category_id TEXT DEFAULT 'bedroom',
    name TEXT NOT NULL,
    min_price NUMERIC DEFAULT 0,
    max_price NUMERIC DEFAULT 0,
    actual_spent NUMERIC DEFAULT 0,
    purchased BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- Fix category_id column type if previously created as UUID
ALTER TABLE public.budget_items DROP CONSTRAINT IF EXISTS budget_items_category_id_fkey;
ALTER TABLE public.budget_items ALTER COLUMN category_id TYPE TEXT USING category_id::TEXT;

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each couple can only see and edit their own workspace
-- ========================================================

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- Workspaces Policies
CREATE POLICY "Users can view workspaces they belong to" 
ON public.workspaces FOR SELECT 
USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = public.workspaces.id AND user_id = auth.uid())
);

CREATE POLICY "Users can insert their own workspace" 
ON public.workspaces FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their workspace" 
ON public.workspaces FOR UPDATE 
USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = public.workspaces.id AND user_id = auth.uid())
);

-- Categories Policies
CREATE POLICY "Users can manage categories in their workspace" 
ON public.categories FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.workspaces w 
        LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id
        WHERE w.id = public.categories.workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
);

-- Budget Items Policies
CREATE POLICY "Users can manage budget items in their workspace" 
ON public.budget_items FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.workspaces w 
        LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id
        WHERE w.id = public.budget_items.workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
);

-- Enable Realtime Sync on budget_items & categories
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspaces;
