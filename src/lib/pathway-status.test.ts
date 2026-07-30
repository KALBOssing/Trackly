import { describe, it, expect } from "vitest";
import { pathwayRequirementStatus } from "@/lib/pathway-status";

describe("pathwayRequirementStatus", () => {
  it("returns 'Requirement Not Started' at 0 completed", () => {
    expect(pathwayRequirementStatus(0).label).toBe("Requirement Not Started");
  });

  it("returns 'One More Pathway Needed' at 1 completed", () => {
    expect(pathwayRequirementStatus(1).label).toBe("One More Pathway Needed");
  });

  it("returns 'Requirement Completed' at 2 completed", () => {
    expect(pathwayRequirementStatus(2).label).toBe("Requirement Completed");
  });

  it("returns 'Requirement Completed' at 4 completed (still below the top tier)", () => {
    expect(pathwayRequirementStatus(4).label).toBe("Requirement Completed");
  });

  it("returns 'Outstanding Achievement' at 5 completed", () => {
    expect(pathwayRequirementStatus(5).label).toBe("Outstanding Achievement");
  });
});
