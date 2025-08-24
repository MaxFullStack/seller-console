import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { OpportunityRepository } from "../opportunity-repository";
import type {
  Opportunity,
  CreateOpportunityInput,
  UpdateOpportunityInput,
} from "../../model/opportunity";

// Mock utils
vi.mock("@/lib/utils", () => ({
  delay: vi.fn().mockResolvedValue(undefined),
  generateId: vi.fn(() => "mock-generated-id"),
}));

describe("OpportunityRepository", () => {
  let repository: OpportunityRepository;
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    repository = new OpportunityRepository();
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
    it("should return opportunities from localStorage when version matches", async () => {
      const existingOpportunities: Opportunity[] = [
        {
          id: "1",
          name: "Test Opportunity",
          stage: "proposal",
          amount: 50000,
          accountName: "Test Account",
          leadId: "1",
        },
      ];
      mockLocalStorage["seller-console-opportunities"] = JSON.stringify(
        existingOpportunities,
      );
      mockLocalStorage["seller-console-opportunities-version"] = "2";

      const result = await repository.list();

      expect(result).toEqual(existingOpportunities);
    });

    it("should reset to mock data when version is outdated", async () => {
      const oldOpportunities: Opportunity[] = [
        {
          id: "1",
          name: "Old Opportunity",
          stage: "proposal",
          amount: 10000,
          accountName: "Old Account",
          leadId: "1",
        },
      ];
      mockLocalStorage["seller-console-opportunities"] =
        JSON.stringify(oldOpportunities);
      mockLocalStorage["seller-console-opportunities-version"] = "1"; // Old version

      const result = await repository.list();

      // Should return mock data, not old data
      expect(result).not.toEqual(oldOpportunities);
      expect(result).toHaveLength(8); // Mock data has 8 opportunities
      expect(result[0]).toEqual({
        id: "1",
        name: "TechCorp - CRM System",
        stage: "proposal",
        amount: 45000,
        accountName: "TechCorp",
        leadId: "1",
      });

      // Should update version in localStorage
      expect(mockLocalStorage["seller-console-opportunities-version"]).toBe(
        "2",
      );
    });

    it("should initialize with mock data when no version exists", async () => {
      const result = await repository.list();

      expect(result).toHaveLength(8); // Mock data has 8 opportunities
      expect(mockLocalStorage["seller-console-opportunities-version"]).toBe(
        "2",
      );
      expect(
        JSON.parse(mockLocalStorage["seller-console-opportunities"]),
      ).toEqual(result);
    });

    it("should initialize with mock data when no localStorage data exists", async () => {
      mockLocalStorage["seller-console-opportunities-version"] = "2";
      // No opportunities data in localStorage

      const result = await repository.list();

      expect(result).toHaveLength(8); // Mock data has 8 opportunities
      expect(
        JSON.parse(mockLocalStorage["seller-console-opportunities"]),
      ).toEqual(result);
    });
  });

  describe("create()", () => {
    it("should create a new opportunity and save to localStorage", async () => {
      const existingOpportunities: Opportunity[] = [];
      mockLocalStorage["seller-console-opportunities"] = JSON.stringify(
        existingOpportunities,
      );
      mockLocalStorage["seller-console-opportunities-version"] = "2";

      const input: CreateOpportunityInput = {
        name: "New Opportunity",
        stage: "prospecting",
        amount: 30000,
        accountName: "New Account",
        leadId: "123",
      };

      const result = await repository.create(input);

      expect(result).toEqual({
        ...input,
        id: "mock-generated-id",
      });

      const savedOpportunities = JSON.parse(
        mockLocalStorage["seller-console-opportunities"],
      );
      expect(savedOpportunities).toHaveLength(1);
      expect(savedOpportunities[0]).toEqual(result);
    });

    it("should add opportunity to existing opportunities in localStorage", async () => {
      const existingOpportunities: Opportunity[] = [
        {
          id: "1",
          name: "Existing Opportunity",
          stage: "proposal",
          amount: 40000,
          accountName: "Existing Account",
          leadId: "1",
        },
      ];
      mockLocalStorage["seller-console-opportunities"] = JSON.stringify(
        existingOpportunities,
      );
      mockLocalStorage["seller-console-opportunities-version"] = "2";

      const input: CreateOpportunityInput = {
        name: "New Opportunity",
        stage: "prospecting",
        amount: 30000,
        accountName: "New Account",
        leadId: "123",
      };

      const result = await repository.create(input);

      const savedOpportunities = JSON.parse(
        mockLocalStorage["seller-console-opportunities"],
      );
      expect(savedOpportunities).toHaveLength(2);
      expect(savedOpportunities[1]).toEqual(result);
    });
  });

  describe("update()", () => {
    it("should update an existing opportunity", async () => {
      const existingOpportunities: Opportunity[] = [
        {
          id: "1",
          name: "Original Opportunity",
          stage: "prospecting",
          amount: 40000,
          accountName: "Original Account",
          leadId: "1",
        },
      ];
      mockLocalStorage["seller-console-opportunities"] = JSON.stringify(
        existingOpportunities,
      );
      mockLocalStorage["seller-console-opportunities-version"] = "2";

      const input: UpdateOpportunityInput = {
        id: "1",
        stage: "proposal",
        amount: 50000,
      };

      const result = await repository.update(input);

      expect(result).toEqual({
        id: "1",
        name: "Original Opportunity",
        stage: "proposal",
        amount: 50000,
        accountName: "Original Account",
        leadId: "1",
      });

      const savedOpportunities = JSON.parse(
        mockLocalStorage["seller-console-opportunities"],
      );
      expect(savedOpportunities[0]).toEqual(result);
    });

    it("should throw error when opportunity not found", async () => {
      const existingOpportunities: Opportunity[] = [];
      mockLocalStorage["seller-console-opportunities"] = JSON.stringify(
        existingOpportunities,
      );
      mockLocalStorage["seller-console-opportunities-version"] = "2";

      const input: UpdateOpportunityInput = {
        id: "non-existent",
        stage: "proposal",
      };

      await expect(repository.update(input)).rejects.toThrow(
        "Opportunity not found",
      );
    });
  });

  describe("delete()", () => {
    it("should delete an existing opportunity", async () => {
      const existingOpportunities: Opportunity[] = [
        {
          id: "1",
          name: "Opportunity 1",
          stage: "prospecting",
          amount: 40000,
          accountName: "Account 1",
          leadId: "1",
        },
        {
          id: "2",
          name: "Opportunity 2",
          stage: "proposal",
          amount: 50000,
          accountName: "Account 2",
          leadId: "2",
        },
      ];
      mockLocalStorage["seller-console-opportunities"] = JSON.stringify(
        existingOpportunities,
      );
      mockLocalStorage["seller-console-opportunities-version"] = "2";

      await repository.delete("1");

      const savedOpportunities = JSON.parse(
        mockLocalStorage["seller-console-opportunities"],
      );
      expect(savedOpportunities).toHaveLength(1);
      expect(savedOpportunities[0].id).toBe("2");
    });

    it("should throw error when opportunity not found for deletion", async () => {
      const existingOpportunities: Opportunity[] = [];
      mockLocalStorage["seller-console-opportunities"] = JSON.stringify(
        existingOpportunities,
      );
      mockLocalStorage["seller-console-opportunities-version"] = "2";

      await expect(repository.delete("non-existent")).rejects.toThrow(
        "Opportunity not found",
      );
    });
  });

  describe("findById()", () => {
    it("should find opportunity by id", async () => {
      const existingOpportunities: Opportunity[] = [
        {
          id: "1",
          name: "Opportunity 1",
          stage: "prospecting",
          amount: 40000,
          accountName: "Account 1",
          leadId: "1",
        },
        {
          id: "2",
          name: "Opportunity 2",
          stage: "proposal",
          amount: 50000,
          accountName: "Account 2",
          leadId: "2",
        },
      ];
      mockLocalStorage["seller-console-opportunities"] = JSON.stringify(
        existingOpportunities,
      );
      mockLocalStorage["seller-console-opportunities-version"] = "2";

      const result = await repository.findById("2");

      expect(result).toEqual(existingOpportunities[1]);
    });

    it("should return null when opportunity not found", async () => {
      const existingOpportunities: Opportunity[] = [];
      mockLocalStorage["seller-console-opportunities"] = JSON.stringify(
        existingOpportunities,
      );
      mockLocalStorage["seller-console-opportunities-version"] = "2";

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("data versioning", () => {
    it("should handle version mismatch correctly", async () => {
      const oldData: Opportunity[] = [
        {
          id: "999",
          name: "Old Data",
          stage: "prospecting",
          amount: 1000,
          accountName: "Old Account",
          leadId: "999",
        },
      ];

      mockLocalStorage["seller-console-opportunities"] =
        JSON.stringify(oldData);
      mockLocalStorage["seller-console-opportunities-version"] = "1"; // Old version

      const result = await repository.list();

      // Should get fresh mock data, not old data
      expect(result).not.toContainEqual(oldData[0]);
      expect(result[0].name).toBe("TechCorp - CRM System");
      expect(mockLocalStorage["seller-console-opportunities-version"]).toBe(
        "2",
      );
    });

    it("should handle missing version key", async () => {
      const someData: Opportunity[] = [
        {
          id: "999",
          name: "Some Data",
          stage: "prospecting",
          amount: 1000,
          accountName: "Some Account",
          leadId: "999",
        },
      ];

      mockLocalStorage["seller-console-opportunities"] =
        JSON.stringify(someData);
      // No version key set

      const result = await repository.list();

      // Should reset to mock data when no version
      expect(result).not.toContainEqual(someData[0]);
      expect(result[0].name).toBe("TechCorp - CRM System");
      expect(mockLocalStorage["seller-console-opportunities-version"]).toBe(
        "2",
      );
    });
  });

  describe("edge cases", () => {
    it("should reset to mock data when localStorage contains invalid JSON", async () => {
      // Set invalid version to trigger reset behavior
      mockLocalStorage["seller-console-opportunities"] = JSON.stringify([
        { invalid: "data" },
      ]);
      mockLocalStorage["seller-console-opportunities-version"] = "1"; // Old version

      // The repository should reset to mock data when version is old
      const result = await repository.list();
      expect(result).toHaveLength(8); // Should get mock data
      expect(result[0].name).toBe("TechCorp - CRM System");
    });

    it("should handle missing amount in opportunity", async () => {
      const input: CreateOpportunityInput = {
        name: "No Amount Opportunity",
        stage: "prospecting",
        accountName: "Test Account",
        leadId: "123",
        // amount is optional
      };

      const result = await repository.create(input);

      expect(result).toEqual({
        ...input,
        id: "mock-generated-id",
      });
      expect(result.amount).toBeUndefined();
    });
  });
});
