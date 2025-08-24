import { expect, afterEach, vi, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

// Mock data
const mockLeadsData = [
  {
    id: "1",
    name: "Anna Smith",
    company: "TechCorp",
    email: "anna.smith@techcorp.com",
    source: "web",
    score: 85,
    status: "new",
  },
  {
    id: "2",
    name: "Carlos Johnson",
    company: "DataFlow",
    email: "carlos@dataflow.com",
    source: "referral",
    score: 92,
    status: "qualified",
  },
  {
    id: "3",
    name: "Marina Williams",
    company: "CloudSys",
    email: "marina.williams@cloudsys.com",
    source: "social",
    score: 78,
    status: "contacted",
  },
  {
    id: "4",
    name: "John Peterson",
    company: "StartupAI",
    email: "john@startupai.com",
    source: "email",
    score: 96,
    status: "new",
  },
  {
    id: "5",
    name: "Lucy Brown",
    company: "FinTech Solutions",
    email: "lucy@fintech.com",
    source: "phone",
    score: 74,
    status: "unqualified",
  },
];

const mockOpportunitiesData = [
  {
    id: "1",
    name: "TechCorp - CRM System",
    stage: "proposal",
    amount: 45000,
    accountName: "TechCorp",
    leadId: "1",
  },
  {
    id: "2",
    name: "DataFlow - Analytics Platform",
    stage: "negotiation",
    amount: 75000,
    accountName: "DataFlow",
    leadId: "2",
  },
  {
    id: "3",
    name: "GlobalTech - Enterprise Suite",
    stage: "closed-won",
    amount: 125000,
    accountName: "GlobalTech",
    leadId: "3",
  },
  {
    id: "4",
    name: "StartupX - MVP Platform",
    stage: "closed-won",
    amount: 35000,
    accountName: "StartupX",
    leadId: "4",
  },
  {
    id: "5",
    name: "FinanceInc - Compliance Tool",
    stage: "closed-lost",
    amount: 60000,
    accountName: "FinanceInc",
    leadId: "5",
  },
];

beforeEach(() => {
  // Mock fetch for data files
  global.fetch = vi.fn((input: RequestInfo | URL, _init?: RequestInit) => {
    const url = input.toString();

    if (url.includes("/data/leads.json")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockLeadsData),
      } as Response);
    }

    if (url.includes("/data/opportunities.json")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOpportunitiesData),
      } as Response);
    }

    // Default reject for other URLs to trigger fallback behavior
    return Promise.reject(new Error("No data file"));
  });

  // Mock console.warn to reduce noise in tests
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
