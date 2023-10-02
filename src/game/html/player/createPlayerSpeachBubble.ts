import { ObsDispCreate, obsDispCreator, obsDispEvents } from '../../../OD'
// @ts-ignore
import speachBubbleSvg from '../../../svg/dialogue-self.svg'
import { IHTMLElWrapper, addHtmlEl } from '../../../htmlEl/addHtmlEl'
import { getContainer } from '../../../common/container'
import { setCSSPosFromPlayer } from '../setCSSPosFromPlayer'

export const createPlayerSpeachBubble = obsDispCreator(
  () => {
    const state = {
      obs: null as any,
      el: null as IHTMLElWrapper,
    }

    const setPosFromPlayer = () => setCSSPosFromPlayer(state.el, { x: 0, y: -35 })
    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        state.obs = obs
        state.el = addHtmlEl({
          attrs: { class: 'player-speach-bubble' },
          attachTo: getContainer(),
        }).setHTML(speachBubbleSvg)

        setPosFromPlayer()

        setTimeout(() => state.obs.dispatchEvent('PLAYER_SPEACH_BUBBLE_HIDE'))
      }),
      PLAYER_SPEACH_BUBBLE_SHOW: () => {
        state.el.el.style.opacity = '1'
        state.el.el.querySelector('.speach-bubble').classList.add('loading')
      },
      PLAYER_SPEACH_BUBBLE_HIDE: () => {
        state.el.el.style.opacity = '0'
        state.el.el.querySelector('svg').classList.remove('loading')
      },
      PLAYER_SPEACH_BUBBLE_SHOW_LOAD: () => {
        state.el.el.querySelector('.speach-bubble').classList.add('loading')
      },
      PLAYER_SPEACH_BUBBLE_SHOW_STOP_LOAD: () => {
        state.el.el.querySelector('svg').classList.remove('loading')
      },
      PLAYER_REPOSITION: setPosFromPlayer,
      DPI_CHANGE: setPosFromPlayer,
      [obsDispEvents.OBS_REMOVE]: () => {
        state.el?.remove()
      },
    }
  },
  { id: 'player-speach-bubble' }
)
