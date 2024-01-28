import { remnantItems } from '@/features/items/data'
import { Archtype } from '@/features/items/types'
import { useState } from 'react'
import { WeaponItem } from '@/features/items/types/WeaponItem'
import {
  DEFAULT_COMMUNITY_BUILD_FILTERS,
  DEFAULT_GUN,
} from '@/features/filters/constants'
import { CommunityBuildFilterProps } from '@/features/filters/types'
import FiltersContainer from '@/features/filters/components/FiltersContainer'
import ArchtypeFilters from '@/features/filters/components/ArchtypeFilters'
import WeaponFilters from '@/features/filters/components/WeaponFilters'

const allLongGuns: string[] = remnantItems
  .filter((item) => WeaponItem.isWeaponItem(item) && item.type === 'long gun')
  .map((item) => item.name)
allLongGuns.unshift(DEFAULT_GUN)

const allHandGuns: string[] = remnantItems
  .filter((item) => WeaponItem.isWeaponItem(item) && item.type === 'hand gun')
  .map((item) => item.name)
allHandGuns.unshift(DEFAULT_GUN)

const allMelee: string[] = remnantItems
  .filter((item) => WeaponItem.isWeaponItem(item) && item.type === 'melee')
  .map((item) => item.name)
allMelee.unshift(DEFAULT_GUN)

interface Props {
  showBorder?: boolean
  onUpdate: (filters: CommunityBuildFilterProps) => void
}

export default function CommunityBuildFilters({ onUpdate }: Props) {
  const [filters, setFilters] = useState<CommunityBuildFilterProps>(
    DEFAULT_COMMUNITY_BUILD_FILTERS,
  )

  function handleClearFilters() {
    setFilters(DEFAULT_COMMUNITY_BUILD_FILTERS)
    onUpdate(DEFAULT_COMMUNITY_BUILD_FILTERS)
  }

  const areAnyFiltersActive = () => {
    return (
      filters.archtypes.length > 0 ||
      filters.longGun !== DEFAULT_GUN ||
      filters.handGun !== DEFAULT_GUN ||
      filters.melee !== DEFAULT_GUN
    )
  }

  function handleArchtypeChange(archtype: Archtype) {
    let newArchtypes = [...filters.archtypes]

    if (newArchtypes.includes(archtype)) {
      newArchtypes = newArchtypes.filter((a) => a !== archtype)
    } else {
      // Only allow two archtypes to be selected at a time
      if (filters.archtypes.length === 2) {
        return
      }
      newArchtypes.push(archtype)
    }

    setFilters({
      ...filters,
      archtypes: newArchtypes,
    })
  }

  function handleWeaponChange(
    weapon: string,
    type: 'longGun' | 'handGun' | 'melee',
  ) {
    setFilters({
      ...filters,
      [type]: weapon,
    })
  }

  return (
    <FiltersContainer<CommunityBuildFilterProps>
      areAnyFiltersActive={areAnyFiltersActive()}
      filters={filters}
      onApplyFilters={onUpdate}
      onClearFilters={handleClearFilters}
    >
      <ArchtypeFilters
        selectedArchtypes={filters.archtypes}
        onChange={(archtype: Archtype) => handleArchtypeChange(archtype)}
      />
      <WeaponFilters
        selectedLongGun={filters.longGun}
        selectedHandGun={filters.handGun}
        selectedMelee={filters.melee}
        onChange={(weapon: string, type: 'longGun' | 'handGun' | 'melee') =>
          handleWeaponChange(weapon, type)
        }
      />
    </FiltersContainer>
  )
}
