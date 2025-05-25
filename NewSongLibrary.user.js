// ==UserScript==
// @name         New Song Library
// @version      0.7.5
// @description  description
// @author       Kaomaru
// @match        https://animemusicquiz.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @updateURL    https://github.com/Leleath/as_scripts/raw/refs/heads/main/NewSongLibrary.user.js
// @downloadURL  https://github.com/Leleath/as_scripts/raw/refs/heads/main/NewSongLibrary.user.js
// ==/UserScript==

'use strict';

const $ = unsafeWindow.jQuery || window.jQuery;

GM_addStyle(`
    @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css");

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
        grid-template-columns: 42px 1fr 30px;
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
    .elNSLSongPlay {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .elNSLSongPlayButton:hover {
        cursor:pointer;
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
    .elNSLAudioPlayerSongName {
        color: #fff;
        font-size: 14px;
        margin-bottom: 4px;
        font-weight: 600;
    }
    .elNSLAudioPlayerSongArtist {
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
                <h2>New Song Library</h2>
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
                </div>
                <div class="elEntryContainerInner elNSLEntryContainerInner" id="newLibraryClusterId0"></div>
            </div>

            <div class="elNSLAudioPlayer">
                <div class="elNSLAudioPlayerSongInfo">
                    <div class="elNSLAudioPlayerSongDetails">
                        <div class="elNSLAudioPlayerSongName">No track selected</div>
                        <div class="elNSLAudioPlayerSongArtist"></div>
                    </div>
                </div>

                <div class="elNSLAudioPlayerControls">
                    <div class="elNSLAudioPlayerControlButtons">
                        <button class="elNSLAudioPlayerControlBtn elNSLAudioPlayerPrevBtn" title="Previous">
                            <i class="fa-solid fa-backward-step"></i>
                        </button>
                        <button class="elNSLAudioPlayerControlBtn elNSLAudioPlayerPlayBtn" title="Play">
                            <i class="fa-solid fa-play"></i>
                        </button>
                        <button class="elNSLAudioPlayerControlBtn elNSLAudioPlayerNextBtn" title="Next">
                            <i class="fa-solid fa-forward-step"></i>
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
                        <a class="elNSLAudioPlayerVolumeIcon"><i class="fa-solid fa-volume-high"></i></a>
                        <div class="elNSLAudioPlayerVolumeBar">
                            <div class="elNSLAudioPlayerVolumeProgress"></div>
                        </div>
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

                    <div class="elNSLSongPlay">
                        <a class="elNSLSongPlayButton" onclick="viewChanger.__controllers.newSongLibrary.audioPlayer.loadSong({songIndex})"><i class="fa-solid fa-play"></i></a>
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

        this.$songNameElement = this.$playerElement.find('.elNSLAudioPlayerSongName');
        this.$songArtistElement = this.$playerElement.find('.elNSLAudioPlayerSongArtist');
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
            $(`[data-song-id="${this.playlist[this.currentTrackIndex].songId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<i class="fa-solid fa-pause"></i>');
        }
    }

    loadSong(index) {
        if (this.currentTrackIndex == index && this.isPlaying) {
            this.togglePlay();

            return;
        }

        const annSongId = this.playlist[index].annSongId;

        unsafeWindow[socketName]._socket.emit("command", {
            type: "library",
            command: "get song extended info",
            data: {
                annSongId,
                includeFileNames: true
            },
        });
    }

    loadTrack(index, songArtist, audio) {
        $('.elNSLSongEntryPlaying').each((index, element) => {
            $(element).removeClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<i class="fa-solid fa-play"></i>');
        });

        if (index < 0 || index >= this.playlist.length) return;

        this.currentTrackIndex = index;
        const track = this.playlist[index];

        this.$songNameElement.text(track.name);
        this.$songArtistElement.text(songArtist);

        this.audio.src = `https://naedist.animemusicquiz.com/${audio}`;

        this.$durationElement.text(this.formatTime(this.audio.duration));

        if (!this.isPlaying) {
            this.togglePlay();
        } else {
            this.audio.play()
                .then(() => {
                    this.setPlayButtonIcon(true);
                    $(`[data-song-id="${this.playlist[this.currentTrackIndex].songId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<i class="fa-solid fa-pause"></i>');
                })
        }
    }

    setPlayButtonIcon(isPlaying) {
        if (isPlaying) {
            this.$playBtn.html('<i class="fa-solid fa-pause"></i>');
        } else {
            this.$playBtn.html('<i class="fa-solid fa-play"></i>');
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
            this.setPlayButtonIcon(false);
            $(`[data-song-id="${this.playlist[this.currentTrackIndex].songId}"]`).removeClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<i class="fa-solid fa-play"></i>');
        } else {
            this.audio.play()
                .then(() => {
                    this.setPlayButtonIcon(true);
                    $(`[data-song-id="${this.playlist[this.currentTrackIndex].songId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<i class="fa-solid fa-pause"></i>');
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
        else this.$volumeBtn.html(this.audio.volume < 0.5 ? '<i class="fa-solid fa-volume-low"></i>' : '<i class="fa-solid fa-volume-high"></i>');

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
            this.$volumeBtn.html('<i class="fa-solid fa-volume-xmark"></i>');
        } else {
            this.audio.volume = this.lastVolume || 0.7;
            this.$volumeContainer.width(`${this.volume * 100}%`);
            this.$volumeBtn.html(this.audio.volume < 0.5 ? '<i class="fa-solid fa-volume-low"></i>' : '<i class="fa-solid fa-volume-high"></i>');
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
        this.currentBatchIndex = 0;
        this.batchSize = 50;
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

        // this.originalHandler = unsafeWindow[socketName]._socket.listeners("command")[0];

        // // unsafeWindow[socketName]._socket.addEventListener("command", this.handleSocketCommand);

        // unsafeWindow[socketName]._socket.on("command", this.handleSocketCommand);
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

                this.audioPlayer.loadTrack(index, songArtist, song.fileName);
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

                unsafeWindow[socketName]._socket.emit("command", {
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

                this.combineLists();
            }
        } else {
            // this.originalHandler(event);
            console.log('handle')
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

    async getLibraryMasterList() {
        if (!this.loaded) {
            const libraryMasterList = await this.fetchWithGM();

            this.animeMap = libraryMasterList.animeMap;
            this.songMap = libraryMasterList.songMap;
            this.artistMap = libraryMasterList.artistMap;
            this.groupMap = libraryMasterList.groupMap;

            unsafeWindow[socketName]._socket.emit("command", {
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

        this.renderSongList();
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

    filterSongs(songsData) {
        const playerStatusList = JSON.parse(localStorage.getItem('playerStatusList')) || [];

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

                const songArtistName = song.songArtistId ? this.artistMap[song.songArtistId].name.toLowerCase() : '';
                const songGroupName = song.songGroupId ? this.groupMap[song.songGroupId].name.toLowerCase() : '';

                const composerArtistName = song.composerArtistId ? this.artistMap[song.composerArtistId].name.toLowerCase() : '';
                const composerGroupName = song.composerGroupId ? this.groupMap[song.composerGroupId].name.toLowerCase() : '';

                const arrangerArtistName = song.arrangerArtistId ? this.artistMap[song.arrangerArtistId].name.toLowerCase() : '';
                const arrangerGroupName = song.arrangerGroupId ? this.groupMap[song.arrangerGroupId].name.toLowerCase() : '';

                if (!songName.includes(searchTerm) &&
                    !animeNameJA.includes(searchTerm) &&
                    !animeNameEN.includes(searchTerm) &&
                    !songArtistName.includes(searchTerm) &&
                    !songGroupName.includes(searchTerm) &&
                    !composerArtistName.includes(searchTerm) &&
                    !composerGroupName.includes(searchTerm) &&
                    !arrangerArtistName.includes(searchTerm) &&
                    !arrangerGroupName.includes(searchTerm)) {
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
        let playerStatusList = JSON.parse(localStorage.getItem('playerStatusList')) || [];

        if (el.checked) playerStatusList.push(id)
        else playerStatusList = playerStatusList.filter(psl => psl !== id)

        localStorage.setItem('playerStatusList', JSON.stringify(playerStatusList))
    }

    renderBatch() {
        const playerStatusList = JSON.parse(localStorage.getItem('playerStatusList')) || [];

        const currentBatchIndexPlusBatchSize = this.currentBatchIndex + this.batchSize;

        const fragment = $(document.createDocumentFragment());
        const endIndex = Math.min(currentBatchIndexPlusBatchSize, this.sortedSongsData.length);

        const templateScript = $('#elNSLSongEntryTemplate');
        const templateHtml = templateScript.html();

        $('#elNSLShowMore').remove();

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
            switch (song.songType) {
                case 1: songType = `<div class="elNSLSongType elNSLSongTypeOP">OP ${song.songNumber}</div>`; break;
                case 2: songType = `<div class="elNSLSongType elNSLSongTypeOP">ED ${song.songNumber}</div>`; break;
                default: songType = `<div class="elNSLSongType elNSLSongTypeOP">INS</div>`;
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
                default: animeStatus = `<div class="elNSLAnimeStatus elNSLAnimeStatusUnknown">U ${songCheckbox}</div>`;
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

        if (this.currentBatchIndex < this.sortedSongsData.length) {
            const showMoreTemplateScript = $('#elNSLSongShowMoreTemplate');
            const showMoreTemplateHtml = showMoreTemplateScript.html();
            fragment.append(showMoreTemplateHtml);
        }

        $('#newLibraryClusterId0').append(fragment);

        this.audioPlayer.checkPlayingSong();

        this.currentBatchIndex = endIndex;
    }

    renderSongList() {
        $('#newLibraryClusterId0').html('');

        this.sortedSongsData = (this.filterSongs(this.allSongs)).sort((a, b) => {
            switch (this.filterData.sort) {
                case 'idasc': return a.annId - b.annId || a.type - b.type || a.number - b.number; break;
                case 'iddesc': return b.annId - a.annId || a.type - b.type || a.number - b.number; break;
                case 'namedesc': return -((a.mainNames.JA || a.mainNames.EN || "").localeCompare(b.mainNames.JA || b.mainNames.EN || "")); break;
                default: return (a.mainNames.JA || a.mainNames.EN || "").localeCompare(b.mainNames.JA || b.mainNames.EN || ""); // asc
            }
        });

        this.audioPlayer.setPlaylist(this.sortedSongsData);

        this.currentBatchIndex = 0;

        this.renderBatch()

        if (!this.loaded) {
            this.tempCallback();
            this.$view.removeClass("hide");

            this.loaded = true;
        }
    }

    openView(callback) {
        this.tempCallback = callback;
        this.active = true;

        this.originalHandler = unsafeWindow[socketName]._socket.listeners("command")[0];

        unsafeWindow[socketName]._socket.off('command');
        unsafeWindow[socketName]._socket.on("command", this.handleSocketCommand);

        this.getLibraryMasterList();
    }

    closeView() {
        this.$view.addClass("hide");

        this.audioPlayer.audio.pause();
        this.active = false;

        unsafeWindow[socketName]._socket.off('command');
        unsafeWindow[socketName]._socket.on("command", this.originalHandler);
    }
}

function setupNewSongLibrary() {
    const newSongLibrary = new NewSongLibrary();
    newSongLibrary.setup();

    unsafeWindow[viewChangerName].__controllers.newSongLibrary = newSongLibrary;
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