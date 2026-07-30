export function pathwayRequirementStatus(pathwaysCompleted: number) {
  if (pathwaysCompleted >= 5) {
    return { label: "Outstanding Achievement", tone: "success" as const };
  }
  if (pathwaysCompleted >= 2) {
    return { label: "Requirement Completed", tone: "success" as const };
  }
  if (pathwaysCompleted === 1) {
    return { label: "One More Pathway Needed", tone: "warning" as const };
  }
  return { label: "Requirement Not Started", tone: "muted" as const };
}
