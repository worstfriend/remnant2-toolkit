'use client'

import Link from 'next/link'
import PageHeader from '../../features/ui/PageHeader'
import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import CommunityBuilds from './CommunityBuilds'
import CommunityBuildFilters from '@/features/filters/components/CommunityBuildFilters'
import getTotalBuildCount from '@/features/build/actions/getTotalBuildCount'
import { CommunityBuildFilterProps } from '@/features/filters/types'

export default function Page() {
  const { data: sessionData } = useSession()

  const [communityBuildFilters, setCommunityBuildFilters] =
    useState<CommunityBuildFilterProps | null>(null)

  const [totalBuildCount, setTotalBuildCount] = useState<number | string>(
    'HUNDREDS',
  )

  useEffect(() => {
    async function getBuildCountAsync() {
      const response = await getTotalBuildCount()
      setTotalBuildCount(response)
    }
    getBuildCountAsync()
  }, [])

  return (
    <>
      <PageHeader
        title="Community Builds"
        subtitle={
          <span>
            Search from{' '}
            <span className="text-2xl font-bold text-green-500">
              {totalBuildCount}
            </span>{' '}
            community submitted builds!
          </span>
        }
      />

      <div className="mb-8 flex w-full max-w-2xl items-center justify-center">
        <CommunityBuildFilters
          onUpdateFilters={(newFilters) => {
            setCommunityBuildFilters(newFilters)
          }}
        />
      </div>
      {communityBuildFilters && (
        <div className="grid w-full grid-cols-1 gap-2">
          <CommunityBuilds
            communityBuildFilters={communityBuildFilters}
            itemsPerPage={24}
          />
        </div>
      )}
    </>
  )
}
