import { getMazeSize } from '../game/global/mazeSize'

export const gameInstructionsHtml = `
    <div class="info">
        <h2>Before you start, fellow trapped explorer...</h2>
        
        <div class="limitedness mt-2 mb-2">
            <h3>CHOOSE SPACE LIMITEDness: <span class="maze-size-choice">${
              getMazeSize().rows
            }</span></h3>
            <input class="maze-size" type="range" min="6" max="35" value="10" step="1" />
            <div class="maze-size-tip">Recommended: play the game on size 10 if it's your first run</div>
        </div>

        <h3>
            <p>
                Find your way out of the maze... 
                <br><br>&nbsp;&nbsp;the space is <em>limited</em>...
                <br>
                <br>&nbsp;&nbsp;the rooms count is <b>NOT</b>...
                <br>
                <br>&nbsp;&nbsp;the maze is <em>infinite</em>
                <br>
                <br>&nbsp;&nbsp;there will be <em>foes</em>... 🐹 🐷 🙉</h3>
            </p>
        </h3>
        
        <br>
        <p><b>Movement: </b> WASD or Arrows</p>
        <p><b>Action: </b> [SPACE] or [E]</p>

        <br>
        <p><b>Fact: </b> You are a <em>doughnut</em></p>

        <br>
        <br>
        <br>
        <br>

        <hr>
        <h3>Not TLDR::</h3>

        <p>There are <b>4 directions - 4 portals in each maze</b></p>
        <hr>
        <p>After the first level 3 portals lead <b>deeper</b> into the maze</p>
        <p>1 will take you where you came from</p>
        <p>Every time you enter a portal, 3 other portals will lead you <em>only deeper</em></p>
        <hr>
        <p>.. A -&gt; A1, A2, A3, A4 </p>
        <p>...  A2 -&gt; A2A, A2B, A2C</p>
        <p>....  A2A -&gt; A2A2, A2A3, A2A4</p>
        <p>.. You <b>can</b> go back ..  A2A -&gt; A2 </p>
        <hr>
        <p>.. You <b>can</b> .. zoom in and out arbitrarily if you need it </p>
        <hr>
        <p>.. You <b>can</b> .. switch the lights on and off</p>
        <hr>
        <p>.. You <b>can</b> .. use hints if having enough 🍉</p>
        <hr>
        <p>.. You <b>can</b> .. stop and start the music and the sound effects</p>
        <hr>


        <br>
        <p>Good Luck! <button class="start-the-game mt-3 mb-2">Enter the Rubber Duck's maze..</button></p>
    </div>`

export const freeRoamInstructionsHtml = `
    <div class="info">
        <h2>Before you start, fellow explorer...</h2>
        <h3><br>Roam freely... no purpose... 
            <br>&nbsp;&nbsp;you can configure the maze and even share it as a URL!</h3>
         </h3>

        <br>
        <p><b>Movement: </b> WASD or Arrows</p>
        <p><b>Action: </b> [SPACE] or [E]</p>

        <br>
        <p><b>Fact: </b> You STILL are a <em>doughnut</em></p>

        <br>
        <br>
        <br>
        <br>

        <hr>
        <h3>Not TLDR::</h3>

        <p>There are <b>4 directions - 4 portals in each maze</b></p>
        <hr>
        <p>After the first level 3 portals lead <b>deeper</b> into the maze</p>
        <p>1 will take you where you came from</p>
        <p>Every time you enter a portal, 3 other portals will lead you <em>only deeper</em></p>
        <hr>
        <p>.. A -&gt; A1, A2, A3, A4 </p>
        <p>...  A2 -&gt; A2A, A2B, A2C</p>
        <p>....  A2A -&gt; A2A2, A2A3, A2A4</p>
        <p>.. You <b>can</b> go back ..  A2A -&gt; A2 </p>
        <hr>
        <p>.. You <b>can</b> .. zoom in and out arbitrarily if you need it </p>
        <hr>
        <p>.. You <b>can</b> .. switch the lights on and off</p>
        <hr>

        <br>
        <hr>
        <p><b>Change</b> the maze title, so that you get a unique maze</p>
        <hr>
        <p><b>Change</b> the maze size, so that you change the <b>LIMITEDness</b> to explore a bigger or smaller maze</p>
        
        <hr>
        <p><b>Add and Edit</b> notes via a the action button to introduce mysterious and <b>a-maze-ing</b> messages</p>
        
        <hr>
        <p><b>Customize the Looks</b> of your maze via the [⚙️] button</p>
        
        <hr>
        <p><b>Share :)</b> your final maze via using the [🎁] button</p>

        <br>
        <p>Enjoy the free-roaming! <button class="start-free-roam mt-3 mb-2">Enter the infinite maze..</button></p> 
    </div>`

export const creditsHTML = `
    <div class="info">
        <h2>Made with ❤️ for Ludum Dare 54 !</h2>
        <h2>By AweSkyBear</h2>
        <p><a target="_blank" href="https://ldjam.com/events/ludum-dare/54/$371504">Game page on LDJAM</a></p>
        <p>Tools/Stuff used: HTML5, TypeScript, obs-disp, Prando, maze-generation, HowlerJS, SFXR, Sound Fonts, misc MIDI editors, LOVE</p>
        <p>Full credits and source code available on the <a target="_blank" 
            href="https://github.com/AweSkyBear/LD54-Infinitum-Labyrinth-Space-Un-LIMITed/blob/main/README.md#credits">github repo README</a></p>
        <p><a target="_blank" href="https://therealjavascript.com">www.therealjavascript.com</a></p>
        <br>
    </div>
`
