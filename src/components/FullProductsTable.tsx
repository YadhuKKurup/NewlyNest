'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { BudgetItem } from '../types/budget';
import { BudgetItemRow } from './BudgetItemRow';

interface FullProductsTableProps {
  items: BudgetItem[];
  onEditItem: (item: BudgetItem) => void;
}

export const FullProductsTable: React.FC<FullProductsTableProps> = ({ items, onEditItem }) => {
  let purchasedCount = 0;
  items.forEach((item) => {
    if (item.purchased) purchasedCount += 1;
  });

  return (
    <div className="mb-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

      {/* Header with Analytics Banner Dark Gradient & Text Gradient */}
      <div className="relative overflow-hidden p-4 sm:p-5 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                <span>Full Master </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-indigo-300">
                  Products
                </span>
                <span> List</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {purchasedCount} / {items.length} Acquired
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Complete inventory list across all room categories
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Content Table */}
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
              <BudgetItemRow
                key={item.id}
                item={item}
                onEdit={onEditItem}
              />
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
