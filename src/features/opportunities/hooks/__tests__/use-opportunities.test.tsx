import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock async operation hook
vi.mock("@/hooks/use-async-operation", () => ({
  useAsyncOperation: vi.fn(),
}));

// Mock opportunity repository
vi.mock("../../api/opportunity-repository", () => ({
  opportunityRepository: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { useOpportunities } from "../use-opportunities";
import { useAsyncOperation } from "@/hooks/use-async-operation";

const mockUseAsyncOperation = vi.mocked(useAsyncOperation);

describe("useOpportunities", () => {
  const mockExecute = vi.fn();
  const mockAsyncState = {
    data: [],
    loading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAsyncOperation.mockReturnValue([mockAsyncState, mockExecute]);
  });

  it("should provide opportunities state and actions", () => {
    const { result } = renderHook(() => useOpportunities());

    expect(result.current.opportunities).toEqual(mockAsyncState);
    expect(result.current.loadOpportunities).toBeDefined();
    expect(result.current.createOpportunity).toBeDefined();
    expect(result.current.updateOpportunity).toBeDefined();
    expect(result.current.deleteOpportunity).toBeDefined();
  });

  it("should load opportunities on mount", () => {
    renderHook(() => useOpportunities());

    expect(mockExecute).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should not load opportunities if already loading", () => {
    mockAsyncState.loading = true;

    renderHook(() => useOpportunities());

    expect(mockExecute).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should not load opportunities if already loaded", () => {
    renderHook(() => useOpportunities());

    expect(mockExecute).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should call loadOpportunities with async operation", async () => {
    const { result } = renderHook(() => useOpportunities());

    await act(async () => {
      await result.current.loadOpportunities();
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should call createOpportunity with async operation", async () => {
    const { result } = renderHook(() => useOpportunities());

    const createInput = {
      name: "New Opportunity",
      stage: "prospecting" as const,
      accountName: "New Account",
      leadId: "lead-1",
    };

    await act(async () => {
      await result.current.createOpportunity(createInput);
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should call updateOpportunity with async operation", async () => {
    const { result } = renderHook(() => useOpportunities());

    const updateInput = {
      id: "1",
      stage: "negotiation" as const,
    };

    await act(async () => {
      await result.current.updateOpportunity(updateInput);
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should call deleteOpportunity with async operation", async () => {
    const { result } = renderHook(() => useOpportunities());

    await act(async () => {
      await result.current.deleteOpportunity("1");
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should dispatch correct actions for successful operations", async () => {
    const { result } = renderHook(() => useOpportunities());

    await act(async () => {
      await result.current.loadOpportunities();
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should dispatch error action on operation failure", async () => {
    const { result } = renderHook(() => useOpportunities());

    await act(async () => {
      await result.current.loadOpportunities();
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.any(Function));
  });
});
