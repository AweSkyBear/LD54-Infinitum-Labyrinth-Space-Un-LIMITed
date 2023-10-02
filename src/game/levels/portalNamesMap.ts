import { getCurrentTopos } from '../global/currentTopos'

/** seed-to-portalTitle */
export const PORTAL_NAMES_MAP = {
  // '0C': 'The correct one!', // test only
  '0C4': 'Yes',
  '0C4B': 'Yes',
  '0C4B3': 'Yes',
}

export const getPortalTitleBySeed = (seed: string) =>
  getCurrentTopos() === 'the-game' ? PORTAL_NAMES_MAP[seed] : undefined
