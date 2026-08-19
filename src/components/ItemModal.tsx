'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Save, IndianRupee, Tag, FileText } from 'lucide-react';
import { BudgetItem, CategoryId } from '../types/budget';
import { INITIAL_CATEGORIES } from '../data/initialBudget';
import { useBudgetStore } from '../store/useBudgetStore';
import { formatINR } from '../utils/formatCurrency';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: BudgetItem | null;
  defaultCategoryId?: CategoryId;
  isPurchasedOnlyMode?: boolean;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  defaultCategoryId = 'bedroom',
  isPurchasedOnlyMode = false,
}) => {
  const { addItem, updateItem } = useBudgetStore();
  const actualPaidInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId>(defaultCategoryId);
  const [minPrice, setMinPrice] = useState('1000');
  const [maxPrice, setMaxPrice] = useState('2500');
  const [actualSpent, setActualSpent] = useState('0');
  const [purchased, setPurchased] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setMinPrice(itemToEdit.minPrice.toString());
      setMaxPrice(itemToEdit.maxPrice.toString());
      setActualSpent(itemToEdit.actualSpent > 0 ? itemToEdit.actualSpent.toString() : '');
      setPurchased(isPurchasedOnlyMode ? true : itemToEdit.purchased);
      setNotes(itemToEdit.notes || '');
    } else {
      setName('');
      setCategory(defaultCategoryId);
      setMinPrice('1000');
      setMaxPrice('2500');
      setActualSpent('0');
      setPurchased(false);
      setNotes('');
    }
    setError('');
  }, [itemToEdit, defaultCategoryId, isOpen, isPurchasedOnlyMode]);

  // Focus Actual Paid (₹) input automatically when opened in purchased only mode
  useEffect(() => {
    if (isOpen && isPurchasedOnlyMode && actualPaidInputRef.current) {
      setTimeout(() => {
        actualPaidInputRef.current?.focus();
        actualPaidInputRef.current?.select();
      }, 50);
    }
  }, [isOpen, isPurchasedOnlyMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter an item name.');
      return;
    }

    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || min;
    const actual = parseFloat(actualSpent) || 0;

    if (min > max) {
      setError('Target Minimum price cannot be greater than Maximum price.');
      return;
    }

    if (itemToEdit) {
      updateItem({
        ...itemToEdit,
        name: name.trim(),
        category,
        minPrice: min,
        maxPrice: max,
        actualSpent: actual,
        purchased: actual > 0 ? true : (isPurchasedOnlyMode ? true : purchased),
        notes: notes.trim(),
      });
    } else {
      addItem({
        name: name.trim(),
        category,
        minPrice: min,
        maxPrice: max,
        actualSpent: actual,
        purchased: actual > 0 ? true : purchased,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  const calculatedAvg = Math.round(((parseFloat(minPrice) || 0) + (parseFloat(maxPrice) || 0)) / 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-hidden">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 flex-shrink-0">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            {itemToEdit ? <Save className="w-4 h-4 text-indigo-500" /> : <Plus className="w-4 h-4 text-rose-500" />}
            {itemToEdit ? 'Edit Budget Item' : 'Add New Budget Item'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 mb-3 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex-shrink-0">
            {error}
          </div>
        )}

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-3.5 custom-scrollbar">

          {/* Row 1: Item Name & Room Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPurchasedOnlyMode}
                placeholder="e.g. Geyser, Inverter, Mattress..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-indigo-500" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                disabled={isPurchasedOnlyMode}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {INITIAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: 3-Column Price Grid (Target Min, Target Max, Actual Paid) */}
          <div className="bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-emerald-500" /> Pricing & Actual Paid
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Planned Avg:{' '}
                <strong className="text-indigo-600 dark:text-indigo-400">
                  {formatINR(calculatedAvg)}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  Min (₹)
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  disabled={isPurchasedOnlyMode}
                  min="0"
                  step="any"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  Max (₹)
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  disabled={isPurchasedOnlyMode}
                  min="0"
                  step="any"
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  Actual Paid (₹)
                </label>
                <input
                  ref={actualPaidInputRef}
                  type="number"
                  value={actualSpent}
                  onChange={(e) => setActualSpent(e.target.value)}
                  min="0"
                  step="any"
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-indigo-400/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Acquisition Checkbox */}
          <div className="flex items-center gap-2 py-0.5">
            <input
              type="checkbox"
              id="purchased-checkbox"
              checked={purchased}
              onChange={(e) => setPurchased(e.target.checked)}
              disabled={isPurchasedOnlyMode}
              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <label htmlFor="purchased-checkbox" className={`text-xs font-semibold text-slate-700 dark:text-slate-300 ${isPurchasedOnlyMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
              Mark Item as Acquired / Purchased
            </label>
          </div>

          {/* Row 4: Notes / Specs */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" /> Notes / Specifications
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPurchasedOnlyMode}
              placeholder="Dimensions, warranty details, store links..."
              rows={2}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
            >
              {itemToEdit ? 'Save Changes' : 'Create Item'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
