import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BudgetItem, CategoryId, StatusFilter, BudgetSummary } from '../types/budget';
import { INITIAL_BUDGET_ITEMS } from '../data/initialBudget';
import { workspaceService, Workspace } from '../lib/workspaceService';

interface BudgetStoreState {
  items: BudgetItem[];
  searchQuery: string;
  selectedCategory: CategoryId | 'all' | 'full-products';
  statusFilter: StatusFilter;
  isDarkMode: boolean;

  // Cloud Workspace State
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setItems: (items: BudgetItem[]) => void;

  // Actions
  togglePurchased: (id: string) => void;
  updateActualSpent: (id: string, amount: number) => void;
  updateItem: (updatedItem: BudgetItem) => void;
  addItem: (item: Omit<BudgetItem, 'id'>) => void;
  deleteItem: (id: string) => void;
  resetToDefault: () => void;
  clearAllWorkspaceItems: () => void;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: CategoryId | 'all' | 'full-products') => void;
  setStatusFilter: (filter: StatusFilter) => void;
  toggleDarkMode: () => void;

  // Selectors
  getSummary: () => BudgetSummary;
  getFilteredItems: () => BudgetItem[];
  getCategorySummary: (categoryId: CategoryId) => {
    plannedAvg: number;
    spent: number;
    purchasedCount: number;
    totalCount: number;
  };
}

export const useBudgetStore = create<BudgetStoreState>()(
  persist(
    (set, get) => ({
      items: INITIAL_BUDGET_ITEMS,
      searchQuery: '',
      selectedCategory: 'all',
      statusFilter: 'all',
      isDarkMode: false,
      activeWorkspace: null,

      setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
      setItems: (items) => set({ items }),

      togglePurchased: (id: string) => {
        const { activeWorkspace, items } = get();
        const targetItem = items.find((i) => i.id === id);
        if (!targetItem) return;

        const newPurchased = !targetItem.purchased;
        const updatedItem = {
          ...targetItem,
          purchased: newPurchased,
          actualSpent: newPurchased ? targetItem.actualSpent : 0,
          updatedAt: new Date().toISOString(),
        };

        // Update local state
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? updatedItem : i)),
        }));

        // Sync with Supabase if in active workspace
        if (activeWorkspace) {
          workspaceService.updateBudgetItem(updatedItem);
        }
      },

      updateActualSpent: (id: string, amount: number) => {
        const { activeWorkspace, items } = get();
        const cleanAmount = Math.max(0, isNaN(amount) ? 0 : amount);
        const targetItem = items.find((i) => i.id === id);
        if (!targetItem) return;

        const updatedItem = {
          ...targetItem,
          actualSpent: cleanAmount,
          purchased: cleanAmount > 0 ? true : targetItem.purchased,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          items: state.items.map((i) => (i.id === id ? updatedItem : i)),
        }));

        if (activeWorkspace) {
          workspaceService.updateBudgetItem(updatedItem);
        }
      },

      updateItem: (updatedItem: BudgetItem) => {
        const { activeWorkspace } = get();
        set((state) => ({
          items: state.items.map((item) =>
            item.id === updatedItem.id ? { ...updatedItem, updatedAt: new Date().toISOString() } : item
          ),
        }));

        if (activeWorkspace) {
          workspaceService.updateBudgetItem(updatedItem);
        }
      },

      addItem: (newItemData) => {
        const { activeWorkspace } = get();
        const id = `item-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newItem: BudgetItem = {
          ...newItemData,
          id,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          items: [newItem, ...state.items],
        }));

        if (activeWorkspace) {
          workspaceService.addBudgetItem(activeWorkspace.id, newItemData).then((res) => {
            if (res) {
              // Replace temporary local ID with Supabase UUID
              set((state) => ({
                items: state.items.map((i) => (i.id === id ? { ...i, id: res.id } : i)),
              }));
            }
          });
        }
      },

      deleteItem: (id: string) => {
        const { activeWorkspace } = get();
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));

        if (activeWorkspace) {
          workspaceService.deleteBudgetItem(id);
        }
      },

      resetToDefault: () => {
        set({
          items: INITIAL_BUDGET_ITEMS,
          searchQuery: '',
          selectedCategory: 'all',
          statusFilter: 'all',
        });
      },

      clearAllWorkspaceItems: () => {
        const { activeWorkspace } = get();
        set({
          items: [],
          searchQuery: '',
          selectedCategory: 'all',
          statusFilter: 'all',
        });
        if (activeWorkspace) {
          workspaceService.clearWorkspaceItems(activeWorkspace.id);
        }
      },

      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setStatusFilter: (filter) => set({ statusFilter: filter }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      getSummary: () => {
        const { items } = get();
        let totalPlannedAvg = 0;
        let totalSpent = 0;
        let purchasedCount = 0;
        let overBudgetCount = 0;
        let underBudgetCount = 0;

        items.forEach((item) => {
          const plannedAvg = (item.minPrice + item.maxPrice) / 2;
          totalPlannedAvg += plannedAvg;

          if (item.purchased) {
            purchasedCount += 1;
            totalSpent += item.actualSpent;

            const delta = plannedAvg - item.actualSpent;
            if (delta < 0) {
              overBudgetCount += 1;
            } else if (delta > 0) {
              underBudgetCount += 1;
            }
          }
        });

        const totalItemsCount = items.length;
        const completionPercentage = totalItemsCount > 0 ? Math.round((purchasedCount / totalItemsCount) * 100) : 0;
        const netSavings = totalPlannedAvg - totalSpent;

        return {
          totalPlannedAvg,
          totalSpent,
          purchasedCount,
          totalItemsCount,
          netSavings,
          overBudgetCount,
          underBudgetCount,
          completionPercentage,
        };
      },

      getFilteredItems: () => {
        const { items, searchQuery, selectedCategory, statusFilter } = get();
        return items.filter((item) => {
          // Category match
          if (
            selectedCategory !== 'all' &&
            selectedCategory !== 'full-products' &&
            item.category !== selectedCategory
          ) {
            return false;
          }

          // Search match
          if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            const nameMatch = item.name.toLowerCase().includes(query);
            const notesMatch = item.notes?.toLowerCase().includes(query) ?? false;
            if (!nameMatch && !notesMatch) return false;
          }

          // Status filter match
          const plannedAvg = (item.minPrice + item.maxPrice) / 2;
          const delta = plannedAvg - item.actualSpent;

          if (statusFilter === 'purchased') return item.purchased;
          if (statusFilter === 'pending') return !item.purchased;
          if (statusFilter === 'over-budget') return item.purchased && delta < 0;
          if (statusFilter === 'under-budget') return item.purchased && delta > 0;

          return true;
        });
      },

      getCategorySummary: (categoryId: CategoryId) => {
        const { items } = get();
        const categoryItems = items.filter((i) => i.category === categoryId);
        let plannedAvg = 0;
        let spent = 0;
        let purchasedCount = 0;

        categoryItems.forEach((item) => {
          plannedAvg += (item.minPrice + item.maxPrice) / 2;
          if (item.purchased) {
            purchasedCount += 1;
            spent += item.actualSpent;
          }
        });

        return {
          plannedAvg,
          spent,
          purchasedCount,
          totalCount: categoryItems.length,
        };
      },
    }),
    {
      name: 'newlywed-nest-budget-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
