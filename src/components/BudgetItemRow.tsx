'use client';

import React, { useState } from 'react';
import { Check, Edit3, Trash2, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { BudgetItem } from '../types/budget';
import { useBudgetStore } from '../store/useBudgetStore';
import { formatINR } from '../utils/formatCurrency';

interface BudgetItemRowProps {
  item: BudgetItem;
  onEdit: (item: BudgetItem, isPurchasedOnlyMode?: boolean) => void;
}

export const BudgetItemRow: React.FC<BudgetItemRowProps> = ({ item, onEdit }) => {
  const { togglePurchased, updateActualSpent, deleteItem } = useBudgetStore();

  const [isEditingActual, setIsEditingActual] = useState(false);
  const [actualInput, setActualInput] = useState(item.actualSpent.toString());

  const plannedAvg = Math.round((item.minPrice + item.maxPrice) / 2);
  const delta = plannedAvg - item.actualSpent;
  const isOverBudget = item.purchased && delta < 0;
  const isUnderBudget = item.purchased && delta > 0;

  const handleActualSubmit = () => {
    const val = parseFloat(actualInput);
    if (!isNaN(val)) {
      updateActualSpent(item.id, val);
    }
    setIsEditingActual(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleActualSubmit();
    } else if (e.key === 'Escape') {
      setActualInput(item.actualSpent.toString());
      setIsEditingActual(false);
    }
  };

  const handleCheckboxClick = () => {
    if (item.purchased) {
      togglePurchased(item.id);
    } else {
      onEdit(item, true);
    }
  };

  return (
    <tr
      className={`group border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
        item.purchased ? 'bg-slate-50/40 dark:bg-slate-900/40' : ''
      }`}
    >
      {/* 1. Status Checkbox */}
      <td className="py-3.5 px-4 text-center">
        <button
          onClick={handleCheckboxClick}
          title={item.purchased ? 'Mark as Pending' : 'Mark as Purchased'}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            item.purchased
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-transparent'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>
      </td>

      {/* 2. Item Name & Notes */}
      <td className="py-3.5 px-4">
        <div className="flex flex-col">
          <span
            onDoubleClick={() => onEdit(item, false)}
            className={`font-semibold text-sm cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
              item.purchased
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-100'
            }`}
            title="Double-click to edit item"
          >
            {item.name}
          </span>
          {item.notes && (
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <Info className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate max-w-xs">{item.notes}</span>
            </span>
          )}
        </div>
      </td>

      {/* 3. Target Range (Min - Max) & Planned Avg */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex flex-col text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {formatINR(plannedAvg)}{' '}
            <span className="font-normal text-slate-400 dark:text-slate-500 text-[11px]">(Avg)</span>
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {formatINR(item.minPrice)} – {formatINR(item.maxPrice)}
          </span>
        </div>
      </td>

      {/* 4. Actual Spent Paid (₹) - Editable Input */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        {isEditingActual ? (
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-400">₹</span>
            <input
              type="number"
              value={actualInput}
              onChange={(e) => setActualInput(e.target.value)}
              onBlur={handleActualSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-24 px-2 py-1 text-xs font-bold rounded-lg border border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        ) : (
          <div
            onClick={() => {
              setActualInput(item.actualSpent.toString());
              setIsEditingActual(true);
            }}
            title="Click to edit price paid"
            className="cursor-pointer group/price inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {formatINR(item.actualSpent)}
            </span>
            <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover/price:opacity-100 transition-opacity" />
          </div>
        )}
      </td>

      {/* 5. Dynamic Variance Badge (\Delta = Planned Avg - Actual Spent) */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        {!item.purchased ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Pending
          </span>
        ) : isUnderBudget ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <TrendingDown className="w-3.5 h-3.5" />
            +{formatINR(Math.abs(delta))} Saved
          </span>
        ) : isOverBudget ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            <TrendingUp className="w-3.5 h-3.5" />
            -{formatINR(Math.abs(delta))} Over
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
            On Target
          </span>
        )}
      </td>

      {/* 6. Actions */}
      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item, false)}
            title="Edit Item Details"
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteItem(item.id)}
            title="Delete Item"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
