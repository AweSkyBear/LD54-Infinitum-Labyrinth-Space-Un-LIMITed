import { ObsDispCreate, dispatchEvent, obsDispCreator, obsDispEvents, removeObs } from '../../OD'
const classNames = require('classnames')
// @ts-ignore
import signpostSvg from '../../svg/signpost.svg'
import { Pos } from '../../common/types'
import { addSVG } from '../../htmlEl/addSVG'
import { IHTMLElWrapper } from '../../htmlEl/addHtmlEl'
import { getContainer } from '../../common/container'
import { posEquals } from '../../common/func'
import { LevelInfoBarEvents } from './createLevelInfoBar'
import { setCSSAbsPosByCell } from '../gameUtil'
import { IObserver } from 'obs-disp'

export const createSignpost = obsDispCreator<{
  pos: Pos
  signText: string
  fullText?: string
  classname?: string
  onPlayerInteraction?: () => void
  onPlayerEndInteraction?: () => void
  /** Custom logic */
  changeTextUponZoom?: { dpiLevel: number; newText: string }
}>(
  ({
    pos,
    signText,
    fullText,
    classname,
    onPlayerInteraction,
    onPlayerEndInteraction,
    changeTextUponZoom,
  }) => {
    const state = {
      obs: null as IObserver,
      pos,
      svgEl: null as IHTMLElWrapper,
      playerTouches: false,
      origSignText: signText,
      currentZoom: 1,
      editing: false,
    }

    const handlePlayerInteraction = () => {
      dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_SHOW)
      dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_TYPE_TEXT, {
        payload: { text: fullText, shouldRemain: true, editable: state.editing },
      })
    }
    const handleEndPlayerInteraction = () => {
      dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_CLEAR)
    }

    const getSignText = () => state.svgEl?.el?.querySelector<HTMLElement>('.sign-text')?.innerHTML
    const setSignText = (text: string) =>
      (state.svgEl.el.querySelector<HTMLElement>('.sign-text').innerHTML = text)

    const switchByZoomText = () => {
      if (changeTextUponZoom) {
        const currentText = getSignText()
        const isShowingOrigText = currentText === state.origSignText
        const isHighZoom =
          // DPI is when user zooms the browser (e.g. with ctrl + mouse scroll),
          // currentZoom comes from body.style.zoom - in-game controls!
          window.devicePixelRatio >= 6 || state.currentZoom >= 4 /* magick numbers :))) */

        if (isShowingOrigText && isHighZoom) {
          // switch to the when-zoomed-text
          setSignText(changeTextUponZoom.newText)
        } else if (!isShowingOrigText && !isHighZoom) {
          // switch back to orig text
          setSignText(signText)
        }
      }
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        state.obs = obs
        state.svgEl = addSVG({
          svg: (signpostSvg as string).replace('__TEXT__', signText),
          attachTo: getContainer(),
          attrs: {
            class: classNames('item signpost', { [classname]: classname }),
          },
        })

        setCSSAbsPosByCell(state.svgEl, state.pos)
      }),
      GAME_UPDATE: () => {
        if (!state.svgEl?.el) return

        switchByZoomText()
      },
      PLAYER_POS_CHANGED: (ev) => {
        ///// PLAYER TOUCHES DETECTION
        const playerPos = ev.payload.pos as Pos
        const playerIsOnSignpost = posEquals(playerPos, state.pos)
        if (!state.playerTouches && playerIsOnSignpost) {
          handlePlayerInteraction()
          onPlayerInteraction && onPlayerInteraction()
          state.playerTouches = true
        } else if (state.playerTouches && !playerIsOnSignpost) {
          handleEndPlayerInteraction()
          onPlayerEndInteraction && onPlayerEndInteraction()
          state.playerTouches = false
        }
      },
      SIGNPOST_FORCE_REMOVE: () => {
        removeObs(state.obs)
      },
      DPI_CHANGE: () => {
        setCSSAbsPosByCell(state.svgEl, state.pos)
      },
      SCREEN_ZOOM_CHANGED: (ev) => (state.currentZoom = ev.payload.zoom),
      [obsDispEvents.OBS_REMOVE]: () => {
        state.svgEl?.remove()
      },
    }
  }
)
