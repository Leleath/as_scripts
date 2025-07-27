// ==UserScript==
// @name         New Song Library
// @version      0.9.2
// @description  description
// @author       Kaomaru
// @match        https://animemusicquiz.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @updateURL    https://github.com/Leleath/as_scripts/raw/refs/heads/main/NewSongLibrary.user.js
// @downloadURL  https://github.com/Leleath/as_scripts/raw/refs/heads/main/NewSongLibrary.user.js
// ==/UserScript==

'use strict';

const version = '0.9.5'

const globalObj = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
const $ = globalObj.jQuery || window.jQuery;
const viewChangerName = 'viewChanger';
const socketName = 'socket';

GM_addStyle(`
    .svg-icon {
        width: 1em;
        height: 1em;
        vertical-align: -0.125em;
        fill: white;
    }
    .svg-icon-black {
        fill: black;
    }
    .elNSLMainContainer {
        max-width: 1200px;
        position: relative;
    }
    .elNSLHeaderContainer {
        background-color: #1b1b1bd6;
        width: 100%;
        padding: 16px;
    }
    .elNSLHeaderContainer h2 {
        font-size: 36px;
        text-align: center;
        margin: 0 !important;
    }
    .elNSLEntryContainer {
        display: flex;
        flex-direction: row;
        box-shadow: none !important;
    }
    .elNSLEntryContainerInner {
        padding: 16px !important;
        mask: 16px !important;
    }
    .elNSLFilterContainer {
        flex-basis: 400px;
    }
    .elNSLFormFilter {
        color: white;
    }
    .elNSLFormGroup {
        margin-bottom: 6px;
    }
    .elNSLFormGroupLegend {
        text-align: center;
        font-size: 18px;
    }
    .elNSLFormSearch {
        color: black;
        width: 100%;
    }
    .elNSLFormSelect {
        color: black;
        width: 100%;
    }
    .elNSLFormSubmit {
        width: 100%;
        color: black;
    }
    .elNSLPagination {
        text-align: center;
    }
    .elNSLPagination:last-child {
        margin-top: 8px;
    }
    .elNSLPaginationChange {
        color: white;
        padding: 8px;
        background-color: #1b1b1b;
        border-radius: 4px;
        border: none;
    }
    .elNSLPaginationChange:first-child {
        margin-right: 8px;
    }
    .elNSLPaginationChange:only-child {
        margin-right: 0px;
    }
    .alignCenter {
        text-align: center;
    }
    .elNSLSongEntry {
        margin-top: 8px !important;
        padding: 8px !important;
    }
    .elNSLSongEntry:first-child {
        margin-top: 0 !important;
        padding: 8px !important;
    }
    .elNSLSongEntryPlaying {
        margin-left: 8px;
        margin-right: -8px;
    }
    .elNSLSongShowMore {
        width: 100%;
        padding: 16px;
        text-align: center;
    }
    .elNSLSongShowMoreButton:hover {
        cursor: pointer;
    }
    .elNSLSongRow {
        display: grid;
        grid-template-columns: 40px 1fr 30px 30px 30px;
        gap: 4px;
    }
    .elNSLFormCheckboxGroupHalf {
        display: grid;
        grid-template-columns: 50% 50%;
        gap: 4px;
    }
    .elNSLSongAnimeNameMain {
        font-size: 18px;
    }
    .elNSLSongAnimeNameMain a {
        font-size: 12px;
    }
    .elNSLSongAnimeNameSecond {
        color: gray;
        font-size: 14px;
    }
    .elNSLPaginationChange:disabled {
        color: #cecece;
        background-color: #545454;
    }
    .elNSLSongTypeAnimeStatusRow {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .elNSLAnimeStatus {
    }
    .elNSLSongType {
        display: flex;
        align-items: center;
    }
    .elNSLSongTypeOP {
    }
    .elNSLSongTypeED {
    }
    .elNSLSongTypeINS {
    }   
    .elNSLSongType p {
        margin: 0 !important;
    }
    .elNSLSongName {
        font-size: 14px;
    }
    .elNSLSongArtist {
        color: lightgray;
    }
    .elNSLSongInfo {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .elNSLSongInfoButton:hover {
        cursor:pointer;
    }
    .elNSLSongSearch {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .elNSLSongSearchButton:hover {
        cursor:pointer;
    }
    .elNSLSongPlay {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .elNSLSongPlayButton:hover {
        cursor:pointer;
    }

    .elNSLModalVideo {
        width: 100%;
    }
    .elNSLModalButtonsRow {
        display: flex;
        width: 100%;
        justify-content: space-between;
        margin-bottom: 4px;
    }
    .elNSLModalVideoPrevButton svg, .elNSLModalVideoNextButton svg {
        width: 2em;
        height: 2em;
    }
    .elEntryContainerHead {
        font-size: 24px;
        margin-bottom: 6px;
    }
    .elNSLModalSongAnimeNameSecond {
        font-size: 1em;
        color: darkgray;
    }
    .elNSLModalSongType {
        font-size: 0.6em;
        color: darkgray;
    }
    .elNSLModalSongAnimePanel {
        margin-bottom: 6px;
    }
    .elNSLModalSongName {
        font-size: 1.2em;
    }
    .elNSLModalSongArtistTitle {
        font-size: 1.2em;
    }
    .elNSLModalSongNamePanel {
        margin-bottom: 6px;
    }
    .elNSLModalSongComposerTitle {
        font-size: 1.2em;
    }
    .elNSLModalSongArrangerTitle {
        font-size: 1.2em;
        margin-bottom: 6px;
    }

    .elNSLAudioPlayer {
        width: 100%;
        height: 80px;
        background: #181818;
        border-top: 1px solid #282828;
        display: flex;
        justify-content: space-between;
        padding: 8px 16px;
        font-family: 'Circular', Helvetica, Arial, sans-serif;
    }
    .elNSLAudioPlayerSongInfo {
        display: flex;
        align-items: center;
        width: 30%;
        min-width: 180px;
    }
    .elNSLAudioPlayerSongDetails {
        display: flex;
        flex-direction: column;
    }
    .elNSLAudioPlayerSongInfoFirst {
        color: #fff;
        font-size: 14px;
        margin-bottom: 4px;
        font-weight: 600;
    }
    .elNSLAudioPlayerSongInfoSecond {
        color: #b3b3b3;
        font-size: 12px;
    }
    .elNSLAudioPlayerControls {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 40%;
        max-width: 722px;
    }
    .elNSLAudioPlayerControlButtons {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }
    .elNSLAudioPlayerControlBtn {
        background: none;
        border: none;
        color: #b3b3b3;
        font-size: 16px;
        margin: 0 8px;
        cursor: pointer;
        transition: color 0.2s;
    }
    .elNSLAudioPlayerControlBtn:hover {
        color: #fff;
    }
    .elNSLAudioPlayerPlayBtn {
        background: #fff;
        color: #000;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
    }
    .elNSLAudioPlayerPlayBtn:hover {
        transform: scale(1.05);
    }
    .elNSLAudioPlayerProgressContainer {
        width: 100%;
        display: flex;
        align-items: center;
    }
    .elNSLAudioPlayerProgressTime {
        color: #a7a7a7;
        font-size: 11px;
        width: 40px;
        text-align: center;
    }
    .elNSLAudioPlayerProgressBar {
        flex-grow: 1;
        height: 4px;
        background: #535353;
        border-radius: 2px;
        cursor: pointer;
        position: relative;
    }
    .elNSLAudioPlayerProgress {
        height: 100%;
        background: #1db954;
        border-radius: 2px;
        width: 0%;
    }
    .elNSLAudioPlayerExtraControls {
        display: flex;
        align-items: center;
        width: 30%;
        justify-content: flex-end;
    }
    .elNSLAudioPlayerVolumeContainer {
        display: flex;
        align-items: center;
        width: 120px;
    }
    .elNSLAudioPlayerVolumeIcon {
        color: #b3b3b3;
        margin-right: 8px;
        font-size: 16px;
        cursor: pointer;
    }
    .elNSLAudioPlayerVolumeBar {
        height: 4px;
        background: #535353;
        border-radius: 2px;
        flex-grow: 1;
        cursor: pointer;
    }
    .elNSLAudioPlayerVolumeProgress {
        height: 100%;
        background: #b3b3b3;
        border-radius: 2px;
        width: 70%;
    }
` );

