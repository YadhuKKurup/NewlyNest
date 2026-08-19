'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { AnalyticsHeader } from '../components/AnalyticsHeader';
import { FilterBar } from '../components/FilterBar';
import { WorkspaceBar } from '../components/WorkspaceBar';
import { CategorySection } from '../components/CategorySection';
import { CategorySummaryTable } from '../components/CategorySummaryTable';
import { FullProductsTable } from '../components/FullProductsTable';
import { ItemModal } from '../components/ItemModal';
import { ResetModal } from '../components/ResetModal';
import { AuthModal } from '../components/AuthModal';
import { WorkspaceModal } from '../components/WorkspaceModal';
import { OnboardingModal } from '../components/OnboardingModal';
import { UserProfileModal } from '../components/UserProfileModal';
import { PrintView } from '../components/PrintView';
import { useBudgetStore } from '../store/useBudgetStore';
import { INITIAL_CATEGORIES, INITIAL_BUDGET_ITEMS } from '../data/initialBudget';
import { BudgetItem, CategoryId } from '../types/budget';
import { workspaceService, Workspace } from '../lib/workspaceService';
import { supabase } from '../lib/supabaseClient';
import { Layers, Plus, Heart } from 'lucide-react';

function HomeContent() {
  const { user } = useAuth();
  const {
    isDarkMode,
    getFilteredItems,
    selectedCategory,
    activeWorkspace,
    setActiveWorkspace,
    setItems,
  } = useBudgetStore();

  const [mounted, setMounted] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [isPurchasedOnlyMode, setIsPurchasedOnlyMode] = useState(false);
  const [defaultCatForAdd, setDefaultCatForAdd] = useState<CategoryId>('bedroom');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync Workspaces & Handle Invite Links or Trigger Onboarding
  useEffect(() => {
    if (!mounted) return;

    async function initWorkspace() {
      if (!user) {
        // User logged out: reset active workspace to null and items to sample demo items
        setActiveWorkspace(null);
        setItems(INITIAL_BUDGET_ITEMS);
        return;
      }

      // Check for invite token in URL
      const searchParams = new URLSearchParams(window.location.search);
      const inviteId = searchParams.get('invite');

      if (inviteId) {
        await workspaceService.joinWorkspace(user.id, inviteId);
        window.history.replaceState({}, '', window.location.pathname);
      }

      // Fetch user's workspaces
      const workspaces = await workspaceService.getUserWorkspaces(user.id);
      if (workspaces.length > 0) {
        const active = workspaces[0];
        setActiveWorkspace(active);
        const cloudItems = await workspaceService.getWorkspaceItems(active.id);
        setItems(cloudItems); // Load user's cloud items (can be [] for clean dashboard)
      } else {
        // User is logged in but has no workspace yet -> Trigger Onboarding Modal!
        setItems([]);
        setIsOnboardingOpen(true);
      }
    }

    initWorkspace();
  }, [user, mounted]);

  // Supabase Realtime Listener for Live Partner Sync
  useEffect(() => {
    if (!activeWorkspace) return;

    const channel = supabase
      .channel(`workspace-${activeWorkspace.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_items',
          filter: `workspace_id=eq.${activeWorkspace.id}`,
        },
        async () => {
          const updatedItems = await workspaceService.getWorkspaceItems(activeWorkspace.id);
          setItems(updatedItems);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeWorkspace]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-sm font-semibold">Loading NewlyNest Planner...</span>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  // Require Auth for write actions in demo mode
  const requireAuthForAction = (action: () => void) => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      action();
    }
  };

  const handleEditItem = (item: BudgetItem, purchasedOnlyMode = false) => {
    requireAuthForAction(() => {
      setEditingItem(item);
      setIsPurchasedOnlyMode(purchasedOnlyMode);
      setIsAddItemOpen(true);
    });
  };

  const handleAddItemForCategory = (catId: CategoryId) => {
    requireAuthForAction(() => {
      setEditingItem(null);
      setIsPurchasedOnlyMode(false);
      setDefaultCatForAdd(catId);
      setIsAddItemOpen(true);
    });
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        
        {/* Screen View (Hidden when printing) */}
        <div className="print:hidden">
          <Navbar
            onOpenAddItem={() => {
              requireAuthForAction(() => {
                setEditingItem(null);
                setIsPurchasedOnlyMode(false);
                setDefaultCatForAdd('bedroom');
                setIsAddItemOpen(true);
              });
            }}
            onOpenResetModal={() => {
              requireAuthForAction(() => setIsResetOpen(true));
            }}
            onTriggerPrint={handleTriggerPrint}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenUserProfileModal={() => setIsUserProfileModalOpen(true)}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Top Analytics KPI Header */}
            <AnalyticsHeader />

            {/* Couple / Solo Workspace Banner */}
            <WorkspaceBar
              activeWorkspace={activeWorkspace}
              onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />

            {/* Filter Bar & Search */}
            <FilterBar />

            {/* 1. FULL PRODUCTS VIEW MODE */}
            {selectedCategory === 'full-products' ? (
              <div className="space-y-6 animate-fadeIn">
                {/* Section A: Category Summary Table */}
                <CategorySummaryTable />

                {/* Section B: All Products Unified Master Table */}
                {filteredItems.length > 0 && (
                  <FullProductsTable
                    items={filteredItems}
                    onEditItem={handleEditItem}
                  />
                )}
              </div>
            ) : (
              /* 2. GROUPED ROOM CATEGORY ACCORDION VIEWS */
              INITIAL_CATEGORIES.map((category) => {
                if (selectedCategory !== 'all' && selectedCategory !== category.id) {
                  return null;
                }

                const categoryItems = filteredItems.filter((i) => i.category === category.id);
                if (categoryItems.length === 0) return null;

                return (
                  <CategorySection
                    key={category.id}
                    category={category}
                    items={categoryItems}
                    onEditItem={handleEditItem}
                    onAddItemCategory={handleAddItemForCategory}
                  />
                );
              })
            )}

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="my-12 text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mb-4">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {user ? 'Your Budget Dashboard is Empty' : 'No Budget Items Found'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
                  {user
                    ? 'Start building your home budget list by adding your first product item below.'
                    : 'No items matched your search query or selected filters. Sign in to create your personal dashboard.'}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      requireAuthForAction(() => {
                        setEditingItem(null);
                        setIsPurchasedOnlyMode(false);
                        setIsAddItemOpen(true);
                      });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Item</span>
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="mt-16 border-t border-slate-200/80 dark:border-slate-800/80 py-8 bg-white/50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <p className="flex items-center justify-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                NewlyNest Budget Planner <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> Built for modern couples & individuals
              </p>
              <p>
                Real-time partner sync • Auto-calculating variance ($\Delta$) • Supabase Cloud Persistence
              </p>
            </div>
          </footer>
        </div>

        {/* Printable View Component (Only rendered during print) */}
        <PrintView />

        {/* Modals */}
        <ItemModal
          isOpen={isAddItemOpen}
          onClose={() => {
            setIsAddItemOpen(false);
            setEditingItem(null);
            setIsPurchasedOnlyMode(false);
          }}
          itemToEdit={editingItem}
          defaultCategoryId={defaultCatForAdd}
          isPurchasedOnlyMode={isPurchasedOnlyMode}
        />

        <ResetModal
          isOpen={isResetOpen}
          onClose={() => setIsResetOpen(false)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        <WorkspaceModal
          isOpen={isWorkspaceModalOpen}
          onClose={() => setIsWorkspaceModalOpen(false)}
          activeWorkspace={activeWorkspace}
          onWorkspaceCreated={(ws) => {
            setActiveWorkspace(ws);
            workspaceService.getWorkspaceItems(ws.id).then(setItems);
          }}
        />

        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onWorkspaceCreated={(ws) => {
            setActiveWorkspace(ws);
            workspaceService.getWorkspaceItems(ws.id).then(setItems);
          }}
        />

        <UserProfileModal
          isOpen={isUserProfileModalOpen}
          onClose={() => setIsUserProfileModalOpen(false)}
          activeWorkspace={activeWorkspace}
          onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        />

      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
