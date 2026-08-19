export type CategoryId = 'bedroom' | 'living-room' | 'kitchen' | 'bathroom' | 'electronics' | 'utility';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  description: string;
  iconName: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export interface BudgetItem {
  id: string;
  name: string;
  category: CategoryId;
  minPrice: number;
  maxPrice: number;
  actualSpent: number;
  purchased: boolean;
  notes?: string;
  updatedAt?: string;
}

export type StatusFilter = 'all' | 'purchased' | 'pending' | 'over-budget' | 'under-budget';

export interface BudgetSummary {
  totalPlannedAvg: number;
  totalSpent: number;
  purchasedCount: number;
  totalItemsCount: number;
  netSavings: number; // positive = saved, negative = over budget
  overBudgetCount: number;
  underBudgetCount: number;
  completionPercentage: number;
}
