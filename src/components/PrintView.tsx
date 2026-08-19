'use client';

import React from 'react';
import { useBudgetStore } from '../store/useBudgetStore';
import { INITIAL_CATEGORIES } from '../data/initialBudget';
import { formatINR } from '../utils/formatCurrency';

export const PrintView: React.FC = () => {
  const { items, getSummary } = useBudgetStore();
  const summary = getSummary();

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="hidden print:block text-slate-900 p-8 font-sans bg-white">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            NewlyNest - Home Budget Report
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Generated on {formattedDate} • Complete Appliance & Room Setup Summary
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 font-bold uppercase">Status</p>
          <p className="text-sm font-extrabold text-indigo-700">
            {summary.purchasedCount} of {summary.totalItemsCount} Acquired ({summary.completionPercentage}%)
          </p>
        </div>
      </div>

      {/* KPI Highlights Box */}
      <div className="grid grid-cols-4 gap-4 p-4 rounded-xl border border-slate-300 bg-slate-50 mb-6 text-center">
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Total Planned</p>
          <p className="text-lg font-bold">{formatINR(summary.totalPlannedAvg)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Total Spent</p>
          <p className="text-lg font-bold">{formatINR(summary.totalSpent)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Net Variance</p>
          <p className={`text-lg font-bold ${summary.netSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {summary.netSavings >= 0 ? '+' : '-'}{formatINR(Math.abs(summary.netSavings))}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Pending Items</p>
          <p className="text-lg font-bold">{summary.totalItemsCount - summary.purchasedCount}</p>
        </div>
      </div>

      {/* Categorized Tables */}
      {INITIAL_CATEGORIES.map((category) => {
        const catItems = items.filter((i) => i.category === category.id);
        if (catItems.length === 0) return null;

        let categoryPlanned = 0;
        let categorySpent = 0;
        catItems.forEach((i) => {
          categoryPlanned += (i.minPrice + i.maxPrice) / 2;
          if (i.purchased) categorySpent += i.actualSpent;
        });

        return (
          <div key={category.id} className="mb-6 page-break-inside-avoid">
            <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-2">
              <h2 className="text-base font-bold text-slate-900">{category.name}</h2>
              <span className="text-xs text-slate-600 font-semibold">
                Category Spent: {formatINR(categorySpent)} / Target: {formatINR(categoryPlanned)}
              </span>
            </div>

            <table className="w-full text-xs text-left border-collapse mb-2">
              <thead>
                <tr className="border-b border-slate-400 bg-slate-100">
                  <th className="py-1.5 px-2">Status</th>
                  <th className="py-1.5 px-2">Item Name</th>
                  <th className="py-1.5 px-2">Target Range</th>
                  <th className="py-1.5 px-2">Planned Avg</th>
                  <th className="py-1.5 px-2">Actual Paid (₹)</th>
                  <th className="py-1.5 px-2">Variance ($\Delta$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {catItems.map((item) => {
                  const plannedAvg = Math.round((item.minPrice + item.maxPrice) / 2);
                  const delta = plannedAvg - item.actualSpent;
                  return (
                    <tr key={item.id} className="border-b border-slate-200">
                      <td className="py-1.5 px-2 font-bold">
                        {item.purchased ? '✓ Purchased' : 'Pending'}
                      </td>
                      <td className="py-1.5 px-2 font-medium">{item.name}</td>
                      <td className="py-1.5 px-2 text-slate-600">{formatINR(item.minPrice)} - {formatINR(item.maxPrice)}</td>
                      <td className="py-1.5 px-2 font-semibold">{formatINR(plannedAvg)}</td>
                      <td className="py-1.5 px-2 font-bold">{formatINR(item.actualSpent)}</td>
                      <td className="py-1.5 px-2">
                        {!item.purchased
                          ? '—'
                          : delta >= 0
                            ? `+${formatINR(delta)} Saved`
                            : `-${formatINR(Math.abs(delta))} Over`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Footer / Notes */}
      <div className="border-t border-slate-400 pt-4 mt-8 flex justify-between text-xs text-slate-500">
        <p>NewlyNest Home Budget Planner • Verified Report</p>
        <p>Page 1 of 1</p>
      </div>
    </div>
  );
};
