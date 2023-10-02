import { ObsDispCreate, obsDispCreator, obsDispEvents } from '../../../OD'
import { getContainer } from '../../../common/container'
import { wait } from '../../../common/func'
import { addHtmlEl, IHTMLElWrapper } from '../../../htmlEl/addHtmlEl'
import { setCSSPosFromPlayer } from '../setCSSPosFromPlayer'

export const createAttackVisuals = obsDispCreator(
  () => {
    const state = {
      attackEl: null as IHTMLElWrapper,
    }

    const createAttackEl = () => {
      state.attackEl = addHtmlEl({
        attrs: { class: 'player-attack' },
        attachTo: getContainer(),
      })
        .setHTML(
          `
            <div class="dir down"></div>
            <div class="dir up"></div>
            <div class="dir right"></div>
            <div class="dir left"></div>
        `
        )
        .then((el) => {
          setCSSPosFromPlayer(el)
          wait(300).then(removeAttackEl)
        })

      return state.attackEl
    }

    const removeAttackEl = () => {
      state.attackEl?.remove()
      state.attackEl = null
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
      PLAYER_ACTION_ATTACK: () => {
        createAttackEl()
      },
      [obsDispEvents.OBS_REMOVE]: removeAttackEl,
    }
  },
  { id: 'player-attack-visuals' }
)
