import { z } from 'zod'

import { BuildState } from '@/features/build/types'

export const buildStateSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  isPublic: z.boolean().nullable(),
  buildId: z.string().nullable(),
  isFeaturedBuild: z.boolean().nullable(),
  createdById: z.string().nullable(),
  upvoted: z.boolean().nullable(),
  items: z.object({
    helm: z.any(),
    torso: z.any(),
    legs: z.any(),
    gloves: z.any(),
    relic: z.any(),
    amulet: z.any(),
    weapon: z.array(z.any()),
    ring: z.array(z.any()),
    archetype: z.array(z.any()),
    skill: z.array(z.any()),
    concoction: z.array(z.any()),
    consumable: z.array(z.any()),
    mod: z.array(z.any()),
    mutator: z.array(z.any()),
    relicfragment: z.array(z.any()),
    trait: z.array(z.any()),
    perk: z.array(z.any()),
  }),
})

export const initialBuildState: BuildState = {
  name: 'My Build',
  description: null,
  isPublic: true,
  isMember: false,
  isFeaturedBuild: false,
  thumbnailUrl: null,
  videoUrl: null,
  buildId: null,
  createdAt: new Date(),
  updatedAt: null,
  createdByDisplayName: null,
  createdById: null,
  upvoted: false,
  totalUpvotes: 0,
  reported: false,
  items: {
    helm: null,
    torso: null,
    legs: null,
    gloves: null,
    relic: null,
    amulet: null,
    weapon: [],
    ring: [],
    archetype: [],
    skill: [],
    concoction: [],
    consumable: [],
    mod: [],
    mutator: [],
    relicfragment: [],
    trait: [],
    perk: [],
  },
}
