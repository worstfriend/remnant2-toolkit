import { ArmorItem } from './ArmorItem'
import { GenericItem } from './GenericItem'
import { ModItem } from './ModItem'
import { MutatorItem } from './MutatorItem'
import { PerkItem } from './PerkItem'
import { TraitItem } from './TraitItem'
import { WeaponItem } from './WeaponItem'

export type Item =
  | GenericItem
  | ArmorItem
  | WeaponItem
  | ModItem
  | MutatorItem
  | TraitItem
  | PerkItem

/**
 * The minimum information that should be
 * written in a CSV export for each item
 */
export interface CsvItem {
  name: string
  category: GenericItem['category']
  description: string
  howToGet: string
  wikiLinks: string
}