'use client'

import { toast } from 'react-toastify'

import { deleteBuild } from '@/app/builder/actions'
import { isErrorResponse } from '@/features/error-handling/isErrorResponse'

export function DeleteBuildButton({
  buildId,
  onDeleteBuild,
}: {
  buildId: string
  onDeleteBuild: (buildId: string) => void
}) {
  async function handleDeleteBuild() {
    const confirmed = confirm('Are you sure you want to delete this build?')
    if (!confirmed) return

    const response = await deleteBuild(JSON.stringify({ buildId }))

    if (isErrorResponse(response)) {
      console.error(response.errors)
      toast.error('Error deleting build. Please try again later.')
    } else {
      toast.success(response.message)
      onDeleteBuild(buildId)
    }
  }

  return (
    <button
      type="button"
      className="text-red-500 hover:text-red-300"
      onClick={handleDeleteBuild}
    >
      Delete
    </button>
  )
}
