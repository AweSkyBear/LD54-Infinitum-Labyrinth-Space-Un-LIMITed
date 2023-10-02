import { dispatchEvent, ObsDispCreate, obsDispCreator, obsDispEvents } from '../OD'
import { getMazeEl, getTopMazeEl } from '../game/global/getMazeEl'
import { basedOnPartial, createHtmlEl } from './func'
import { addHtmlEl, IHTMLElWrapper } from '../htmlEl/addHtmlEl'

export const createPause = obsDispCreator(() => {
  const togglePause =
    (ev: KeyboardEvent, onlyIfPaused = true) =>
    () => {
      if ((ev.target as any)?.tagName?.toLowerCase() === 'input') return

      ev?.preventDefault()

      if (onlyIfPaused && !state.isPaused) return

      dispatchEvent(state.isPaused ? 'GAME_RESUME' : 'GAME_PAUSE')
    }

  const handleKeys = (ev: KeyboardEvent) => {
    return basedOnPartial<string>({
      Escape: togglePause(ev, false),
      p: togglePause(ev, false),
      F5: togglePause(ev, false),
      F4: togglePause(ev, false),
    })(ev.key)
  }

  const state = {
    isPaused: false,
    pausedTextEl: null as IHTMLElWrapper,
    keydownHandler: (ev: KeyboardEvent) => {
      if (ev.repeat) return

      handleKeys(ev)
    },
  }

  return {
    [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
      document.addEventListener('keydown', state.keydownHandler)
    }),
    GAME_PAUSE: () => {
      if (state.isPaused) return

      dispatchEvent('INPUT_DISABLE')
      getTopMazeEl()?.classList.add('blurred')
      getMazeEl().classList.add('brightness-low')
      state.pausedTextEl = addHtmlEl().setHTML(`
        <div class="paused-info">The game is currently paused. <br>Press [ESC] or [P] to resume</div>
      `)

      state.isPaused = true
    },
    GAME_RESUME: () => {
      if (!state.isPaused) return

      dispatchEvent('INPUT_ENABLE')
      getTopMazeEl()?.classList.remove('blurred')
      getMazeEl().classList.remove('brightness-low')
      state.pausedTextEl?.remove()

      state.isPaused = false
    },
    DOCUMENT_VISIBILITY_CHANGED: (ev) => {
      !ev.payload.visible && dispatchEvent('GAME_PAUSE')
    },
    [obsDispEvents.OBS_REMOVE]: () => {
      document.removeEventListener('keydown', state.keydownHandler)
      state.pausedTextEl?.remove()
    },
  }
})
