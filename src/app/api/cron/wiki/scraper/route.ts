import { NextRequest } from 'next/server'

import { validateEnv } from '@/app/(validators)/validate-env'
import { handleAmuletItems } from '@/app/api/cron/wiki/scraper/amulets/handle-amulet-items'
import { handleArmorItems } from '@/app/api/cron/wiki/scraper/armor/handle-armor-items'
import { handleConcoctionItems } from '@/app/api/cron/wiki/scraper/concoctions/handle-concoction-items'
import { handleWeaponItems } from '@/app/api/cron/wiki/scraper/weapons/handle-weapon-items'

export async function GET(request: NextRequest) {
  const envVars = validateEnv()

  const authHeader = request.headers.get('authorization')
  if (
    authHeader !== `Bearer ${envVars.CRON_SECRET}` &&
    envVars.NODE_ENV === 'production'
  ) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  // no need for archetype items

  //await handleAmuletItems()
  //await handleArmorItems()
  await handleConcoctionItems()
  //await handleWeaponItems()

  console.info('Finished running wiki scraper script.')

  return new Response('Finished running wiki scraper script.', {
    status: 200,
  })
}