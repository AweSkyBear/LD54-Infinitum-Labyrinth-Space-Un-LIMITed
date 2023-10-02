import { IObserver } from 'obs-disp'
import { dispatchEvent, ObsDispCreate, obsDispCreator, obsDispEvents, removeObs } from '../OD'
import { TPortalSeed } from '../game/createPortals'
import { Pos } from '../common/types'
import { getCurrentSeed } from '../game/global/currentSeed'
import { createSignpost } from '../game/html/createSignpost'
import { isEdgePos, stringifyPos } from '../game/gameUtil'
import { exposeToWindow, wait } from '../common/func'
import { clone, compose, equals, omit } from 'ramda'
import { LevelInfoBarEvents } from '../game/html/createLevelInfoBar'
import { IMazeLoadConfig } from './IMazeLoadConfig'

export interface ISignpostProps {
  pos: Pos
  signText: string
  fullText: string
  onPlayerInteraction?: () => void
  onPlayerEndInteraction?: () => void
}

const DEFAULT_SIGN_TEXT = '(you can edit this text here)'

const cleansePropsForStoring = (signpostProps: ISignpostProps) =>
  compose((props: ISignpostProps) => {
    props.fullText === DEFAULT_SIGN_TEXT && (props.fullText = '')
    return props
  }, omit(['onPlayerInteraction', 'onPlayerEndInteraction']))(signpostProps)

export type TAllSignsMap = Record<TPortalSeed, Record<string, ISignpostProps>>

export let getAllSignsMap = null as () => TAllSignsMap

