import { getMazeSize } from '../game/global/mazeSize'
import {
  getWallColors,
  setAllColorsFromConfig,
  setCellWallColor,
} from '../game/global/cellWallColors'
import { getSeedSuffix } from '../game/global/seedSuffix'
import { addHtmlEl, IHTMLElWrapper } from '../htmlEl/addHtmlEl'
import { dispatchEvent, ObsDispCreate, obsDispCreator, obsDispEvents } from '../OD'

export const createMazeConfigureModal = obsDispCreator(() => {
  const state = {
    reconfigureModalEl: null as IHTMLElWrapper,
  }

  const setModalShown = (shown: boolean) => {
    state.reconfigureModalEl &&
      (state.reconfigureModalEl.el.querySelector<HTMLElement>('.modal').style.display = shown
        ? 'flex'
        : 'none')
  }

  const updateModalInputs = (htmlEl: IHTMLElWrapper) => {
    // set existing values:
    htmlEl.el.querySelector<HTMLInputElement>('.maze-title').value = getSeedSuffix()
    htmlEl.el.querySelector<HTMLInputElement>('.maze-size').value = `${getMazeSize().rows}`
    htmlEl.el.querySelector<HTMLInputElement>('.maze-width').value = `${getMazeSize().cols}`
    htmlEl.el.querySelector<HTMLInputElement>('.maze-height').value = `${getMazeSize().rows}`
    setAllColorsFromConfig(getWallColors())

    htmlEl.el.querySelector<HTMLInputElement>('.c1').value = getWallColors().c1
    htmlEl.el.querySelector<HTMLInputElement>('.c2').value = getWallColors().c2
    htmlEl.el.querySelector<HTMLInputElement>('.c3').value = getWallColors().c3
    htmlEl.el.querySelector<HTMLInputElement>('.c4').value = getWallColors().c4
  }

  return {
    [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
    MAZE_RECONFIGRE_SHOW_MODAL: () => {
      state.reconfigureModalEl =
        state.reconfigureModalEl ||
        addHtmlEl({})
          .setHTML(
            `
            <div class="modal maze-reconfigure">
                <div>
                    <label>Maze Title:</label>
                    <input class="maze-title mb-0.5" type="text" placeholder="your maze title!" value="${getSeedSuffix()}"/>
                    <sup class="ta-c d-b">* reseeds the infinite maze</sup>
                </div>

                <div>
                    <label class="label-maze-size">Maze Size: 10</label>
                    <input class="maze-size" type="range" min="3" max="35" value="10" step="1" />
                </div>
                
                <div>
                    <label>Maze Width/Height:</label>
                    <input class="maze-width" type="number" min="3" max="35" value="10" />
                    <input class="maze-height" type="number" min="3" max="35" value="10" />
                </div>

                <div>
                    <label>Wall Colors:</label>
                    <input class="c1" type="color" value="#3e68ff" />
                    <input class="c2" type="color" value="#3e68ff" />
                    <input class="c3" type="color" value="#3e68ff" />
                    <input class="c4" type="color" value="#3e68ff" />
                </div>

                <button class="ok">OK</button>
            </div>
        `
          )
          .then((res) => {
            updateModalInputs(res)

            // handlers
            res.el.querySelector<HTMLElement>('.ok').addEventListener('click', () => {
              dispatchEvent('MAZE_RECONFIGRE_HIDE_MODAL')
              dispatchEvent('MAZE_RECONFIGURE', {
                payload: {
                  mazeTitle: res.el.querySelector<HTMLInputElement>('.maze-title').value.trim(),
                  size: parseInt(res.el.querySelector<HTMLInputElement>('.maze-size').value),
                  width: parseInt(res.el.querySelector<HTMLInputElement>('.maze-width').value),
                  height: parseInt(res.el.querySelector<HTMLInputElement>('.maze-height').value),
                },
              })

              dispatchEvent('MAZE_FORCE_REGEN')
            })

            res.el.querySelector<HTMLInputElement>('.maze-size').addEventListener('input', (ev) => {
              const newSize = (ev.target as any).value as string
              res.el.querySelector('.label-maze-size').innerHTML = `Maze size: ${newSize}`

              // update W and H controls to match it
              res.el.querySelector<HTMLInputElement>('.maze-width').value = newSize
              res.el.querySelector<HTMLInputElement>('.maze-height').value = newSize
            })

            const handleColorUpd = (className: string) => (ev: any) => {
              const colorHexString = (ev.target as any).value as string
              dispatchEvent('MAZE_RECONFIGURE_SET_COLOR', {
                payload: { colorKey: className, colorHex: colorHexString },
              })
            }

            res.el.querySelector<HTMLElement>('.c1').addEventListener('input', handleColorUpd('c1'))
            res.el.querySelector<HTMLElement>('.c2').addEventListener('input', handleColorUpd('c2'))
            res.el.querySelector<HTMLElement>('.c3').addEventListener('input', handleColorUpd('c3'))
            res.el.querySelector<HTMLElement>('.c4').addEventListener('input', handleColorUpd('c4'))
          })

      state.reconfigureModalEl && updateModalInputs(state.reconfigureModalEl)

      setModalShown(true)
      dispatchEvent('INPUT_DISABLE')
    },
    MAZE_RECONFIGRE_HIDE_MODAL: () => {
      setModalShown(false)
      dispatchEvent('INPUT_ENABLE')
    },
    [obsDispEvents.OBS_REMOVE]: () => {
      state.reconfigureModalEl?.remove()
    },
  }
})