const htmlContent = `
    <div id="newSongLibraryPage" class="gamePage hide">
        <div id="elBackButton" class="topRightBackButton leftRightButtonTop clickAble">
            <p onclick="viewChanger.changeView(&quot;main&quot;);">
                Back
            </p>
        </div>
        <div class="elMainContainer elNSLMainContainer">
            <div class="elNSLHeaderContainer">
                <h2>New Song Library ${version}</h2>
            </div>
            <div class="elEntryContainer elNSLEntryContainer">
                <div class="elEntryContainerInner elNSLEntryContainerInner elNSLFilterContainer">
                    <div class="elEntryContainerHead alignCenter">Search</div>
                    <div class="elNSLFormCheckboxGroupHalf alignCenter">
                        <div>Animes: <span id="elNSLAnimesCount"></span></div>
                        <div>Songs: <span id="elNSLSongsCount"></span></div>
                    </div>

                    <form id="elNSLFilterForm" class="elNSLFormFilter">                        
                        <div class="elNSLFormGroup">
                            <select name="searchSelect" class="elNSLFormSelect">
                                <option value="searchAll" selected>All</option>
                                <option value="searchAnime">Anime</option>
                                <option value="searchSong">Name</option>
                                <option value="searchArtist">Artist</option>
                                <option value="searchComposer">Composer</option>
                                <option value="searchArranger">Arranger</option>
                            </select>
                            <input class="elNSLFormSearch" type="text" id="search" name="search" placeholder="Type...">
                            <div>
                                <input type="checkbox" name="searchPartialMatch" id="searchPartialMatch" checked>
                                <label for="searchPartialMatch">Partial Match</label>
                            </div>
                            <select name="sort" class="elNSLFormSelect">
                                <option value="nameasc">Name Asc</option>
                                <option value="namedesc">Name Desc</option>
                                <option value="idasc" selected>annId Asc</option>
                                <option value="iddesc">annId Desc</option>
                            </select>
                        </div>

                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Song Type</div>
                            <div class="elNSLFormCheckboxGroup">
                                <div>
                                    <input type="checkbox" name="op" id="op" checked>
                                    <label for="op">Opening</label>
                                </div>
                                <div>
                                    <input type="checkbox" name="ed" id="ed" checked>
                                    <label for="ed">Ending</label>
                                </div>
                                <div>
                                    <input type="checkbox" name="insert" id="insert" checked>
                                    <label for="insert">Insert</label>
                                </div>
                            </div>
                        </div>

                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Anime Status</div>
                            <div class="elNSLFormCheckboxGroup elNSLFormCheckboxGroupHalf">
                                <div>
                                    <div>
                                        <input type="checkbox" name="ptw" id="ptw">
                                        <label for="ptw">Plan to Watch</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="watching" id="watching" checked>
                                        <label for="watching">Watching</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="completed" id="completed" checked>
                                        <label for="completed">Completed</label>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <input type="checkbox" name="onhold" id="onhold">
                                        <label for="onhold">On Hold</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="dropped" id="dropped">
                                        <label for="dropped">Dropped</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="other" id="other">
                                        <label for="other">Other</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Anime Year</div>
                            <div class="elNSLFormCheckboxGroup elNSLFormCheckboxGroupHalf">
                                <div>
                                    From <input type="number" value="1900" min="1900" max="2025" class="elNSLFormSearch" name="yearFrom">
                                </div>
                                <div>
                                    To <input type="number" value="2025" min="1900" max="2025"  class="elNSLFormSearch" name="yearTo">
                                </div>
                            </div>
                        </div>
                        
                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Player Status</div>
                            <div class="elNSLFormCheckboxGroup">
                                <div>
                                    <input type="checkbox" name="added" id="added" checked>
                                    <label for="added">Added</label>
                                </div>
                                <div>
                                    <input type="checkbox" name="notadded" id="notadded" checked>
                                    <label for="notadded">Not Added</label>
                                </div>
                            </div>
                        </div>

                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Other</div>
                            <div class="elNSLFormCheckboxGroup">
                                <div>
                                    <input type="checkbox" name="onesong" id="onesong">
                                    <label for="onesong">One Song</label>
                                </div>
                                <div>
                                    <input type="checkbox" name="rebroadcast" id="rebroadcast">
                                    <label for="rebroadcast">Rebroadcast</label>
                                </div>
                                <div>
                                    <input type="checkbox" name="dub" id="dub">
                                    <label for="dub">Dub</label>
                                </div>
                            </div>
                        </div>

                        <div class="elNSLFormActions">
                            <button class="elNSLFormSubmit" type="submit">Search</button>
                        </div>
                    </form>
                </div>
                <div class="elEntryContainerInner elNSLEntryContainerInner" id="newLibraryClusterId0"></div>
            </div>

            <div class="elNSLAudioPlayer">
                <div class="elNSLAudioPlayerSongInfo">
                    <div class="elNSLAudioPlayerSongDetails">
                        <div class="elNSLAudioPlayerSongInfoFirst">No track selected</div>
                        <div class="elNSLAudioPlayerSongInfoSecond"></div>
                    </div>
                </div>

                <div class="elNSLAudioPlayerControls">
                    <div class="elNSLAudioPlayerControlButtons">
                        <button class="elNSLAudioPlayerControlBtn elNSLAudioPlayerPrevBtn" title="Previous">
                            <svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241 64 96c0-17.7-14.3-32-32-32S0 78.3 0 96L0 416c0 17.7 14.3 32 32 32s32-14.3 32-32l0-145 11.5 9.6 192 160z"/></svg>
                        </button>
                        <button class="elNSLAudioPlayerControlBtn elNSLAudioPlayerPlayBtn" title="Play">
                            <svg class="svg-icon svg-icon-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>
                        </button>
                        <button class="elNSLAudioPlayerControlBtn elNSLAudioPlayerNextBtn" title="Next">
                            <svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416L0 96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241l0-145c0-17.7 14.3-32 32-32s32 14.3 32 32l0 320c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-145-11.5 9.6-192 160z"/></svg>
                        </button>
                    </div>

                    <div class="elNSLAudioPlayerProgressContainer">
                        <span class="elNSLAudioPlayerProgressTimeStart">0:00</span>
                        <div class="elNSLAudioPlayerProgressBar">
                            <div class="elNSLAudioPlayerProgress"></div>
                        </div>
                        <span class="elNSLAudioPlayerProgressTimeEnd">0:00</span>
                    </div>
                </div>

                <div class="elNSLAudioPlayerExtraControls">
                    <div class="elNSLAudioPlayerVolumeContainer">
                        <a class="elNSLAudioPlayerVolumeIcon"><svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg></a>
                        <div class="elNSLAudioPlayerVolumeBar">
                            <div class="elNSLAudioPlayerVolumeProgress"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="modal fade" id="elNSLModal" tabindex="-1" role="dialog" style="display: none;">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                        <h3 class="modal-title"><span class="elNSLModalSongAnimeJP"></span></h3>
                    </div>
                    <div class="modal-body">
                        <video class="elNSLModalVideo" id="elNSLModalVideo" autoplay controls>
                            Your browser does not support the video tag.
                        </video>

                        <div class="elNSLModalSongAnimePanel"><span class="elNSLModalSongAnimeEN"></span></div>
                        <div class="elNSLModalSongNamePanel"><span class="elNSLModalSongName"></span> - <span class="elNSLModalSongArtist"></span></div>
                        <div class="elNSLModalSongComposerTitle">Composer: <span class="elNSLModalSongComposer"></span></div>
                        <div class="elNSLModalSongArrangerTitle">Arranger: <span class="elNSLModalSongArranger"></span></div>
                        <div class="elNSLModalSongDifficultyTitle">Difficulty: <span class="elNSLModalSongDifficulty"></span></div>
                        
                    </div>
                </div>
            </div>
        </div>
        
        <script type="text/template" id="elNSLSongEntryTemplate">
            <div class="elSongEntry elNSLSongEntry">
                <div class="elNSLSongRow">
                    <div class="elNSLSongTypeAnimeStatusRow">
                        <span class="elSongSongType">{songType}</span>
                        <span class="elSongAnimeStatus">{animeStatus}</span>
                    </div>

                    <div>
                        <span class="elSongAnimeName">{animeName}</span>
                        <div class="elNSLSongName"><span class="elNSLSongSongName">{songName}</span> - <span class="elNSLSongSongArtist">{songArtist}</span> <span class="elSongPlayerStatus">{playerStatus}</span></div>
                    </div>

                    <div class="elNSLSongSearch">
                        <a class="elNSLSongSearchButton"><svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg></a>
                    </div>

                    <div class="elNSLSongInfo">
                        <a class="elNSLSongInfoButton"><svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg></a>
                    </div>

                    <div class="elNSLSongPlay">
                        <a class="elNSLSongPlayButton"><svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg></a>
                    </div>
                </div>
            </div>
        </script>
    </div>
`;

