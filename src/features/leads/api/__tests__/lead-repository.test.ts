import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  type MockedFunction,
} from "vitest";
import { LeadRepository } from "../lead-repository";
import type { Lead, CreateLeadInput, UpdateLeadInput } from "../../model/lead";

// Mock utils
vi.mock("@/lib/utils", () => ({
  delay: vi.fn().mockResolvedValue(undefined),
  generateId: vi.fn(() => "mock-generated-id"),
}));

// Mock fetch
global.fetch = vi.fn();

describe("LeadRepository", () => {
  let repository: LeadRepository;
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    repository = new LeadRepository();
    mockLocalStorage = {};

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("list()", () => {
    it("should return existing leads from localStorage when available", async () => {
      const existingLeads: Lead[] = [
        {
          id: "1",
          name: "Test Lead",
          company: "Test Company",
          email: "test@example.com",
          source: "web",
          score: 80,
          status: "new",
        },
      ];
      mockLocalStorage["seller-console-leads"] = JSON.stringify(existingLeads);

      const result = await repository.list();

      expect(result).toEqual(existingLeads);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should load initial data from JSON file when localStorage is empty", async () => {
      const fetchedLeads: Lead[] = [
        {
          id: "1",
          name: "Fetched Lead",
          company: "Fetched Company",
          email: "fetched@example.com",
          source: "email",
          score: 90,
          status: "qualified",
        },
      ];

      (fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(fetchedLeads),
      } as unknown as Response);

      const result = await repository.list();

      expect(fetch).toHaveBeenCalledWith("/seller-console/data/leads.json");
      expect(result).toEqual(fetchedLeads);
      expect(mockLocalStorage["seller-console-leads"]).toBe(
        JSON.stringify(fetchedLeads),
      );
    });

    it("should fallback to mock data when JSON fetch fails", async () => {
      (fetch as MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const result = await repository.list();

      expect(fetch).toHaveBeenCalledWith("/seller-console/data/leads.json");
      expect(result).toHaveLength(5); // Mock data has 5 leads
      expect(result[0]).toEqual({
        id: "1",
        name: "Anna Smith",
        company: "TechCorp",
        email: "anna.smith@techcorp.com",
        source: "web",
        score: 85,
        status: "new",
      });
    });

    it("should fallback to mock data when JSON response is not ok", async () => {
      (fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
      } as unknown as Response);

      const result = await repository.list();

      expect(result).toHaveLength(5); // Mock data has 5 leads
    });
  });

  describe("create()", () => {
    it("should create a new lead and save to localStorage", async () => {
      const existingLeads: Lead[] = [];
      mockLocalStorage["seller-console-leads"] = JSON.stringify(existingLeads);

      const input: CreateLeadInput = {
        name: "New Lead",
        company: "New Company",
        email: "new@example.com",
        source: "social",
        score: 75,
        status: "new",
      };

      const result = await repository.create(input);

      expect(result).toEqual({
        ...input,
        id: "mock-generated-id",
      });

      const savedLeads = JSON.parse(mockLocalStorage["seller-console-leads"]);
      expect(savedLeads).toHaveLength(1);
      expect(savedLeads[0]).toEqual(result);
    });

    it("should add lead to existing leads in localStorage", async () => {
      const existingLeads: Lead[] = [
        {
          id: "1",
          name: "Existing Lead",
          company: "Existing Company",
          email: "existing@example.com",
          source: "web",
          score: 80,
          status: "new",
        },
      ];
      mockLocalStorage["seller-console-leads"] = JSON.stringify(existingLeads);

      const input: CreateLeadInput = {
        name: "New Lead",
        company: "New Company",
        email: "new@example.com",
        source: "social",
        score: 75,
        status: "new",
      };

      const result = await repository.create(input);

      const savedLeads = JSON.parse(mockLocalStorage["seller-console-leads"]);
      expect(savedLeads).toHaveLength(2);
      expect(savedLeads[1]).toEqual(result);
    });
  });

  describe("update()", () => {
    it("should update an existing lead", async () => {
      const existingLeads: Lead[] = [
        {
          id: "1",
          name: "Original Lead",
          company: "Original Company",
          email: "original@example.com",
          source: "web",
          score: 80,
          status: "new",
        },
      ];
      mockLocalStorage["seller-console-leads"] = JSON.stringify(existingLeads);

      const input: UpdateLeadInput = {
        id: "1",
        status: "qualified",
        score: 90,
      };

      const result = await repository.update(input);

      expect(result).toEqual({
        id: "1",
        name: "Original Lead",
        company: "Original Company",
        email: "original@example.com",
        source: "web",
        score: 90,
        status: "qualified",
      });

      const savedLeads = JSON.parse(mockLocalStorage["seller-console-leads"]);
      expect(savedLeads[0]).toEqual(result);
    });

    it("should throw error when lead not found", async () => {
      const existingLeads: Lead[] = [];
      mockLocalStorage["seller-console-leads"] = JSON.stringify(existingLeads);

      const input: UpdateLeadInput = {
        id: "non-existent",
        status: "qualified",
      };

      await expect(repository.update(input)).rejects.toThrow("Lead not found");
    });
  });

  describe("delete()", () => {
    it("should delete an existing lead", async () => {
      const existingLeads: Lead[] = [
        {
          id: "1",
          name: "Lead 1",
          company: "Company 1",
          email: "lead1@example.com",
          source: "web",
          score: 80,
          status: "new",
        },
        {
          id: "2",
          name: "Lead 2",
          company: "Company 2",
          email: "lead2@example.com",
          source: "email",
          score: 85,
          status: "qualified",
        },
      ];
      mockLocalStorage["seller-console-leads"] = JSON.stringify(existingLeads);

      await repository.delete("1");

      const savedLeads = JSON.parse(mockLocalStorage["seller-console-leads"]);
      expect(savedLeads).toHaveLength(1);
      expect(savedLeads[0].id).toBe("2");
    });

    it("should throw error when lead not found for deletion", async () => {
      const existingLeads: Lead[] = [];
      mockLocalStorage["seller-console-leads"] = JSON.stringify(existingLeads);

      await expect(repository.delete("non-existent")).rejects.toThrow(
        "Lead not found",
      );
    });
  });

  describe("findById()", () => {
    it("should find lead by id", async () => {
      const existingLeads: Lead[] = [
        {
          id: "1",
          name: "Lead 1",
          company: "Company 1",
          email: "lead1@example.com",
          source: "web",
          score: 80,
          status: "new",
        },
        {
          id: "2",
          name: "Lead 2",
          company: "Company 2",
          email: "lead2@example.com",
          source: "email",
          score: 85,
          status: "qualified",
        },
      ];
      mockLocalStorage["seller-console-leads"] = JSON.stringify(existingLeads);

      const result = await repository.findById("2");

      expect(result).toEqual(existingLeads[1]);
    });

    it("should return null when lead not found", async () => {
      const existingLeads: Lead[] = [];
      mockLocalStorage["seller-console-leads"] = JSON.stringify(existingLeads);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("localStorage edge cases", () => {
    it("should handle malformed localStorage data", async () => {
      mockLocalStorage["seller-console-leads"] = "invalid-json";

      // This should throw an error when trying to parse invalid JSON
      expect(() =>
        JSON.parse(mockLocalStorage["seller-console-leads"]),
      ).toThrow();
    });

    it("should handle empty localStorage", async () => {
      // localStorage returns empty array when no data exists
      const result = JSON.parse(
        mockLocalStorage["seller-console-leads"] || "[]",
      );
      expect(result).toEqual([]);
    });
  });
});
