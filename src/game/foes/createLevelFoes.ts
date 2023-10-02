import Prando from 'prando'
import { repeat } from 'ramda'
import { getIsCalmMode } from '../global/calmMode'
import { getCurrentSeed } from '../global/currentSeed'
import { createRandomFoe } from '../html/createRandomFoe'

const MIN_COUNT = 1
const MAX_COUNT = 5

export const createLevelFoes = () => {
  if (getIsCalmMode()) return []

  // CONFIG COUNT
  const count = new Prando(getCurrentSeed()).nextInt(MIN_COUNT, MAX_COUNT)
  const foes = repeat(null, count).map(createRandomFoe)
  return foes
}