class AudioPlayerClass {
    constructor() {
        this.currentTrackIndex = -1;
        this.isPlaying = false;
        this.lastVolume = 0.8;
        this.volume = 0.8;
        this.playlist = [];
        this.audio = new Audio();
        this.audio.volume = this.volume;
        this.isSeeking = false;
        this.isVolumeSeeking = false;
    }

    setup() {
        this.$playerElement = $('.elNSLAudioPlayer');

        this.$songInfoFirstElement = this.$playerElement.find('.elNSLAudioPlayerSongInfoFirst');
        this.$songInfoSecondElement = this.$playerElement.find('.elNSLAudioPlayerSongInfoSecond');
        this.$progressBar = this.$playerElement.find('.elNSLAudioPlayerProgressBar');
        this.$progressContainer = this.$playerElement.find('.elNSLAudioPlayerProgress');
        this.$currentTimeElement = this.$playerElement.find('.elNSLAudioPlayerProgressTimeStart');
        this.$durationElement = this.$playerElement.find('.elNSLAudioPlayerProgressTimeEnd');
        this.$playBtn = this.$playerElement.find('.elNSLAudioPlayerPlayBtn');
        this.$prevBtn = this.$playerElement.find('.elNSLAudioPlayerPrevBtn');
        this.$nextBtn = this.$playerElement.find('.elNSLAudioPlayerNextBtn');
        this.$volumeBtn = this.$playerElement.find('.elNSLAudioPlayerVolumeIcon');
        this.$volumeBar = this.$playerElement.find('.elNSLAudioPlayerVolumeBar');
        this.$volumeContainer = this.$playerElement.find('.elNSLAudioPlayerVolumeProgress');

        this.$playBtn.on('click', () => this.togglePlay());
        this.$prevBtn.on('click', () => this.prevTrack());
        this.$nextBtn.on('click', () => this.nextTrack());
        this.$volumeBtn.on('click', () => this.toggleMute());

        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.nextTrack());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());

        this.$progressBar.on('mousedown', (e) => {
            this.isSeeking = true;
            this.setProgress(e);
        });

        this.$volumeBar.on('mousedown', (e) => {
            this.isVolumeSeeking = true;
            this.setVolume(e);
        });

        $(document).on('mousemove', (e) => {
            if (this.isSeeking) {
                this.setProgress(e);
            } else if (this.isVolumeSeeking) {
                this.setVolume(e);
            }
        });

        $(document).on('mouseup', () => {
            this.isSeeking = false;
            this.isVolumeSeeking = false;
        });
    }

    setPlaylist(newPlaylist) {
        this.playlist = newPlaylist;
        this.currentTrackIndex = -1;
    }

    checkPlayingSong() {
        if (this.currentTrackIndex !== -1) {
            $(`[data-song-id="${this.playlist[this.currentTrackIndex].songSongId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>');
        }
    }

    loadSong(index) {
        if (this.currentTrackIndex == index && this.isPlaying) {
            this.togglePlay();

            return;
        }

        if (this.playlist[index].audio == null) {
            const annSongId = this.playlist[index].songAnnSongId;

            globalObj[socketName]._socket.emit("command", {
                type: "library",
                command: "get song extended info",
                data: {
                    annSongId,
                    includeFileNames: true
                },
            });
        } else {
            this.loadTrack(index, null, null)
        }
    }

    loadTrack(index, songArtist, audio) {
        $('.elNSLSongEntryPlaying').each((index, element) => {
            $(element).removeClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>');
        });

        if (index < 0 || index >= this.playlist.length) return;

        this.currentTrackIndex = index;
        const track = this.playlist[index];

        let songTypeFull = track.songNumber == 0 ? '' : ` ${track.songNumber}`;
        if (track.songRebroadcast) songTypeFull += ' R';
        if (track.songDub) songTypeFull += ' D';
        let songType;
        switch (track.songType) {
            case 1: songType = `Opening${songTypeFull}`; break;
            case 2: songType = `Ending${songTypeFull}`; break;
            default: songType = `Insert${songTypeFull}`;
        }

        this.$songInfoFirstElement.text(`${track.songName} - ${track.songArtistString || songArtist}`);
        this.$songInfoSecondElement.text(`${track.animeMainNames.JA || track.animeMainNames.EN} (${songType})`);

        this.audio.src = `https://naedist.animemusicquiz.com/${track.audio || audio}`;

        this.$durationElement.text(this.formatTime(this.audio.duration));

        if (!this.isPlaying) {
            this.togglePlay();
        } else {
            this.audio.play()
                .then(() => {
                    this.setPlayButtonIcon(true);
                    $(`[data-song-id="${this.playlist[this.currentTrackIndex].songSongId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>');
                })
        }

        if (this.playlist[index].audio == null) {
            this.playlist[index].audio = audio;
            this.playlist[index].songArtistString = songArtist;
        }
    }

    setPlayButtonIcon(isPlaying) {
        if (isPlaying) {
            this.$playBtn.html('<svg class="svg-icon svg-icon-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>');
        } else {
            this.$playBtn.html('<svg class="svg-icon svg-icon-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>');
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
            this.setPlayButtonIcon(false);
            $(`[data-song-id="${this.playlist[this.currentTrackIndex].songSongId}"]`).removeClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>');
        } else {
            this.audio.play()
                .then(() => {
                    this.setPlayButtonIcon(true);
                    $(`[data-song-id="${this.playlist[this.currentTrackIndex].songSongId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>');
                })
                .catch(e => {
                    console.error("Playback error:", e);
                    this.isPlaying = false;
                    this.setPlayButtonIcon(false);
                });
        }
        this.isPlaying = !this.isPlaying;
    }

    prevTrack() {
        this.togglePlay();
        let newIndex = this.currentTrackIndex - 1;
        if (newIndex < 0) newIndex = this.playlist.length - 1;
        this.loadSong(newIndex);
        if (this.isPlaying) this.audio.play();
    }

    nextTrack() {
        this.togglePlay();
        let newIndex = this.currentTrackIndex + 1;
        if (newIndex >= this.playlist.length) newIndex = 0;
        this.loadSong(newIndex);
        if (this.isPlaying) this.audio.play();
    }

    updateDuration() {
        this.$durationElement.text(this.formatTime(this.audio.duration));
    }

    setProgress(e) {
        const rect = this.$progressBar[0].getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.min(Math.max(x / rect.width, 0), 1);
        this.$progressContainer.width(`${percentage * 100}%`);
        this.audio.currentTime = percentage * this.audio.duration;
    }

    setVolume(e) {
        if (this.volume == 0) this.$volumeBtn.text('🔇');
        else this.$volumeBtn.html(this.audio.volume < 0.5 ? '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM412.6 181.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5z"/></svg>' : '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg>');

        const rect = this.$volumeBar[0].getBoundingClientRect();
        const x = e.clientX - rect.left;
        this.volume = Math.min(Math.max(x / rect.width, 0), 1);
        this.audio.volume = this.volume;
        this.$volumeContainer.width(`${this.volume * 100}%`);
    }

    updateProgress() {
        if (!this.isSeeking && !isNaN(this.audio.duration)) {
            const progressPercent = (this.audio.currentTime / this.audio.duration) * 100;
            this.$progressContainer.width(`${progressPercent}%`);
            this.$currentTimeElement.text(this.formatTime(this.audio.currentTime));
        }
    }

    toggleMute() {
        if (this.audio.volume > 0) {
            this.lastVolume = this.audio.volume;
            this.audio.volume = 0;
            this.$volumeContainer.width(`0%`);
            this.$volumeBtn.html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"/></svg>');
        } else {
            this.audio.volume = this.lastVolume || 0.7;
            this.$volumeContainer.width(`${this.volume * 100}%`);
            this.$volumeBtn.html(this.audio.volume < 0.5 ? '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM412.6 181.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5z"/></svg>' : '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg>');
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';

        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

class StorageSave {
    constructor() {
        this.storageSave = this.get();
    }

    get() {
        return JSON.parse(GM_getValue("playerStatusList", "[]"));
    }

    set() {
        GM_setValue("playerStatusList", JSON.stringify(this.storageSave));
    }

    getStorageSave() {
        return this.storageSave;
    }

    hasStorageSave(eventSongId) {
        return this.storageSave.includes(eventSongId);
    }

    setStorageSave(el, id) {
        if (el.checked) this.storageSave.push(id)
        else this.storageSave = this.storageSave.filter(psl => psl !== id)

        this.set();
    }
}

class Song {
    constructor(anime, song) {
        this.animeAnnId = anime.annId;
        this.animeCategory = anime.category;
        this.animeYear = anime.year;
        this.animeSeasonId = anime.seasonId;
        this.animeNames = anime.names;
        this.animeMainNames = anime.mainNames;
        this.animeSearchNames = anime.searchNames;
        this.animeStatus = anime.animeStatus;
        this.animePlayerStatus = anime.playerStatus;
        this.animeSearchIndex = anime.searchIndex;
        this.animeAnimesIds = anime.animesIds;

        this.songAnnId = song.annId;
        this.songAnnSongId = song.annSongId;
        this.songNumber = song.number;
        this.songPlayerLikeStatus = song.playerLikeStatus;
        this.songType = song.type;
        this.songUploaded = song.uploaded;

        this.animeOneSong = (Object.keys(anime.songMap)).length > 1 ? false : true;

        this.songSongId = song.songEntry.songId;
        this.songName = song.songEntry.name;
        this.songSearchNames = song.songEntry.searchNames;
        this.songArtist = song.songEntry.artist;
        this.songArtistArtistId = song.songEntry.songArtistId;
        this.songArtistGroupId = song.songEntry.songGroupId;
        this.songComposer = song.songEntry.composer;
        this.songComposerArtistId = song.songEntry.composerArtistId;
        this.songComposerGroupId = song.songEntry.composerGroupId;
        this.songArranger = song.songEntry.arranger;
        this.songArrangerArtistId = song.songEntry.arrangerArtistId;
        this.songArrangerGroupId = song.songEntry.arrangerGroupId;
        this.songRebroadcast = song.songEntry.rebroadcast;
        this.songDub = song.songEntry.dub;
    }
}

class Search {
    constructor() {
        this.search = '';
        this.searchPartialMatch = true;
        this.sort = 'idasc';
        this.searchSelect = 'searchAll';
        this.op = true;
        this.ed = true;
        this.insert = true;
        this.ptw = false;
        this.watching = true;
        this.completed = true;
        this.onhold = false;
        this.dropped = false;
        this.other = false;
        this.added = true;
        this.notadded = true;
        this.yearFrom = 1900;
        this.yearTo = 2025;
        this.onesong = false;
        this.rebroadcast = false;
        this.dub = false;

        this.animeId = null;
    }

    setSearch(e) {
        this.search = e.target.search.value;
        this.searchPartialMatch = e.target.searchPartialMatch.checked;
        this.searchSelect = e.target.searchSelect.value;
        this.sort = e.target.sort.value;
        this.op = e.target.op.checked;
        this.ed = e.target.ed.checked;
        this.insert = e.target.insert.checked;
        this.ptw = e.target.ptw.checked;
        this.watching = e.target.watching.checked;
        this.completed = e.target.completed.checked;
        this.onhold = e.target.onhold.checked;
        this.dropped = e.target.dropped.checked;
        this.other = e.target.other.checked;
        this.yearFrom = e.target.yearFrom.value;
        this.yearTo = e.target.yearTo.value;
        this.added = e.target.added.checked;
        this.notadded = e.target.notadded.checked;
        this.onesong = e.target.onesong.checked;
        this.rebroadcast = e.target.rebroadcast.checked;
        this.dub = e.target.dub.checked;
    }
}

class NewSongLibrary {
    constructor() {
        this.$view;
        this.active = false;
        this.loaded = false;
        this.animeMap;
        this.allSongs;
        this.audioPlayer;
        this.currentPageIndex = 0;
        this.currentBatchIndex = 0;
        this.batchSize = 100;
        this.search = new Search();
        this.storageSave = new StorageSave();
        this.listners = [];
    }

    setup() {
        $('#mainMenu').append(`<div id="mpNewSongLibrary" class="button floatingContainer mainMenuButton" onclick="viewChanger.changeView('newSongLibrary');"><h1>New Song Library</h1></div>`)
        $('#gameContainer').append(htmlContent)

        this.audioPlayer = new AudioPlayerClass();
        this.audioPlayer.setup();

        this.$view = $("#newSongLibraryPage");

        $('#elNSLFilterForm').on('submit', (e) => {
            e.preventDefault();
            this.search.animeId = null;
            this.search.setSearch(e);
            this.renderSongList();
        });

        $("#elNSLModal").on('hide.bs.modal', function () {
            $("#elNSLModalVideo")[0].pause();
            $("#elNSLModalVideo")[0].src = '';
        });

        globalObj[socketName]._socket.addEventListener("command", this.handleSocketCommand);

        this.loadLibrary();
    }

    handleSocketCommand = (event) => {
        console.log(event)

        if (event.command === 'answer results') {
            this.answerHandle(event.data);
        }

        if (this.active || !this.loaded) {
            if (event.command === 'get song extended info') {
                const song = event.data;

                const index = this.audioPlayer.playlist.findIndex(item => item.songAnnSongId == song.annSongId);

                const songArtist = this.audioPlayer.playlist[index].songArtist.name;

                if ($('#elNSLModal').hasClass('in')) {
                    this.updateModal(index, song);
                } else {
                    this.audioPlayer.loadTrack(index, songArtist, song.fileName);
                }
            }
            if (event.command === 'get anime status list') {
                this.animeMap = Object.fromEntries(
                    Object.entries(this.animeMap).map(([key, anime]) => [
                        key,
                        {
                            ...anime,
                            animeStatus: event.data.animeListMap[key] || 0
                        }
                    ])
                );

                globalObj[socketName]._socket.emit("command", {
                    type: "library",
                    command: "get player status list",
                });
            }
            if (event.command === 'get player status list') {
                this.playerStatusList = event.data.statusListMap;

                this.animeMap = Object.fromEntries(
                    Object.entries(this.animeMap).map(([key, anime]) => [
                        key,
                        {
                            ...anime,
                            playerStatus: this.playerStatusList[key] || 0
                        }
                    ])
                );

                GM_xmlhttpRequest({
                    method: "GET",
                    url: "https://raw.githubusercontent.com/Leleath/as_scripts/refs/heads/main/animesIds.json",
                    onload: (response) => {
                        const animesIds = JSON.parse(response.responseText);
                        // const animesIds = JSON.parse(JSON.stringify(animesIdsJson).replace(/"(\d+)"/g, '$1'));

                        this.animeMap = Object.fromEntries(
                            Object.entries(this.animeMap).map(([key, anime]) => [
                                key,
                                {
                                    ...anime,
                                    // animesIds: animesIds[anime.annId]
                                    animesIds: animesIds[anime.annId] ? Object.fromEntries(
                                        Object.entries(animesIds[anime.annId]).map(([k, v]) => [k, v === null ? null : parseInt(v, 10)])
                                    ) : []
                                }
                            ])
                        );

                        this.combineLists();

                        if (this.active) this.renderSongList();

                        this.loaded = true;
                    },
                    onerror: (error) => console.log(error)
                });
            }
            if (event.command === 'anime list update result') {
                this.getLibraryMasterList();
            }
        }
    }

    async getLibraryMasterList() {
        globalObj[socketName]._socket.emit("command", {
            type: "library",
            command: "get anime status list",
        });
    }

    combineLists() {
        this.allSongs = Object.values(this.animeMap).flatMap(anime => Object.values(anime.songMap).flatMap(song => new Song(anime, song)))
    }

    isInSong(dataArray, searchTerm, searchPartialMatch) {
        for (let i = 0; i < dataArray.length; i++) {
            if (searchPartialMatch) {
                if (dataArray[i].includes(searchTerm)) return true;
            } else {
                if (dataArray[i] == searchTerm) return true;
            }
        }

        return false;
    }

    filterSongs(songsData) {
        return songsData.filter(song => {
            if (song.songUploaded == 0) return false;

            if (
                (!this.search.added && this.storageSave.hasStorageSave(song.songSongId)) ||
                (!this.search.notadded && !this.storageSave.hasStorageSave(song.songSongId))
            ) return false;

            if (this.search.animeId) {
                if (song.animeAnnId !== this.search.animeId) return false

                return true;
            }

            if (!this.search.rebroadcast && song.songRebroadcast == 1) return false;
            if (!this.search.dub && song.songDub == 1) return false;

            if (this.search.onesong) {
                if (!song.animeOneSong) return false
            }

            if (this.search.search !== '') {
                const searchTerm = this.search.search.toLowerCase();
                const searchPartialMatch = this.search.searchPartialMatch;

                const songName = song.songSearchNames;
                const animeNames = song.animeSearchNames;
                const songArtistNames = song.songArtist?.searchNames || [];
                const songArtistArtistMembersNames = song.songArtist?.artistMembers?.flatMap(group => group.searchNames) || [];
                const songArtistGroupMembersNames = song.songArtist?.groupMembers?.flatMap(group => group.searchNames) || [];
                const songComposerNames = song.songComposer?.searchNames || [];
                const songComposerArtistMembersNames = song.songComposer?.artistMembers?.flatMap(group => group.searchNames) || [];
                const songComposerGroupMembersNames = song.songComposer?.groupMembers?.flatMap(group => group.searchNames) || [];
                const songArrangerNames = song.songArranger?.searchNames || [];
                const songArrangerArtistMembersNames = song.songArranger?.artistMembers?.flatMap(group => group.searchNames) || [];
                const songArrangerGroupMembersNames = song.songArranger?.groupMembers?.flatMap(group => group.searchNames) || [];

                switch (this.search.searchSelect) {
                    case 'searchAll':
                        if (
                            !this.isInSong(songName, searchTerm, searchPartialMatch) &&
                            !this.isInSong(animeNames, searchTerm, searchPartialMatch) &&
                            !this.isInSong(songArtistNames, searchTerm, searchPartialMatch) &&
                            !this.isInSong(songArtistArtistMembersNames, searchTerm, searchPartialMatch) &&
                            !this.isInSong(songArtistGroupMembersNames, searchTerm, searchPartialMatch) &&
                            !this.isInSong(songComposerNames, searchTerm, searchPartialMatch) &&
                            !this.isInSong(songComposerArtistMembersNames, searchTerm, searchPartialMatch) &&
                            !this.isInSong(songComposerGroupMembersNames, searchTerm, searchPartialMatch) &&
                            !this.isInSong(songArrangerNames, searchTerm, searchPartialMatch) &&
                            !this.isInSong(songArrangerArtistMembersNames, searchTerm, searchPartialMatch) &&
                            !this.isInSong(songArrangerGroupMembersNames, searchTerm, searchPartialMatch)
                        ) {
                            return false;
                        }
                        break;
                    case 'searchAnime':
                        if (
                            !this.isInSong(animeNames, searchTerm, searchPartialMatch)
                        ) {
                            return false;
                        }
                        break;
                    case 'searchSong':
                        if (
                            !this.isInSong(songName, searchTerm, searchPartialMatch)
                        ) {
                            return false;
                        }
                        break;
                    case 'searchArtist':
                        if (
                            !this.isInSong(songArtistNames, searchTerm, searchPartialMatch)
                        ) {
                            return false;
                        }
                        break;
                    case 'searchComposer':
                        if (
                            !this.isInSong(songComposerNames, searchTerm, searchPartialMatch)
                        ) {
                            return false;
                        }
                        break;
                    case 'searchArranger':
                        if (
                            !this.isInSong(songArrangerNames, searchTerm, searchPartialMatch)
                        ) {
                            return false;
                        }
                        break;
                }
            }

            switch (song.animeStatus) {
                case 0: if (!this.search.other) return false; break;
                case 1: if (!this.search.watching) return false; break;
                case 2: if (!this.search.completed) return false; break;
                case 3: if (!this.search.onhold) return false; break;
                case 4: if (!this.search.dropped) return false; break;
                case 5: if (!this.search.ptw) return false; break;
                default: return false;
            }

            switch (song.songType) {
                case 1: if (!this.search.op) return false; break;
                case 2: if (!this.search.ed) return false; break;
                case 3: if (!this.search.insert) return false; break;
                default: return false;
            }

            if (!(song.animeYear >= this.search.yearFrom && song.animeYear <= this.search.yearTo)) {
                return false;
            }

            return true;
        });
    }

    setPage(pageIndex) {
        this.currentBatchIndex = pageIndex;

        $('#newLibraryClusterId0').scrollTop(0);

        this.renderBatch();
    }

    renderBatch() {
        const currentBatchIndexPlusBatchSize = this.currentBatchIndex + this.batchSize;

        const fragment = $(document.createDocumentFragment());
        const endIndex = Math.min(currentBatchIndexPlusBatchSize, this.sortedSongsData.length);

        const templateScript = $('#elNSLSongEntryTemplate');
        const templateHtml = templateScript.html();

        $('#newLibraryClusterId0').html('');

        const pagination = $('<div>');
        pagination.addClass('elNSLPagination');

        if (this.sortedSongsData.length > this.batchSize) {
            const prevPage = $('<button>');
            prevPage.addClass('elNSLPaginationChange')
            const prevPageIndex = this.currentBatchIndex - this.batchSize;
            prevPage.on('click', (e) => this.setPage(prevPageIndex));
            prevPage.text(`Prev Page`)
            if (!(currentBatchIndexPlusBatchSize - this.batchSize > 0)) prevPage.prop('disabled', true);
            pagination.append(prevPage)

            const nextPage = $('<button>');
            nextPage.addClass('elNSLPaginationChange')
            const nextPageIndex = this.currentBatchIndex + this.batchSize;
            nextPage.on('click', (e) => this.setPage(nextPageIndex));
            nextPage.text(`Next Page`)
            if (!(currentBatchIndexPlusBatchSize < this.sortedSongsData.length)) nextPage.prop('disabled', true);
            pagination.append(nextPage)

            pagination.clone(true).appendTo(fragment);
        }

        for (let i = this.currentBatchIndex; i < endIndex; i++) {
            const template = $(templateHtml);

            const song = this.sortedSongsData[i];

            const animeName = $('<div>', {
                class: 'elNSLSongAnimeNameMain',
                html: song.animeMainNames.JA ? `${song.animeMainNames.JA} ` : song.animeMainNames.EN ? `${song.animeMainNames.EN} ` : ''
            })
            if (song.animeMainNames.JA && song.animeMainNames.EN && song.animeMainNames.JA !== song.animeMainNames.EN) {
                animeName.append($('<span>', {
                    class: 'elNSLSongAnimeNameSecond',
                    html: song.animeMainNames.EN
                }))
            }
            if (song.animeAnimesIds.malId) {
                animeName.append($('<a>', {
                    href: `https://myanimelist.net/anime/${song.animeAnimesIds.malId}`,
                    html: ' MAL'
                }))
            }
            if (song.animeAnimesIds.anilistId) {
                animeName.append($('<a>', {
                    href: `https://anilist.co/anime/${song.animeAnimesIds.anilistId}`,
                    html: ' ANILIST'
                }))
            }
            if (song.animeAnimesIds.kitsuId) {
                animeName.append($('<a>', {
                    href: `https://kitsu.app/anime/${song.animeAnimesIds.kitsuId}`,
                    html: ' KITSU'
                }))
            }
            if (song.animeAnimesIds.annId) {
                animeName.append($('<a>', {
                    href: `https://www.animenewsnetwork.com/encyclopedia/anime.php?id=${song.animeAnimesIds.annId}`,
                    html: ' ANN'
                }))
            }

            const songArtist = song.songArtist;

            let songTypeFull = song.songNumber == 0 ? '' : song.songNumber;
            if (song.songRebroadcast == 1) songTypeFull += ' R';
            if (song.songDub == 1) songTypeFull += ' D';
            let songType;
            switch (song.songType) {
                case 1: songType = `<div class="elNSLSongType elNSLSongTypeOP">OP ${songTypeFull}</div>`; break;
                case 2: songType = `<div class="elNSLSongType elNSLSongTypeOP">ED ${songTypeFull}</div>`; break;
                default: songType = `<div class="elNSLSongType elNSLSongTypeOP">INS ${songTypeFull}</div>`;
            }

            // a
            let songCheckbox = $('<input>', {
                type: 'checkbox',
                checked: this.storageSave.hasStorageSave(song.songSongId),
                change: (e) => {
                    this.storageSave.setStorageSave(e.target, song.songSongId);
                }
            });
            let animeStatus;
            switch (song.animeStatus) {
                case 0: animeStatus = $('<div>').addClass('elNSLAnimeStatus', 'elNSLAnimeStatusOther').html('- ').append(songCheckbox); break;
                case 1: animeStatus = $('<div>').addClass('elNSLAnimeStatus', 'elNSLAnimeStatusWatching').html('W ').append(songCheckbox); break;
                case 2: animeStatus = $('<div>').addClass('elNSLAnimeStatus', 'elNSLAnimeStatusCompleted').html('C ').append(songCheckbox); break;
                case 3: animeStatus = $('<div>').addClass('elNSLAnimeStatus', 'elNSLAnimeStatusOn-Hold').html('O ').append(songCheckbox); break;
                case 4: animeStatus = $('<div>').addClass('elNSLAnimeStatus', 'elNSLAnimeStatusDropped').html('D ').append(songCheckbox); break;
                case 5: animeStatus = $('<div>').addClass('elNSLAnimeStatus', 'elNSLAnimeStatusPTW').html('P ').append(songCheckbox); break;
                default: animeStatus = $('<div>').addClass('elNSLAnimeStatus', 'elNSLAnimeStatusUnknown').html('- ').append(songCheckbox);
            }

            const playerStatus = song.playerStatus == 1 ? 'Like' : song.playerStatus == 2 ? 'Dislike' : ''

            const artistContainer = template.find('.elNSLSongSongArtist');
            new ArtistHover(songArtist, artistContainer, undefined, null, false);

            template.attr('data-song-id', song.songSongId);
            template.find('.elSongSongType').html(songType)
            template.find('.elSongAnimeStatus').html(animeStatus)
            template.find('.elSongAnimeName').html(animeName)
            template.find('.elNSLSongSongName').html(song.songName)
            template.find('.elSongPlayerStatus').html(playerStatus)
            template.find('.elNSLSongSongArtist').html(songArtist?.name || '')
            template.find('.elNSLSongSearchButton').on('click', (e) => {
                this.search.animeId = song.animeAnnId;
                this.renderSongList();
            })
            template.find('.elNSLSongInfoButton').on('click', (e) => this.showModal(i, false))
            template.find('.elNSLSongPlayButton').on('click', (e) => this.audioPlayer.loadSong(i))

            fragment.append(template)
        }

        if (this.sortedSongsData.length > this.batchSize) {
            pagination.clone(true).appendTo(fragment);
        }

        $('#newLibraryClusterId0').append(fragment);

        this.audioPlayer.checkPlayingSong();

        this.currentBatchIndex = endIndex;
    }

    renderSongList() {
        this.sortedSongsData = (this.filterSongs(this.allSongs)).sort((a, b) => {
            switch (this.search.sort) {
                case 'idasc': return a.animeAnnId - b.animeAnnId || a.songType - b.songType || a.songNumber - b.songNumber;
                case 'iddesc': return b.animeAnnId - a.animeAnnId || a.songType - b.songType || a.songNumber - b.songNumber;
                case 'namedesc': return -((a.animeMainNames.JA || a.animeMainNames.EN || "").localeCompare(b.animeMainNames.JA || b.animeMainNames.EN || ""));
                default: return (a.animeMainNames.JA || a.animeMainNames.EN || "").localeCompare(b.animeMainNames.JA || b.animeMainNames.EN || "");
            }
        });

        this.audioPlayer.setPlaylist(this.sortedSongsData);

        this.currentBatchIndex = 0;
        this.currentPageIndex = 0;

        this.renderBatch()

        const songsCount = this.sortedSongsData.length;
        $('#elNSLSongsCount').html(songsCount)
        const animesCount = [...new Set(this.sortedSongsData.map(anime => anime.animeAnnId))].length;
        $('#elNSLAnimesCount').html(animesCount)

        this.tempCallback();
        this.$view.removeClass("hide");
    }

    updateModal(index, songData) {
        const song = this.sortedSongsData[index];

        let songType;
        let songTypeFull = song.songNumber == 0 ? '' : song.songNumber;
        if (song.songRebroadcast) songTypeFull += ' R';
        if (song.songDub) songTypeFull += ' D';
        switch (song.songType) {
            case 1: songType = `Opening ${songTypeFull}`; break;
            case 2: songType = `Ending ${songTypeFull}`; break;
            default: songType = `Insert ${songTypeFull}`;
        }

        const animeName = $('<div>', {
            class: 'elNSLSongAnimeNameMain',
            html: song.animeMainNames.JA ? `${song.animeMainNames.JA} ` : song.animeMainNames.EN ? `${song.animeMainNames.EN} ` : ''
        })
        if (song.animeMainNames.JA && song.animeMainNames.EN && song.animeMainNames.JA !== song.animeMainNames.EN) {
            animeName.append($('<span>', {
                class: 'elNSLSongAnimeNameSecond',
                html: song.animeMainNames.EN
            }))
        }

        const songArtist = song.songArtist?.name || '';
        const songComposer = song.songComposer?.name || '';
        const songArranger = song.songArranger?.name || '';

        const videoSrc = '720' in songData.fileNameMap ? songData.fileNameMap['720'] : '480' in songData.fileNameMap ? songData.fileNameMap['480'] : null;

        $('#elNSLModalVideo')[0].src = `https://naedist.animemusicquiz.com/${videoSrc}`;
        $('.elNSLModalSongAnimeJP').html(animeName)
        $('.elNSLModalSongName').html(song.songName)
        $('.elNSLModalSongDifficulty').html(songData.globalPercent)

        const modalSongArtist = $('.elNSLModalSongArtist');
        modalSongArtist.html(songArtist);
        if (song.songArtist) new ArtistHover(song.songArtist, modalSongArtist, undefined, null, false);

        const modalSongComposer = $('.elNSLModalSongComposer');
        modalSongComposer.html(songComposer);
        if (song.songComposer) new ArtistHover(song.songComposer, modalSongComposer, undefined, null, false);

        const modalSongArranger = $('.elNSLModalSongArranger');
        modalSongArranger.html(songArranger);
        if (song.songArranger) new ArtistHover(song.songArranger, modalSongArranger, undefined, null, false);
    }

    showModal(index, isOpened) {
        const annSongId = this.sortedSongsData[index].songAnnSongId;

        globalObj[socketName]._socket.emit("command", {
            type: "library",
            command: "get song extended info",
            data: {
                annSongId,
                includeFileNames: true
            },
        });

        if (!isOpened) {
            $('#elNSLModal').modal("show");
        }
    }

    answerHandle (event) {
        console.log(event.songInfo);

        const { annId, songName, artistInfo } = event.songInfo;

        const songArtistGroupId = 'artistId' in artistInfo ? artistInfo.artistId : artistInfo.groupId;

        const eventSongIndex = this.allSongs.findIndex(item => {
            const itemArtistId = item.songArtistArtistId !== null ? item.songArtistArtistId : item.songArtistGroupId;

            return item.animeAnnId == annId &&
                itemArtistId == songArtistGroupId &&
                item.songName == songName;
        });
        const eventSongId = this.allSongs[eventSongIndex].songSongId;

        const checkForElement = () => {
            const $element = $('#qpSongType');
            if ($element.length) {
                // $('#qpSongType').append(`<div>Saved <input type="checkbox" onchange="viewChanger.__controllers.newSongLibrary.storageSave.setStorageSave(this, ${eventSongId})" class="elNSLPlayerStatusCheckbox" ${this.storageSave.hasStorageSave(eventSongId) && 'checked'} /></div>`)

                                // <input type="checkbox" name="searchPartialMatch" id="searchPartialMatch" checked>
                                // <label for="searchPartialMatch">Partial Match</label>

                $element.append(
                    $('<div>').append(
                        $('<label>', {
                            for: 'answerCheckbox',
                            html: 'Saved'
                        }),
                        $('<input>', {
                            type: 'checkbox',
                            name: 'answerCheckbox',
                            id: 'answerCheckbox',
                            checked: this.storageSave.hasStorageSave(eventSongId),
                            change: (e) => {
                                this.storageSave.setStorageSave(e.target, eventSongId);
                            }
                        })
                    ));

                clearInterval(intervalId);
            }
        }

        const intervalId = setInterval(checkForElement, 100);
    }

    loadLibrary() {
        let cacheValue;

        Object.defineProperty(libraryCacheHandler, 'annSongIdAnnIdMap', {
            get: function () {
                return cacheValue;
            },
            set: (value) => {
                cacheValue = value;

                this.listners = [];
                this.listners.push(
                    globalObj[socketName].listners['get anime status list'][0],
                    globalObj[socketName].listners['get player status list'][0]
                )
                this.listners.forEach(listener => listener.unbindListener())

                this.animeMap = { ...libraryCacheHandler.animeCache };

                this.getLibraryMasterList();
            }
        });
        libraryCacheHandler.requestCacheUpdate(0);
    }

    openView(callback) {
        this.tempCallback = callback;
        this.active = true;

        if (!this.loaded) {
            this.loadLibrary();
        } else {
            this.getLibraryMasterList();
        }
    }

    closeView() {
        this.$view.addClass("hide");

        this.audioPlayer.audio.pause();
        this.active = false;

        this.listners.forEach(listener => listener.bindListener())
        this.listners = [];
    }
}

const waitForInitialLoad = () => {
    return new Promise((resolve, reject) => {
        const loadingScreen = document.getElementById("loadingScreen");
        if (!loadingScreen) return reject(new Error("Loading screen not found"));

        new MutationObserver((_record, observer) => {
            try {
                observer.disconnect();
                resolve();
            } catch (error) {
                observer.disconnect();
                reject(error);
            }
        }).observe(loadingScreen, { attributes: true });
    });
};

waitForInitialLoad().then(() => {
    const newSongLibrary = new NewSongLibrary();

    globalObj[viewChangerName].__controllers.newSongLibrary = newSongLibrary;
    globalObj[viewChangerName].__controllers.newSongLibrary.setup()

    // new Listener('answer results', (e) => globalObj[viewChangerName].__controllers.newSongLibrary.answerHandle(e)).bindListener();
});