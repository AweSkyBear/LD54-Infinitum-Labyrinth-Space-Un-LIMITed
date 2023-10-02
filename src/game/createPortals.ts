import { ObsDispCreate, dispatchEvent, obsDispCreator, obsDispEvents, payloadProp } from '../OD'
const classNames = require('classnames')
import { createHtmlEl, exposeToWindow, switchOn, wait } from '../common/func'
import {
  findCell,
  getMazePreviousSeed,
  getPortalTitle,
  getMazeTitle,
  matchesPos,
  getReadablePortalTitle,
} from './gameUtil'
import { getMazeSize } from '../game/global/mazeSize'
import { INITIAL_MAZE_SEED } from './createMaze'
import { getContainer } from '../common/container'
import { debugLogEvent } from '../common/func'

export type TPortalSeed = string
export type TPortalWithPos = { pos: { x: number; y: number }; seed: string }

const getPortals = (enteredPortal?: TPortalWithPos): TPortalSeed[] => {
  const seed = enteredPortal?.seed
  if (seed) {
    const lastChar = seed[seed.length - 1]
    const isLetter = isNaN(parseInt(lastChar))
    const final = isLetter
      ? [1, 2, 3, 4].map((next) => `${seed}${next}`)
      : ['A', 'B', 'C', 'D'].map((next) => `${seed}${next}`)

    if (enteredPortal) {
      const matchingPosInd = getPortalsPositions().findIndex((pos) =>
        matchesPos(pos)(enteredPortal)
      )

      final[matchingPosInd] = enteredPortal.seed
    }

    return final
  } else {
    // prepend the initial seed!
    return ['A', 'B', 'C', 'D'].map((seed) => `${INITIAL_MAZE_SEED}${seed}`)
  }
}

export const getPortalsPositions = () => {
  return [
    { x: 0, y: 0 },
    { x: getMazeSize().cols - 1, y: 0 },
    { x: getMazeSize().cols - 1, y: getMazeSize().rows - 1 },
    { x: 0, y: getMazeSize().rows - 1 },
  ]
}

const getPortalsContainer = () => {
  return getContainer().querySelector('.portals-container')
}
const createPortalsContainer = () =>
  getContainer().appendChild(createHtmlEl('<div class="portals-container"/>'))

