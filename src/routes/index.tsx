import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { LeadsCard, OpportunitiesCard, MetricsCard } from '@/features/dashboard'
import { useDashboardStore } from '@/store/dashboard-store'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { useOpportunities } from '@/features/opportunities/hooks/use-opportunities'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const setLeads = useDashboardStore((state) => state.setLeads)
  const setOpportunities = useDashboardStore((state) => state.setOpportunities)
  
  // Use the same hooks as the individual pages
  const { leads } = useLeads()
  const { opportunities } = useOpportunities()

  // Sync the hook data with the dashboard store
  useEffect(() => {
    if (leads.data) {
      setLeads(leads.data)
    }
  }, [leads.data, setLeads])

  useEffect(() => {
    if (opportunities.data) {
      setOpportunities(opportunities.data)
    }
  }, [opportunities.data, setOpportunities])

  return (
    <div className="space-y-6">
      {/* Top Row: Leads and Opportunities */}
      <div className="grid gap-6 md:grid-cols-2">
        <LeadsCard />
        <OpportunitiesCard />
      </div>
      
      {/* Bottom Row: Overall Metrics (Full Width) */}
      <div className="w-full">
        <MetricsCard />
      </div>
    </div>
  )
}