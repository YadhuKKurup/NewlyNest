'use client';

import React from 'react';
import { Bed, Tv, Utensils, Wrench, Layers, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/initialBudget';
import { useBudgetStore } from '../store/useBudgetStore';
import { formatINR } from '../utils/formatCurrency';

const iconMap: Record<string, React.ElementType> = {
  Bed,
  Tv,
  Utensils,
  Wrench,
};

export const CategorySummaryTable: React.FC = () => {
  const { items } = useBudgetStore();

  let grandPlanned = 0;
  let grandSpent = 0;
  let grandAcquiredCount = 0;

  const categoryData = INITIAL_CATEGORIES.map((category) => {
    const catItems = items.filter((i) => i.category === category.id);
    let plannedTotal = 0;
    let spentTotal = 0;
    let purchasedCount = 0;

    catItems.forEach((item) => {
      plannedTotal += (item.minPrice + item.maxPrice) / 2;
      if (item.purchased) {
        purchasedCount += 1;
        spentTotal += item.actualSpent;
      }
    });

    grandPlanned += plannedTotal;
    grandSpent += spentTotal;
    grandAcquiredCount += purchasedCount;

    const delta = plannedTotal - spentTotal;

    return {
      category,
      itemCount: catItems.length,
      purchasedCount,
      plannedTotal,
      spentTotal,
      delta,
    };
  });

  const grandDelta = grandPlanned - grandSpent;

  return (
    <div className="mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

      {/* Header with Analytics Banner Dark Gradient & Text Gradient */}
      <div className="relative overflow-hidden p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
              <span>Categories & </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-indigo-300">Budget </span>
              <span>Summary Table</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Aggregated room totals for target average, actual paid, and net variance
            </p>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <th className="py-3 px-4">Room Category</th>
              <th className="py-3 px-4">Acquisitions</th>
              <th className="py-3 px-4">Target Range (Avg)</th>
              <th className="py-3 px-4">Actual Paid (₹)</th>
              <th className="py-3 px-4">Variance ($\Delta$) (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {categoryData.map(({ category, itemCount, purchasedCount, plannedTotal, spentTotal, delta }) => {
              const CategoryIcon = iconMap[category.iconName] || Layers;
              const isSavings = delta >= 0;

              return (
                <tr key={category.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">

                  {/* Category Name */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${category.gradient} text-white shadow-sm`}>
                        <CategoryIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{category.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{category.description}</p>
                      </div>
                    </div>
                  </td>

                  {/* Acquisitions Count */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${category.badgeBg} ${category.badgeText}`}>
                      {purchasedCount} / {itemCount} Acquired
                    </span>
                  </td>

                  {/* Target Avg */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                    {formatINR(plannedTotal)}
                  </td>

                  {/* Actual Paid */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                    {formatINR(spentTotal)}
                  </td>

                  {/* Variance Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {purchasedCount === 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                        No purchases yet
                      </span>
                    ) : isSavings ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <TrendingDown className="w-3.5 h-3.5" />
                        +{formatINR(Math.abs(delta))} Saved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                        <TrendingUp className="w-3.5 h-3.5" />
                        -{formatINR(Math.abs(delta))} Over
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Grand Total Footer */}
          <tfoot>
            <tr className="bg-slate-900 text-white font-extrabold border-t-2 border-slate-700 text-sm">
              <td className="py-4 px-4 uppercase tracking-wider flex items-center gap-2">
                <span>Grand Overall Total</span>
              </td>
              <td className="py-4 px-4 text-xs font-semibold text-slate-300">
                {grandAcquiredCount} of {items.length} Acquired
              </td>
              <td className="py-4 px-4 text-indigo-300">
                {formatINR(grandPlanned)}
              </td>
              <td className="py-4 px-4 text-white">
                {formatINR(grandSpent)}
              </td>
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${grandDelta >= 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                >
                  {grandDelta >= 0 ? '+' : '-'}{formatINR(Math.abs(grandDelta))} {grandDelta >= 0 ? 'Saved' : 'Over'}
                </span>
              </td>
            </tr>
          </tfoot>

        </table>
      </div>

    </div>
  );
};
