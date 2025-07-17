'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DashboardFilters({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getActiveTab = () => {
    if (searchParams.has('from') && searchParams.has('to')) return 'custom';
    return searchParams.get('range') || 'all';
  };
  const [activeTab, setActiveTab] = React.useState(getActiveTab());

  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('from');
    params.delete('to');

    if (value === 'all') {
      params.delete('range');
    } else {
      params.set('range', value);
    }
    
    router.push(`/admin?${params.toString()}`);
  };

  React.useEffect(() => {
    if (date?.from && date?.to) {
      setActiveTab('custom');
      const params = new URLSearchParams(searchParams.toString());
      params.set('from', format(date.from, 'yyyy-MM-dd'));
      params.set('to', format(date.to, 'yyyy-MM-dd'));
      params.delete('range');
      router.push(`/admin?${params.toString()}`);
    }
  }, [date, router, searchParams]);
  
  React.useEffect(() => {
    setActiveTab(getActiveTab());
  }, [searchParams]);

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>
      </Tabs>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[260px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
