'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Bed, Tv, Utensils, Wrench, Layers, Bath, Zap } from 'lucide-react';
import { BudgetItem, CategoryInfo } from '../types/budget';
import { BudgetItemRow } from './BudgetItemRow';
import { useBudgetStore } from '../store/useBudgetStore';
import { formatINR } from '../utils/formatCurrency';

interface CategorySectionProps {
  category: CategoryInfo;
  items: BudgetItem[];
  onEditItem: (item: BudgetItem, isPurchasedOnlyMode?: boolean) => void;
  onAddItemCategory: (catId: CategoryInfo['id']) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Bed,
  Tv,
  Utensils,
  Bath,
  Zap,
  Wrench,
};

const categoryTitleMarkup: Record<string, React.ReactNode> = {
  bedroom: (
    <>
      <span>Bedroom </span>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-indigo-300">Sanctuary</span>
    </>
  ),
  'living-room': (
    <>
      <span>Living </span>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-indigo-300">Room</span>
    </>
  ),
  kitchen: (
    <>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-indigo-300">Kitchen</span>
      <span> & Appliances</span>
    </>
  ),
  bathroom: (
    <>
      <span>Bathroom </span>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-indigo-300">Essentials</span>
    </>
  ),
  electronics: (
    <>
      <span>Electronics & </span>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-indigo-300">Power</span>
    </>
  ),
  utility: (
    <>
      <span>Home Utility & </span>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-indigo-300">Decor</span>
    </>
  ),
};

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  items,
  onEditItem,
  onAddItemCategory,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Subtotals
  let plannedTotal = 0;
  let spentTotal = 0;
  let purchasedCount = 0;

  items.forEach((item) => {
    plannedTotal += (item.minPrice + item.maxPrice) / 2;
    if (item.purchased) {
      purchasedCount += 1;
      spentTotal += item.actualSpent;
    }
  });

  const CategoryIcon = iconMap[category.iconName] || Layers;

  if (items.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      
      {/* Category Accordion Header - Analytics Banner Gradient & Glowing Accents */}
      <div className="relative overflow-hidden p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        {/* Title & Icon */}
        <div className="relative z-10 flex items-center gap-3">
          <div className={`p-3 rounded-2xl bg-gradient-to-tr ${category.gradient} text-white shadow-md shadow-indigo-500/20 flex-shrink-0`}>
            <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                {categoryTitleMarkup[category.id] || category.name}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${category.badgeBg} ${category.badgeText}`}>
                {purchasedCount} / {items.length} Acquired
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              {category.description}
            </p>
          </div>
        </div>

        {/* Sub-totals & Expand Controls */}
        <div className="relative z-10 flex items-center justify-between sm:justify-end gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Category Sub-total</p>
            <p className="text-sm font-extrabold text-white">
              {formatINR(spentTotal)}{' '}
              <span className="text-xs font-normal text-slate-300">
                / {formatINR(plannedTotal)} target
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddItemCategory(category.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Row</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </div>

      {/* Accordion Content Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-2.5 px-4 text-center w-12">Status</th>
                <th className="py-2.5 px-4">Item & Description</th>
                <th className="py-2.5 px-4">Target Range (Avg)</th>
                <th className="py-2.5 px-4">Actual Paid (₹)</th>
                <th className="py-2.5 px-4">Variance ($\Delta$)</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <BudgetItemRow key={item.id} item={item} onEdit={onEditItem} />
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
