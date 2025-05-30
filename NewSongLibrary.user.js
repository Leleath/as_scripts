// ==UserScript==
// @name         New Song Library
// @version      0.8.3
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

const version = '0.8.2'

const globalObj = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
const $ = globalObj.jQuery || window.jQuery;

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
        grid-template-columns: 50px 1fr 30px 30px;
        gap: 4px;
    }
    .elNSLSongAnimeNameMain {
        font-size: 18px;
    }
    .elNSLSongAnimeNameSecond {
        color: gray;
        font-size: 14px;
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
    .elNSLSongPlay {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .elNSLSongPlayButton:hover {
        cursor:pointer;
    }
    .elNSLSongAnimeNameMain {
        font-size: 18px;
    }
    .elNSLSongAnimeNameSecond {
        color: gray;
        font-size: 14px;
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
    .elNSLModalSongAnimeNameMain {
        font-size: 1em;
    }
    .elNSLModalSongAnimeNameSecond {
        font-size: 0.8em;
        color: darkgray;
    }
    .elNSLModalSongType {
        font-size: 0.8em;
        color: darkgray;
    }
    .elNSLModalSongNameArtist {
        font-size: 1.2em;
        color: lightgray;
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
                    <form id="elNSLFilterForm" class="elNSLFormFilter">
                        <div class="elNSLFormGroup">
                            <input class="elNSLFormSearch" type="text" id="search" name="search" placeholder="Type...">
                        </div>

                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Sort</div>
                            <div class="elNSLFormCheckboxGroup">
                                <select name="sort" class="elNSLFormSelect">
                                    <option value="nameasc" selected>Name Asc</option>
                                    <option value="namedesc">Name Desc</option>
                                    <option value="idasc">annId Asc</option>
                                    <option value="iddesc">annId Desc</option>
                                </select>
                            </div>
                        </div>

                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Song Type</div>
                            <div class="elNSLFormCheckboxGroup">
                                <div>
                                    <input type="checkbox" name="op" checked> OP
                                </div>
                                <div>
                                    <input type="checkbox" name="ed" checked> ED
                                </div>
                                <div>
                                    <input type="checkbox" name="insert" checked> Insert
                                </div>
                            </div>
                        </div>

                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Anime Status:</div>
                            <div class="elNSLFormCheckboxGroup">
                                <div>
                                    <input type="checkbox" name="ptw"> Plan to Watch
                                </div>
                                <div>
                                    <input type="checkbox" name="watching" checked> Watching
                                </div>
                                <div>
                                    <input type="checkbox" name="completed" checked> Completed
                                </div>
                                <div>
                                    <input type="checkbox" name="onhold"> On Hold
                                </div>
                                <div>
                                    <input type="checkbox" name="dropped"> Dropped
                                </div>
                                <div>
                                    <input type="checkbox" name="other"> Other
                                </div>
                            </div>
                        </div>
                        
                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Player Status:</div>
                            <div class="elNSLFormCheckboxGroup">
                                <div>
                                    <input type="checkbox" name="added" checked> Added
                                </div>
                                <div>
                                    <input type="checkbox" name="notadded" checked> Not Added
                                </div>
                            </div>
                        </div>

                        <div class="elNSLFormActions">
                            <button class="elNSLFormSubmit" type="submit">Search</button>
                        </div>
                    </form>

                    <div>Songs count: <span id="elNSLSongsCount"></span></div>
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
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                        <h2 class="modal-title">Song Info</h2>
                    </div>
                    <div class="modal-body">
                        <div class="elNSLModalButtonsRow">
                            <a class="elNSLModalVideoPrevButton" id="elNSLModalVideoPrevButton" onclick="viewChanger.__controllers.newSongLibrary.setIndexModal({songIndexPrev})"><svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg></a>
                            <a class="elNSLModalVideoNextButton" id="elNSLModalVideoNextButton" onclick="viewChanger.__controllers.newSongLibrary.setIndexModal({songIndexNext})"><svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg></a>
                        </div>
                        <video class="elNSLModalVideo" id="elNSLModalVideo" autoplay controls>
                            Your browser does not support the video tag.
                        </video>

                        <div id="elNSLModalSongNameArtist"></div>
                        <div id="elNSLModalSongAnime"></div>
                        <div id="elNSLModalSongType"></div>
                        
                    </div>
                </div>
            </div>
        </div>
        
        <script type="text/template" id="elNSLSongEntryTemplate">
            <div class="elSongEntry elNSLSongEntry" data-song-id="{songId}">
                <div class="elNSLSongRow">
                    <div class="elNSLSongTypeAnimeStatusRow">
                        {songType}
                        {animeStatus}
                    </div>

                    <div>
                        {animeName}
                        <div class="elNSLSongName">{songName} - <span class="elNSLSongArtist">{songArtist}</span> {playerStatus}</div>
                    </div>

                    <div class="elNSLSongInfo">
                        <a class="elNSLSongInfoButton" onclick="viewChanger.__controllers.newSongLibrary.showModal({songIndex})"><svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg></a>
                    </div>

                    <div class="elNSLSongPlay">
                        <a class="elNSLSongPlayButton" onclick="viewChanger.__controllers.newSongLibrary.audioPlayer.loadSong({songIndex})"><svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg></a>
                    </div>
                </div>
            </div>
        </script>
        <script type="text/template" id="elNSLSongShowMoreTemplate">
            <div class="elNSLSongShowMore" id="elNSLShowMore">
                <a class="elNSLSongShowMoreButton" onclick="viewChanger.__controllers.newSongLibrary.renderBatch()">Show More</a>
            </div>
        </script>
    </div>
`;

const viewChangerName = 'viewChanger';
const socketName = 'socket';

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
            $(`[data-song-id="${this.playlist[this.currentTrackIndex].songId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>');
        }
    }

    loadSong(index) {
        if (this.currentTrackIndex == index && this.isPlaying) {
            this.togglePlay();

            return;
        }

        if (this.playlist[index].audio == null) {
            const annSongId = this.playlist[index].annSongId;

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

        let songType;
        let songTypeFull = track.songNumber == 0 ? '' : ` ${track.songNumber}`;
        if (track.rebroadcast) songTypeFull += ' R';
        if (track.dub) songTypeFull += ' D';
        switch (track.songType) {
            case 1: songType = `Opening${songTypeFull}`; break;
            case 2: songType = `Ending${songTypeFull}`; break;
            default: songType = `Insert${songTypeFull}`;
        }

        this.$songInfoFirstElement.text(`${track.name} - ${track.songArtistString || songArtist}`);
        this.$songInfoSecondElement.text(`${track.mainNames.JA || track.mainNames.EN} (${songType})`);

        this.audio.src = `https://naedist.animemusicquiz.com/${track.audio || audio}`;

        this.$durationElement.text(this.formatTime(this.audio.duration));

        if (!this.isPlaying) {
            this.togglePlay();
        } else {
            this.audio.play()
                .then(() => {
                    this.setPlayButtonIcon(true);
                    $(`[data-song-id="${this.playlist[this.currentTrackIndex].songId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>');
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
            $(`[data-song-id="${this.playlist[this.currentTrackIndex].songId}"]`).removeClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>');
        } else {
            this.audio.play()
                .then(() => {
                    this.setPlayButtonIcon(true);
                    $(`[data-song-id="${this.playlist[this.currentTrackIndex].songId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>');
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

class NewSongLibrary {
    constructor() {
        this.$view;
        this.active;
        this.loaded;
        this.animeMap;
        this.songMap;
        this.artistMap;
        this.groupMap;
        this.allSongs;
        this.audioPlayer;
        this.currentPageIndex = 0;
        this.currentBatchIndex = 0;
        this.batchSize = 100;
        this.filterData = {
            search: '',
            sort: 'nameasc',
            op: true,
            ed: true,
            insert: true,
            ptw: false,
            watching: true,
            completed: true,
            onhold: false,
            dropped: false,
            other: false,
            added: true,
            notadded: true,
        }

        this.originalHandler;

        this.listners = [];
    }

    setup() {
        $('#mainMenu').append(`<div id="mpNewSongLibrary" class="button floatingContainer mainMenuButton" onclick="viewChanger.changeView('newSongLibrary');"><h1>New Song Library</h1></div>`)
        $('#gameContainer').append(htmlContent)

        this.audioPlayer = new AudioPlayerClass();
        this.audioPlayer.setup();
        this.active = false;
        this.loaded = false;

        this.$view = $("#newSongLibraryPage");

        $('#elNSLFilterForm').on('submit', (e) => this.handleFilterForm(e));

        $("#elNSLModal").on('hide.bs.modal', function () {
            $("#elNSLModalVideo")[0].pause();
            $("#elNSLModalVideo")[0].src = '';
        });

        globalObj[socketName]._socket.addEventListener("command", this.handleSocketCommand);

        this.getFirstData();
    }

    handleSocketCommand = (event) => {
        console.log(JSON.stringify(event))

        if (this.active) {
            if (event.command === 'get song extended info') {
                const song = event.data;

                const index = this.audioPlayer.playlist.findIndex(item => item.annSongId == song.annSongId);

                const songArtist = this.audioPlayer.playlist[index].songArtistId ?
                    this.artistMap[this.audioPlayer.playlist[index].songArtistId].name :
                    this.groupMap[this.audioPlayer.playlist[index].songGroupId].name;

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
                            playerStatus: event.data.statusListMap[key] || 0
                        }
                    ])
                );

                this.renderSongList();

                this.combineLists();
            }
        }
    }

    async fetchWithGM() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://animemusicquiz.com/libraryMasterList",
                headers: {
                    "Content-Type": "application/json"
                },
                onload: function (response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                },
                onerror: function (error) {
                    reject(error);
                }
            });
        });
    }

    async getFirstData() {
        const libraryMasterList = await this.fetchWithGM();

        this.animeMap = libraryMasterList.animeMap;
        this.songMap = libraryMasterList.songMap;
        this.artistMap = libraryMasterList.artistMap;
        this.groupMap = libraryMasterList.groupMap;

        this.combineLists();
    }

    async getLibraryMasterList() {
        if (!this.loaded) {
            const libraryMasterList = await this.fetchWithGM();

            this.animeMap = libraryMasterList.animeMap;
            this.songMap = libraryMasterList.songMap;
            this.artistMap = libraryMasterList.artistMap;
            this.groupMap = libraryMasterList.groupMap;

            globalObj[socketName]._socket.emit("command", {
                type: "library",
                command: "get anime status list",
            });
        } else {
            this.tempCallback();
            this.$view.removeClass("hide");
        }
    }

    combineLists() {
        this.allSongs = Object.values(this.animeMap).flatMap(anime => {
            const commonSongData = {
                annId: anime.annId,
                category: anime.category,
                year: anime.year,
                seasonId: anime.seasonId,
                names: anime.names,
                mainNames: anime.mainNames,
                animeStatus: anime.animeStatus
            };

            return ['OP', 'ED', 'INS'].flatMap(type =>
                anime.songLinks[type]
                    ? Object.values(anime.songLinks[type]).map(songLink => {
                        const songData = this.songMap[songLink.songId];
                        if (!songData) return null;

                        return {
                            ...commonSongData,
                            annSongId: songLink.annSongId,
                            songType: songLink.type,
                            songNumber: songLink.number,
                            playerStatus: songLink.playerStatus,
                            ...songData
                        };
                    }).filter(Boolean)
                    : []
            );
        });
    }

    handleFilterForm(e) {
        e.preventDefault();

        this.filterData = {
            search: e.target.search.value,
            sort: e.target.sort.value,
            op: e.target.op.checked,
            ed: e.target.ed.checked,
            insert: e.target.insert.checked,
            ptw: e.target.ptw.checked,
            watching: e.target.watching.checked,
            completed: e.target.completed.checked,
            onhold: e.target.onhold.checked,
            dropped: e.target.dropped.checked,
            other: e.target.other.checked,
            added: e.target.added.checked,
            notadded: e.target.notadded.checked,
        };

        this.renderSongList();
    }

    isInSong(dataArray, searchTerm) {
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].includes(searchTerm)) return true;
        }

        return false;
    }

    filterSongs(songsData) {
        const playerStatusList = JSON.parse(GM_getValue("playerStatusList", "[]"));

        return songsData.filter(song => {
            if (
                (!this.filterData.added && playerStatusList.includes(song.songId)) ||
                (!this.filterData.notadded && !playerStatusList.includes(song.songId))
            ) return false;

            if (this.filterData.search !== '') {
                const searchTerm = this.filterData.search.toLowerCase();
                const songName = song.name.toLowerCase();
                const animeNameJA = song.mainNames.JA?.toLowerCase() || '';
                const animeNameEN = song.mainNames.EN?.toLowerCase() || '';
                const animeNames = song.names ? song.names.map(animeName => animeName.name.toLowerCase()) : [];

                const songArtistGroup = song.songArtistId ? this.artistMap[song.songArtistId] : this.groupMap[song.songGroupId];
                const songArtistGroupName = songArtistGroup?.name?.toLowerCase() ?? '';
                const songArtistGroupArtistsNames = songArtistGroup?.artistMembers
                    ?.map(member => this.artistMap[member]?.name?.toLowerCase())
                    ?.filter(Boolean) || [];
                const songArtistGroupGroupsNames = songArtistGroup?.groupMembers
                    ?.map(member => this.groupMap[member]?.name?.toLowerCase())
                    ?.filter(Boolean) || [];

                const composerArtistGroup = song.composerArtistId ? this.artistMap[song.composerArtistId] : this.groupMap[song.composerGroupId];
                const composerArtistGroupName = composerArtistGroup?.name?.toLowerCase() ?? '';
                const composerArtistGroupArtistsNames = composerArtistGroup?.artistMembers
                    ?.map(member => this.artistMap[member]?.name?.toLowerCase())
                    ?.filter(Boolean) || [];
                const composerArtistGroupGroupsNames = composerArtistGroup?.groupMembers
                    ?.map(member => this.groupMap[member]?.name?.toLowerCase())
                    ?.filter(Boolean) || [];

                const arrangerArtistGroup = song.arrangerArtistId ? this.artistMap[song.arrangerArtistId] : this.groupMap[song.arrangerGroupId];
                const arrangerArtistGroupName = arrangerArtistGroup?.name?.toLowerCase() ?? '';
                const arrangerArtistGroupArtistsNames = arrangerArtistGroup?.artistMembers
                    ?.map(member => this.artistMap[member]?.name?.toLowerCase())
                    ?.filter(Boolean) || [];
                const arrangerArtistGroupGroupsNames = arrangerArtistGroup?.groupMembers
                    ?.map(member => this.groupMap[member]?.name?.toLowerCase())
                    ?.filter(Boolean) || [];

                if (!songName.includes(searchTerm) &&
                    !animeNameJA.includes(searchTerm) &&
                    !animeNameEN.includes(searchTerm) &&
                    !this.isInSong(animeNames, searchTerm) &&
                    !songArtistGroupName.includes(searchTerm) &&
                    !this.isInSong(songArtistGroupArtistsNames, searchTerm) &&
                    !this.isInSong(songArtistGroupGroupsNames, searchTerm) &&
                    !composerArtistGroupName.includes(searchTerm) &&
                    !this.isInSong(composerArtistGroupArtistsNames, searchTerm) &&
                    !this.isInSong(composerArtistGroupGroupsNames, searchTerm) &&
                    !arrangerArtistGroupName.includes(searchTerm) &&
                    !this.isInSong(arrangerArtistGroupArtistsNames, searchTerm) &&
                    !this.isInSong(arrangerArtistGroupGroupsNames, searchTerm)) {
                    return false;
                }
            }

            switch (song.animeStatus) {
                case 0: if (!this.filterData.other) return false; break;
                case 1: if (!this.filterData.watching) return false; break;
                case 2: if (!this.filterData.completed) return false; break;
                case 3: if (!this.filterData.onhold) return false; break;
                case 4: if (!this.filterData.dropped) return false; break;
                case 5: if (!this.filterData.ptw) return false; break;
                default: return false;
            }

            switch (song.songType) {
                case 1: if (!this.filterData.op) return false; break;
                case 2: if (!this.filterData.ed) return false; break;
                case 3: if (!this.filterData.insert) return false; break;
                default: return false;
            }

            return true;
        });
    }

    changePlayerStatus(el, id) {
        let playerStatusList = JSON.parse(GM_getValue("playerStatusList", "[]"));

        if (el.checked) playerStatusList.push(id)
        else playerStatusList = playerStatusList.filter(psl => psl !== id)

        GM_setValue("playerStatusList", JSON.stringify(playerStatusList));
    }

    setPage(pageIndex) {
        this.currentBatchIndex = pageIndex;

        this.renderBatch();
    }

    renderBatch() {
        const playerStatusList = JSON.parse(GM_getValue("playerStatusList", "[]"));

        const currentBatchIndexPlusBatchSize = this.currentBatchIndex + this.batchSize;

        const fragment = $(document.createDocumentFragment());
        const endIndex = Math.min(currentBatchIndexPlusBatchSize, this.sortedSongsData.length);

        const templateScript = $('#elNSLSongEntryTemplate');
        const templateHtml = templateScript.html();

        $('#newLibraryClusterId0').html('');

        const pagination = $('<div>');
        pagination.addClass('elNSLPagination');
        if (currentBatchIndexPlusBatchSize - this.batchSize > 0) {
            const prevPage = $('<button>');
            prevPage.addClass('elNSLPaginationChange')
            prevPage.attr('onclick', `viewChanger.__controllers.newSongLibrary.setPage(${this.currentBatchIndex - this.batchSize})`);
            prevPage.text(`Prev Page`)
            pagination.append(prevPage)
        }
        if (currentBatchIndexPlusBatchSize < this.sortedSongsData.length) {
            const nextPage = $('<button>');
            nextPage.addClass('elNSLPaginationChange')
            nextPage.attr('onclick', `viewChanger.__controllers.newSongLibrary.setPage(${this.currentBatchIndex + this.batchSize})`);
            nextPage.text(`Next Page`)
            pagination.append(nextPage)
        }

        pagination.clone().appendTo(fragment);

        for (let i = this.currentBatchIndex; i < endIndex; i++) {
            const song = this.sortedSongsData[i];

            const animeName = song.mainNames.JA
                ? song.mainNames.EN && song.mainNames.JA !== song.mainNames.EN
                    ? `<div class="elNSLSongAnimeNameMain">${song.mainNames.JA} <span class="elNSLSongAnimeNameSecond">${song.mainNames.EN}</span></div>`
                    : `<div class="elNSLSongAnimeNameMain">${song.mainNames.JA}</div>`
                : `<div class="elNSLSongAnimeNameMain">${song.mainNames.EN}</div>` || '';

            const songArtist = song.songArtistId
                ? this.artistMap[song.songArtistId]
                : this.groupMap[song.songGroupId];

            let songType;
            let songTypeFull = song.songNumber == 0 ? '' : song.songNumber;
            if (song.rebroadcast) songTypeFull += ' R';
            if (song.dub) songTypeFull += ' D';
            switch (song.songType) {
                case 1: songType = `<div class="elNSLSongType elNSLSongTypeOP">OP ${songTypeFull}</div>`; break;
                case 2: songType = `<div class="elNSLSongType elNSLSongTypeOP">ED ${songTypeFull}</div>`; break;
                default: songType = `<div class="elNSLSongType elNSLSongTypeOP">INS ${songTypeFull}</div>`;
            }

            const songCheckbox = `<input type="checkbox" onchange="viewChanger.__controllers.newSongLibrary.changePlayerStatus(this, ${song.songId})" class="elNSLPlayerStatusCheckbox" ${playerStatusList.includes(song.songId) && 'checked'} />`;
            let animeStatus;
            switch (song.animeStatus) {
                case 0: animeStatus = `<div class="elNSLAnimeStatus elNSLAnimeStatusOther">- ${songCheckbox}</div>`; break;
                case 1: animeStatus = `<div class="elNSLAnimeStatus elNSLAnimeStatusWatching">W ${songCheckbox}</div>`; break;
                case 2: animeStatus = `<div class="elNSLAnimeStatus elNSLAnimeStatusCompleted">C ${songCheckbox}</div>`; break;
                case 3: animeStatus = `<div class="elNSLAnimeStatus elNSLAnimeStatusOn-Hold">O ${songCheckbox}</div>`; break;
                case 4: animeStatus = `<div class="elNSLAnimeStatus elNSLAnimeStatusDropped">D ${songCheckbox}</div>`; break;
                case 5: animeStatus = `<div class="elNSLAnimeStatus elNSLAnimeStatusPTW">P ${songCheckbox}</div>`; break;
                default: animeStatus = `<div class="elNSLAnimeStatus elNSLAnimeStatusUnknown">- ${songCheckbox}</div>`;
            }

            const playerStatus = song.playerStatus == 1 ? 'Like' : song.playerStatus == 2 ? 'Dislike' : ''

            fragment.append(templateHtml
                .replace(/\{animeName\}/g, animeName)
                .replace(/\{songName\}/g, song.name)
                .replace(/\{songArtist\}/g, songArtist?.name || '')
                .replace(/\{songType\}/g, songType)
                .replace(/\{animeStatus\}/g, animeStatus)
                .replace(/\{playerStatus\}/g, playerStatus)
                .replace(/\{songId\}/g, song.songId)
                .replace(/\{songIndex\}/g, i));
        }

        pagination.clone().appendTo(fragment);

        $('#newLibraryClusterId0').append(fragment);

        this.audioPlayer.checkPlayingSong();

        this.currentBatchIndex = endIndex;
    }

    renderSongList() {
        this.sortedSongsData = (this.filterSongs(this.allSongs)).sort((a, b) => {
            switch (this.filterData.sort) {
                case 'idasc': return a.annId - b.annId || a.type - b.type || a.number - b.number; break;
                case 'iddesc': return b.annId - a.annId || a.type - b.type || a.number - b.number; break;
                case 'namedesc': return -((a.mainNames.JA || a.mainNames.EN || "").localeCompare(b.mainNames.JA || b.mainNames.EN || "")); break;
                default: return (a.mainNames.JA || a.mainNames.EN || "").localeCompare(b.mainNames.JA || b.mainNames.EN || "");
            }
        });

        this.audioPlayer.setPlaylist(this.sortedSongsData);

        this.currentBatchIndex = 0;
        this.currentPageIndex = 0;

        this.renderBatch()

        const songsCount = this.sortedSongsData.length;
        $('#elNSLSongsCount').html(songsCount)

        if (!this.loaded) {
            this.tempCallback();
            this.$view.removeClass("hide");

            this.loaded = true;
        }
    }

    updateModal(index, songData) {
        const song = this.sortedSongsData[index];

        const animeName = song.mainNames.JA
            ? song.mainNames.EN && song.mainNames.JA !== song.mainNames.EN
                ? `<div class="elNSLModalSongAnimeNameMain">${song.mainNames.JA} <span class="elNSLModalSongAnimeNameSecond">${song.mainNames.EN}</span></div>`
                : `<div class="elNSLModalSongAnimeNameMain">${song.mainNames.JA}</div>`
            : `<div class="elNSLModalSongAnimeNameMain">${song.mainNames.EN}</div>` || '';

        const songArtist = song.songArtistId
            ? this.artistMap[song.songArtistId].name
            : this.groupMap[song.songGroupId].name;

        let songType;
        let songTypeFull = song.songNumber == 0 ? '' : song.songNumber;
        if (song.rebroadcast) songTypeFull += ' R';
        if (song.dub) songTypeFull += ' D';
        switch (song.songType) {
            case 1: songType = `<div class="elNSLModalSongType">Opening ${songTypeFull}</div>`; break;
            case 2: songType = `<div class="elNSLModalSongType">Ending ${songTypeFull}</div>`; break;
            default: songType = `<div class="elNSLModalSongType">Insert ${songTypeFull}</div>`;
        }

        const videoSrc = '720' in songData.fileNameMap ? songData.fileNameMap['720'] : '480' in songData.fileNameMap ? songData.fileNameMap['480'] : null;

        $('#elNSLModalVideo')[0].src = `https://naedist.animemusicquiz.com/${videoSrc}`;
        $('#elNSLModalSongNameArtist').html(`<div class="elNSLModalSongNameArtist">${song.name} - ${songArtist}</div>`)
        $('#elNSLModalSongAnime').html(animeName)
        $('#elNSLModalSongType').html(songType)
        $('#elNSLModalVideoPrevButton').attr('onclick', `viewChanger.__controllers.newSongLibrary.setIndexModal(${index - 1})`)
        $('#elNSLModalVideoNextButton').attr('onclick', `viewChanger.__controllers.newSongLibrary.setIndexModal(${index + 1})`)
    }

    showModal(index) {
        const annSongId = this.sortedSongsData[index].annSongId;

        globalObj[socketName]._socket.emit("command", {
            type: "library",
            command: "get song extended info",
            data: {
                annSongId,
                includeFileNames: true
            },
        });

        $('#elNSLModal').modal("show");
    }

    setIndexModal(index) {
        const annSongId = this.sortedSongsData[index].annSongId;

        globalObj[socketName]._socket.emit("command", {
            type: "library",
            command: "get song extended info",
            data: {
                annSongId,
                includeFileNames: true
            },
        });
    }

    answerHandle(event) {
        const { annId, songName, artistInfo } = event.songInfo;

        const songArtistGroupId = 'artistId' in artistInfo ? artistInfo.artistId : artistInfo.groupId;

        const eventSongIndex = this.allSongs.findIndex(item => {
            const itemArtistId = item.songArtistId !== null ? item.songArtistId : item.songGroupId;

            return item.annId == annId &&
                songArtistGroupId == itemArtistId &&
                item.name == songName;
        });
        const eventSongId = this.allSongs[eventSongIndex].songId;

        const playerStatusList = JSON.parse(GM_getValue("playerStatusList", "[]"));

        function checkForElement() {
            const $element = $('#qpSongType');
            if ($element.length) {
                $('#qpSongType').append(`<div>Saved <input type="checkbox" onchange="viewChanger.__controllers.newSongLibrary.changePlayerStatus(this, ${eventSongId})" class="elNSLPlayerStatusCheckbox" ${playerStatusList.includes(eventSongId) && 'checked'} /></div>`)
                
                clearInterval(intervalId);
            }
        }

        const intervalId = setInterval(checkForElement, 100);
    }

    openView(callback) {
        this.tempCallback = callback;
        this.active = true;

        this.originalHandler = globalObj[socketName]._socket.listeners("command")[0];

        this.listners = [];
        this.listners.push(
            globalObj[socketName].listners['get anime status list'][0],
            globalObj[socketName].listners['get player status list'][0]
        )
        this.listners.forEach(listener => listener.unbindListener())

        this.getLibraryMasterList();
    }

    closeView() {
        this.$view.addClass("hide");

        this.audioPlayer.audio.pause();
        this.active = false;

        this.listners.forEach(listener => listener.bindListener())
        this.listners = [];
    }
}

function setupNewSongLibrary() {
    // const newSongLibrary = new NewSongLibrary();
    // newSongLibrary.setup();

    // globalObj[viewChangerName].__controllers.newSongLibrary = newSongLibrary;

    const newSongLibrary = new NewSongLibrary();

    globalObj[viewChangerName].__controllers.newSongLibrary = newSongLibrary;
    globalObj[viewChangerName].__controllers.newSongLibrary.setup()

    new Listener('answer results', (e) => globalObj[viewChangerName].__controllers.newSongLibrary.answerHandle(e)).bindListener();
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
    setupNewSongLibrary();
});