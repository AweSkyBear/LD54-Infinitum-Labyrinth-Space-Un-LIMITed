import { getMazeSize } from '../game/global/mazeSize'
import { getWallColors } from '../game/global/cellWallColors'
import { getSeedSuffix } from '../game/global/seedSuffix'
import { addHtmlEl, IHTMLElWrapper } from '../htmlEl/addHtmlEl'
import { dispatchEvent, ObsDispCreate, obsDispCreator, obsDispEvents } from '../OD'
import { getMazeUrlParam } from './createMazeURLLoader'
import { getAllSignsMap } from './createUserSignCreator'
import { IMazeLoadConfig } from './IMazeLoadConfig'
import { isCurrentlyOptimized } from '../common/createMazePerfOptimizer'

export const createMazeShareModal = obsDispCreator(
  () => {
    const state = {
      modalEl: null as IHTMLElWrapper,
    }

    const setModalShown = (shown: boolean) => {
      state.modalEl &&
        (state.modalEl.el.querySelector<HTMLElement>('.modal').style.display = shown
          ? 'flex'
          : 'none')
    }

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
      MAZE_SHARE_SHOW_MODAL: () => {
        state.modalEl =
          state.modalEl ||
          addHtmlEl({})
            .setHTML(
              `
            <div class="modal maze-share">
                <div>
                    <label>Copy and send this URL:</label>
                    <textarea class="maze-url" readonly></textarea>
                </div>
                
                <button class="copy-url-and-close">Cppy and Close</button>
            </div>`
            )
            .then((res) => {
              const mazeUrlEl = res.el.querySelector<HTMLTextAreaElement>('.maze-url')
              mazeUrlEl.value = generateMazeUrl()

              res.el
                .querySelector<HTMLElement>('.copy-url-and-close')
                .addEventListener('click', () => {
                  copyInputValueToClipboard(mazeUrlEl)
                  dispatchEvent('MAZE_SHARE_HIDE_MODAL')
                })
            })

        setModalShown(true)
        dispatchEvent('INPUT_DISABLE')
      },
      MAZE_SHARE_HIDE_MODAL: () => {
        setModalShown(false)
        dispatchEvent('INPUT_ENABLE')
      },
      [obsDispEvents.OBS_REMOVE]: () => {
        state.modalEl?.remove()
      },
    }
  },
  { id: 'maze-share-modal' }
)

const copyInputValueToClipboard = (input: HTMLTextAreaElement) => {
  input.select()
  input.setSelectionRange(0, 99999)

  // Copy the text inside the text field
  navigator.clipboard.writeText(input.value)
}

const generateMazeUrl = () => {
  const config: IMazeLoadConfig = {
    size: { w: getMazeSize().cols, h: getMazeSize().cols },
    seedSuffix: getSeedSuffix(),
    walls: getWallColors(),
    notes: getAllSignsMap(),
    fat: !isCurrentlyOptimized(),
  }

  console.log(
    `config`,
    config,
    `stringified`,
    JSON.stringify(config),
    encodeURIComponent(JSON.stringify(config))
  )

  const mazeHashParam = encodeURIComponent(JSON.stringify(config))
  return `${window.location.origin}/#maze=${mazeHashParam}`
}
