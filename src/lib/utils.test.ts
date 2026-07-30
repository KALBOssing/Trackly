import { describe, it, expect } from "vitest";
import { formatBytes, initials, cn } from "@/lib/utils";

describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes under 1KB", () => {
    expect(formatBytes(500)).toBe("500.0 B");
  });

  it("formats megabytes", () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});

describe("initials", () => {
  it("builds uppercase initials from first and last name", () => {
    expect(initials("Juan", "Dela Cruz")).toBe("JD");
  });

  it("handles an empty last name", () => {
    expect(initials("Juan", "")).toBe("J");
  });
});

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
