import {
  ObsDispCreate,
  IObserver,
  IObserverOptions,
  dispatchEvent,
  obsDispCreator,
  obsDispEvents,
} from '../../OD'
const classNames = require('classnames')
// @ts-ignore
import { Pos } from '../../common/types'
import { addHtmlEl, IHTMLElWrapper } from '../../htmlEl/addHtmlEl'
import { getContainer } from '../../common/container'
import { addAndRemoveClass, distance, posEquals } from '../../common/func'
import { LevelInfoBarEvents } from './createLevelInfoBar'
import { findCell, getRandomMazePos, setCSSAbsPosByCell, setCSSRotationDeg } from '../gameUtil'
import { TGenerateSolutionFunc, TMazeCellPos } from '../createMaze'
import { randomDeg } from '../global/genericRandom'
import { throttle } from 'throttle-debounce'

const convertPosToMazePos = (pos: Pos) => ({ column: pos.x, row: pos.y } as TMazeCellPos)
const convertMazePosToXY = (mazePos: TMazeCellPos) => ({ x: mazePos.column, y: mazePos.row } as Pos)

export const createFoe = (obsProps?: IObserverOptions) =>
  obsDispCreator<{
    meta?: Record<any, any>
    pos: Pos
    html: string
    speedFactor?: number
    /** Text coming when touching it - if not passed, don't do this */
    fullText?: string
    classname?: string
    onPlayerInteraction?: ({ obs }: { obs: IObserver }) => void
    onPlayerEndInteraction?: () => void
    onPlayerMove?: ({ playerPos, itemPos }: { playerPos: Pos; itemPos: Pos }) => void
  }>(
    ({
      pos,
      fullText,
      html,
      classname,
      onPlayerInteraction,
      onPlayerEndInteraction,
      onPlayerMove,
      meta,
    }) => {
      const INITIAL_UPDATE_MS = 3000 /* to get faster with maze depth */
      let _handleUpdate = (ms: number) => {
        state.active && state.obs.dispatchEvent('FOE_UPDATE')
        state.active && setUpdateTimer(ms) // continue
      }
      const state = {
        obs: null as IObserver,
        active: true,
        meta,
        pos,
        playerPos: null as Pos,
        playerMazePos: { column: 0, row: 0 } as TMazeCellPos,
        htmlEl: null as IHTMLElWrapper,
        touchesPlayer: false,
        currentZoom: 1,
        getPathToPlayer: null as () => ReturnType<TGenerateSolutionFunc>,
        pathToPlayer: [] as Pos[],
        updateStepMs: INITIAL_UPDATE_MS,
        updateTimer: null as NodeJS.Timeout, // setInterval(() => _handleUpdate(INITIAL_UPDATE_MS)), // start it
        /** If player is 1 square apart */
        nearPlayer: false,
      }

      const stopUpdate = () => {
        state.active = false
        clearTimeout(state.updateTimer)
        state.updateTimer = null
      }
      const startUpdate = () => {
        state.active = true
        return setUpdateTimer(state.updateStepMs)
      }

      const setUpdateTimer = (ms: number) => {
        !state.updateTimer && (state.updateTimer = setInterval(_handleUpdate, ms) as any)
        return state.updateTimer
      }

      const handlePlayerInteraction = () => {
        fullText &&
          dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_TYPE_TEXT, {
            payload: { text: fullText, shouldRemain: true },
          })
      }
      const handleEndPlayerInteraction = () => {
        fullText && dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_CLEAR)
      }

      const updateAngle = (angle: number) => setCSSRotationDeg(state.htmlEl, angle)

      const updatePos = (pos: Pos) => {
        state.pos = pos

        const cell = findCell(state.pos)
        if (!cell) return

        setCSSAbsPosByCell(state.htmlEl, state.pos)
      }

      const matchesPlayerPos = () => posEquals(state.playerPos, state.pos)

      /** Any direction */
      const playerIs1SquareApart = () => distance(state.playerPos, state.pos) <= 1

      const updatePlayerInteractionFlags = () => {
        if (!state.obs?.handleEvent) return

        const playerIsOnSamePos = matchesPlayerPos()
        if (!state.touchesPlayer && playerIsOnSamePos) {
          handlePlayerInteraction()
          onPlayerInteraction && onPlayerInteraction({ obs: state.obs })
          state.touchesPlayer = true
        } else if (state.touchesPlayer && !playerIsOnSamePos) {
          handleEndPlayerInteraction()
          onPlayerEndInteraction && onPlayerEndInteraction()
          state.touchesPlayer = false
        }

        if (!playerIsOnSamePos) {
          const pathToPlayer =
            state.getPathToPlayer && state.getPathToPlayer().map(convertMazePosToXY)
          pathToPlayer && (state.pathToPlayer = pathToPlayer)
        }

        state.nearPlayer = playerIs1SquareApart()

        state.touchesPlayer && handlePlayerHitByFoe()
      }

      const handleHitByPlayer = () => {
        if (!state.obs?.handleEvent) return

        dispatchEvent('FOE_HIT_BY_PLAYER')

        addAndRemoveClass(state.htmlEl.el, 'foe-hit', 1000)

        updatePos(getRandomMazePos())
        updateAngle(randomDeg())
      }

      // FIX - throttle this since we can get Maximum Call Stack error
      const handlePlayerHitByFoe = throttle(
        1000,
        () => {
          dispatchEvent('PLAYER_HIT_BY_FOE')
        },
        { noTrailing: true }
      )

      return {
        [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
          state.obs = obs

          state.htmlEl = addHtmlEl({
            attachTo: getContainer(),
            attrs: {
              class: classNames('foe', { [classname]: classname }),
            },
          }).setHTML(html)

          setCSSAbsPosByCell(state.htmlEl, state.pos)

          startUpdate()
        }),
        FOE_UPDATE_STOP: stopUpdate,
        FOE_UPDATE_START: startUpdate,
        GAME_UPDATE: () => updatePlayerInteractionFlags(),
        GAME_PAUSE: stopUpdate,
        GAME_RESUME: startUpdate,
        FOE_UPDATE: () => {
          if (!state.htmlEl?.el || !state.obs?.handleEvent) return

          updatePlayerInteractionFlags()

          // const pathToPlayer =
          //   state.getPathToPlayer && state.getPathToPlayer().map(convertMazePosToXY)

          if (state.pathToPlayer) {
            const currentIndOnPath = state.pathToPlayer.findIndex(posEquals(state.pos))
            const nextIndOnPath = currentIndOnPath + 1

            const nextPos = state.pathToPlayer[nextIndOnPath]
            nextPos && updatePos(nextPos)
          }
        },
        MAZE_GENERATED_DELAYED: (ev) => {
          const generateSolution = ev.payload.generateSolution as TGenerateSolutionFunc
          state.getPathToPlayer = () =>
            generateSolution(convertPosToMazePos(state.pos), state.playerMazePos)
        },
        PLAYER_ACTION_ATTACK: (ev) => state.nearPlayer && handleHitByPlayer(),
        PLAYER_POS_CHANGED: (ev) => {
          updatePlayerInteractionFlags()

          // note: below code may not be needed
          const playerPos = ev.payload.pos as Pos
          state.playerPos = playerPos
          state.playerMazePos = { row: playerPos.y, column: playerPos.x }

          onPlayerMove && onPlayerMove({ playerPos, itemPos: pos })
        },
        DPI_CHANGE: () => {
          setCSSAbsPosByCell(state.htmlEl, state.pos)
        },
        [LevelInfoBarEvents.LEVEL_INFO_BAR_SET_TEXT]: stopUpdate,
        [LevelInfoBarEvents.LEVEL_INFO_BAR_TYPE_TEXT]: stopUpdate,
        [LevelInfoBarEvents.LEVEL_INFO_BAR_SHOW]: stopUpdate,
        [LevelInfoBarEvents.LEVEL_INFO_BAR_CLEAR]: startUpdate,
        DOCUMENT_VISIBILITY_CHANGED_TO_INVISIBLE: stopUpdate,
        DOCUMENT_VISIBILITY_CHANGED_TO_VISIBLE: startUpdate,
        SCREEN_ZOOM_CHANGED: (ev) => (state.currentZoom = ev.payload.zoom),
        [obsDispEvents.OBS_REMOVE]: () => {
          state.htmlEl?.remove()
          stopUpdate()
          _handleUpdate = null
        },
      }
    },
    obsProps
  )
