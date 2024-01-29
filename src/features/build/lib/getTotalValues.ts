import { Item } from '@/features/items/types'
import { BuildState } from '../types'
import { TraitItem } from '@/features/items/types/TraitItem'
import { WEIGHT_CLASSES } from '@/features/items/constants'

function getItemsByKey(
  buildState: BuildState,
  key:
    | 'armor'
    | 'armorPercent'
    | 'health'
    | 'healthPercent'
    | 'healthCap'
    | 'stamina'
    | 'staminaPercent'
    | 'weight'
    | 'weightPercent'
    | 'fireResistance'
    | 'fireResistancePercent'
    | 'blightResistance'
    | 'blightResistancePercent'
    | 'shockResistance'
    | 'shockResistancePercent'
    | 'bleedResistance'
    | 'bleedResistancePercent'
    | 'toxinResistance'
    | 'toxinResistancePercent'
    | 'weightThreshold',
) {
  const items: Item[] = []
  buildState.items.helm !== null &&
    buildState.items.helm[key] &&
    items.push(buildState.items.helm)
  buildState.items.torso !== null &&
    buildState.items.torso[key] &&
    items.push(buildState.items.torso)
  buildState.items.legs !== null &&
    buildState.items.legs[key] &&
    items.push(buildState.items.legs)
  buildState.items.gloves !== null &&
    buildState.items.gloves[key] &&
    items.push(buildState.items.gloves)
  buildState.items.amulet !== null &&
    buildState.items.amulet[key] &&
    items.push(buildState.items.amulet)
  buildState.items.relic !== null &&
    buildState.items.relic[key] &&
    items.push(buildState.items.relic)
  buildState.items.ring &&
    buildState.items.ring.forEach((ring) => {
      ring?.[key] && items.push(ring)
    })
  buildState.items.relicfragment &&
    buildState.items.relicfragment.forEach((fragment) => {
      fragment?.[key] && items.push(fragment)
    })
  buildState.items.weapon &&
    buildState.items.weapon.forEach((weapon) => {
      weapon?.[key] && items.push(weapon)
    })
  buildState.items.mutator &&
    buildState.items.mutator.forEach((mutator) => {
      mutator?.[key] && items.push(mutator)
    })
  buildState.items.mod &&
    buildState.items.mod.forEach((mod) => {
      mod?.[key] && items.push(mod)
    })
  buildState.items.trait &&
    buildState.items.trait.forEach((trait) => {
      trait?.[key] && items.push(trait)
    })
  buildState.items.concoction &&
    buildState.items.concoction.forEach((concoction) => {
      concoction?.[key] && items.push(concoction)
    })
  buildState.items.consumable &&
    buildState.items.consumable.forEach((consumable) => {
      consumable?.[key] && items.push(consumable)
    })

  return items
}

function getTraitItemsByKey(
  buildState: BuildState,
  key:
    | 'armorStep'
    | 'armorStepPercent'
    | 'healthStep'
    | 'healthStepPercent'
    | 'staminaStep'
    | 'staminaStepPercent'
    | 'weightStep'
    | 'weightStepPercent'
    | 'weightThresholds',
) {
  const items: TraitItem[] = []
  buildState.items.trait &&
    buildState.items.trait.forEach((trait) => {
      trait?.[key] && items.push(trait)
    })
  return items
}

export function getTotalArmor(buildState: BuildState) {
  // all equipped items that increase armor
  const equippedArmorIncreaseItems = getItemsByKey(buildState, 'armor')
  // all equipped items that increase armor by a percentage
  const equippedArmorPercentItems = getItemsByKey(buildState, 'armorPercent')
  // all equipped items that increase the armor by a value per point
  const equippedArmorStepItems = getTraitItemsByKey(buildState, 'armorStep')
  // all equipped itesm that increase the armor by a percentage point
  const equippedArmorStepPercentItems = getTraitItemsByKey(
    buildState,
    'armorStepPercent',
  )

  const totalArmorIncrease = equippedArmorIncreaseItems.reduce(
    (acc, item) => acc + (item.armor ?? 0),
    0,
  )
  const totalArmorPercent = equippedArmorPercentItems.reduce(
    (acc, item) => acc + (item.armorPercent ?? 0),
    0,
  )
  const totalArmorStep = equippedArmorStepItems.reduce(
    (acc, item) => acc + (item.armorStep * item.amount ?? 0),
    0,
  )

  const totalArmorStepPercent = equippedArmorStepPercentItems.reduce(
    (acc, item) => acc + (item.armorStepPercent * item.amount ?? 0),
    0,
  )

  const totalArmor =
    totalArmorIncrease * (1 + totalArmorPercent + totalArmorStepPercent) +
    totalArmorStep

  return totalArmor.toFixed(2)
}

