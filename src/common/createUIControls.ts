import { dispatchEvent, ObsDispCreate, obsDispCreator, obsDispEvents } from '../OD'
import { addHtmlEl, IHTMLElWrapper } from '../htmlEl/addHtmlEl'
import { getContainer } from './container'
import { attachEventOnElClick, toggleFullScreen, wait } from './func'
import { getCurrentTopos, TTopos } from '../game/global/currentTopos'
import { toggleMazeOptimized } from './createMazePerfOptimizer'

const toggleActiveOnClick = (el?: HTMLElement) =>
  el?.addEventListener('click', () => {
    el.classList.toggle('active')
  })

export const createUIControls = obsDispCreator(() => {
  const state = {
    controlsEl: null as IHTMLElWrapper,
  }

  const getExitBtn = () => state.controlsEl.el.querySelector<HTMLElement>('.exit')

  return {
    [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
    GAME_START: () => {
      state.controlsEl = addHtmlEl({ prependTo: getContainer() })
        .setHTML(controlsHTML(getCurrentTopos()))
        .then((res) => {
          attachEventOnElClick(
            res.el.querySelector('.music-next-track'),
            'MUSIC_REQUEST_NEXT_TRACK'
          )
          attachEventOnElClick(res.el.querySelector('.toggle-music'), 'MUSIC_TOGGLE')
          toggleActiveOnClick(res.el.querySelector('.toggle-music'))

          attachEventOnElClick(res.el.querySelector('.toggle-sfx'), 'SOUND_TOGGLE')
          toggleActiveOnClick(res.el.querySelector('.toggle-sfx'))

          res.el.querySelector('.get-hint') &&
            attachEventOnElClick(res.el.querySelector('.get-hint'), 'HINT_REQUEST_GET')

          res.el.querySelector('.toggle-maze-settings') &&
            attachEventOnElClick(
              res.el.querySelector('.toggle-maze-settings'),
              'MAZE_RECONFIGRE_SHOW_MODAL'
            )

          res.el.querySelector('.toggle-maze-share') &&
            attachEventOnElClick(
              res.el.querySelector('.toggle-maze-share'),
              'MAZE_SHARE_SHOW_MODAL'
            )

          attachEventOnElClick(res.el.querySelector('.toggle-lights'), 'LIGHTS_TOGGLE')

          attachEventOnElClick(res.el.querySelector('.zoom-in'), 'SCREEN_ZOOM_IN')
          attachEventOnElClick(res.el.querySelector('.zoom-out'), 'SCREEN_ZOOM_OUT')
          attachEventOnElClick(res.el.querySelector('.zoom-reset'), 'SCREEN_ZOOM_RESET')

          attachEventOnElClick(res.el.querySelector('.exit'), 'GAME_REQUEST_EXIT')

          res.el.querySelector('.toggle-full-screen').addEventListener('click', toggleFullScreen)

          attachEventOnElClick(res.el.querySelector('.toggle-help-screen'), 'GAME_REQUEST_HELP')

          attachEventOnElClick(res.el.querySelector('.toggle-game-pause'), 'GAME_PAUSE')

          res.el.querySelector('.toggle-optimized')?.addEventListener('click', toggleMazeOptimized)
        })
    },
    GAME_REQUEST_EXIT: () => {
      const confirmExit = getExitBtn().classList.contains('active')
      if (!confirmExit) {
        getExitBtn().classList.add('active')
        getExitBtn().title = 'Click again to confirm'
        wait(2000).then(() => {
          getExitBtn().classList.remove('active')
          getExitBtn().title = `Exit ${getCurrentTopos()}`
        })
      } else {
        dispatchEvent('GAME_EXIT')
      }
    },
    [obsDispEvents.OBS_REMOVE]: () => {
      state.controlsEl?.remove()
    },
  }
})

const controlsHTML = (topos: TTopos) => {
  return `
    <div class="controls"> 
      <div class="controls-top">
        <button class="toggle-game-pause" title="Pause/resume">||</button>
        <button class="toggle-help-screen hidden" title="Show Help Screen">F1</button>
        <button class="toggle-full-screen" title="Toggle full screen">🔲</button>
        <button class="exit" title="Exit game">⛌</button>
      </div>

      <div class="controls-main">
          ${
            topos === 'the-game'
              ? `
                  <div class="main">
                      <button class="music-next-track" title="Next music track">♫⏩</button>
                      <button class="toggle-music active" title="Toggle music on or off">♫</button>
                      <button class="toggle-sfx active" title="Toggle sound effects on or off">♫ Fx</button>
                      <button class="get-hint" title="Click to get a hint (when having enough fruit)">💡</button>
                      <button class="toggle-lights" title="Toggle lights on or off (off means dark maze)">☀</button>
                      <button class="zoom-in" title="Zoom in">🔎+</button>
                      <button class="zoom-out" title="Zoom out">🔎-</button>
                      <button class="zoom-reset" title="Zoom reset">🔎=</button>
                      <button class="toggle-optimized" title="Make the maze FAT or NOT... but fat is slow :(">FAT</button>
                  </div>
              `
              : `
                <div class="main">
                    <button class="music-next-track" title="Next music track">♫⏩</button>
                    <button class="toggle-music active" title="Toggle music on or off">♫</button>
                    <button class="toggle-sfx active" title="Toggle sound effects on or off">♫ Fx</button>
                    <button class="toggle-maze-settings" title="Click to modify the maze">⚙️</button>
                    <button class="toggle-maze-share" title="Click to share this maze">🎁</button>
                    <button class="toggle-lights" title="Toggle lights on or off (off means dark maze)">☀</button>
                    <button class="zoom-in" title="Zoom in">🔎+</button>
                    <button class="zoom-out" title="Zoom out">🔎-</button>
                    <button class="zoom-reset" title="Zoom reset">🔎=</button>
                    <button class="toggle-optimized" title="Make the maze FAT or NOT... but fat is slow :(">FAT</button>
                </div>
              `
          }
      </div> 
    </div> 
    `
}
