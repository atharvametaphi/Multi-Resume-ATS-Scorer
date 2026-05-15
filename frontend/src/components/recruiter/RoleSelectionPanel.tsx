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
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0] ?? null;
  const hasRoles = roles.length > 0;

  return (
    <Card className="h-full border-border/80 bg-card p-6">
      <p className="section-kicker">Role Selection</p>

      <div className="mt-4">
        <label htmlFor="role-select" className="mb-2 block text-sm font-medium text-foreground">
          Select Job Role
        </label>
        <select
          id="role-select"
          value={selectedRoleId}
          onChange={(event) => onRoleChange(event.target.value)}
          disabled={!hasRoles}
          className="h-11 w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {hasRoles ? (
            roles.map((role) => (
              <option key={role.id} value={role.id} className="bg-card text-foreground">
                {role.title}
              </option>
            ))
          ) : (
            <option value="">No job descriptions available</option>
          )}
        </select>
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Required Skills</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedRole ? (
            selectedRole.requiredSkills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="rounded-full border-border/70 bg-muted/45 px-3 py-1 text-xs font-medium text-foreground"
              >
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Required skills will appear after JDs are loaded.</p>
          )}
        </div>
      </div>
    </Card>
  );
};
