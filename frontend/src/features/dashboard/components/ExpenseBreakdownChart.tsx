'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AddExpenseDialog } from '@/features/dashboard/components/AddExpenseDialog';

const COLORS = ['#3b82f6', '#8b5cf6', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#64748b'];

export function ExpenseBreakdownChart({ analytics }: { analytics: any }) {
  const data = analytics?.expensesByCategory || [];

  if (!data || data.length === 0) {
    return (
      <Card className="glass-card h-full rounded-3xl overflow-hidden flex flex-col border border-white/5 relative group">
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 to-transparent pointer-events-none" />
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-100">Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center flex-1 min-h-[300px] text-center px-6">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-200 mb-1">No expenses tracked yet</h3>
          <p className="text-sm text-slate-400 max-w-xs mb-6">Log expenses to calculate accurate gym profit.</p>
          <AddExpenseDialog />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-full rounded-3xl overflow-hidden flex flex-col border border-white/5 relative group">
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-base font-semibold text-slate-100">Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 relative z-10 p-0 sm:p-6 sm:pt-0">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="amount"
                nameKey="category"
                stroke="rgba(0,0,0,0.2)"
                animationDuration={1500}
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#e2e8f0', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {data.map((entry: any, index: number) => (
            <div key={entry.category} className="flex items-center gap-1.5 text-xs bg-white/5 px-2 py-1 rounded-md border border-white/5">
              <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-slate-300 font-medium">{entry.category.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
