import { supabase } from './supabaseClient';
import { BudgetItem, CategoryId } from '../types/budget';
import { INITIAL_BUDGET_ITEMS } from '../data/initialBudget';

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  total_target_budget: number;
  currency: string;
  mode?: 'solo' | 'couple';
}

export const workspaceService = {
  // Fetch user workspaces with fail-safe mode parser
  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .or(`owner_id.eq.${userId}`);

    if (error) {
      console.error('Error fetching workspaces:', error);
      return [];
    }

    return (data || []).map((ws) => {
      let resolvedMode: 'solo' | 'couple' = ws.mode === 'couple' ? 'couple' : 'solo';
      let rawName = ws.name || 'Our Home Budget';

      if (rawName.includes('[mode:couple]')) {
        resolvedMode = 'couple';
        rawName = rawName.replace(/\[mode:couple\]\s*/, '').trim();
      }

      return {
        ...ws,
        name: rawName,
        mode: resolvedMode,
      };
    });
  },

  // Create new workspace with fail-safe mode tag
  async createWorkspace(
    userId: string,
    name: string,
    targetBudget: number = 500000,
    seedDemoItems: boolean = false,
    mode: 'solo' | 'couple' = 'solo'
  ): Promise<Workspace | null> {
    const formattedName = mode === 'couple' ? `${name} [mode:couple]` : name;

    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert({
        owner_id: userId,
        name: formattedName,
        total_target_budget: targetBudget,
        currency: '₹',
        mode: mode,
      })
      .select()
      .single();

    if (error || !workspace) {
      // Fallback if mode column does not exist in DB yet
      console.warn('Primary workspace insert failed, retrying fallback:', error?.message);
      const { data: fallbackWs, error: fallbackError } = await supabase
        .from('workspaces')
        .insert({
          owner_id: userId,
          name: formattedName,
          total_target_budget: targetBudget,
          currency: '₹',
        })
        .select()
        .single();

      if (fallbackError || !fallbackWs) {
        console.error('Error creating workspace in fallback:', fallbackError);
        return null;
      }

      await supabase.from('workspace_members').insert({
        workspace_id: fallbackWs.id,
        user_id: userId,
        role: 'owner',
      });

      return { ...fallbackWs, name, mode };
    }

    // Add owner to members table
    await supabase.from('workspace_members').insert({
      workspace_id: workspace.id,
      user_id: userId,
      role: 'owner',
    });

    // Seed default items if requested
    if (seedDemoItems) {
      const itemsToInsert = INITIAL_BUDGET_ITEMS.map((item) => ({
        workspace_id: workspace.id,
        category_id: item.category,
        name: item.name,
        min_price: item.minPrice,
        max_price: item.maxPrice,
        actual_spent: item.actualSpent,
        purchased: item.purchased,
        notes: item.notes || '',
      }));

      await supabase.from('budget_items').insert(itemsToInsert);
    }

    return { ...workspace, name, mode };
  },

  // Delete workspace
  async deleteWorkspace(workspaceId: string): Promise<boolean> {
    try {
      await supabase.from('budget_items').delete().eq('workspace_id', workspaceId);
      await supabase.from('workspace_members').delete().eq('workspace_id', workspaceId);
      const { error } = await supabase.from('workspaces').delete().eq('id', workspaceId);
      if (error) {
        console.error('Error deleting workspace from DB:', error);
      }
      return true;
    } catch (err) {
      console.error('Catch error deleting workspace:', err);
      return true;
    }
  },

  // Clear all items in a workspace
  async clearWorkspaceItems(workspaceId: string): Promise<boolean> {
    const { error } = await supabase.from('budget_items').delete().eq('workspace_id', workspaceId);
    if (error) {
      console.error('Error clearing workspace items:', error);
      return false;
    }
    return true;
  },

  // Join workspace via partner invite link
  async joinWorkspace(userId: string, workspaceId: string): Promise<boolean> {
    const { error } = await supabase.from('workspace_members').insert({
      workspace_id: workspaceId,
      user_id: userId,
      role: 'partner',
    });

    if (error) {
      // Check if already a member
      if (error.code === '23505') return true;
      console.error('Error joining workspace:', error);
      return false;
    }

    return true;
  },

  // Fetch items for a workspace
  async getWorkspaceItems(workspaceId: string): Promise<BudgetItem[]> {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching budget items:', error);
      return [];
    }

    return (data || []).map((dbItem) => ({
      id: dbItem.id,
      name: dbItem.name,
      category: (dbItem.category_id as CategoryId) || 'bedroom',
      minPrice: Number(dbItem.min_price) || 0,
      maxPrice: Number(dbItem.max_price) || 0,
      actualSpent: Number(dbItem.actual_spent) || 0,
      purchased: Boolean(dbItem.purchased),
      notes: dbItem.notes || '',
      updatedAt: dbItem.updated_at,
    }));
  },

  // Insert single item
  async addBudgetItem(workspaceId: string, item: Omit<BudgetItem, 'id'>) {
    const { data, error } = await supabase
      .from('budget_items')
      .insert({
        workspace_id: workspaceId,
        category_id: item.category,
        name: item.name,
        min_price: item.minPrice,
        max_price: item.maxPrice,
        actual_spent: item.actualSpent,
        purchased: item.purchased,
        notes: item.notes || '',
      })
      .select()
      .single();

    if (error) console.error('Error adding item:', error);
    return data;
  },

  // Update item
  async updateBudgetItem(item: BudgetItem) {
    const { error } = await supabase
      .from('budget_items')
      .update({
        category_id: item.category,
        name: item.name,
        min_price: item.minPrice,
        max_price: item.maxPrice,
        actual_spent: item.actualSpent,
        purchased: item.purchased,
        notes: item.notes || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);

    if (error) console.error('Error updating item:', error);
  },

  // Delete item
  async deleteBudgetItem(id: string) {
    const { error } = await supabase.from('budget_items').delete().eq('id', id);
    if (error) console.error('Error deleting item:', error);
  },
};