export const createPortals = obsDispCreator(
  () => {
    const state = {
      lastLevelStartSeed: '0' as TPortalSeed,
      lastEnteredPortal: null as TPortalWithPos,
      lastIsMovingBack: false,
      seed: '0' as TPortalSeed,
      mazePortals: getPortals(),
      mazePortalEls: [] as HTMLElement[],
      fromPortal: null as TPortalWithPos,
      __visitedPortalsMap: {} as Record<TPortalSeed, TPortalSeed[]>,
    }

    const renderPortals = (isMovingBack: boolean) => {
      state.mazePortalEls.forEach((el) => el.remove())
      state.mazePortalEls = state.mazePortals.map((portalSeed, ind) => {
        const isPortalToPreviousMaze =
          (portalSeed === state.seed && !isMovingBack && state.__visitedPortalsMap[portalSeed]) ||
          state.seed?.slice(0, -1) === portalSeed

        const prevArrowToRender = switchOn<string, string>({
          '0': () => '↖',
          '1': () => '↗',
          '2': () => '↘',
          '3': () => '↙',
        })(ind.toString() as any)

        const portalTitle = getPortalTitle(
          portalSeed,
          state.seed,
          isMovingBack,
          prevArrowToRender,
          true
        )

        const newEl = createHtmlEl(
          `<div class="${classNames('portal', {
            'is-to-prev': isPortalToPreviousMaze,
            a: ind === 0,
            b: ind === 1,
            c: ind === 2,
            d: ind === 3,
          })}" ${
            isPortalToPreviousMaze &&
            `title="back to ${getMazeTitle(state.seed?.slice(0, -1))}, where you came from"`
          }>${
            isPortalToPreviousMaze ? `<span class="arrow-prev">${prevArrowToRender}</span>` : ''
          }<span class="${classNames('portal-text', `p${ind}`)}">${portalTitle}</span></div>`
        )
        !getPortalsContainer() && createPortalsContainer()
        getPortalsContainer().appendChild(newEl)

        const portalPosByInd = [
          { x: 0, y: 0 },
          { x: getMazeSize().cols - 1, y: 0 },
          { x: getMazeSize().cols - 1, y: getMazeSize().rows - 1 },
          { x: 0, y: getMazeSize().rows - 1 },
        ]
        const cell = findCell(portalPosByInd[ind])

        newEl.classList.add('portal-wrapper')
        newEl.style.cssText = `
                position: absolute;
                left: ${cell.offsetLeft}px;
                top: ${cell.offsetTop}px;
                z-index: -1000;
            `

        return newEl
      })
    }

    const dispatchPortalsGenerated = (fromPortal?: TPortalWithPos, isMovingBack?: boolean) => {
      dispatchEvent('PORTALS_GENERATED', {
        payload: {
          isMovingBack,
          fromPortal,
          portals: state.mazePortals.map((pSeed, ind) => {
            return {
              pos: getPortalsPositions()[ind],
              seed: pSeed,
            }
          }) as TPortalWithPos[],
        },
      })
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        createPortalsContainer()
        renderPortals(false)
        dispatchPortalsGenerated(null)
      }),
      MAZE_FORCE_REGEN: () => {
        dispatchPortalsGenerated(state.lastEnteredPortal)
      },
      PORTAL_REQUEST_ENTER: (ev) => {
        debugLogEvent(ev)

        const portal = payloadProp<TPortalWithPos>('portal')(ev)
        state.seed = portal.seed
        const fromPortal = payloadProp<TPortalWithPos>('fromPortal')(ev)
        const enteringSeed = portal.seed

        // handle (the optional) update of `visitedPortalsMap`
        const visitedPortalsMap = ev.payload.visitedPortalsMap as typeof state.__visitedPortalsMap
        visitedPortalsMap && (state.__visitedPortalsMap = visitedPortalsMap)
        //////
        // handle (the optional) `mazePortals` param
        const mazePortals = ev.payload.mazePortals as typeof state.mazePortals
        mazePortals && (state.mazePortals = mazePortals)
        //////

        const previousPortals = state.__visitedPortalsMap[enteringSeed]
        const isMovingBack = !!previousPortals

        if (isMovingBack) {
          // remove the previous portals when moving back (so that the next
          // move for the same will be considered forward)
          delete state.__visitedPortalsMap[enteringSeed]
          state.mazePortals = previousPortals
        } else {
          // save the previous portals when moving forward
          state.__visitedPortalsMap[enteringSeed] = state.mazePortals
          // state.__enteredToPreviousPortalsMap.set(enteringSeed, state.mazePortals)
          state.mazePortals = getPortals(portal)
        }

        dispatchEvent('PORTAL_EXITED', {
          payload: {
            fromSeed: isMovingBack ? portal.seed : getMazePreviousSeed(portal.seed),
            isMovingBack,
          },
        })

        const seed = isMovingBack ? getMazePreviousSeed(portal.seed) : portal.seed
        dispatchEvent('PORTAL_ENTERED', {
          payload: {
            seed,
            portal: { pos: portal.pos, seed },
            isMovingBack,
            fromPortal: isMovingBack ? fromPortal : portal,
          },
        })
      },
      PORTAL_ENTERED: (ev) => {
        debugLogEvent(ev)

        const enteredPortal = payloadProp<TPortalWithPos>('portal')(ev)
        const isMovingBack = payloadProp<boolean>('isMovingBack')(ev)

        state.lastIsMovingBack = isMovingBack
        renderPortals(isMovingBack)

        state.lastEnteredPortal = enteredPortal
        dispatchPortalsGenerated(enteredPortal, isMovingBack)
      },
      LEVEL_STARTED: async () => {
        // save the location of the last level-started maze
        state.lastLevelStartSeed = state.seed
      },
      GAME_UPDATE: () => {
        exposeToWindow({ state })
        exposeToWindow({ renderPortals })
      },
      DPI_CHANGE: () => {
        renderPortals(state.lastIsMovingBack)
      },
    }
  },
  { id: 'mazePortals' }
)
