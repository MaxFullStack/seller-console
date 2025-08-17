import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { LeadsCard, OpportunitiesCard, MetricsCard } from '@/components/dashboard'
import { useDashboardStore } from '@/store/dashboard-store'
import { leadRepository } from '@/features/leads/api/lead-repository'
import { opportunityRepository } from '@/features/opportunities/api/opportunity-repository'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const setLeads = useDashboardStore((state) => state.setLeads)
  const setOpportunities = useDashboardStore((state) => state.setOpportunities)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load leads data
        const leadsData = await leadRepository.findAll()
        setLeads(leadsData)

        // Load opportunities data  
        const opportunitiesData = await opportunityRepository.findAll()
        setOpportunities(opportunitiesData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    }

    loadDashboardData()
  }, [setLeads, setOpportunities])

  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <LeadsCard />
        <OpportunitiesCard />
        <MetricsCard />
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min flex items-center justify-center">
        <p className="text-muted-foreground">Main dashboard area</p>
      </div>
    </>
  )
}