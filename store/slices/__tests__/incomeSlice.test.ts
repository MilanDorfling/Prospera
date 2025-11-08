import { normalizeIncome } from '@/store/slices/incomeSlice';

describe('normalizeIncome', () => {
  it('keeps newest entry per name (first occurrence) and preserves canonical order', () => {
    const now = Date.now();
    const items = [
      { _id: 'b2', id: 'b2', name: 'Salary', amount: 5000, createdAt: new Date(now).toISOString() },
      { _id: 'b1', id: 'b1', name: 'Salary', amount: 0, createdAt: new Date(now - 1000).toISOString() },
      { _id: 'c2', id: 'c2', name: 'Freelance', amount: 500, createdAt: new Date(now - 2000).toISOString() },
      { _id: 'c1', id: 'c1', name: 'Freelance', amount: 0, createdAt: new Date(now - 3000).toISOString() },
      { _id: 'd1', id: 'd1', name: 'Investments', amount: 100, createdAt: new Date(now - 4000).toISOString() },
    ];

    const result = normalizeIncome(items as any);
    expect(result.map(r => r.name)).toEqual(['Salary', 'Freelance', 'Investments']);
    const salary = result.find(r => r.name === 'Salary')!;
    const freelance = result.find(r => r.name === 'Freelance')!;
    const investments = result.find(r => r.name === 'Investments')!;

    expect(salary._id).toBe('b2');
    expect(salary.amount).toBe('5000'); // stringified
    expect(freelance._id).toBe('c2');
    expect(freelance.amount).toBe('500');
    expect(investments._id).toBe('d1');
    expect(investments.amount).toBe('100');
  });

  it('handles empty and malformed input safely', () => {
    expect(normalizeIncome([])).toEqual([]);
    expect(normalizeIncome([null as any, undefined as any, { foo: 'bar' } as any])).toEqual([]);
  });
});
