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
import { addSVG } from '../../htmlEl/addSVG'
import { addHtmlEl, IHTMLElWrapper } from '../../htmlEl/addHtmlEl'
import { getContainer } from '../../common/container'
import { posEquals } from '../../common/func'
import { LevelInfoBarEvents } from './createLevelInfoBar'
import { setCSSAbsPosByCell } from '../gameUtil'
import { pick } from 'ramda'

export const createInteractibleItem = (obsProps?: IObserverOptions) =>
  obsDispCreator<{
    meta?: Record<any, any>
    pos: Pos
    /** Text coming when touching it - if not passed, don't do this */
    fullText?: string
    /** Either this or `html` has to be provided */
    svg?: string
    /** Either this or `svg` has to be provided */
    html?: string
    classname?: string
    onPlayerInteraction?: ({ obs, state }: { obs: IObserver; state: Record<string, any> }) => void
    onPlayerEndInteraction?: () => void
    onPlayerMove?: ({ playerPos, itemPos }: { playerPos: Pos; itemPos: Pos }) => void
  }>(
    ({
      pos,
      fullText,
      svg,
      html,
      classname,
      onPlayerInteraction,
      onPlayerEndInteraction,
      onPlayerMove,
      meta,
    }) => {
      const state = {
        meta,
        obs: null as IObserver,
        pos,
        htmlEl: null as IHTMLElWrapper,
        playerTouches: false,
        currentZoom: 1,
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

      return {
        [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
          state.obs = obs
          state.htmlEl = svg
            ? addSVG({
                svg,
                attachTo: getContainer(),
                attrs: {
                  class: classNames('item interactible', { [classname]: classname }),
                },
              })
            : // assume `html` is provided
              addHtmlEl({
                attachTo: getContainer(),
                attrs: {
                  class: classNames('item interactible', { [classname]: classname }),
                },
              }).setHTML(html)

          setCSSAbsPosByCell(state.htmlEl, state.pos)
        }),
        GAME_UPDATE: () => {
          if (!state.htmlEl?.el) return
        },
        PLAYER_POS_CHANGED: (ev) => {
          const playerPos = ev.payload.pos as Pos

          onPlayerMove && onPlayerMove({ playerPos, itemPos: pos })

          ///// PLAYER TOUCHES DETECTION
          const playerIsOnSignpost = posEquals(playerPos, state.pos)
          if (!state.playerTouches && playerIsOnSignpost) {
            handlePlayerInteraction()
            onPlayerInteraction &&
              onPlayerInteraction({ obs: state.obs, state: pick(['pos'], state) })
            state.playerTouches = true
          } else if (state.playerTouches && !playerIsOnSignpost) {
            handleEndPlayerInteraction()
            onPlayerEndInteraction && onPlayerEndInteraction()
            state.playerTouches = false
          }
        },
        DPI_CHANGE: () => {
          setCSSAbsPosByCell(state.htmlEl, state.pos)
        },
        SCREEN_ZOOM_CHANGED: (ev) => (state.currentZoom = ev.payload.zoom),
        [obsDispEvents.OBS_REMOVE]: () => {
          state.htmlEl?.remove()
        },
      }
    },
    obsProps
  )
