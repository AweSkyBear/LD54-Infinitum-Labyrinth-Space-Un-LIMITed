import { dispatchEvent, ObsDispCreate, IEvent, obsDispCreator, obsDispEvents, ODAPI } from '../OD'
import { Howl, HowlOptions } from 'howler'
import { exposeToWindow, wait } from './func'
import { getCurrentTopos } from '../game/global/currentTopos'
import { IObserver } from 'obs-disp'

// DEFAULT
// Howler.volume(1.5)

const _tracks = [] as Howl[]

export const createMusic = obsDispCreator(
  () => {
    const state = {
      obs: null as IObserver,
      muted: false,
      trackPaths: ['/music/Cosmic-Low-Wind.mp3', '/music/Cosmic-Strings.mp3'],
      trackVolumeOverrides: [undefined, 0.3],
      // tracks: [] as Howl[],
      trackInd: -1,
    }

    // f (getCurrentTopos() === 'start-screen') return
    // const whenNotOnStartScreen = (callback: ) =>

    const loadAndPlayTrack = (opts?: HowlOptions) => {
      // state.trackInd = ind

      if (state.muted) return

      stopCurrentTrack()

      if (!_tracks[state.trackInd]) {
        // load it / create it
        _tracks[state.trackInd] = new Howl({
          src: state.trackPaths[state.trackInd],
          loop: true,
          ...opts,
        })
      }

      _tracks[state.trackInd].play()
      state.trackVolumeOverrides[state.trackInd] &&
        _tracks[state.trackInd].volume(state.trackVolumeOverrides[state.trackInd])

      exposeToWindow({ tracks: _tracks })
    }

    const stopCurrentTrack = () => {
      try {
        _tracks[state.trackInd]?.stop()
      } catch (ex) {
        console.warn('Howler track stop failed', ex)
      }
    }

    const nextTrack = (ev: IEvent) => {
      if (getCurrentTopos() === 'start-screen') return

      if (state.muted) return

      stopCurrentTrack()

      const ind = state.trackInd
      state.trackInd = ind + 1 > state.trackPaths.length - 1 ? 0 : ind + 1

      wait(ev.payload?.delay || 0).then(() => {
        loadAndPlayTrack()
      })
    }

    const pauseMusic = () => {
      try {
        _tracks[state.trackInd]?.pause()
      } catch (ex) {
        console.warn('Howler track pause failed', ex)
      }
    }

    const startMusic = () => !state.muted && _tracks[state.trackInd]?.play()

    // not needed
    // const unloadAll = () => _tracks.forEach((t) => t?.unload())
    const handleGameExit = () => (state.trackInd = -1)

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => (state.obs = obs)),
      GAME_START: () =>
        getCurrentTopos() === 'infinite-roam' &&
        // state.obs?.options &&
        // ODAPI.checkObsExists(state.obs) &&
        dispatchEvent('MUSIC_REQUEST_NEXT_TRACK', { payload: { delay: 5000 } }),
      LEVEL_STARTED: () =>
        state.obs?.options &&
        ODAPI.checkObsExists(state.obs) &&
        dispatchEvent('MUSIC_REQUEST_NEXT_TRACK', { payload: { delay: 5000 } }),
      MUSIC_REQUEST_NEXT_TRACK: nextTrack,
      MUSIC_TOGGLE: () => {
        state.muted = !state.muted
        dispatchEvent(state.muted ? 'MUSIC_STOP' : 'MUSIC_START')
      },
      MUSIC_STOP: stopCurrentTrack,
      MUSIC_START: startMusic,
      MUSIC_PAUSE: pauseMusic,
      MUSIC_RESUME: startMusic,
      GAME_PAUSE: pauseMusic,
      GAME_RESUME: startMusic,
      GAME_EXIT: handleGameExit,
      GAME_REQUEST_EXIT: handleGameExit,
      [obsDispEvents.OBS_REMOVE]: () => {
        // unloadAll()
        exposeToWindow({ ss: null })
      },
      // DEBUG
      GAME_UPDATE: () => exposeToWindow({ ss: state }),
      // MUSIC_VOL_UP: () => {
      //   // Howler.volume(state.volume + 0.2)
      //   //
      // },
      // MUSIC_VOL_DOWN: () => {
      //   //
      // },
    }
  },
  { id: 'create-music' }
)