export function getTotalHealth(buildState: BuildState) {
  const equippedHealthIncreaseItems = getItemsByKey(buildState, 'health')
  const equippedHealthPercentItems = getItemsByKey(buildState, 'healthPercent')
  const equippedHealthStepItems = getTraitItemsByKey(buildState, 'healthStep')
  const equippedHealthStepPercentItems = getTraitItemsByKey(
    buildState,
    'healthStepPercent',
  )
  const equippedHealthCapItems = getItemsByKey(buildState, 'healthCap')

  const totalHealthIncrease = equippedHealthIncreaseItems.reduce(
    (acc, item) => acc + (item?.health ?? 0),
    0,
  )

  const totalHealthPercent = equippedHealthPercentItems.reduce(
    (acc, item) => acc + (item?.healthPercent ?? 0),
    0,
  )

  const totalHealthStep = equippedHealthStepItems.reduce(
    (acc, item) => acc + (item.healthStep * item.amount ?? 0),
    0,
  )

  const totalHealthStepPercent = equippedHealthStepPercentItems.reduce(
    (acc, item) => acc + (item.healthStepPercent * item.amount ?? 0),
    0,
  )

  // Find the item with the lowest health cap, i.e. the lowest max health
  // player can have
  const itemWithLowestHealthCap = equippedHealthCapItems.reduce<Item | null>(
    (prev, current) => {
      if (prev === null || prev.healthCap === undefined) {
        return current
      } else if (current === null || current.healthCap === undefined) {
        return prev
      } else {
        return prev.healthCap < current.healthCap ? prev : current
      }
    },
    null,
  )

  // Calculate the health cap reduction, i.e. the amount of health that is
  // not included in the total health calculation
  // This is 1 - the lowest health cap, because the health cap is a percentage
  // of the player's max health
  // So if the lowest health cap is 0.9, then the player's max health is 10% less
  const healthCapReduction = 1 - (itemWithLowestHealthCap?.healthCap ?? 0)

  const baseHealthAmount = 100

  const totalHealth =
    (baseHealthAmount + totalHealthIncrease + totalHealthStep) *
    (1 + totalHealthPercent + totalHealthStepPercent) *
    healthCapReduction

  return totalHealth.toFixed(2)
}

export function getTotalResistances(
  buildState: BuildState,
  resistance: 'fire' | 'blight' | 'shock' | 'bleed' | 'toxin',
) {
  const itemsWithResistance = getItemsByKey(
    buildState,
    `${resistance}Resistance`,
  )
  const itemsWithResistancePercent = getItemsByKey(
    buildState,
    `${resistance}ResistancePercent`,
  )

  const totalItemResistance = itemsWithResistance.reduce(
    (acc, item) => acc + (item?.[`${resistance}Resistance`] ?? 0),
    0,
  )
  const totalItemResistancePercent = itemsWithResistancePercent.reduce(
    (acc, item) => acc + (item?.[`${resistance}ResistancePercent`] ?? 0),
    0,
  )

  const totalResistanceIncrease =
    totalItemResistance * totalItemResistancePercent
  const totalResistance = totalItemResistance + totalResistanceIncrease
  return totalResistance
}

export function getTotalStamina(buildState: BuildState) {
  const equippedStaminaIncreaseItems = getItemsByKey(buildState, 'stamina')
  const equippedStaminaPercentItems = getItemsByKey(
    buildState,
    'staminaPercent',
  )
  const equippedStaminaStepItems = getTraitItemsByKey(buildState, 'staminaStep')
  const equippedStaminaStepPercentItems = getTraitItemsByKey(
    buildState,
    'staminaStepPercent',
  )

  const totalStaminaIncrease = equippedStaminaIncreaseItems.reduce(
    (acc, item) => acc + (item?.stamina ?? 0),
    0,
  )

  const totalStaminaPercent = equippedStaminaPercentItems.reduce(
    (acc, item) => acc + (item?.staminaPercent ?? 0),
    0,
  )

  const staminaHealthStep = equippedStaminaStepItems.reduce(
    (acc, item) => acc + (item.staminaStep * item.amount ?? 0),
    0,
  )

  const staminaHealthStepPercent = equippedStaminaStepPercentItems.reduce(
    (acc, item) => acc + (item.staminaStepPercent * item.amount ?? 0),
    0,
  )

  const baseStaminaAmount = 100

  const totalStamina =
    (baseStaminaAmount + totalStaminaIncrease + staminaHealthStep) *
    (1 + totalStaminaPercent + staminaHealthStepPercent)

  return totalStamina.toFixed(2)
}

export function getTotalWeight(buildState: BuildState) {
  const equippedWeightIncreaseItems = getItemsByKey(buildState, 'weight')
  const equippedWeightPercentItems = getItemsByKey(buildState, 'weightPercent')

  const totalWeightIncrease = equippedWeightIncreaseItems.reduce(
    (acc, item) => acc + (item?.weight ?? 0),
    0,
  )

  const totalWeightPercent = equippedWeightPercentItems.reduce(
    (acc, item) => acc + (item?.weightPercent ?? 0),
    0,
  )

  const totalWeight = totalWeightIncrease * (1 + totalWeightPercent)
  return totalWeight.toFixed(2)
}

export function getWeightClass(buildState: BuildState) {
  let totalWeight = Number(getTotalWeight(buildState))

  const equippedWeightThresholdItems = getItemsByKey(
    buildState,
    'weightThreshold',
  )
  const equippedWeightThresholdTraits = getTraitItemsByKey(
    buildState,
    'weightThresholds',
  )

  const totalWeightThreshold = equippedWeightThresholdItems.reduce(
    (acc, item) => acc + (item?.weightThreshold ?? 0),
    0,
  )
  const totalWeightThresholdTrait =
    equippedWeightThresholdTraits.reduce(
      (acc, item) => acc + (item.weightThresholds[0] * item.amount ?? 0),
      0,
    ) || 0

  totalWeight -= totalWeightThreshold + totalWeightThresholdTrait

  let weightClass = WEIGHT_CLASSES.LIGHT
  if (totalWeight > WEIGHT_CLASSES.LIGHT.maxWeight) {
    weightClass = WEIGHT_CLASSES.MEDIUM
  }
  if (totalWeight > WEIGHT_CLASSES.MEDIUM.maxWeight) {
    weightClass = WEIGHT_CLASSES.HEAVY
  }
  if (totalWeight > WEIGHT_CLASSES.HEAVY.maxWeight) {
    weightClass = WEIGHT_CLASSES.ULTRA
  }

  return weightClass
}