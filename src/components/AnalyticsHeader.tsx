'use client';

import React from 'react';
import { IndianRupee, ShoppingBag, TrendingDown, TrendingUp, CheckCircle2, AlertCircle, PieChart, ShieldCheck } from 'lucide-react';
import { useBudgetStore } from '../store/useBudgetStore';
import { formatINR } from '../utils/formatCurrency';

export const AnalyticsHeader: React.FC = () => {
  const { getSummary } = useBudgetStore();
  const summary = getSummary();

  const isSavings = summary.netSavings >= 0;

  return (
    <div className="mb-8 space-y-6">
      {/* Top Banner Message */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <ShieldCheck className="w-3.5 h-3.5" /> NewlyNest Home Setup Dashboard
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Build Your Dream Home, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-indigo-300">Within Budget</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Track target price ranges against actual paid prices. Double-click any price or item name to modify target ranges or enter actual costs.
            </p>
          </div>

          {/* Quick Progress Dial Card */}
          <div className="flex-shrink-0 bg-white/10 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 flex items-center gap-4">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600/30 border-4 border-indigo-400 text-white font-bold text-lg">
              {summary.completionPercentage}%
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Acquisition Status</p>
              <p className="text-lg font-bold text-white">
                {summary.purchasedCount} <span className="text-sm font-normal text-slate-300">/ {summary.totalItemsCount} items</span>
              </p>
              <p className="text-xs text-indigo-300 font-medium mt-0.5">
                {summary.totalItemsCount - summary.purchasedCount} items pending purchase
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Planned Budget */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Planned (Avg)
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatINR(summary.totalPlannedAvg)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sum of average target price ranges
            </p>
          </div>
        </div>

        {/* Metric 2: Total Spent to Date */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Spent to Date
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatINR(summary.totalSpent)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              For {summary.purchasedCount} acquired item{summary.purchasedCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Metric 3: Net Variance (Saved vs Excess) */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Budget Savings
            </span>
            <div
              className={`p-2 rounded-xl ${
                isSavings
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isSavings ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <p
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isSavings ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isSavings ? '+' : '-'}{formatINR(Math.abs(summary.netSavings))}
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isSavings ? 'Under planned target average' : 'Over planned target average'}
            </p>
          </div>
        </div>

        {/* Metric 4: Acquired Items & Progress */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overall Progress
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-900 dark:text-white">
                {summary.purchasedCount} of {summary.totalItemsCount} Done
              </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{summary.completionPercentage}%</span>
            </div>

            {/* Custom Styled Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${summary.completionPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" /> {summary.underBudgetCount} under budget
              </span>
              {summary.overBudgetCount > 0 && (
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                  <AlertCircle className="w-3 h-3" /> {summary.overBudgetCount} over budget
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
