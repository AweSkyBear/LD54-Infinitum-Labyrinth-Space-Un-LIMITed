import { getRandomMazePos } from '../../gameUtil'
import { createRandomDuckSvg } from '../../../svg/createRandomDuckSvg'
import { createInteractibleItem } from '../createInteractibleItem'
// @ts-ignore
import laptopSVG from '../../../svg/laptop-svgrepo-com.svg'
import { LevelInfoBarEvents } from '../createLevelInfoBar'
import { dispatchEvent } from '../../../OD'
import { escapeHtml, wait, waitForCondition } from '../../../common/func'
import { setGameStateFlag } from '../../global/gameState'
import { createScrollItem } from '../createScrollItem'
import { playSound } from '../../../common/sound'

export const createL5LaptopItem = () => {
  return createInteractibleItem()({
    pos: getRandomMazePos(),
    svg: laptopSVG,
    classname: 'laptop',
    fullText: `${createRandomDuckSvg()} ENTER THE PASSWORD !!! <input class="locked-laptop-password" placeholder="da password, *iatch!" />`,
    onPlayerInteraction: async () => {
      // give enough time to render the input
      await waitForCondition(() => !!getPasswordInput())

      getPasswordInput()?.addEventListener('keydown', handleTypeInPasswordInput)
      getPasswordInput()?.addEventListener('keyup', handleTypeInPasswordInput)
    },
  })
}

export const getPasswordInput = () =>
  document.querySelector<HTMLInputElement>('.locked-laptop-password')

const handleTypeInPasswordInput = () => {
  const FIRST_FIB_NUMBERS = '011235' // the goal
  if (getPasswordInput().value.trim() === FIRST_FIB_NUMBERS) {
    //// 4) ENTERED THE CORRECT PASSWORD

    // not really needed, due to the elem removed as soon as sign is closed
    // getPasswordInput()?.removeEventListener('keydown', handleTypeInPasswordInput)
    // getPasswordInput()?.removeEventListener('keyup', handleTypeInPasswordInput)

    // hide the riddle with the pass input
    dispatchEvent(LevelInfoBarEvents.LEVEL_INFO_BAR_CLEAR)

    //// remove the existing signposts
    dispatchEvent('LEVEL_CLEAR_CREATED_ELEMENTS')

    //// after this, Next time we enter the maze with the laptop -
    //// and this time ---> show only the SCROLL with the instructions!
    setGameStateFlag('zoomLevelPasswordUsed', true)
    playSound('switch')

    const createdEl = createSuccessScrollItem()
    dispatchEvent('LEVEL_STORE_CREATED_ELEMENTS', { payload: { createdElements: [createdEl] } })

    // NOTE: GOAL AS:   C4B3A3A3A4  ->   the Diamond game  !  !  !  !  !  !
  }
}

/** Create the SCROLL with instructions */
export const createSuccessScrollItem = () => {
  return createScrollItem({
    fullText: `${createRandomDuckSvg()} You made it, Jonesy!
      Your next set of instructions? <br><br>
      Just bring me <em>this ${escapeHtml('->>>>')}</em>💎<em>${escapeHtml('<<<<-')}</em>
      Bring it to me and you will <em>BE FREE</em>!
      <br>
      A 💎 will wait for you... at the entrance of <b>the 10 characters</b>,
      only 3 of them - <b>the beginner's letter</b>!<br>
      <b>The final symbol</b>? 
      <br>
      ...
      <br>It's the count of thumbs on a human hand when I bite 🦆 one off 💩 HAHAHAHA! 💩 ( •͈૦•͈ ) ( · ❛ ֊ ❛)- 
      <br>
      You have <b>moved passed there</b>... but did not (need) to enter!
      <br>
      Goodoughnut luck, Indoughna Jones! 🍩🍮🍩
      <br>
      ...
      <br>
      <br>
      <b>Show us what yo really made of! 🍚☁️ </b> 
      <br>
      `,
  })
}
