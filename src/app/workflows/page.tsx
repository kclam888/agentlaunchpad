'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { WorkflowCard } from '@/components/workflows/WorkflowCard'
import { WorkflowForm } from '@/components/workflows/WorkflowForm'
import { Modal } from '@/components/shared/Modal'
import { useNotification } from '@/contexts/NotificationContext'
import { Workflow, WorkflowStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { WorkflowList } from '@/components/workflows/WorkflowList'

export default async function WorkflowsPage() {
  const workflows = await prisma.workflow.findMany()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Workflows</h1>
      </div>

      <WorkflowList initialWorkflows={workflows} />
    </div>
  )
} 