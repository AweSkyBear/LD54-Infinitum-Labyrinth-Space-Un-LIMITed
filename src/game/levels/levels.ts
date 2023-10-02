import { dispatchEvent, IObserver, removeObs } from '../../OD'
const classNames = require('classnames')

import { TPortalWithPos } from '../createPortals'
import { getRandomMazePos, getReadablePortalTitle } from '../gameUtil'
import { createSignpost } from '../html/createSignpost'
import { repeat } from 'ramda'
import { createRandomDuckSvg } from '../../svg/createRandomDuckSvg'
import { createSandwichSvg } from '../../svg/createSandwichSvg'
import { createL5LaptopItem, createSuccessScrollItem } from '../html/lvl5Game/createL5LaptopItem'
import { getGameStateFlag, setGameStateFlag } from '../global/gameState'
import { createHoaxDiamond } from '../html/lvl5Game/createHoaxDiamond'
import { createDiamondGame } from './lvl5/createLevel5Game'
import { createDuckPalmSvg } from '../../svg/createDuckPalmSvg'
import { createInteractibleItem } from '../html/createInteractibleItem'
import { basedOnPartial } from '../../common/func'
import { createThirdEyeGuider } from '../html/lvl6ThirdEye/createThirdEyeGuider'
import { createThirdEyeWhichLeadsGame } from '../html/lvl6ThirdEye/createThirdEyeWhichLeadsGame'
import { getMazeSize } from '../global/mazeSize'