export const createUserSignCreator = obsDispCreator<{ allSignsMap: TAllSignsMap }>(
  ({ allSignsMap }) => {
    const state = {
      obs: null as IObserver,
      playerPos: null as Pos,
      /** PortalSeed TO (Map of (Pos TO IObserver)) */
      allSignsMap: allSignsMap || ({} as TAllSignsMap),
      visibleSignsMap: {} as Record<string, IObserver>,
      textWasEdited: false,
      editedSignProps: null as ISignpostProps,
      editedSignObs: null as IObserver,
    }

    const getCurrentMap = () => {
      state.allSignsMap[getCurrentSeed()] = state.allSignsMap[getCurrentSeed()] || {}
      return state.allSignsMap[getCurrentSeed()]
    }

    const getSignAt = (pos: Pos) => getCurrentMap()[stringifyPos(pos)]

    const updateSignAt = (signpostProps: ISignpostProps) =>
      (getCurrentMap()[stringifyPos(signpostProps.pos)] = cleansePropsForStoring(signpostProps))

    const addSignpost = (signpostProps: ISignpostProps, onlyCreateObs = false) => {
      if (!onlyCreateObs) {
        state.allSignsMap[getCurrentSeed()] = state.allSignsMap[getCurrentSeed()] || {}
        state.allSignsMap[getCurrentSeed()][stringifyPos(state.playerPos)] =
          cleansePropsForStoring(signpostProps)
      }

      const newObs = (state.visibleSignsMap[stringifyPos(signpostProps.pos)] =
        createSignpost(signpostProps))
      /// ugly monkey-patch fix:
      ;(newObs as any).pos = signpostProps.pos
      //////
      return newObs
    }
    const removeSignpostAtPlayerPos = () => {
      // dispatchEvent('SIGNPOST_REMOVE_IF_AT_PLAYER_POS')
      delete state.allSignsMap[getCurrentSeed()][stringifyPos(state.playerPos)]
      dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_CLEAR)
      removeVisibleSignAtPlayerPos()
    }
    const removeVisibleSignAtPlayerPos = () => {
      const obs = state.visibleSignsMap[stringifyPos(state.playerPos)]
      removeObs(obs)
      delete state.visibleSignsMap[stringifyPos(state.playerPos)]
    }
    const replaceVsibleSign = (obs: IObserver, props: ISignpostProps) => {
      removeObs(Object.values(state.visibleSignsMap).find(equals(obs)))

      const updatedSign = addSignpost({ ...props, ...omit(['pos'])(state.editedSignProps) }, true)
      state.visibleSignsMap[stringifyPos(props.pos)] = updatedSign
    }
    const removeVsibleSigns = () => {
      Object.values(state.visibleSignsMap).forEach((o) => removeObs(o))
      state.visibleSignsMap = {}
      dispatchEvent('SIGNPOST_FORCE_REMOVE')
    }

    const getSignAtPos = () => getCurrentMap()[stringifyPos(state.playerPos)]

    const showSignpostsForMaze = () => {
      // remove the old ones
      removeVsibleSigns()

      // and create the ones for this maze which were whenever created! // signposts which are for this maze
      const m = getCurrentMap()
      Object.values(m).map((props) => {
        state.visibleSignsMap[stringifyPos(props.pos)] = addSignpost(props)
      })
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        state.obs = obs
      }),
      MAZE_LOAD: (ev) => {
        const config = ev.payload as IMazeLoadConfig
        state.allSignsMap = config.notes
      },
      MAZE_LOADED: showSignpostsForMaze,
      PLAYER_ACTION_KEY: () => {
        // note: if onto an existing signpost -> REMOVE IT
        const existingSign = getSignAtPos()
        if (!existingSign && !isEdgePos(state.playerPos)) {
          // const props =

          const props: ISignpostProps = {
            pos: { ...state.playerPos },
            signText: '...',
            fullText: `(you can edit this text here)`,
            onPlayerInteraction: () => {
              dispatchEvent('SIGNPOST_TOUCHED', {
                target: state.obs,
                payload: { pos: { ...state.playerPos }, signObs: newSignObs },
              })
            },
            onPlayerEndInteraction: () => {
              if (!state.textWasEdited) return
              state.textWasEdited = false

              dispatchEvent('SIGNPOST_EDIT_END', { target: [newSignObs, state.obs] })

              replaceVsibleSign(newSignObs, {
                ...props,
                fullText: state.editedSignProps?.fullText,
              })
            },
          }

          const newSignObs = addSignpost(props)
          dispatchEvent('SIGNPOST_TOUCHED', {
            target: state.obs,
            payload: { pos: { ...state.playerPos }, signObs: newSignObs },
          })

          wait().then(() => dispatchEvent('SIGNPOST_EDIT_START'))
        } else {
          removeSignpostAtPlayerPos()
        }
      },
      PLAYER_POS_CHANGED: (ev) => {
        state.playerPos = ev.payload.pos as Pos
      },

      PORTAL_ENTERED_DEFERRED: showSignpostsForMaze,
      SIGNPOST_TOUCHED: (ev) => {
        const signObs = ev.payload.signObs
        const pos = (signObs as any).pos // QCK dirty fix
        const existingProps = getSignAt(pos)
        state.editedSignProps = existingProps // Object.values(state.visibleSigns).find(obs => obs === getSignAt(pos)))
        state.editedSignObs = signObs
      },
      SIGNPOST_EDIT_TEXT: (ev) => {
        state.textWasEdited = true
        state.editedSignProps.pos = state.playerPos // qck fix
        state.editedSignProps.fullText = ev.payload.text
        updateSignAt(state.editedSignProps)
      },
      SIGNPOST_EDIT_END: () => {
        state.textWasEdited = false
      },
      GAME_UPDATE: () => {
        getAllSignsMap = () => clone(state.allSignsMap) // expose it
        exposeToWindow({ state, getCurrentMap, getCurrentSeed, getAllSignsMap })
      },
      [obsDispEvents.OBS_REMOVE]: () => {
        removeVsibleSigns()
        state.allSignsMap = {}
        getAllSignsMap = () => clone(state.allSignsMap)
      },
    }
  },
  { id: 'create-sign-creator' }
)
