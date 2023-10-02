import {
  dispatchEvent,
  ObsDispCreate,
  IObserver,
  obsDispCreator,
  obsDispEvents,
  removeObs,
} from '../../OD'
import Prando from 'prando'
import { TPortalSeed } from '../createPortals'
import { defaultTo, propOr, repeat } from 'ramda'
import { Pos } from '../../common/types'
import { getMazeSize } from '../../game/global/mazeSize'
import { getCurrentDepth } from '../global/currentDepth'
import { getCurrentPrando, getCurrentSeed } from '../global/currentSeed'
import { createFruit } from '../html/createFruit'
import { isNotNil } from '../../common/func'
import { stringifyPos } from '../gameUtil'

const MIN_COUNT = 0
const MAX_COUNT = 5

const TAKE_FRUIT_PER_HIT = 5

export const createLevelFruit = obsDispCreator(
  () => {
    const state = {
      fruits: [] as IObserver[],
      fruitCount: 0,
      /**
       * Acts as the storage for fruit - persist what is collected only, since
       * fruit positions are auto-generated via pseudo-randomness ;)))
       */
      collectedFruitMap: {} as Record<TPortalSeed, Record<string, boolean>>,
    }

    const getCollectedPositionsForMaze = (seed: TPortalSeed) =>
      defaultTo({}, state.collectedFruitMap[seed])
    const persistCollected = (seed: TPortalSeed, pos: Pos) => {
      state.collectedFruitMap[seed] = propOr({}, seed)(state.collectedFruitMap)
      state.collectedFruitMap[seed][stringifyPos(pos)] = true
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
      PORTAL_ENTERED: (ev) => {
        const seed = defaultTo('0', ev.payload.seed) as string

        // clean from the previous, if any
        state.fruits.forEach((o) => removeObs(o))

        // add the new ones
        state.fruits.push(...createLocalFruit(getCollectedPositionsForMaze(seed)))
      },
      FRUIT_COLLECTED: (ev) => {
        const seed = ev.payload.seed as TPortalSeed
        const pos = ev.payload.pos as Pos

        persistCollected(seed, pos)

        dispatchEvent('FRUIT_COUNT_UPDATED', { payload: { count: ++state.fruitCount } })
      },
      PLAYER_HIT_BY_FOE: () => {
        state.fruitCount = Math.max(0, state.fruitCount - TAKE_FRUIT_PER_HIT)

        dispatchEvent('FRUIT_COUNT_UPDATED', { payload: { count: state.fruitCount } })
      },
      [obsDispEvents.OBS_REMOVE]: () => {
        state.fruits.forEach((o) => removeObs(o))
      },
    }
  },
  { id: 'level-fruit' }
)

export const createLocalFruit = (collectedByIndex: Record<string, boolean>) => {
  const depth = getCurrentDepth()
  /** per the depth !  !  ! - 5-10 initial depth; + 5 for every 2 depths deeper */
  const addCount = Math.max(0, depth / 4) * 5
  const count = new Prando(getCurrentSeed()).nextInt(MIN_COUNT + addCount, MAX_COUNT + addCount)

  const positions = repeat(null, count).map(
    () =>
      ({
        x: getCurrentPrando().nextInt(0, getMazeSize().cols - 1),
        y: getCurrentPrando().nextInt(0, getMazeSize().rows - 1),
      } as Pos)
  )

  const fruits = repeat(null, count)
    .map((_, ind) => {
      const posStr = stringifyPos(positions[ind])
      const wasCollected = collectedByIndex[posStr]
      return !wasCollected && createFruit({ pos: positions[ind] })
    })
    .filter(isNotNil)

  return fruits
}
