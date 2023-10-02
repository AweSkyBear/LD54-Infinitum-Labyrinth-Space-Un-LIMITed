import { dispatchEvent, ObsDispCreate, obsDispCreator, obsDispEvents } from '../OD'
import { defaultTo } from 'ramda'
import { colorLuminance } from './color'
import { randomDegFor, wait } from './func'

/** Also to act as a maze-color management (only in Dark mode) */
export const createLightsSwitcher = obsDispCreator(() => {
  const state = {
    lights: 'off' as 'off' | 'on',
    lastElBackgroundStyle: '',
    lastElBackdropFilter: '',
  }

  const getEl = () => document.body

  const switchLightsOff = () => {
    setHueRotate()
    setBackgroundStyle()

    state.lights = 'off'
    getEl().classList.add('dark')
  }
  const switchLightsOn = () => {
    getEl().style.background = '' // reset it so that it comes from CSS
    state.lights = 'on'
    getEl().classList.remove('dark')
    removeHueRotate()
  }
  const setHueRotate = () => (getEl().style.backdropFilter = state.lastElBackdropFilter)
  const setBackgroundStyle = () => (getEl().style.background = state.lastElBackgroundStyle)

  const removeHueRotate = () => (getEl().style.backdropFilter = ``)

  return {
    [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {}),
    GAME_START: () => {
      wait(1000).then(() => {
        // to begin the game
        switchLightsOff()
        // quick fix / element repositioning
        dispatchEvent('DPI_CHANGE', { payload: { dpi: window.devicePixelRatio } })
      })
    },
    LIGHTS_TOGGLE: () => {
      state.lights === 'off' ? (state.lights = 'on') : (state.lights = 'off')

      state.lights === 'off' && dispatchEvent('LIGHTS_SWITCH_OFF')
      state.lights === 'on' && dispatchEvent('LIGHTS_SWITCH_ON')
    },
    LIGHTS_SWITCH_OFF: switchLightsOff,
    LIGHTS_SWITCH_ON: switchLightsOn,
    PORTAL_ENTERED: (ev) => {
      const seed = defaultTo('0', ev.payload.seed) as string

      if (state.lights === 'off') {
        // UPDATE THE COLOR TO DARKER based on depth : ))) / except for the Genesis Maze
        if (seed === '0') {
          state.lastElBackgroundStyle = ''
          setBackgroundStyle()
          state.lastElBackdropFilter = ''
          setHueRotate()
        } else {
          const luminance = 0.6 - seed.length / 15

          // note: darker and darker color when deeper into the maze!
          const finalGradient = `
        radial-gradient(
            circle at 50% 55%,
            ${colorLuminance('#020024', luminance)} 0%,
            ${colorLuminance('#060555', luminance)} 20%,
            ${colorLuminance('#090979', luminance)} 35%,
            ${colorLuminance('#073b9a', luminance)} 51%,
            ${colorLuminance('#07419e', luminance)} 53%,
            ${colorLuminance('#050344', luminance)} 54%,
            ${colorLuminance('#00d4ff', luminance)} 100%)
        `

          state.lastElBackgroundStyle = finalGradient
          setBackgroundStyle()

          // change the color!
          const hueRotateDeg = randomDegFor(seed)
          state.lastElBackdropFilter = `hue-rotate(${hueRotateDeg}deg)`

          setHueRotate()
        }
      }
    },
    [obsDispEvents.OBS_REMOVE]: () => {
      switchLightsOn()
    },
  }
})
