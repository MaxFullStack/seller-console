/**
 * Dashboard Feature Hooks
 *
 * Clean separation of concerns:
 * - Each hook has a single responsibility
 * - Hooks only consume raw data from store
 * - All business logic centralized in feature
 */

export { useLeadsMetrics } from "./use-leads-metrics";
export { useOpportunitiesMetrics } from "./use-opportunities-metrics";
export { useOverallMetrics } from "./use-overall-metrics";