export const levels = {
  ///////// LEVEL 0 //////////
  0: {
    title: 'The Genesis Maze!',
    introText: [
      '(⊙︿⊙) What is this...',
      '... is this a maze?!?!',
      '<br/>I wonder what I should do...',
      '<br><br><br> And why am I a.. <b><em>green DOUGHUT?!?!?!</em></b> 🥯',
    ],
    handleLevelStart: () => {
      return [
        createSignpost({
          pos: getRandomMazePos(),
          signText: '...',
          fullText: `${createDuckPalmSvg()} Thy shall seek <em>thyself</em> the right direction! <br/> As in life, you have many choices...`,
        }),
        createSignpost({
          pos: { x: 1, y: 1 },
          signText: '...',
          fullText: `
            ${createDuckPalmSvg()} Space is <em>limited</em>. But don't let that fool you.<br>
            Options to continue your journey - are not.
            `,
        }),
        createSignpost({
          pos: getRandomMazePos(),
          signText: '...',
          fullText: `
            ${createDuckPalmSvg()} Technically... the correct term for this type of limited space is <em>maze</em>.
            You can call me your <em>messmate</em><br>
            Creepy.. uh?
            <hr>
            <span class="t-small">* Messmate: the modern equivalent of this word is something like <em>lunch buddy</em>,
            but “messmate” is so much more evocative.
            In a sentence: “My usual messmate’s not here – mind if I sit with you? ”</span> 🍝🍛🤤
          `,
        }),
      ]
    },
    handlePortalEntering: ({ seed, portal: _portal, isMovingBack, fromPortal }) => {
      const createdElements = []

      // create for EVERY possible seed -> e.g. the only way we succeed is entering the CORRECT_SEED
      const CORRECT_SEED = '0C'
      if (/* initial maze */ seed !== '0' && seed !== CORRECT_SEED) {
        const deepInTheMaze = seed.length >= 5

        createdElements.push(
          ...repeat(0, deepInTheMaze ? 5 : 1).map(() =>
            createSignpost({
              pos: getRandomMazePos(),
              signText: !deepInTheMaze ? 'NO!' : 'NO!!!',
              fullText: !deepInTheMaze
                ? `${createDuckPalmSvg()} (·•᷄∩•᷅ ) <br> Nope nope nope... yo getting it wronnn', green-doughnut fella :D 🫠`
                : `${createDuckPalmSvg()} 💕 ( •̥́ ᦷ •̀ ) We go back already, shall we?`,
            })
          )
        )

        // TEMP
        // dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_TYPE_TEXT, { payload: { text: 'Nope...' } })
      } else if (!isMovingBack) {
        // is CORRECT_SEED
        dispatchEvent('LEVEL_REQUEST_START', { payload: { levelInd: 1 } })
      }

      return createdElements
    },
  },
  ///////// LEVEL 1 //////////
  1: {
    title: 'The Explicit Direcitons',
    handleLevelStart: () => {
      return [
        createSignpost({
          pos: getRandomMazePos(),
          signText: '....?',
          fullText: `${createDuckPalmSvg()} ... thy shall go deeper ... follow the signs! <br/>Will you?`,
        }),
      ]
    },
    handlePortalExited: ({
      fromSeed,
      isMovingBack,
    }: {
      fromSeed: string
      isMovingBack: boolean
    }) => {
      // if going out of the (previously) winning one --> XX: since we have just lvl 1 depth of this level - moving back
      if (fromSeed === '0C' && isMovingBack) {
        dispatchEvent('LEVEL_PREV')
      }
    },
    handlePortalEntering: ({ seed, portal: _portal, isMovingBack, fromPortal }) => {
      if (seed === '0C4B3') {
        dispatchEvent('LEVEL_REQUEST_START', { payload: { levelInd: 2 } })
      }
    },
    hints: [
      'Look at the corners: see the portals. Some of them <em>explicitly</em> point you towards entering them...',
      `Still can't figure it out? Maybe go ↩️ back until you see the clear signs.`,
    ],
  },
  //// LEVEL 2
  2: {
    title: "The Rubber Duck's riddle...",
    introText: [
      "👀 See see see... 👀 I see a dove 🕊️ on a sign post :O.<br/>That's something new!",
    ],
    handleLevelStart: () => {
      // note: creating signposts from here is buggy : ) - don't do it
    },
    handlePortalExited: ({
      fromSeed,
      isMovingBack,
    }: {
      fromSeed: string
      isMovingBack: boolean
    }) => {
      // if going out of the (previously) winning one --> XX: since we have just lvl 1 depth of this level - moving back
      if (fromSeed === '0C4B3' && isMovingBack) {
        dispatchEvent('LEVEL_PREV')
      }
    },
    handlePortalEntering: ({ seed, portal, isMovingBack, fromPortal }) => {
      const createdElements = []

      ;(portal.seed === '0C4B3' || fromPortal.seed === '0C4B3') &&
        createdElements.push(
          createSignpost({
            pos: getRandomMazePos(),
            signText: '𓅌',
            classname: 'sign-dove',
            fullText: `${createRandomDuckSvg()} I am the Rubber Duck!!!
            What... you expected a <em>rubber duck</em> on that sign??! Haa-haa! I fooled you!
            From now on my riddles will be written on the <b>falcon</b>!
            It's not a DOVE, you noob! YES - it's falcon! I am getting carried away...
           here comes your first riddle, <em>you b*tch</em>:
           <br/>
            <p class="bold em">The 4 diagonal directions of the world! What comes for you next must not be previous. <br/>
            What way you go, should not be from where the sun rises!
            And neither where gravity pulls. After the new follow the path sturdily -
            repeat the previous with the new - 3 times!
            Take the above instructions not without a grain of salt (or without... you decide).
            Still, add tomato and garlic to your sandwich ${createSandwichSvg()} (it's better that way).
            </p>`,
          })
        )

      // correct portal (after repeating 3 times):
      if (portal.seed === '0C4B3A3A3A3') {
        dispatchEvent('LEVEL_REQUEST_START', { payload: { levelInd: 3 } })
        // dispatchEvent('LEVEL_NEXT')
      }

      // LvL 5 branch - correct portal (only after passing level 4):
      if (getGameStateFlag('zoomLevelPasswordUsed') && portal.seed === '0C4B3A3A3A4') {
        dispatchEvent('LEVEL_REQUEST_START', { payload: { levelInd: 5 } })
      }

      return createdElements
    },
    hints: [
      'The 4 diagonal directions of the world... those must be the portals, no?',
      `It seems we have 3 directions which will lead to <em>nowhere</em> according to the riddle -
        east and south and where we came from (don't go back) - one direction left to go`,
      `My doughnut fella, ones finding the right direction, <em>repeat it</em> 3 times as the riddle says.`,
      `Ohh gosh - here it is - repeating it means you have to move at TOP-LEFT then to BOTTOM-RIGHT and repeat
      it 3 times... 😵👇`,
    ],
  },
  //// LEVEL 3
  3: {
    title: 'The falcons...',
    introText: [
      `👀 (⊙ _ ⊙ ) 🐧 Phew... so much looping! Should've stayed home doing the laundry. ✨👕✨<br>
        Wait... I've still no idea how I got here!!!`,
    ],
    handleLevelStart: () => {
      // note: creating signposts from here is buggy : ) - don't do it
    },
    handlePortalEntering: ({ seed, portal, isMovingBack, fromPortal }) => {
      const createdElements = []

      if (isMovingBack && fromPortal.seed === '0C4B3A3A3A3') {
        dispatchEvent('LEVEL_PREV')
        return
      }

      //// 1) ENTERING LEVEL
      if (portal.seed === '0C4B3A3A3A3') {
        // ON ENTERING NEW LEVEL :::
        createdElements.push(
          createSignpost({
            pos: getRandomMazePos(),
            signText: 'How?',
            classname: 'how',
            fullText: `${createRandomDuckSvg()} Muahaha! <em>How did I get here?</em> How did you get here?!?!
              <br/> I put you here. Bia**h! (•ө•)♡ 🤪`,
          }),
          createSignpost({
            pos: getRandomMazePos(),
            signText: '𓅌',
            classname: 'sign-dove',
            fullText: `${createRandomDuckSvg()} <b><em>The 7 falcons... only they show the way,
             <br> ... <br> ... <br> ... <br> ... <br> bi*ch! <br> The right falcons! </em></b>   `,
          }),
          createSignpost({
            pos: getRandomMazePos(),
            signText: '𓅌',
            classname: 'sign-dove',
            fullText: `${createRandomDuckSvg()} <b><em>The numbers will progress<br> but you don't know how..
              <br/>Muahahahahhahaah you... <br/><br/>WAMBLECROMPT</em> * ! ! !</br>
              <hr>
              <span class="t-small">* Wamblecrompt: literally <em>overcome with indigestion</em>. In top 10 of lost English words</span>
            `,
          })
        )
      }

      //// 2) GOING OVER BRANCHES
      // when not the winning branch -> 0C4B3A3A3A3B3A2C1
      if (!portal.seed.startsWith('0C4B3A3A3A3B3A2C1')) {
        //// TOP-LEFT branch - formula 1
        if (portal.seed.startsWith('0C4B3A3A3A3A')) {
          const initialLen = '0C4B3A3A3A3A'.length
          const depthDiff = portal.seed.length - initialLen

          const formulaResCount = Math.max(1, 3 - depthDiff) // 3, 2, 1
          createdElements.push(
            ...repeat(1, formulaResCount).map((_, ind) =>
              createSignpost({
                pos: getRandomMazePos(),
                signText: `𓅌`,
                classname: 'sign-dove',
                fullText: ` --- Falcon ${ind} ---`,
              })
            )
          )
          //// TOP-RIGHT branch - formula 2 - the correct one
        } else if (portal.seed.startsWith('0C4B3A3A3A3B')) {
          const initialLen = '0C4B3A3A3A3B'.length
          const depthDiff = portal.seed.length - initialLen

          const countByInd = [1, 3, 7, 15, 31]
          const formulaResCount = countByInd[Math.min(countByInd.length - 1, depthDiff)]

          //// 3) (check) AT THE CORRECT PATH - one of 3 options for falcons
          const isCorrectPathWithRightFalcons = formulaResCount === 7 && portal.seed.endsWith('B1D')

          createdElements.push(
            ...repeat(1, formulaResCount).map((_, ind) =>
              createSignpost({
                pos: getRandomMazePos(),
                signText: `𓅌`,
                classname: classNames('item sign-dove', { right: isCorrectPathWithRightFalcons }),
                fullText: isCorrectPathWithRightFalcons
                  ? `${createRandomDuckSvg()}You did it, doughnut-guy! Yo filthy doughnut <em>Banloca *</em> 🥸!
                <br> You are beginning to earn maa respect! 🦉<br>
                <b>The next challenge lies at... ${getReadablePortalTitle('C4B3A3A3A3B3A2C1')}</b>
                <br>Better <b>write that down</b>... you sugary circular thing... 😈
                <hr>
                <span class="t-small">* Banloca: literally - bone encloser, bone locker (kind of a bag of bones ( • ᴗ - ) ✧)</span>
                `
                  : ` --- Falcon ${ind} --- <p>.. but is it a right one?</p>`,
                onPlayerInteraction: () => setGameStateFlag('touchedRightFalcon', true),
              })
            )
          )
        } //// BOTTOM-LEFT   branch - formula 3
        else if (portal.seed.startsWith('0C4B3A3A3A3D')) {
          const initialLen = '0C4B3A3A3A3D'.length
          const depthDiff = portal.seed.length - initialLen

          const formulaResCount = Math.min(2 + 2 * depthDiff, 10) // 2, 4, 6, 8, 10
          createdElements.push(
            ...repeat(1, formulaResCount).map((_, ind) =>
              createSignpost({
                pos: getRandomMazePos(),
                signText: `𓅌`,
                classname: 'sign-dove',
                fullText: ` --- Falcon ${ind} ---`,
              })
            )
          )
        }
      } else if (portal.seed === '0C4B3A3A3A3B3A2C1' && getGameStateFlag('touchedRightFalcon')) {
        //// 4) THE NEXT CHALLENGE

        dispatchEvent('LEVEL_REQUEST_START', { payload: { levelInd: 4 } })
      }

      return createdElements
    },
    hints: [
      `Take a close look at what every sign says in the begining of the level.
        Try to be aware of the number of falcon signs when you go deeper into the maze.`,
      `The <em>right falcons</em> means in one place you have falcon signs turned to the right...`,
      `The deeper the depth, the count of falcon changes <em>differently pre the branch/portal you entered</em>`,
      `Go back and compare how many falcons we have with each maze branch... how do those numbers progress?`,
      `Okay... it's a tricky one because there are 12 places (in total) with 7 falcons ;)`,
      `Blaaah... ok ok... here it is: one of the progressions has 1..3..7 falcons (when going deeper) - in one of the branches
      that has 3 falcons there is ONE branch with 7 right falcons... go there!!! 😵😵😵 😩 🏤☘️ <br> Good Luck!`,
    ],
  },
  ///////// LEVEL 4 - Devil is in the Detail //////////
  4: {
    title: 'The devil is in the detail...',
    introText: ['...', '...', '...'],
    handleLevelStart: () => {},
    handlePortalEntering: ({ seed, portal, isMovingBack, fromPortal }) => {
      const createdElements = []

      if (isMovingBack && fromPortal.seed === '0C4B3A3A3A3B3A2C1') {
        dispatchEvent('LEVEL_PREV')
        return
      }

      //// 1) ENTERING LEVEL
      if (portal.seed === '0C4B3A3A3A3B3A2C1') {
        if (getGameStateFlag('zoomLevelPasswordUsed')) {
          createdElements.push(createSuccessScrollItem())
        } else {
          const constructedText = 'The way, b**tch, is to enter the first 6 fibonnaci numbers'
          const letteCountPerSign = 3
          const numberOfSignposts = Math.ceil(constructedText.length / letteCountPerSign)

          //// 2) create the signposts with the instructions, viewed only upon very high zoom!
          createdElements.push(
            ...repeat(1, numberOfSignposts).map((_, ind) =>
              createSignpost({
                pos: getRandomMazePos(),
                signText: `...`,
                classname: 'sign-small-text',
                fullText: `... ᵕ̈ㅤᵕ̈ㅤᵕ̈ text is too small... it's unreadable
                <br> not bringing my grandma doughnut-glasses unfortunately =( 😢<br>`,
                // + actual SIGN to be very small text!
                changeTextUponZoom: {
                  dpiLevel: 6,
                  newText: `${constructedText.substring(
                    ind * letteCountPerSign,
                    ind * letteCountPerSign + letteCountPerSign
                  )} ( ${ind + 1}`,
                },
              })
            )
          )

          //// 3) LAPTOP item - enter the password
          createdElements.push(createL5LaptopItem())
        }
      }

      return createdElements
    },
    hints: [
      `What do the unreadable signs say? You have 1 tool to just reveal the <em>truth</em>`,
      `Try to zoom in quite enough and then look around...`,
      `Didn't you see it already? You simply have to put the message just like puzzle pieces in the correct order
       (you have the numbering) and then use the clue as the password <b>WHEN TOUCHING THE LAPTOP</b> ! ! ! 🖥️`,
      `I you don't know what Fib is, use yo browser search, after all you are an
        <em>Internet-enabled 🍩 doughnut banloca</em> hahahaha! 😆🤪🦇
        <br> It's starts like this: 0 1 1 * * *`,
      `Ooohh gosh! You lazy 🍩 doughnut-a*s! Here it is: 0 1 1 2 3 5`,
      `What about after inputting the password? You've to move back to a portal with 10 symbols
      (depth 10) in which you did <b>not</b> enter. Track back where you came from, <em>PLS</em>!`,
      `The final character at the target portal is 4 because 5 - 1 is 4, you b***ch 🤪😂🤪😭👋`,
    ],
  },
  ///////// LEVEL 5 - The Diamond game //////////
  5: {
    title: 'The elusive diamond!',
    // introText: [''],
    handleLevelStart: () => {
      return []
    },
    handlePortalEntering: ({ seed, portal, isMovingBack, fromPortal }) => {
      const createdElements = []

      const LEVEL_START_SEED = '0C4B3A3A3A4'
      if (portal.seed === LEVEL_START_SEED && !getGameStateFlag('diamondTaken')) {
        // JUST A TEST
        createdElements.push(createHoaxDiamond())

        createdElements.push(
          createSignpost({
            pos: getRandomMazePos(),
            signText: '!!!!!',
            fullText: `${createRandomDuckSvg()} Note well, doughnut guy:
          <br>
          <em>
            It is not where it does seem it is...
            <br>
            if you touch its shadow, it will disappear...
            <br>
            you MUST have patience...
            <br>
            hoooold...
            <br>
            for the truth to be revealed!
            <br>
            Hooold...
            <br>
            for your thrid eye 👁️ to show you the way!
          </em>
          `,
          })
        )
        createdElements.push(createDiamondGame())
      } else if (!isMovingBack) {
        // ?
      }

      return createdElements
    },
    hints: [
      `Don't fool yourself - taking the FAKE diamonds does nothing muhahahahah 🥸🤥🚫`,
      `Try not to move your green-dough body - the longer you do, the better chance to see a diamond which is not fake.
        Taking any fake diamond will reset the whole thing. 😜`,
    ],
  },
  6: {
    title: 'Your third 👁️ shows you the way',
    introText: [
      `${createRandomDuckSvg()} 👁️👁️👁️ Your third eye is there for you to take it...
    or shall I say your <em>first</em> in your doughnuty case HAHAHAHAH.<br><br> You *itch. <br> <br>👁️👁️👁️`,
    ],
    handleLevelStart: () => {
      return []
    },
    handlePortalEntering: ({ seed, portal, isMovingBack, fromPortal }) => {
      const createdElements = []

      const PORTAL_WITH_FINAL_DOOR_SEED = '0C4B3A3A3A4A2D3'

      const createdObs = basedOnPartial<string, IObserver>({
        '0C4B3A3A3A4': () => createThirdEyeWhichLeadsGame(),
        '0C4B3A3A3A4A': () => createThirdEyeGuider({ x: getMazeSize().cols - 1, y: 0 }), // show next to be TOPRIGHT
        '0C4B3A3A3A4A2': () => createThirdEyeGuider({ x: 0, y: getMazeSize().rows - 1 }), // show next to be BOTTOMLEFT
        '0C4B3A3A3A4A2D': () =>
          createThirdEyeGuider({ x: getMazeSize().cols - 1, y: getMazeSize().rows - 1 }), // show next to be BOTTOMRIGHT

        [PORTAL_WITH_FINAL_DOOR_SEED]: () =>
          createInteractibleItem()({
            pos: getRandomMazePos(),
            html: '🚪',
            classname: 'final-door',
            onPlayerInteraction: ({ obs }) => {
              removeObs(obs)

              dispatchEvent('GAME_WON')
            },
          }),
      })(portal.seed)

      createdObs && createdElements.push(createdObs)

      return createdElements
    },
  },
} as Record<number, TLevelConfig>

export type TLevelConfig = {
  title: string
  introText?: string[]
  handleLevelStart: <T extends void | any[]>() => T
  handlePortalExited?: ({
    fromSeed,
    isMovingBack,
  }: {
    fromSeed: string
    isMovingBack: boolean
  }) => void
  handlePortalEntering: <T extends void | any[]>({
    seed,
    portal,
    isMovingBack,
    fromPortal,
  }: {
    seed: string
    portal: TPortalWithPos
    isMovingBack: boolean
    fromPortal: TPortalWithPos
  }) => T
  hints?: string[]
}
