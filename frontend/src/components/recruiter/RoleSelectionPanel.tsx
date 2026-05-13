import type { RolePreset } from "../../types/recruiter";
import { Badge } from "../ui/badge";
import { Card } from "../ui/Card";

interface RoleSelectionPanelProps {
  roles: RolePreset[];
  selectedRoleId: string;
  onRoleChange: (roleId: string) => void;
}

export const RoleSelectionPanel = ({
  roles,
  selectedRoleId,
  onRoleChange
}: RoleSelectionPanelProps) => {
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];

  return (
    <Card className="border-border bg-card px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Role Selection
      </p>

      <div className="mt-3.5">
        <label htmlFor="role-select" className="mb-1 block text-sm font-medium text-foreground">
          Role Dropdown
        </label>
        <select
          id="role-select"
          value={selectedRoleId}
          onChange={(event) => onRoleChange(event.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-muted/25 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id} className="bg-card text-foreground">
              {role.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3.5">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Required Skills</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedRole.requiredSkills.map((skill) => (
            <Badge key={skill} variant="outline" className="border-border bg-muted/25 px-2.5 py-1 text-[11px]">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};
