import {
  dispatchEvent,
  ObsDispCreate,
  IObserver,
  obsDispCreator,
  obsDispEvents,
  removeObs,
} from '../../OD'
import { IHTMLElWrapper, addHtmlEl } from '../../htmlEl/addHtmlEl'
import { addText } from '../../htmlEl/addText'
import { levels } from '../levels/levels'
import { getContainer } from '../../common/container'
// @ts-ignore
import square from '../../svg/square.svg'
import { repeat } from 'ramda'
import { basedOn, basedOnPartial, debugLogEvent, wait, waitForCondition } from '../../common/func'
import { createGame } from '../createGame'
import { dispatchReadjustDPIChange } from '../../common/createDPIChangeDetect'
import { getCurrentTopos, TTopos } from '../global/currentTopos'
import { getSeedSuffix } from '../global/seedSuffix'
const classNames = require('classnames')

export type TStartMenuButton = 'start-the-game' | 'start-free-roam' | 'credits'

export const createHeader = obsDispCreator<{
  topos: TTopos
}>(
  ({ topos }) => {
    const state = {
      obs: null as IObserver,
      header: null as IHTMLElWrapper,

      fruitCount: null,
    }

    const getLevelTitleEl = () => state.header?.el?.querySelector<HTMLElement>('.level-title')

    const setLevelTitle = (levelInd: number, text: string) => {
      getLevelTitleEl().innerHTML = `<span class="level-label">Level <span class="level-ind">${levelInd}</span>: ${text}</span>`
    }
    const setLevelSquares = (levelInd: number) => {
      getContainer().querySelector<HTMLElement>('.level-progress').innerHTML = `${repeat(
        square,
        levelInd
      ).join(' ')}`
    }

    const getGameTitleHtml = () => {
      return basedOn({
        'start-screen': () =>
          `<h1 class="game-title">Infinitum Labyrinth <span class="sub">Space Un-LIMITed</span></h1>`,
        'the-game': () => `<h1 class="game-title">Infinitum Labyrinth
          ${state.fruitCount ? `<span class="fs-rem1">🍉</span>${state.fruitCount}` : ''}</h1>`,
        'infinite-roam': () => `<h1 class="game-title">Free Roam</h1>`,
      })(topos)
    }

    const setGameTitle = () =>
      state.header?.el &&
      (state.header.el.querySelector('.game-title').outerHTML = getGameTitleHtml())

    const handleMazeRetitle = async () =>
      getCurrentTopos() === 'infinite-roam' &&
      getSeedSuffix() &&
      (await waitForCondition(() => !!getLevelTitleEl()).then(
        () => (getLevelTitleEl().innerHTML = getSeedSuffix())
      ))

    return {
      [obsDispEvents.OBS_CREATE]: ObsDispCreate.useObs((obs) => {
        state.obs = obs

        state.header = addHtmlEl({
          prependTo: getContainer(),
          attrs: { class: classNames('header', { 'free-roam': topos === 'infinite-roam' }) },
        })
          .setHTML(
            basedOn({
              'start-screen': () => {
                return `
                  ${getGameTitleHtml()}
                  <div class="menu">
                    <button class="start-the-game">The Game</button>
                    <button class="start-free-roam">Free Roam</button>

                    <div class="credits-wrap">
                      <br>
                      <br>

                      <p style="font-size: 3rem; text-align: center">♾️</p>

                      <br>
                      <br>

                      <button class="credits">Credits</button>
                    </div>
                  </div>
                `
              },
              'the-game': () => {
                return `
                  ${getGameTitleHtml()}
                  <h3 class="level-title">---</h1>
                  <div class='level-progress'></div>
                `
              },
              'infinite-roam': () => {
                return `
                  ${getGameTitleHtml()}
                  <h3 class="level-title">Just roam - infinitely</h1>
                  <div class="seed-wrapper>Seed: <input class='seed' type="text" value="some initial seed" /></div>
                `
              },
            })(topos)
          )
          .then((res) => {
            res.el.querySelector('.start-the-game')?.addEventListener('click', () => {
              dispatchEvent('BUTTON_CLICK', {
                payload: { button: 'start-the-game' as TStartMenuButton },
              })
            })
            res.el.querySelector('.start-free-roam')?.addEventListener('click', () => {
              dispatchEvent('BUTTON_CLICK', {
                payload: { button: 'start-free-roam' as TStartMenuButton },
              })
            })
            res.el.querySelector('.credits')?.addEventListener('click', () => {
              dispatchEvent('BUTTON_CLICK', {
                payload: { button: 'credits' as TStartMenuButton },
              })
            })
          })
      }),
      LEVEL_STARTED: (ev) => {
        debugLogEvent(ev)

        const { levelInd }: { levelInd: number } = ev.payload as any
        setLevelTitle(levelInd, `${levels[levelInd].title}`)
        // state.levelTitle.setText(`Level ${levelInd}: ${levels[levelInd].title}`)
        setLevelSquares(levelInd)
      },
      FRUIT_COUNT_UPDATED: (ev) => {
        state.fruitCount = ev.payload.count

        setGameTitle()
        dispatchReadjustDPIChange()
      },
      GAME_START: handleMazeRetitle,
      MAZE_RETITLE: handleMazeRetitle,
      [obsDispEvents.OBS_REMOVE]: () => {
        state.header?.remove()
      },
    }
  },
  { id: 'header' }
)
