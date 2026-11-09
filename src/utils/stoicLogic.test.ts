import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStreak,
  calculateVirtueDistribution,
  analyzeDichotomy,
  calculateSpendingMetrics,
  isValidDateKey,
  localDateKey,
  formatDisplayDate,
  type AmbitionItem,
  type DichotomyItem,
  type ExpenseItem,
} from './stoicLogic';

test('isValidDateKey validates standard YYYY-MM-DD correctly', () => {
  assert.equal(isValidDateKey('2026-11-08'), true);
  assert.equal(isValidDateKey('2026-02-29'), false); // not leap year in 2026
  assert.equal(isValidDateKey('invalid-date'), false);
  assert.equal(isValidDateKey('2026-13-01'), false);
});

test('calculateStreak counts consecutive active days including today or yesterday', () => {
  const dates = ['2026-11-08', '2026-11-07', '2026-11-06'];
  assert.equal(calculateStreak(dates, '2026-11-08'), 3);

  // If today is not yet logged but yesterday is, streak remains alive
  assert.equal(calculateStreak(['2026-11-07', '2026-11-06'], '2026-11-08'), 2);

  // If missed yesterday, streak is broken
  assert.equal(calculateStreak(['2026-11-05', '2026-11-04'], '2026-11-08'), 0);
});

test('calculateVirtueDistribution tallies cardinal virtues and percentages accurately', () => {
  const sampleAmbitions: AmbitionItem[] = [
    { id: '1', title: 'Task 1', virtue: 'wisdom', priority: 'high', actionSteps: [], completed: true, createdAt: '' },
    { id: '2', title: 'Task 2', virtue: 'courage', priority: 'medium', actionSteps: [], completed: false, createdAt: '' },
    { id: '3', title: 'Task 3', virtue: 'wisdom', priority: 'low', actionSteps: [], completed: true, createdAt: '' },
    { id: '4', title: 'Task 4', virtue: 'temperance', priority: 'high', actionSteps: [], completed: false, createdAt: '' },
  ];

  const dist = calculateVirtueDistribution(sampleAmbitions);
  assert.equal(dist.wisdom.count, 2);
  assert.equal(dist.wisdom.percentage, 50);
  assert.equal(dist.courage.count, 1);
  assert.equal(dist.courage.percentage, 25);
  assert.equal(dist.justice.count, 0);
  assert.equal(dist.justice.percentage, 0);
  assert.equal(dist.temperance.count, 1);
  assert.equal(dist.temperance.percentage, 25);
});

test('analyzeDichotomy properly computes within/outside counts and reframing rate', () => {
  const items: DichotomyItem[] = [
    { id: '1', text: 'Weather tomorrow', category: 'outside', reframed: 'Dress warmly and accept rain', createdAt: '' },
    { id: '2', text: 'My reaction to criticism', category: 'within', reframed: 'Listen for truth calmly', createdAt: '' },
    { id: '3', text: 'Other person opinion', category: 'outside', reframed: '', createdAt: '' },
  ];

  const analysis = analyzeDichotomy(items);
  assert.equal(analysis.total, 3);
  assert.equal(analysis.within, 1);
  assert.equal(analysis.outside, 2);
  assert.equal(analysis.withinRatio, 33);
  assert.equal(analysis.outsideRatio, 67);
  assert.equal(analysis.reframedRate, 67);
});

test('calculateSpendingMetrics tracks intentional living and impulse control', () => {
  const expenses: ExpenseItem[] = [
    { id: '1', amount: 50, category: 'necessity', description: 'Groceries', date: '2026-11-08' },
    { id: '2', amount: 30, category: 'growth', description: 'Stoic philosophy book', date: '2026-11-08' },
    { id: '3', amount: 20, category: 'impulse', description: 'Unplanned late night takeout', date: '2026-11-08' },
  ];

  const metrics = calculateSpendingMetrics(expenses, 500);
  assert.equal(metrics.totalSpent, 100);
  assert.equal(metrics.necessityTotal, 50);
  assert.equal(metrics.growthTotal, 30);
  assert.equal(metrics.impulseTotal, 20);
  assert.equal(metrics.intentionalRatio, 80); // (50+30)/100 = 80%
  assert.equal(metrics.budgetRemaining, 400);
  assert.equal(metrics.budgetUsedPercentage, 20);
});
