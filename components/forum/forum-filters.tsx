'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ForumFiltersProps {
  selectedCraving: string;
  onCravingChange: (craving: string) => void;
  cravingOptions: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
}

export function ForumFilters({ selectedCraving, onCravingChange, cravingOptions }: ForumFiltersProps) {
  return (
    <Select value={selectedCraving} onValueChange={onCravingChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filter by category" />
      </SelectTrigger>
      <SelectContent>
        {cravingOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center space-x-2">
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}