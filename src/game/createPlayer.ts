import {
  ObsDispCreate,
  IObserver,
  dispatchEvent,
  obsDispCreator,
  obsDispEvents,
  payloadProp,
} from '../OD'
import { addAndRemoveClass, createHtmlEl } from '../common/func'
import { constrainPosToMazeSize, getMazeSize } from '../game/global/mazeSize'
import { findCell, getRandomMazePos, matchesPos, setCSSAbsPosByCell } from './gameUtil'
import { TMazeJson } from './createMaze'
import { TPortalWithPos } from './createPortals'
import { getContainer } from '../common/container'
import { createPlayerSpeachBubble } from './html/player/createPlayerSpeachBubble'
import { Pos } from '../common/types'
import { throttle } from 'throttle-debounce'
import { getResizeDims } from '../freeRoam/createMazeConfigurer'

export const createPlayer = obsDispCreator(
  () => {
    const state = {
      obs: null as IObserver,
      speachBubbleObs: null as IObserver,
      inputEnabled: true,
      playerHit: false,
      playerEl: null as HTMLElement,
      pos: constrainPosToMazeSize({ x: 4, y: 4 }),
      maze: null as TMazeJson,
      hasMovedAfterMazeGenerated: false,
      portals: [] as TPortalWithPos[],
      /** When coming from a portal (everything but the initial maze) */
      fromPortal: null as TPortalWithPos,
    }

    const createPlayer = () => {
      state.playerEl?.remove()
      /// recreating the speach bubble

      state.playerEl = createHtmlEl('<div class="player" />')
      getContainer().appendChild(state.playerEl)

      state.playerEl.style.cssText = `position: absolute; z-index: -100`

      // setTimeout(() => createSpeachBubble())
    }
    const randomizePos = () => (state.pos = getRandomMazePos())

    const updatePlayerPos = (posOverride?: Pos) => {
      posOverride && (state.pos = posOverride)

      const cell = findCell(state.pos)
      if (!cell) return

      setCSSAbsPosByCell(state.playerEl, state.pos)

      dispatchEvent('PLAYER_POS_CHANGED', { payload: { pos: { ...state.pos } } })
    }

    const throttleInputHandler = (inputUpdateCallback: () => void) =>
      throttle(1000 / 7 /* 8 times per second */, inputUpdateCallback)

    // const getMazeCellAtPos = (x: number, y: number) => path([y, x], state.maze)

    const moveUp = throttleInputHandler(() => {
      const { x, y } = state.pos

      if (y - 1 >= 0 && !state.maze[y - 1][x].down) {
        state.pos.y -= 1
        dispatchEvent('PLAYER_REPOSITION')
      }
    })

    const moveDown = throttleInputHandler(() => {
      const { x, y } = state.pos

      if (y + 1 <= getMazeSize().rows - 1 && !state.maze[y + 1][x].up) {
        state.pos.y += 1
        dispatchEvent('PLAYER_REPOSITION')
      }
    })

    const moveLeft = throttleInputHandler(() => {
      const { x, y } = state.pos

      if (x - 1 >= 0 && !state.maze[y][x - 1].right) {
        state.pos.x -= 1
        dispatchEvent('PLAYER_REPOSITION')
      }
    })

    const moveRight = throttleInputHandler(() => {
      const { x, y } = state.pos

      if (x + 1 <= getMazeSize().cols - 1 && !state.maze[y][x + 1].left) {
        state.pos.x += 1
        dispatchEvent('PLAYER_REPOSITION')
      }
    })

    const handleSpacePress = throttle(500, () => dispatchEvent('PLAYER_ACTION_KEY'), {
      noTrailing: true,
    })

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        state.obs = obs
        createPlayerSpeachBubble()
      }),
      GAME_START: () => {
        createPlayer()

        dispatchEvent('PLAYER_REPOSITION')
      },
      MAZE_GENERATED: (ev) => {
        state.maze = payloadProp<TMazeJson>('mazeJSON')(ev)
        createPlayer()
        updatePlayerPos()

        setTimeout(() => (state.hasMovedAfterMazeGenerated = false))
      },
      INPUT_DISABLE: ({ payload }) => {
        state.inputEnabled = false
      },
      INPUT_ENABLE: ({ payload }) => {
        state.inputEnabled = true
      },
      INPUT_UPDATE: ({ payload }) => {
        if (!state.inputEnabled) return

        const { up, down, left, right } = payload
        if (up && !down) moveUp()
        if (left && !right) moveLeft()

        if (up && left) return

        if (down && !up) moveDown()
        if (right && !left) moveRight()
      },
      INPUT_ONCE: ({ payload }) => {
        if (!state.inputEnabled) return

        const { spaceOnes } = payload
        if (spaceOnes) handleSpacePress()
      },
      MAZE_RESIZE: (ev) => {
        const dims = getResizeDims(ev)
        state.pos.x = Math.min(state.pos.x, dims.width - 1) // -2 for safety if we are currently moving
        state.pos.y = Math.min(state.pos.y, dims.height - 1) // -2 for safety if we are currently moving
      },
      PORTALS_GENERATED: (ev) => {
        const portals = payloadProp<TPortalWithPos[]>('portals')(ev)
        state.fromPortal = payloadProp<TPortalWithPos>('fromPortal')(ev)
        state.portals = portals
      },
      PLAYER_REPOSITION: () => updatePlayerPos(),
      PLAYER_POS_CHANGED: () => {
        state.hasMovedAfterMazeGenerated = true
      },
      PLAYER_ACTION_KEY: () => {
        //// Enter portal scenario
        const portalForCurrentPos = state.portals.find(matchesPos(state.pos))

        if (portalForCurrentPos) {
          const isMovingBack =
            state.fromPortal &&
            portalForCurrentPos &&
            state.fromPortal.seed === portalForCurrentPos.seed

          portalForCurrentPos &&
            dispatchEvent('PORTAL_REQUEST_ENTER', {
              payload: {
                portalSeeds: state.portals.map((p) => p.seed), // ?
                portal: portalForCurrentPos,
                fromPortal: state.fromPortal, // ?
                isMovingBack,
              },
            })
        }
        //// <-
        else {
          // shoots
          dispatchEvent('PLAYER_ACTION_ATTACK')
        }
      },
      PLAYER_HIT_BY_FOE: () => {
        addAndRemoveClass(state.playerEl, 'player-hit', 1000)
        updatePlayerPos(getRandomMazePos())
      },
      DPI_CHANGE: () => {
        updatePlayerPos()
      },
      [obsDispEvents.OBS_REMOVE]: () => {
        state.playerEl.remove()
      },
    }
  },
  { id: 'player' }
)
