import { createFileRoute } from '@tanstack/react-router'
import { LeadsPage } from '@/features/leads/pages/leads-page'

export const Route = createFileRoute('/leads')({
  component: LeadsPage,
})