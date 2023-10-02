import { ObsDispCreate, dispatchEvent, obsDispCreator, obsDispEvents, payloadProp } from '../OD'
// @ts-ignore
import mazeGen from 'maze-generation'
const classNames = require('classnames')
import { getMazeSize } from '../game/global/mazeSize'
import { TPortalSeed, TPortalWithPos } from './createPortals'
import { getContainer } from '../common/container'
import { decorateCreateHtmlEl, wait } from '../common/func'
import { dispatchReadjustDPIChange } from '../common/createDPIChangeDetect'
import { getSeedSuffix } from './global/seedSuffix'
import { haveWallColorsChanged, setCellWallColor } from './global/cellWallColors'

export interface IMazeCell {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  visited: boolean
}

export type TMazeJson = IMazeCell[][]

export type TMazeCellPos = { row: number; column: number }
export type TGenerateSolutionFunc = (
  startCell: TMazeCellPos,
  endCell: TMazeCellPos
) => TMazeCellPos[]

const generateMaze = ({ seed }: { seed: string }) => {
  const maze = mazeGen({
    width: getMazeSize().cols,
    height: getMazeSize().rows,
    seed: `${seed}${getSeedSuffix()}`,
    algorithm: 'HUNTANDKILL',
  })

  return {
    maze,
    generateSolution: ((startCell, endCell) =>
      maze.generateSolution(startCell, endCell).toJSON()) as TGenerateSolutionFunc,
    mazeJSON: maze.toJSON().rows,
  }
}

const renderMaze = ({ mazeJSON }: { mazeJSON: TMazeJson }) => {
  const mazeHTML = mazeJSON
    .map((row) => {
      return `<div class="row">${row
        .map((cell) => {
          return `<span class="cell ${classNames(cell as any)}"></span>`
        })
        .join('')}</div>`
    })
    .join('')

  ;(
    getContainer().querySelector('.maze') ||
    decorateCreateHtmlEl('')((el) => {
      el.className = 'maze'
      getContainer().appendChild(el)
    })
  ).innerHTML = mazeHTML
}

export const INITIAL_MAZE_SEED = '0'

export const createMaze = obsDispCreator(
  () => {
    const state = {
      seed: INITIAL_MAZE_SEED,
      lastPortal: null as TPortalWithPos,
      currentPortals: [] as TPortalSeed[],
    }

    const regenerateMaze = (portal?: TPortalWithPos, isMovingBack?: boolean) => {
      portal && (state.seed = portal.seed)

      const { seed } = state
      const { mazeJSON, generateSolution } = generateMaze({ seed })
      renderMaze({ mazeJSON })

      const mazeGeneratedEventPayload = {
        seed,
        mazeJSON,
        fromPortal: portal,
        isMovingBack,
        generateSolution,
      }
      dispatchEvent('MAZE_GENERATED', {
        payload: mazeGeneratedEventPayload,
      })

      wait(1000).then(() => {
        dispatchEvent('MAZE_GENERATED_DELAYED', {
          payload: mazeGeneratedEventPayload,
        })
      })

      if (haveWallColorsChanged()) {
        setCellWallColor()
      }
    }
    const regenerateFromSeed = (seed: TPortalSeed) => {
      regenerateMaze({ ...state.lastPortal, seed })
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
      GAME_START: () => regenerateMaze(),
      PORTALS_GENERATED: (ev) => {
        const fromPortal = payloadProp<TPortalWithPos>('fromPortal')(ev)
        const isMovingBack = payloadProp<boolean>('isMovingBack')(ev)

        state.lastPortal = fromPortal
        regenerateMaze(fromPortal, isMovingBack)

        const portals = payloadProp<TPortalWithPos[]>('portals')(ev).map((p) => p.seed)
        state.currentPortals = portals

        dispatchReadjustDPIChange()
      },
      /** To be used in Free Roam mode */
      MAZE_FORCE_REGEN: (ev) => regenerateFromSeed(ev.payload?.seed || state.lastPortal?.seed),
    }
  },
  { id: 'maze' }
)
