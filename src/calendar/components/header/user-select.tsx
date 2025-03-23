import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Avatar } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Select } from "@/components/ui/select";

export function UserSelect() {
  const { users, selectedUserId, setSelectedUserId } = useCalendar();

  // If selectedUserId is null, convert to undefined for compatibility with Select
  const selectValue = selectedUserId === null ? undefined : selectedUserId;

  return (
    <Select.Root value={selectValue} onValueChange={setSelectedUserId}>
      <Select.Trigger className="w-48">
        <Select.Value />
      </Select.Trigger>

      <Select.Content viewportClassName="w-64" align="end">
        <Select.Item value="all">
          <div className="flex items-center gap-1">
            <AvatarGroup max={2}>
              {users?.map(user => (
                <Avatar.Root key={user.id} className="size-6 text-xxs">
                  <Avatar.Image src={user.picturePath ?? undefined} alt={user.name} />
                  <Avatar.Fallback className="text-xxs">{user.name[0]}</Avatar.Fallback>
                </Avatar.Root>
              ))}
            </AvatarGroup>
            All
          </div>
        </Select.Item>

        {users?.map(user => (
          <Select.Item key={user.id} value={user.id} className="flex-1">
            <div className="flex items-center gap-2">
              <Avatar.Root key={user.id} className="size-6">
                <Avatar.Image src={user.picturePath ?? undefined} alt={user.name} />
                <Avatar.Fallback className="text-xxs">{user.name[0]}</Avatar.Fallback>
              </Avatar.Root>

              <p className="truncate">{user.name}</p>
            </div>
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
