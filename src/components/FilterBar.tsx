'use client';

import React from 'react';
import { Search, X, Filter, Tag, CheckCircle2, Clock, TrendingUp, TrendingDown, Layers, LayoutGrid } from 'lucide-react';
import { useBudgetStore } from '../store/useBudgetStore';
import { StatusFilter } from '../types/budget';
import { INITIAL_CATEGORIES } from '../data/initialBudget';

export const FilterBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    statusFilter,
    setStatusFilter,
    items,
  } = useBudgetStore();

  // Calculate counts for status pills
  const counts = React.useMemo(() => {
    let all = items.length;
    let purchased = 0;
    let pending = 0;
    let over = 0;
    let under = 0;

    items.forEach((item) => {
      if (item.purchased) {
        purchased += 1;
        const plannedAvg = (item.minPrice + item.maxPrice) / 2;
        const delta = plannedAvg - item.actualSpent;
        if (delta < 0) over += 1;
        if (delta > 0) under += 1;
      } else {
        pending += 1;
      }
    });

    return { all, purchased, pending, over, under };
  }, [items]);

  const statusPills: { id: StatusFilter; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'all', label: 'All Items', icon: Layers, count: counts.all },
    { id: 'purchased', label: 'Purchased', icon: CheckCircle2, count: counts.purchased },
    { id: 'pending', label: 'Pending', icon: Clock, count: counts.pending },
    { id: 'under-budget', label: 'Under Budget', icon: TrendingDown, count: counts.under },
    { id: 'over-budget', label: 'Over Budget', icon: TrendingUp, count: counts.over },
  ];

  return (
    <div className="mb-6 space-y-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">

      {/* Row 1: Search Input (Left) & Status Filter Pills (Right) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">

        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items , notes (e.g. Bed, Sofa, QLED..)"
            className="w-full pl-10 pr-9 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none flex-wrap">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {statusPills.map((pill) => {
            const Icon = pill.icon;
            const isActive = statusFilter === pill.id;

            return (
              <button
                key={pill.id}
                onClick={() => setStatusFilter(pill.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{pill.label}</span>
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Row 2: Room Category Navigation Bar (Clean Wrapping, Zero Overflow) */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">

        {/* Category Label */}
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-1">
          <Tag className="w-3.5 h-3.5" /> Category:
        </span>

        {/* All Rooms Tab */}
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${selectedCategory === 'all'
            ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          All Rooms
        </button>

        {/* Full Products Tab */}
        <button
          onClick={() => setSelectedCategory('full-products')}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${selectedCategory === 'full-products'
            ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Full Products</span>
        </button>

        {/* Individual Room Category Tabs */}
        {INITIAL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${selectedCategory === cat.id
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            {cat.name}
          </button>
        ))}

      </div>

    </div>
  );
};
