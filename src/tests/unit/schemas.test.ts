import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "@/lib/validations/auth.schema";
import {
  createWriteupSchema,
  filterWriteupSchema,
} from "@/lib/validations/writeup.schema";

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("validates valid registration inputs", () => {
      const result = registerSchema.safeParse({
        username: "hacker_01",
        email: "hacker@sec.io",
        password: "securepassword123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid characters in username", () => {
      const result = registerSchema.safeParse({
        username: "hacker<script>",
        email: "hacker@sec.io",
        password: "securepassword123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects short passwords", () => {
      const result = registerSchema.safeParse({
        username: "hacker_01",
        email: "hacker@sec.io",
        password: "123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createWriteupSchema", () => {
    it("validates valid writeup submission", () => {
      const result = createWriteupSchema.safeParse({
        title: "Kernel Exploitation Deep Dive",
        contentMd: "## Exploit analysis\n\nLong writeup content here...",
        ctfName: "DEF CON 32",
        ctfYear: 2024,
        category: "PWN",
        difficulty: "INSANE",
        status: "PUBLIC",
        tags: ["kernel", "heap"],
      });
      expect(result.success).toBe(true);
    });

    it("rejects writeup with invalid category", () => {
      const result = createWriteupSchema.safeParse({
        title: "Test writeup",
        contentMd: "content...",
        ctfName: "DEF CON",
        ctfYear: 2024,
        category: "INVALID_CAT",
        difficulty: "HARD",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("filterWriteupSchema", () => {
    it("defaults to trending sort and page 1", () => {
      const result = filterWriteupSchema.parse({});
      expect(result.sort).toBe("trending");
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
    });
  });
});
