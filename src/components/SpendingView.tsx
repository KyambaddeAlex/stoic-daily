import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  TrendingDown,
  Sparkles,
  PieChart,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';
import {
  type ExpenseItem,
  calculateSpendingMetrics,
  formatDisplayDate,
  localDateKey,
} from '../utils/stoicLogic';
import {
  getExpenses,
  addExpense,
  deleteExpense,
  getMonthlyBudget,
  saveMonthlyBudget,
} from '../services/storageService';

export function SpendingView() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(getExpenses());
  const [budget, setBudget] = useState<number>(getMonthlyBudget());
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetInput, setNewBudgetInput] = useState(String(budget));

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'necessity' | 'growth' | 'impulse'>('necessity');
  const [description, setDescription] = useState('');

  const metrics = calculateSpendingMetrics(expenses, budget);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !description.trim()) return;

    addExpense({
      amount: Math.round(num * 100) / 100,
      category,
      description: description.trim(),
      date: localDateKey(),
    });

    setExpenses(getExpenses());
    setAmount('');
    setDescription('');
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    setExpenses(getExpenses());
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(newBudgetInput);
    if (!isNaN(num) && num > 0) {
      saveMonthlyBudget(num);
      setBudget(num);
      setIsEditingBudget(false);
    }
  };

  const categoryBadges = {
    necessity: 'bg-blue-950/40 text-blue-300 border-blue-800/40',
    growth: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
    impulse: 'bg-red-950/40 text-red-300 border-red-800/40',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242b24] pb-4">
        <div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#c89b3c]">
            04 / INTENTIONAL LIVING & FINANCE
          </p>
          <h2 className="text-2xl font-serif font-bold text-[#f0f3ee]">
            Mindful Stoic Spending
          </h2>
          <p className="text-xs text-[#8c988a]">
            Seneca: "Wealth consists not in having great possessions, but in having few wants."
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditingBudget ? (
            <div className="flex items-center gap-2 bg-[#1b201b] border border-[#2b342b] px-3 py-1.5 rounded-lg text-xs">
              <span className="text-[#889586]">Monthly Cap:</span>
              <strong className="text-[#e6c875] font-mono">${budget}</strong>
              <button
                type="button"
                onClick={() => setIsEditingBudget(true)}
                className="text-[10px] text-[#c89b3c] hover:underline ml-1"
              >
                Edit
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveBudget} className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                value={newBudgetInput}
                onChange={(e) => setNewBudgetInput(e.target.value)}
                className="w-20 bg-[#121512] border border-[#2c352c] rounded px-2 py-1 text-xs text-[#e4e7e2]"
              />
              <button
                type="submit"
                className="px-2 py-1 rounded bg-[#c89b3c] text-[#121412] text-xs font-bold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="px-2 py-1 text-xs text-[#889586]"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#171b17] border border-[#283028] rounded-xl p-4 space-y-1">
          <p className="text-[11px] text-[#8e9a8b] uppercase font-semibold">Intentionality Ratio</p>
          <p className="text-2xl font-serif font-bold text-[#8ce09a]">
            {metrics.intentionalRatio}%
          </p>
          <p className="text-[10px] text-[#707c6f]">Necessity & Growth vs Impulse</p>
        </div>

        <div className="bg-[#171b17] border border-[#283028] rounded-xl p-4 space-y-1">
          <p className="text-[11px] text-[#8e9a8b] uppercase font-semibold">Total Spent</p>
          <p className="text-2xl font-serif font-bold text-[#f0f3ee] font-mono">
            ${metrics.totalSpent.toFixed(2)}
          </p>
          <p className="text-[10px] text-[#707c6f]">{metrics.budgetUsedPercentage}% of cap used</p>
        </div>

        <div className="bg-[#171b17] border border-[#283028] rounded-xl p-4 space-y-1">
          <p className="text-[11px] text-[#8e9a8b] uppercase font-semibold">Growth & Virtue</p>
          <p className="text-2xl font-serif font-bold text-[#c89b3c] font-mono">
            ${metrics.growthTotal.toFixed(2)}
          </p>
          <p className="text-[10px] text-[#707c6f]">Books, health & craft tools</p>
        </div>

        <div className="bg-[#171b17] border border-[#283028] rounded-xl p-4 space-y-1">
          <p className="text-[11px] text-[#8e9a8b] uppercase font-semibold">Impulse / Desires</p>
          <p className="text-2xl font-serif font-bold text-[#e89086] font-mono">
            ${metrics.impulseTotal.toFixed(2)}
          </p>
          <p className="text-[10px] text-[#707c6f]">Examine without shame</p>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div className="bg-[#171b17] border border-[#283028] rounded-xl p-4 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#cad2c6]">
            Remaining Capacity: <strong className="text-[#e6c875] font-mono">${metrics.budgetRemaining.toFixed(2)}</strong>
          </span>
          <span className="text-[#889586]">{metrics.budgetUsedPercentage}% of ${budget}</span>
        </div>
        <div className="w-full bg-[#121512] h-2.5 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all ${
              metrics.budgetUsedPercentage > 90 ? 'bg-red-500' : 'bg-[#c89b3c]'
            }`}
            style={{ width: `${metrics.budgetUsedPercentage}%` }}
          />
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-[#171b17] border border-[#283028] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#f0f3ee]">Log an Intentional Expense</h3>

        <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-medium text-[#9ba699] mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#121512] border border-[#283028] rounded-lg px-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-medium text-[#9ba699] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'necessity' | 'growth' | 'impulse')}
              className="w-full bg-[#121512] border border-[#283028] rounded-lg px-2.5 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
            >
              <option value="necessity">Necessity (Food, Shelter, Utility)</option>
              <option value="growth">Growth (Books, Fitness, Craft)</option>
              <option value="impulse">Impulse (Luxury, Distraction)</option>
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-medium text-[#9ba699] mb-1">
              Purpose & Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Epictetus translation or coffee"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#121512] border border-[#283028] rounded-lg px-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-[#283228] hover:bg-[#344034] text-[#e6c875] border border-[#3b473b] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Log Expense
            </button>
          </div>
        </form>
      </div>

      {/* Expenses List */}
      <div className="bg-[#171b17] border border-[#283028] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#f0f3ee]">Recent Expenditures</h3>

        <div className="space-y-2">
          {expenses.length === 0 ? (
            <p className="text-center py-6 text-xs text-[#717c6f] italic">
              No expenses recorded yet.
            </p>
          ) : (
            expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#141814] border border-[#242b24]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      categoryBadges[exp.category]
                    }`}
                  >
                    {exp.category}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-[#e4e7e2]">{exp.description}</p>
                    <p className="text-[10px] text-[#737f71]">{exp.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-[#f0f3ee]">
                    ${exp.amount.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="p-1 text-[#667264] hover:text-red-400 transition-colors"
                    aria-label={`Delete ${exp.description}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
