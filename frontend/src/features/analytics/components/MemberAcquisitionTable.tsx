import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { MemberGrowthDataPoint } from '../services/analyticsService';

interface MemberAcquisitionTableProps {
  data: MemberGrowthDataPoint[];
}

export function MemberAcquisitionTable({ data }: MemberAcquisitionTableProps) {
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    const headers = ['Period', 'New Members', 'Revenue (₹)'];
    const rows = data.map(item => [
      item.period,
      item.newMembers.toString(),
      item.revenue.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `member_acquisition_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Detailed Breakdown</CardTitle>
          <CardDescription className="text-slate-400">Acquisition and revenue by period</CardDescription>
        </div>
        <Button onClick={handleExportCSV} variant="outline" size="sm" className="bg-slate-950 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-white/5 bg-slate-950/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-900/80">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-slate-400 font-medium">Period</TableHead>
                <TableHead className="text-slate-400 font-medium">New Members</TableHead>
                <TableHead className="text-slate-400 font-medium text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((row) => (
                  <TableRow key={row.period} className="border-white/5 hover:bg-slate-800/50">
                    <TableCell className="font-medium text-slate-200">{row.period}</TableCell>
                    <TableCell className="text-slate-300">{row.newMembers}</TableCell>
                    <TableCell className="text-right text-emerald-400 font-medium">
                      ₹{row.revenue.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-slate-500">
                    No data available for the selected period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
