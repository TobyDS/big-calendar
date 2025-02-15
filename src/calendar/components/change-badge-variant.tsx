"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Select } from "@/components/ui/select";

export function ChangeBadgeVariant() {
  const { badgeVariant, setBadgeVariant } = useCalendar();

  return (
    <Select.Root value={badgeVariant} onValueChange={setBadgeVariant}>
      <Select.Trigger className="w-48">
        <Select.Value />
      </Select.Trigger>

      <Select.Content viewportClassName="w-64" align="end">
        <Select.Item value="dot">Dot</Select.Item>
        <Select.Item value="colored">Colored</Select.Item>
      </Select.Content>
    </Select.Root>
  );
}
