import { describe, expect, it } from "vitest";
import { canCurate } from "@/lib/auth";

describe("canCurate", () => {
  it("libera autor e curador", () => {
    expect(canCurate("autor")).toBe(true);
    expect(canCurate("curador")).toBe(true);
  });

  it("barra o leitor", () => {
    expect(canCurate("leitor")).toBe(false);
  });
});
