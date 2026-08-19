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
  // Fetch user workspaces
  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .or(`owner_id.eq.${userId}`);

    if (error) {
      console.error('Error fetching workspaces:', error);
      return [];
    }
    return data || [];
  },

  // Create new workspace (Defaults to seedDemoItems = false for a clean 0-item dashboard)
  async createWorkspace(
    userId: string,
    name: string,
    targetBudget: number = 500000,
    seedDemoItems: boolean = false,
    mode: 'solo' | 'couple' = 'solo'
  ): Promise<Workspace | null> {
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert({
        owner_id: userId,
        name,
        total_target_budget: targetBudget,
        currency: '₹',
      })
      .select()
      .single();

    if (error || !workspace) {
      console.error('Error creating workspace:', error);
      return null;
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
        name: item.name,
        min_price: item.minPrice,
        max_price: item.maxPrice,
        actual_spent: item.actualSpent,
        purchased: item.purchased,
        notes: item.notes || '',
      }));

      await supabase.from('budget_items').insert(itemsToInsert);
    }

    return { ...workspace, mode };
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
