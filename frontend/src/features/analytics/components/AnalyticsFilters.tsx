import * as React from 'react';
import { DateRange } from 'react-day-picker';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsFiltersProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (date: DateRange | undefined) => void;
  groupBy: string;
  onGroupByChange: (value: string) => void;
}

export function AnalyticsFilters({ dateRange, onDateRangeChange, groupBy, onGroupByChange }: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <CalendarDateRangePicker date={dateRange} onDateChange={onDateRangeChange} />
      
      <Select value={groupBy} onValueChange={(val) => { if (val) onGroupByChange(val); }}>
        <SelectTrigger className="w-[180px] bg-slate-950 border-white/10 text-slate-200">
          <SelectValue placeholder="Group by" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
          <SelectItem value="hour">By Hour</SelectItem>
          <SelectItem value="day">By Day</SelectItem>
          <SelectItem value="week">By Week</SelectItem>
          <SelectItem value="month">By Month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
