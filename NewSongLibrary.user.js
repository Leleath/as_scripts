// ==UserScript==
// @name         New Song Library
// @version      0.13
// @description  description
// @author       Kaomaru
// @match        https://animemusicquiz.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @connect      github.com
// @connect      githubusercontent.com
// @connect      raw.githubusercontent.com
// @connect      objects.githubusercontent.com
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @updateURL    https://github.com/Leleath/as_scripts/raw/refs/heads/main/NewSongLibrary.user.js
// @downloadURL  https://github.com/Leleath/as_scripts/raw/refs/heads/main/NewSongLibrary.user.js
// ==/UserScript==

const version = '0.13';

GM_addStyle(`
    .svg-icon { width: 1em; height: 1em; vertical-align: -0.125em; fill: white; }
    .svg-icon-black { fill: black; }
    .elNSLMain { position: absolute; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.8); z-index: 100; }
    .elNSLMainContainer { max-width: 1200px; position: relative; z-index: 1000; padding-bottom: 50px; }
    .elNSLHeaderContainer { background-color: #1b1b1bd6; width: 100%; padding: 16px; }
    .elNSLHeaderContainer h2 { font-size: 36px; text-align: center; margin: 0 !important; }
    .elNSLEntryContainer { display: flex; flex-direction: row; box-shadow: none !important; }
    .elNSLEntryContainerInner { padding: 16px !important; mask: 16px !important; }
    .elNSLFilterContainer { flex-basis: 400px; }
    .elNSLFormFilter { color: white; }
    .elNSLFormGroup { margin-bottom: 16px; background-color: #1b1b1b; border-radius: 4px; box-shadow: 0 0px 5px 1px rgb(0, 0, 0); padding: 0px 8px 8px 8px; position: relative; }
    .elNSLFormGroupFlex { display: grid; grid-template-columns: 1fr auto; }
    .searchPartialMatch { height: 100%; aspect-ratio: 1; margin: 0 !important; }
    .elNSLFormGroupLegend { text-align: center; font-size: 16px; position: absolute; left: 50%; transform: translate(-50%, -50%); color: #5cb85c; font-weight: 600; text-shadow: 0 0 8px black; }
    .elNSLFormGroupLabel { margin: 0 !important; }
    .elNSLFormGroupInput { margin: 0 !important; }
    .elNSLFormGroupMarginBottom { margin-bottom: 8px; }
    .elNSLFormSearchInput { border-radius: 4px 0px 0px 4px !important; }
    .elNSLFormSearch { color: black; flex-grow: 1; border: none; border-radius: 4px; padding: 4px; }
    .elNSLFormSelect { color: black; width: 100%; border: none; border-radius: 4px; padding: 4px; }
    .elNSLFormSubmit { width: 100%; color: white; text-shadow: 0px 0px 8px black; background: #5cb85c; border: none; border-radius: 4px; font-weight: 600; }
    .elNSLSongTypeOP { font-weight: 600; color: #198754; }
    .elNSLSongTypeED { font-weight: 600; color: #6f42c1; }
    .elNSLSongTypeINS { font-weight: 600; color: #dc3545; }
    .elNSLAnimeStatusP { font-weight: 600; color: #0d6efd; }
    .elNSLAnimeStatusW { font-weight: 600; color: #0dcaf0; }
    .elNSLAnimeStatusC { font-weight: 600; color: #198754; }
    .elNSLAnimeStatusH { font-weight: 600; color: #ffc107; }
    .elNSLAnimeStatusD { font-weight: 600; color: #dc3545; }
    .elNSLAnimeStatusU { font-weight: 600; color: #6c757d; }
    .elNSLPagination { text-align: center; }
    .elNSLPagination:last-child { margin-top: 8px; }
    .elNSLPaginationChange { color: white; padding: 8px; background-color: #1b1b1b; border-radius: 4px; border: none; }
    .elNSLPaginationChange:first-child { margin-right: 8px; }
    .elNSLPaginationChange:only-child { margin-right: 0px; }
    .paginationPage { display: inline-block; width: 100px; }
    .alignCenter { text-align: center; }
    .elNSLSongEntry { margin-top: 8px !important; padding: 8px !important; }
    .elNSLSongEntry:first-child { margin-top: 0 !important; padding: 8px !important; }
    .elNSLSongEntryPlaying { margin-left: 8px; margin-right: -8px; }
    .elNSLSongShowMore { width: 100%; padding: 16px; text-align: center; }
    .elNSLSongShowMoreButton:hover { cursor: pointer; }
    .elNSLSongRow { display: grid; grid-template-columns: 55px 1fr 35px 30px 30px; gap: 4px; }
    .elNSLFormCheckboxGroup { padding-top: 12px; }
    .elNSLFormCheckboxGroupHalf { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
    .elNSLSongAnimeNameMain { font-size: 18px; }
    .elNSLSongAnimeNameMain a { font-size: 12px; }
    .elNSLSongAnimeNameSecond { color: gray; font-size: 14px; }
    .elNSLPaginationChange:disabled { color: #cecece; background-color: #545454; }
    .elNSLSongTypeAnimeStatusRow { display: flex; flex-direction: column; justify-content: space-between; }
    .elNSLAnimeStatus { }
    .elNSLSongType { display: flex; align-items: center; }
    .elNSLSongTypeOP { }
    .elNSLSongTypeED { }
    .elNSLSongTypeINS { }
    .elNSLSongType p { margin: 0 !important; }
    .elNSLSongName { font-size: 14px; }
    .elNSLSongArtist { color: lightgray; }
    .elNSLSongInfo { display: flex; justify-content: center; align-items: center; }
    .elNSLSongInfoButton:hover { cursor:pointer; }
    .songRateSelect { display: flex; justify-content: center; align-items: center; color: black; appearance: none; }
    .elNSLSongPlay { display: flex; justify-content: center; align-items: center; }
    .elNSLSongPlayButton:hover { cursor:pointer; }
    .elNSLModalVideo { width: 100%; }
    .elNSLModalButtonsRow { display: flex; width: 100%; justify-content: space-between; margin-bottom: 4px; }
    .elNSLModalVideoPrevButton svg, .elNSLModalVideoNextButton svg { width: 2em; height: 2em; }
    .elEntryContainerHead { font-size: 24px; margin-bottom: 6px; }
    .elNSLModalSongAnimeNameSecond { font-size: 1em; color: darkgray; }
    .elNSLModalSongType { font-size: 0.6em; color: darkgray; }
    .elNSLModalSongAnimePanel { margin-bottom: 6px; }
    .elNSLModalSongAnimePanelTable { width: 100%; table-layout: fixed; border-radius: 4px }
    .elNSLModalSongAnimePanelTable tr th { padding: 4px; text-align: center; background-color: #282828; }
    .elNSLModalSongAnimePanelTable tr td { padding: 4px; text-align: center; }
    .elNSLModalSongName { font-size: 1.2em; }
    .elNSLModalSongArtistTitle { font-size: 1.2em; }
    .elNSLModalSongNamePanel { margin-bottom: 6px; }
    .elNSLModalSongComposerTitle { font-size: 1.2em; }
    .elNSLModalSongArrangerTitle { font-size: 1.2em; margin-bottom: 6px; }
    .elNSLModalSongDifficultyTitle { font-size: 1.2em; margin-bottom: 6px; }
    .elNSLAudioPlayer { width: 100%; height: 80px; background: #181818; border-top: 1px solid #282828; display: flex; justify-content: space-between; padding: 8px 16px; font-family: 'Circular', Helvetica, Arial, sans-serif; }
    .elNSLAudioPlayerSongInfo { display: flex; align-items: center; width: 30%; min-width: 180px; }
    .elNSLAudioPlayerSongDetails { display: flex; flex-direction: column; }
    .elNSLAudioPlayerSongInfoFirst { color: #fff; font-size: 14px; margin-bottom: 4px; font-weight: 600; }
    .elNSLAudioPlayerSongInfoSecond { color: #b3b3b3; font-size: 12px; }
    .elNSLAudioPlayerControls { display: flex; flex-direction: column; align-items: center; width: 40%; max-width: 722px; }
    .elNSLAudioPlayerControlButtons { display: flex; align-items: center; margin-bottom: 8px; }
    .elNSLAudioPlayerControlBtn { background: none; border: none; color: #b3b3b3; font-size: 16px; margin: 0 8px; cursor: pointer; transition: color 0.2s; }
    .elNSLAudioPlayerControlBtn:hover { color: #fff; }
    .elNSLAudioPlayerPlayBtn { background: #fff; color: #000; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; }
    .elNSLAudioPlayerPlayBtn:hover { transform: scale(1.05); }
    .elNSLAudioPlayerRepeatBtn { background: #fff; color: #000; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; }
    .elNSLAudioPlayerRepeatBtn:hover { transform: scale(1.05); }
    .elNSLAudioPlayerProgressContainer { width: 100%; display: flex; align-items: center; }
    .elNSLAudioPlayerProgressTime { color: #a7a7a7; font-size: 11px; width: 40px; text-align: center; }
    .elNSLAudioPlayerProgressBar { flex-grow: 1; height: 4px; background: #535353; border-radius: 2px; cursor: pointer; position: relative; }
    .elNSLAudioPlayerProgress { height: 100%; background: #1db954; border-radius: 2px; width: 0%; }
    .elNSLAudioPlayerExtraControls { display: flex; align-items: center; width: 30%; justify-content: flex-end; }
    .elNSLAudioPlayerVolumeContainer { display: flex; align-items: center; width: 120px; }
    .elNSLAudioPlayerVolumeIcon { color: #b3b3b3; margin-right: 8px; font-size: 16px; cursor: pointer; }
    .elNSLAudioPlayerVolumeBar { height: 4px; background: #535353; border-radius: 2px; flex-grow: 1; cursor: pointer; }
    .elNSLAudioPlayerVolumeProgress { height: 100%; background: #b3b3b3; border-radius: 2px; width: 70%; }
` );

const htmlContent = `
    <div class="elNSLMain hidden">
        <div class="elMainContainer elNSLMainContainer">
            <div class="elNSLHeaderContainer"><h2>New Song Library ${version}</h2></div>
            <div class="elEntryContainer elNSLEntryContainer">
                <div class="elEntryContainerInner elNSLEntryContainerInner elNSLFilterContainer">
                    <form id="elNSLFilterForm" class="elNSLFormFilter">
                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Stats</div>
                            <div class="elNSLFormCheckboxGroup elNSLFormCheckboxGroupHalf">
                                <div>Animes: <span id="elNSLAnimesCount"></span></div>
                                <div>Songs: <span id="elNSLSongsCount"></span></div>
                            </div>
                        </div>
                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Search</div>
                            <div class="elNSLFormCheckboxGroup">
                                <div class="elNSLFormGroupFlex elNSLFormGroupMarginBottom">
                                    <input class="elNSLFormSearch elNSLFormSearchInput" type="text" id="search" name="search" placeholder="Type...">
                                    <input type="checkbox" name="searchPartialMatch" id="searchPartialMatch" class="searchPartialMatch elNSLFormSearchCheckbox" checked>
                                </div>
                                <div class="elNSLFormCheckboxGroupHalf">
                                    <select id="searchSelect" name="searchSelect" class="elNSLFormSelect">
                                        <option value="searchAll" selected>All</option>
                                        <option value="searchAnime">Anime</option>
                                        <option value="searchSong">Name</option>
                                        <option value="searchArtist">Artist</option>
                                        <option value="searchComposer">Composer</option>
                                        <option value="searchArranger">Arranger</option>
                                    </select>
                                    <select id="sort" name="sort" class="elNSLFormSelect">
                                        <option value="nameasc">Name Asc</option>
                                        <option value="namedesc">Name Desc</option>
                                        <option value="idasc" selected>annId Asc</option>
                                        <option value="iddesc">annId Desc</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Anime Status</div>
                            <div class="elNSLFormCheckboxGroup elNSLFormCheckboxGroupHalf">
                                <div>
                                    <div>
                                        <input type="checkbox" name="ptw" id="ptw" class="elNSLFormGroupInput">
                                        <label for="ptw" class="elNSLFormGroupLabel">Plan to Watch</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="watching" id="watching" class="elNSLFormGroupInput" checked>
                                        <label for="watching" class="elNSLFormGroupLabel">Watching</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="completed" id="completed" class="elNSLFormGroupInput" checked>
                                        <label for="completed" class="elNSLFormGroupLabel">Completed</label>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <input type="checkbox" name="onhold" id="onhold" class="elNSLFormGroupInput">
                                        <label for="onhold" class="elNSLFormGroupLabel">On Hold</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="dropped" id="dropped" class="elNSLFormGroupInput">
                                        <label for="dropped" class="elNSLFormGroupLabel">Dropped</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="other" id="other" class="elNSLFormGroupInput">
                                        <label for="other" class="elNSLFormGroupLabel">Other</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Anime Type</div>
                            <div class="elNSLFormCheckboxGroup elNSLFormCheckboxGroupHalf">
                                <div>
                                    <div>
                                        <input type="checkbox" name="tv" id="tv" class="elNSLFormGroupInput" checked>
                                        <label for="tv" class="elNSLFormGroupLabel">TV</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="movie" id="movie" class="elNSLFormGroupInput" checked>
                                        <label for="movie" class="elNSLFormGroupLabel">Movie</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="special" id="special" class="elNSLFormGroupInput" checked>
                                        <label for="special" class="elNSLFormGroupLabel">Special</label>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <input type="checkbox" name="ova" id="ova" class="elNSLFormGroupInput" checked>
                                        <label for="ova" class="elNSLFormGroupLabel">OVA</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="ona" id="ona" class="elNSLFormGroupInput" checked>
                                        <label for="ona" class="elNSLFormGroupLabel">ONA</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="typeOther" id="typeOther" class="elNSLFormGroupInput" checked>
                                        <label for="typeOther" class="elNSLFormGroupLabel">Other</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Anime Year</div>
                            <div class="elNSLFormCheckboxGroup elNSLFormCheckboxGroupHalf">
                                <div>
                                    From <input type="number" value="1900" min="1900" max="2025" class="elNSLFormSearch" name="yearFrom" id="yearFrom">
                                </div>
                                <div>
                                    To <input type="number" value="2025" min="1900" max="2025"  class="elNSLFormSearch" name="yearTo" id="yearTo">
                                </div>
                            </div>
                        </div>
                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Song Type</div>
                            <div class="elNSLFormCheckboxGroup elNSLFormCheckboxGroupHalf">
                                <div>
                                    <div>
                                        <input type="checkbox" name="op" id="op" class="elNSLFormGroupInput" checked>
                                        <label for="op" class="elNSLFormGroupLabel">Opening</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="ed" id="ed" class="elNSLFormGroupInput" checked>
                                        <label for="ed" class="elNSLFormGroupLabel">Ending</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="insert" id="insert" class="elNSLFormGroupInput" checked>
                                        <label for="insert" class="elNSLFormGroupLabel">Insert</label>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <input type="checkbox" name="rebroadcast" id="rebroadcast" class="elNSLFormGroupInput">
                                        <label for="rebroadcast" class="elNSLFormGroupLabel">Rebroadcast</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="dub" id="dub" class="elNSLFormGroupInput">
                                        <label for="dub" class="elNSLFormGroupLabel">Dub</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Song Category</div>
                            <div class="elNSLFormCheckboxGroup elNSLFormCheckboxGroupHalf">
                                <div>
                                    <div>
                                        <input type="checkbox" name="standard" id="standard" class="elNSLFormGroupInput" checked>
                                        <label for="standard" class="elNSLFormGroupLabel">Standard</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="instrumental" id="instrumental" class="elNSLFormGroupInput" checked>
                                        <label for="instrumental" class="elNSLFormGroupLabel">Instrumental</label>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <input type="checkbox" name="chanting" id="chanting" class="elNSLFormGroupInput" checked>
                                        <label for="chanting" class="elNSLFormGroupLabel">Chanting</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="character" id="character" class="elNSLFormGroupInput" checked>
                                        <label for="character" class="elNSLFormGroupLabel">Character</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Player Status</div>
                            <div class="elNSLFormCheckboxGroup elNSLFormCheckboxGroupHalf">
                                <div>
                                    <input type="checkbox" name="added" id="added" class="elNSLFormGroupInput" checked>
                                    <label for="added" class="elNSLFormGroupLabel">Added</label>
                                </div>
                                <div>
                                    <input type="checkbox" name="notadded" id="notadded" class="elNSLFormGroupInput" checked>
                                    <label for="notadded" class="elNSLFormGroupLabel">Not Added</label>
                                </div>
                            </div>
                        </div>
                        <div class="elNSLFormGroup">
                            <div class="elNSLFormGroupLegend">Player Status</div>
                            <div class="elNSLFormCheckboxGroup elNSLFormCheckboxGroupHalf">
                                <div>
                                    <div>
                                        <input type="checkbox" name="like" id="like" class="elNSLFormGroupInput" checked>
                                        <label for="like" class="elNSLFormGroupLabel">Like</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" name="dislike" id="dislike" class="elNSLFormGroupInput" checked>
                                        <label for="dislike" class="elNSLFormGroupLabel">Dislike</label>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <input type="checkbox" name="unrated" id="unrated" class="elNSLFormGroupInput" checked>
                                        <label for="unrated" class="elNSLFormGroupLabel">Unrated</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="elNSLFormActions"><button class="elNSLFormSubmit" type="submit">Search</button></div>
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
                        <button class="elNSLAudioPlayerControlBtn elNSLAudioPlayerPrevBtn" title="Previous"><svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241 64 96c0-17.7-14.3-32-32-32S0 78.3 0 96L0 416c0 17.7 14.3 32 32 32s32-14.3 32-32l0-145 11.5 9.6 192 160z"/></svg></button>
                        <button class="elNSLAudioPlayerControlBtn elNSLAudioPlayerPlayBtn" title="Play"><svg class="svg-icon svg-icon-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg></button>
                        <button class="elNSLAudioPlayerControlBtn elNSLAudioPlayerRepeatBtn" title="Repeat"><svg class="svg-icon svg-icon-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M488 192l-144 0c-9.7 0-18.5-5.8-22.2-14.8s-1.7-19.3 5.2-26.2l46.7-46.7c-75.3-58.6-184.3-53.3-253.5 15.9-75 75-75 196.5 0 271.5s196.5 75 271.5 0c8.2-8.2 15.5-16.9 21.9-26.1 10.1-14.5 30.1-18 44.6-7.9s18 30.1 7.9 44.6c-8.5 12.2-18.2 23.8-29.1 34.7-100 100-262.1 100-362 0S-25 175 75 75c94.3-94.3 243.7-99.6 344.3-16.2L471 7c6.9-6.9 17.2-8.9 26.2-5.2S512 14.3 512 24l0 144c0 13.3-10.7 24-24 24z"/></svg></button>
                        <button class="elNSLAudioPlayerControlBtn elNSLAudioPlayerNextBtn" title="Next"><svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416L0 96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241l0-145c0-17.7 14.3-32 32-32s32 14.3 32 32l0 320c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-145-11.5 9.6-192 160z"/></svg></button>
                    </div>
                    <div class="elNSLAudioPlayerProgressContainer">
                        <span class="elNSLAudioPlayerProgressTimeStart">0:00</span>
                        <div class="elNSLAudioPlayerProgressBar"><div class="elNSLAudioPlayerProgress"></div></div>
                        <span class="elNSLAudioPlayerProgressTimeEnd">0:00</span>
                    </div>
                </div>
                <div class="elNSLAudioPlayerExtraControls">
                    <div class="elNSLAudioPlayerVolumeContainer">
                        <a class="elNSLAudioPlayerVolumeIcon"><svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg></a>
                        <div class="elNSLAudioPlayerVolumeBar"><div class="elNSLAudioPlayerVolumeProgress"></div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="elNSLModal" tabindex="-1" role="dialog" style="display: none;">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                    <h3 class="modal-title"><span class="elNSLModalSongAnimeJP"></span></h3>
                </div>
                <div class="modal-body">
                    <video class="elNSLModalVideo" id="elNSLModalVideo" autoplay controls>Your browser does not support the video tag.</video>
                    <div class="elNSLModalSongAnimePanel"><span class="elNSLModalSongAnimeEN"></span></div>
                    <table class="elNSLModalSongAnimePanelTable">
                        <tbody>
                            <tr>
                                <th colspan="2">SONG NAME</th>
                                <th colspan="2">ARTIST</th>
                            </tr>
                            <tr>
                                <td colspan="2"><span class="elNSLModalSongName"></span></td>
                                <td colspan="2"><span class="elNSLModalSongArtist"></span></td>
                            </tr>
                            <tr>
                                <th colspan="2">COMPOSER</th>
                                <th colspan="2">ARRANGER</th>
                            </tr>
                            <tr>
                                <td colspan="2"><span class="elNSLModalSongComposer"></span></td>
                                <td colspan="2"><span class="elNSLModalSongArranger"></span></td>
                            </tr>
                            <tr>
                                <th colspan="2">DIFFICULTY</th>
                                <th colspan="2">LINKS</th>
                            </tr>
                            <tr>
                                <td colspan="2"><span class="elNSLModalSongDifficulty"></span> / <span class="elNSLModalSongDifficultyOwn"></span></td>
                                <td colspan="2"><span class="elNSLModalSongAnimeLinks"></span></td>
                            </tr>
                            <tr>
                                <th>AnnId</th>
                                <th>AnnSongId</th>
                                <th>SongId</th>
                                <th>-</th>
                            </tr>
                            <tr>
                                <td><span class="elNSLModalSongAnnId"></span></td>
                                <td><span class="elNSLModalSongAnnSongId"></span></td>
                                <td><span class="elNSLModalSongSongId"></span></td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <th colspan="4">Genres</th>
                            </tr>
                            <tr>
                                <td colspan="4"><span class="elNSLModalSongGenres"></span></td>
                            </tr>
                            <tr>
                                <th colspan="4">TAGS</th>
                            </tr>
                            <tr>
                                <td colspan="4"><span class="elNSLModalSongTags"></span></td>
                            </tr>
                        </tbody>
                    </table>
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
                    <div class="elNSLSongName"><span class="elNSLSongSongName">{songName}</span> - <span class="elNSLSongSongArtist">{songArtist}</span></div>
                </div>
                <div class="songRateSelect">              
                    <select name="songRate" id="songRate">
                        <option value="songRateLike">L</option>
                        <option value="songRateUnrated" selected>-</option>
                        <option value="songRateDislike">D</option>
                    </select>
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
`;

(function () {
    'use strict';

    const globalObj = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const $ = globalObj.jQuery || window.jQuery;
    const socketName = 'socket';

    function setup() {
        let storageSave = JSON.parse(GM_getValue("playerStatusList", "[]"));
        let songMap;
        let sortedSongsData;
        let page = 0;

        let currentTrackSongId = -1;
        let isPlaying = false;
        let isRepeating = false;
        let lastVolume = 0.8;
        let volume = 0.8;
        let audio = new Audio();
        audio.volume = volume;
        let isSeeking = false;
        let isVolumeSeeking = false;

        function getSongBySongId(songId) {
            return sortedSongsData.find(songData => songData.songEntry.songId == songId);
        }
        function getAnimeByAnnId(annId) {
            return sortedSongsData.find(songData => songData.animeEntry.annId == annId);
        }

        function loadSong(songId) {
            if (currentTrackSongId == songId && isPlaying) { togglePlay(); return; }

            const songData = getSongBySongId(songId);

            if (songData?.amqSong == null) globalObj[socketName]._socket.emit("command", { type: "library", command: "get song extended info", data: { annSongId: songData.song.annSongId, includeFileNames: true } });
            else loadTrack(songData, songData.amqSong.fileName);
        }

        function loadTrack(songData, audioSource) {
            $('.elNSLSongEntryPlaying').each((index, element) => {
                $(element).removeClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>');
            });

            let songTypeFull = songData.song.number == 0 ? '' : ` ${songData.song.number}`;
            if (songData.song.rebroadcast) songTypeFull += ' R';
            if (songData.song.dub) songTypeFull += ' D';
            let songType;
            switch (songData.song.type) {
                case 1: songType = `Opening${songTypeFull}`; break;
                case 2: songType = `Ending${songTypeFull}`; break;
                default: songType = `Insert${songTypeFull}`;
            }

            // $('.elNSLAudioPlayerSongInfoFirst').text(`${songData.songEntry.name} - ${songData.songEntry.artist.name}`);

            const songArtist = $('<span>', { html: `${songData.songEntry.artist.name}` });
            new ArtistHover(songData.songEntry.artist, songArtist, undefined, null, false);
            $('.elNSLAudioPlayerSongInfoFirst').append(
                $('<span>', { html: `${songData.songEntry.name}` })
            ).append(' - ').append(songArtist);

            $('.elNSLAudioPlayerSongInfoSecond').text(`${songData.animeEntry.mainNames.JA || songData.animeEntry.mainNames.EN} (${songType})`);

            if (songData.song.audio == null) songData.song.audio = audioSource;

            audio.src = `https://naedist.animemusicquiz.com/${songData.song.audio}`;

            $('.elNSLAudioPlayerProgressTimeEnd').text(formatTime(audio.duration));

            currentTrackSongId = songData.songEntry.songId;

            if (!isPlaying) {
                togglePlay();
            } else {
                audio.play()
                    .then(() => {
                        setPlayButtonIcon(true);
                        $(`[data-song-id="${getSongBySongId(currentTrackSongId).songEntry.songId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>');
                    })
            }
        }

        function setPlayButtonIcon(isPlaying) {
            if (isPlaying) $('.elNSLAudioPlayerPlayBtn').html('<svg class="svg-icon svg-icon-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>');
            else $('.elNSLAudioPlayerPlayBtn').html('<svg class="svg-icon svg-icon-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>');
        }

        function toggleRepeat() {
            if (isRepeating) $('.elNSLAudioPlayerRepeatBtn').html('<svg class="svg-icon svg-icon-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M470.6 118.6c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9S352 19.1 352 32l0 32-160 0C86 64 0 150 0 256 0 273.7 14.3 288 32 288s32-14.3 32-32c0-70.7 57.3-128 128-128l160 0 0 32c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64zM41.4 393.4c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9S160 492.9 160 480l0-32 160 0c106 0 192-86 192-192 0-17.7-14.3-32-32-32s-32 14.3-32 32c0 70.7-57.3 128-128 128l-160 0 0-32c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64z"/></svg>');
            else $('.elNSLAudioPlayerRepeatBtn').html('<svg class="svg-icon svg-icon-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M488 192l-144 0c-9.7 0-18.5-5.8-22.2-14.8s-1.7-19.3 5.2-26.2l46.7-46.7c-75.3-58.6-184.3-53.3-253.5 15.9-75 75-75 196.5 0 271.5s196.5 75 271.5 0c8.2-8.2 15.5-16.9 21.9-26.1 10.1-14.5 30.1-18 44.6-7.9s18 30.1 7.9 44.6c-8.5 12.2-18.2 23.8-29.1 34.7-100 100-262.1 100-362 0S-25 175 75 75c94.3-94.3 243.7-99.6 344.3-16.2L471 7c6.9-6.9 17.2-8.9 26.2-5.2S512 14.3 512 24l0 144c0 13.3-10.7 24-24 24z"/></svg>');
            isRepeating = !isRepeating;
        }

        function togglePlay() {
            if (isPlaying) {
                audio.pause();
                setPlayButtonIcon(false);
                if (getSongBySongId(currentTrackSongId)) $(`[data-song-id="${getSongBySongId(currentTrackSongId).songEntry.songId}"]`).removeClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>');
            } else {
                audio.play()
                    .then(() => {
                        setPlayButtonIcon(true);
                        if (getSongBySongId(currentTrackSongId)) $(`[data-song-id="${getSongBySongId(currentTrackSongId).songEntry.songId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>');
                    })
                    .catch(e => {
                        console.error("Playback error:", e);
                        isPlaying = false;
                        setPlayButtonIcon(false);
                    });
            }
            isPlaying = !isPlaying;
        }

        function prevTrack() {
            togglePlay();
            let songIndex = (sortedSongsData.findIndex(songData => songData.songEntry.songId == currentTrackSongId)) - 1;
            if (songIndex < 0) songIndex = sortedSongsData.length - 1;
            if (songIndex == -1) songIndex = 0
            loadSong(sortedSongsData[songIndex].songEntry.songId);
            if (isPlaying) audio.play();
        }

        function nextTrack() {
            togglePlay();
            let songIndex = (sortedSongsData.findIndex(songData => songData.songEntry.songId == currentTrackSongId)) + 1;
            if (songIndex >= sortedSongsData.length) songIndex = 0;
            if (songIndex == -1) songIndex = 0
            loadSong(sortedSongsData[songIndex].songEntry.songId);
            if (isPlaying) audio.play();
        }

        function updateDuration() {
            $('.elNSLAudioPlayerProgressTimeEnd').text(formatTime(audio.duration));
        }

        function setProgress(e) {
            const rect = $('.elNSLAudioPlayerProgressBar')[0].getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.min(Math.max(x / rect.width, 0), 1);
            $('.elNSLAudioPlayerProgress').width(`${percentage * 100}%`);
            audio.currentTime = percentage * audio.duration;
        }

        function setVolume(e) {
            if (volume == 0) $('.elNSLAudioPlayerVolumeIcon').text('🔇');
            else $('.elNSLAudioPlayerVolumeIcon').html(audio.volume < 0.5 ? '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM412.6 181.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5z"/></svg>' : '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg>');

            const rect = $('.elNSLAudioPlayerVolumeBar')[0].getBoundingClientRect();
            const x = e.clientX - rect.left;
            volume = Math.min(Math.max(x / rect.width, 0), 1);
            audio.volume = volume;
            $('.elNSLAudioPlayerVolumeProgress').width(`${volume * 100}%`);
        }

        function updateProgress() {
            if (!isSeeking && !isNaN(audio.duration)) {
                const progressPercent = (audio.currentTime / audio.duration) * 100;
                $('.elNSLAudioPlayerProgress').width(`${progressPercent}%`);
                $('.elNSLAudioPlayerProgressTimeStart').text(formatTime(audio.currentTime));
            }
        }

        function toggleMute() {
            if (audio.volume > 0) {
                lastVolume = audio.volume;
                audio.volume = 0;
                $('.elNSLAudioPlayerVolumeProgress').width(`0%`);
                $('.elNSLAudioPlayerVolumeIcon').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"/></svg>');
            } else {
                audio.volume = lastVolume || 0.7;
                $('.elNSLAudioPlayerVolumeProgress').width(`${volume * 100}%`);
                $('.elNSLAudioPlayerVolumeIcon').html(audio.volume < 0.5 ? '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM412.6 181.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5z"/></svg>' : '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg>');
            }
        }

        function formatTime(seconds) {
            if (isNaN(seconds)) return '0:00';

            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        }

        function setStorageSave(el, id) {
            if (el.checked) storageSave.push(id)
            else storageSave = storageSave.filter(psl => psl !== id)

            GM_setValue("playerStatusList", JSON.stringify(storageSave));
        }

        function getTitleName(song) { }
        function getSongName(song) { }
        function getSongArtist(song) { }
        function getSongComposer(song) { }

        const handleSocketCommand = (event) => {
            console.log(event)

            switch (event.command) {
                case 'answer results': answerHandle(event.data); break;
                case 'get song extended info':
                    const song = event.data;

                    const songData = getSongBySongId(song.songId);
                    songData.amqSong = song;

                    if ($('#elNSLModal').hasClass('in')) {
                        updateModal("song", songData);
                    } else {
                        loadTrack(songData, songData.amqSong.fileName);
                    }

                    break;
                case 'get anime extended info':
                    const anime = event.data;

                    const animeData = getAnimeByAnnId(anime.annId);
                    animeData.amqAnime = anime;

                    updateModal("anime", animeData);

                    break;
                case 'get anime status list':
                    songMap = songMap.map(anime => {
                        return {
                            ...anime,
                            animeEntry: {
                                ...anime.animeEntry,
                                status: event.data.animeListMap[anime.animeEntry.annId] || 0
                            }
                        }
                    });

                    renderSongList();

                    break;
                case 'get player status list':
                    songMap = songMap.map(anime => {
                        return {
                            ...anime,
                            songEntry: {
                                ...anime.songEntry,
                                status: event.data.statusListMap[anime.song.annSongId] || 0
                            }
                        }
                    });

                    renderSongList();

                    break;
                case 'anime list update result': globalObj[socketName]._socket.emit("command", { type: "library", command: "get anime status list" }); break;
            }
        }

        function isInSong(dataArray, searchTerm, searchPartialMatch) {
            for (let i = 0; i < dataArray.length; i++) {
                if (searchPartialMatch) {
                    if (dataArray[i].includes(searchTerm)) return true;
                } else {
                    if (dataArray[i] == searchTerm) return true;
                }
            }

            return false;
        }

        function filterSongs() {
            return songMap.filter(song => {
                if (!$('#added').prop('checked') && storageSave.includes(song.songEntry.songId)) return false;
                if (!$('#notadded').prop('checked') && !storageSave.includes(song.songEntry.songId)) return false;
                if (!$('#rebroadcast').prop('checked') && song.song.rebroadcast == 1) return false;
                if (!$('#dub').prop('checked') && song.song.dub == 1) return false;
                if (!(song.animeEntry.year >= parseInt($('#yearFrom').val()) && song.animeEntry.year <= parseInt($('#yearTo').val()))) return false;

                switch (song.songEntry.status) {
                    case 0: if (!$('#unrated').prop('checked')) return false; break;
                    case 1: if (!$('#like').prop('checked')) return false; break;
                    case 2: if (!$('#dislike').prop('checked')) return false; break;
                }

                switch (song.song.type) {
                    case 1: if (!$('#op').prop('checked')) return false; break;
                    case 2: if (!$('#ed').prop('checked')) return false; break;
                    case 3: if (!$('#insert').prop('checked')) return false; break;
                    default: return false;
                }

                switch (song.animeEntry.status) {
                    case 0: if (!$('#other').prop('checked')) return false; break;
                    case 1: if (!$('#watching').prop('checked')) return false; break;
                    case 2: if (!$('#completed').prop('checked')) return false; break;
                    case 3: if (!$('#onhold').prop('checked')) return false; break;
                    case 4: if (!$('#dropped').prop('checked')) return false; break;
                    case 5: if (!$('#ptw').prop('checked')) return false; break;
                    default: return false;
                }

                switch (song.songEntry.category) {
                    case 4: if (!$('#standard').prop('checked')) return false; break;
                    case 1: if (!$('#instrumental').prop('checked')) return false; break;
                    case 2: if (!$('#chanting').prop('checked')) return false; break;
                    case 3: if (!$('#character').prop('checked')) return false; break;
                    default: return false;
                }

                // ОТРЕДАЧИТЬ
                // Проверить тип аниме
                const animeCategory = (song.animeEntry.category.name).split(" ")
                const animeCategoryFirst = animeCategory[0].toLowerCase();
                const animeCategorySecond = animeCategory[1] ? animeCategory[1].toLowerCase() : '';
                switch (animeCategoryFirst) {
                    case "tv": if ((animeCategorySecond == 'special' && !$('#special').prop('checked')) || (animeCategorySecond != 'special' && !$('#tv').prop('checked'))) return false; break;
                    case "season": if (!$('#tv').prop('checked')) return false; break;
                    case "movie": if (!$('#movie').prop('checked')) return false; break;
                    case "ova": if (!$('#ova').prop('checked')) return false; break;
                    case "ona": if (!$('#ona').prop('checked')) return false; break;
                    case "special": if (!$('#special').prop('checked')) return false; break;
                    default: if (!$('#typeOther').prop('checked')) return false;
                }

                if ($('#search').val() !== '') {
                    const searchTerm = $('#search').val().toLowerCase();
                    const searchPartialMatch = $('#searchPartialMatch').prop('checked');

                    const songName = song.songEntry.searchNames;
                    const animeNames = song.animeEntry.searchNames;
                    const songArtistNames = song.songEntry.artist?.searchNames || [];
                    const songArtistArtistMembersNames = song.songEntry.artist?.artistMembers?.flatMap(group => group.searchNames) || [];
                    const songArtistGroupMembersNames = song.songEntry.artist?.groupMembers?.flatMap(group => group.searchNames) || [];
                    const songComposerNames = song.songEntry.composer?.searchNames || [];
                    const songComposerArtistMembersNames = song.songEntry.composer?.artistMembers?.flatMap(group => group.searchNames) || [];
                    const songComposerGroupMembersNames = song.songEntry.composer?.groupMembers?.flatMap(group => group.searchNames) || [];
                    const songArrangerNames = song.songEntry.arranger?.searchNames || [];
                    const songArrangerArtistMembersNames = song.songEntry.arranger?.artistMembers?.flatMap(group => group.searchNames) || [];
                    const songArrangerGroupMembersNames = song.songEntry.arranger?.groupMembers?.flatMap(group => group.searchNames) || [];

                    switch ($('#searchSelect').val()) {
                        case 'searchAll': if (![songName, animeNames, songArtistNames, songArtistArtistMembersNames, songArtistGroupMembersNames, songComposerNames, songComposerArtistMembersNames, songComposerGroupMembersNames, songArrangerNames, songArrangerArtistMembersNames, songArrangerGroupMembersNames].some(name => isInSong(name, searchTerm, searchPartialMatch))) return false; break;
                        case 'searchAnime': if (!isInSong(animeNames, searchTerm, searchPartialMatch)) return false; break;
                        case 'searchSong': if (!isInSong(songName, searchTerm, searchPartialMatch)) return false; break;
                        case 'searchArtist': if (!isInSong(songArtistNames, searchTerm, searchPartialMatch)) return false; break;
                        case 'searchComposer': if (!isInSong(songComposerNames, searchTerm, searchPartialMatch)) return false; break;
                        case 'searchArranger': if (!isInSong(songArrangerNames, searchTerm, searchPartialMatch)) return false; break;
                    }
                }

                return true;
            });
        }

        function setPage(newPage) { page = newPage; $('#newLibraryClusterId0').scrollTop(0); renderBatch(); }

        function renderBatch() {
            const fragment = $(document.createDocumentFragment());
            const templateHtml = $('#elNSLSongEntryTemplate').html();

            $('#newLibraryClusterId0').html('');

            const pagination = $('<div>', {
                class: 'elNSLPagination'
            });

            if (sortedSongsData.length > page) {
                const prevPage = $('<button>', {
                    class: 'elNSLPaginationChange',
                    html: 'Prev Page',
                    disabled: !(page > 0) ? true : false,
                });
                prevPage.on('click', (e) => {
                    setPage(page - 100)
                })
                pagination.append(prevPage);

                const paginationPage = $('<span>', {
                    class: 'paginationPage',
                    html: `${page} - ${page + 100}`
                });
                pagination.append(paginationPage);

                const nextPage = $('<button>', {
                    class: 'elNSLPaginationChange',
                    html: 'Next Page',
                    disabled: !(page + 100 < sortedSongsData.length) ? true : false,
                });
                nextPage.on('click', (e) => {
                    setPage(page + 100)
                })
                pagination.append(nextPage);

                pagination.clone(true).appendTo(fragment);
            }

            for (let i = page; i < page + 100; i++) {
                const template = $(templateHtml);

                const song = sortedSongsData[i];
                if (i >= sortedSongsData.length) break;

                const animeName = $('<div>', {
                    class: 'elNSLSongAnimeNameMain',
                    html: song.animeEntry.mainNames.JA ? `${song.animeEntry.mainNames.JA} ` : song.animeEntry.mainNames.EN ? `${song.animeEntry.mainNames.EN} ` : ''
                })
                if (song.animeEntry.mainNames.JA && song.animeEntry.mainNames.EN && song.animeEntry.mainNames.JA !== song.animeEntry.mainNames.EN) {
                    animeName.append($('<span>', {
                        class: 'elNSLSongAnimeNameSecond',
                        html: song.animeEntry.mainNames.EN
                    }))
                }

                const songArtist = song.songEntry.artist;

                let songTypeFull = song.song.number == 0 ? '&nbsp;' : `${song.song.number}&nbsp;`;
                if (song.song.rebroadcast == 1) songTypeFull += 'R&nbsp;';
                if (song.song.dub == 1) songTypeFull += 'D';
                let songType;
                switch (song.song.type) {
                    case 1: songType = `<div class="elNSLSongType"><span class="elNSLSongTypeOP">OP</span>&nbsp;<span>${songTypeFull}</span></div>`; break;
                    case 2: songType = `<div class="elNSLSongType"><span class="elNSLSongTypeED">ED</span>&nbsp;<span>${songTypeFull}</span></div>`; break;
                    default: songType = `<div class="elNSLSongType"><span class="elNSLSongTypeINS">INS</span>&nbsp;<span>${songTypeFull}</span></div>`;
                }

                let songCheckbox = $('<input>', {
                    type: 'checkbox',
                    checked: storageSave.includes(song.songEntry.songId),
                    change: (e) => {
                        setStorageSave(e.target, song.songEntry.songId);
                    }
                });
                let animeStatus = 0;
                if ('status' in song.animeEntry) {
                    switch (song.animeEntry.status) {
                        case 1: animeStatus = $('<div>', {
                            class: 'elNSLAnimeStatus elNSLAnimeStatusW',
                            html: 'W '
                        }).append(songCheckbox); break;
                        case 2: animeStatus = $('<div>', {
                            class: 'elNSLAnimeStatus elNSLAnimeStatusC',
                            html: 'C '
                        }).append(songCheckbox); break;
                        case 3: animeStatus = $('<div>', {
                            class: 'elNSLAnimeStatus elNSLAnimeStatusH',
                            html: 'H '
                        }).append(songCheckbox); break;
                        case 4: animeStatus = $('<div>', {
                            class: 'elNSLAnimeStatus elNSLAnimeStatusD',
                            html: 'D '
                        }).append(songCheckbox); break;
                        case 5: animeStatus = $('<div>', {
                            class: 'elNSLAnimeStatus elNSLAnimeStatusP',
                            html: 'P '
                        }).append(songCheckbox); break;
                        default: animeStatus = $('<div>', {
                            class: 'elNSLAnimeStatus elNSLAnimeStatusU',
                            html: '- '
                        }).append(songCheckbox);
                    }
                }

                const artistContainer = template.find('.elNSLSongSongArtist');
                new ArtistHover(songArtist, artistContainer, undefined, null, false);

                template.attr('data-song-id', song.songEntry.songId);
                template.find('.elSongSongType').html(songType)
                template.find('.elSongAnimeStatus').html(animeStatus)
                template.find('.elSongAnimeName').html(animeName)
                template.find('.elNSLSongSongName').html(song.songEntry.name)
                template.find('.elNSLSongSongArtist').html(songArtist?.name || '')
                template.find('.elNSLSongInfoButton').on('click', (e) => showModal(i, false))
                template.find('.elNSLSongPlayButton').on('click', (e) => {
                    loadSong(song.songEntry.songId)
                })

                template.find('#songRate').on('change', function () {
                    var selectedValue = $(this).val();

                    switch (selectedValue) {
                        case 'songRateLike': globalObj[socketName]._socket.emit("command", { type: "library", command: "set song like status", data: { annSongId: song.song.annSongId, stateId: 1 } }); (getSongBySongId(song.songEntry.songId)).songEntry.status = 1; break;
                        case 'songRateUnrated': globalObj[socketName]._socket.emit("command", { type: "library", command: "set song like status", data: { annSongId: song.song.annSongId, stateId: 0 } }); (getSongBySongId(song.songEntry.songId)).songEntry.status = 0; break;
                        case 'songRateDislike': globalObj[socketName]._socket.emit("command", { type: "library", command: "set song like status", data: { annSongId: song.song.annSongId, stateId: 2 } }); (getSongBySongId(song.songEntry.songId)).songEntry.status = 2; break;
                    }
                });

                switch (song.songEntry.status) {
                    case 1: template.find('#songRate').val('songRateLike'); break;
                    case 2: template.find('#songRate').val('songRateDislike'); break;
                }

                fragment.append(template)
            }

            if (sortedSongsData.length > page) {
                pagination.clone(true).appendTo(fragment);
            }

            $('#newLibraryClusterId0').append(fragment);

            const songData = getSongBySongId(currentTrackSongId);
            if (songData) {
                $(`[data-song-id="${songData.songEntry.songId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>');
            }
        }

        function renderSongList() {
            sortedSongsData = (filterSongs()).sort((a, b) => {
                switch ($('#sort').val()) {
                    case 'idasc': return a.animeEntry.annId - b.animeEntry.annId || a.song.type - b.song.type || a.song.number - b.song.number;
                    case 'iddesc': return b.animeEntry.annId - a.animeEntry.annId || a.song.type - b.song.type || a.song.number - b.song.number;
                    case 'namedesc': return -((a.animeEntry.mainNames.JA || a.animeEntry.mainNames.EN || "").localeCompare(b.animeEntry.mainNames.JA || b.animeEntry.mainNames.EN || ""));
                    default: return (a.animeEntry.mainNames.JA || a.animeEntry.mainNames.EN || "").localeCompare(b.animeEntry.mainNames.JA || b.animeEntry.mainNames.EN || "");
                }
            });

            if (currentTrackSongId !== -1 && getSongBySongId(currentTrackSongId)) $(`[data-song-id="${getSongBySongId(currentTrackSongId).songEntry.songId}"]`).addClass('elNSLSongEntryPlaying').find('.elNSLSongPlayButton').html('<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>');

            $('#elNSLSongsCount').html(sortedSongsData.length)
            $('#elNSLAnimesCount').html([...new Set(sortedSongsData.map(anime => anime.animeEntry.annId))].length)

            renderBatch()
        }

        function updateModal(type, song) {
            if (type == 'song') {
                let songType;
                let songTypeFull = song.song.number == 0 ? '' : song.song.number;
                if (song.song.rebroadcast) songTypeFull += ' R';
                if (song.song.dub) songTypeFull += ' D';
                switch (song.song.type) {
                    case 1: songType = `Opening ${songTypeFull}`; break;
                    case 2: songType = `Ending ${songTypeFull}`; break;
                    default: songType = `Insert ${songTypeFull}`;
                }

                const animeName = $('<div>', {
                    class: 'elNSLSongAnimeNameMain',
                    html: song.animeEntry.mainNames.JA ? `${song.animeEntry.mainNames.JA} ` : song.animeEntry.mainNames.EN ? `${song.animeEntry.mainNames.EN} ` : ''
                })
                if (song.animeEntry.mainNames.JA && song.animeEntry.mainNames.EN && song.animeEntry.mainNames.JA !== song.animeEntry.mainNames.EN) {
                    animeName.append($('<span>', {
                        class: 'elNSLSongAnimeNameSecond',
                        html: song.animeEntry.mainNames.EN
                    }))
                }

                const songArtist = song.songEntry.artist?.name || '';
                const songComposer = song.songEntry.composer?.name || '';
                const songArranger = song.songEntry.arranger?.name || '';

                const videoSrc = '720' in song.amqSong.fileNameMap ? song.amqSong.fileNameMap['720'] : '480' in song.amqSong.fileNameMap ? song.amqSong.fileNameMap['480'] : null;

                $('#elNSLModalVideo')[0].src = `https://naedist.animemusicquiz.com/${videoSrc}`;
                $('.elNSLModalSongAnimeJP').html(animeName)
                $('.elNSLModalSongName').html(song.songEntry.name)
                $('.elNSLModalSongDifficulty').html(song.amqSong.globalPercent)
                $('.elNSLModalSongDifficultyOwn').html(song.amqSong.recentPercent)
                $('.elNSLModalSongAnnId').html(song.amqSong.annId)
                $('.elNSLModalSongAnnSongId').html(song.amqSong.annSongId)
                $('.elNSLModalSongSongId').html(song.amqSong.songId)

                const modalSongArtist = $('.elNSLModalSongArtist');
                modalSongArtist.html(songArtist);
                if (song.songEntry.artist) new ArtistHover(song.songEntry.artist, modalSongArtist, undefined, null, false);

                const modalSongComposer = $('.elNSLModalSongComposer');
                modalSongComposer.html(songComposer);
                if (song.songEntry.composer) new ArtistHover(song.songEntry.composer, modalSongComposer, undefined, null, false);

                const modalSongArranger = $('.elNSLModalSongArranger');
                modalSongArranger.html(songArranger);
                if (song.songEntry.arranger) new ArtistHover(song.songEntry.arranger, modalSongArranger, undefined, null, false);
            } else if (type == 'anime') {
                $('.elNSLModalSongAnimeLinks').html('');
                if (song.amqAnime.annId) $('.elNSLModalSongAnimeLinks').append($('<a>', {
                    html: 'ANN',
                    href: `https://www.animenewsnetwork.com/encyclopedia/anime.php?id=${song.amqAnime.annId}`,
                })).append(' ');
                if (song.amqAnime.malId) $('.elNSLModalSongAnimeLinks').append($('<a>', {
                    html: 'MAL',
                    href: `https://myanimelist.net/anime/${song.amqAnime.malId}`
                })).append(' ');
                if (song.amqAnime.anilistId) $('.elNSLModalSongAnimeLinks').append($('<a>', {
                    html: 'Anilist',
                    href: `https://anilist.co/anime/${song.amqAnime.anilistId}`,
                })).append(' ');
                if (song.amqAnime.kitsuId) $('.elNSLModalSongAnimeLinks').append($('<a>', {
                    html: 'Kitsu',
                    href: `https://kitsu.app/anime/${song.amqAnime.kitsuId}`,
                })).append(' ');

                $('.elNSLModalSongGenres').html(``);
                song.amqAnime.genres.forEach((genre, index) => {
                    $('.elNSLModalSongGenres').append(`${genre}`);
                    if (index < song.amqAnime.genres.length - 1) $('.elNSLModalSongGenres').append(', ');
                });
                $('.elNSLModalSongTags').html(``);
                song.amqAnime.tags.forEach((tag, index) => {
                    $('.elNSLModalSongTags').append(`${tag}`);
                    if (index < song.amqAnime.tags.length - 1) $('.elNSLModalSongTags').append(', ');
                });
            }
        }

        function showModal(index, isOpened) {
            const current = sortedSongsData[index];

            if (!current?.amqSong) globalObj[socketName]._socket.emit("command", { type: "library", command: "get song extended info", data: { annSongId: current.song.annSongId, includeFileNames: true } });
            else updateModal("song", current);

            if (!current?.amqAnime) globalObj[socketName]._socket.emit("command", { type: "library", command: "get anime extended info", data: { annId: current.animeEntry.annId, includeFileNames: true } });
            else updateModal("anime", current);

            if (!isOpened) $('#elNSLModal').modal("show");
        }

        function answerHandle(event) {
            const { annId, songName, artistInfo } = event.songInfo;

            const songArtistGroupId = 'artistId' in artistInfo ? artistInfo.artistId : artistInfo.groupId;

            const eventSongIndex = songMap.findIndex(item => {
                const itemArtistId = item.songEntry.songGroupId !== null ? item.songEntry.songGroupId : item.songEntry.songArtistId;

                return item.animeEntry.annId == annId &&
                    itemArtistId == songArtistGroupId &&
                    item.songEntry.name == songName;
            });
            const eventSongId = songMap[eventSongIndex].songEntry.songId;

            const checkForElement = () => {
                const $element = $('#qpSongType');
                if ($element.length) {
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
                                checked: storageSave.includes(eventSongId),
                                change: (e) => {
                                    setStorageSave(e.target, eventSongId);
                                }
                            })
                        ));

                    clearInterval(intervalId);
                }
            }

            const intervalId = setInterval(checkForElement, 100);
        }

        $('#gameContainer').append(htmlContent);

        $('#rightMenuBarPartContainer').append(
            $('<div>', {
                class: 'rightLeftButtonBottom clickAble',
                css: {
                    'right': '205px',
                    'position': 'absolute',
                    'bottom': '0px',
                    'right': '180px',
                    'font-size': '40px',
                    'height': '45px',
                    'width': '112px',
                    'z-index': '-1',
                },
            }).append(
                $('<span>', {
                    id: 'optionGlyphIcon',
                    class: 'glyphicon glyphicon-music',
                    'aria-hidden': 'true',
                })
            ).click(function () {
                $('.elNSLMain').toggleClass('hidden');
            })
        );


        $('.elNSLAudioPlayerPlayBtn').on('click', () => togglePlay());
        $('.elNSLAudioPlayerRepeatBtn').on('click', () => toggleRepeat());
        $('.elNSLAudioPlayerPrevBtn').on('click', () => prevTrack());
        $('.elNSLAudioPlayerNextBtn').on('click', () => nextTrack());
        $('.elNSLAudioPlayerVolumeIcon').on('click', () => toggleMute());

        audio.addEventListener('timeupdate', () => updateProgress());
        audio.addEventListener('ended', () => isRepeating ? audio.play() : nextTrack());
        audio.addEventListener('loadedmetadata', () => updateDuration());

        $('.elNSLAudioPlayerProgressBar').on('mousedown', (e) => { isSeeking = true; setProgress(e); });
        $('.elNSLAudioPlayerVolumeBar').on('mousedown', (e) => { isVolumeSeeking = true; setVolume(e); });

        $(document).on('mousemove', (e) => {
            if (isSeeking) {
                setProgress(e);
            } else if (isVolumeSeeking) {
                setVolume(e);
            }
        });

        $(document).on('mouseup', () => {
            isSeeking = false;
            isVolumeSeeking = false;
        });

        $('#elNSLFilterForm').on('submit', (e) => {
            e.preventDefault();
            setPage(0);
            renderSongList(e.target);
        });

        $("#elNSLModal").on('hide.bs.modal', function () {
            $("#elNSLModalVideo")[0].pause();
            $("#elNSLModalVideo")[0].src = '';
        });

        globalObj[socketName]._socket.addEventListener("command", handleSocketCommand);

        // 

        function createSongMap() {
            songMap = Object.values(libraryCacheHandler.animeCache).map(anime => {
                return Object.values(anime.songMap).map(song => {
                    return {
                        song: {
                            annId: song.annId,
                            annSongId: song.annSongId,
                            dub: song.dub,
                            number: song.number,
                            rebroadcast: song.rebroadcast,
                            type: song.type,
                            uploadStatus: song.uploadStatus,
                            uploaded: song.uploaded,
                            wrongIndex: song.wrongIndex,
                            audio: null,
                        },
                        songEntry: {
                            arranger: song.songEntry.arranger,
                            arrangerArtistId: song.songEntry.arrangerArtistId,
                            arrangerGroupId: song.songEntry.arrangerGroupId,
                            artist: song.songEntry.artist,
                            category: song.songEntry.category,
                            composer: song.songEntry.composer,
                            composerArtistId: song.songEntry.composerArtistId,
                            composerGroupId: song.songEntry.composerGroupId,
                            dub: song.songEntry.dub,
                            name: song.songEntry.name,
                            rebroadcast: song.songEntry.rebroadcast,
                            searchIndex: song.songEntry.searchIndex,
                            searchNames: song.songEntry.searchNames,
                            songArtistId: song.songEntry.songArtistId,
                            songGroupId: song.songEntry.songGroupId,
                            songId: song.songEntry.songId,
                            status: 0,
                        },
                        animeEntry: {
                            annId: anime.annId,
                            category: anime.category,
                            mainNames: anime.mainNames,
                            names: anime.names,
                            searchIndex: anime.searchIndex,
                            searchNames: anime.searchNames,
                            seasonId: anime.seasonId,
                            year: anime.year,
                            status: 0,
                        }
                    }
                }).flat();
            }).flat();

            renderSongList();

            globalObj[socketName]._socket.emit("command", { type: "library", command: "get anime status list" });
            globalObj[socketName]._socket.emit("command", { type: "library", command: "get player status list" });
        }

        let cacheValue;
        Object.defineProperty(libraryCacheHandler, 'annSongIdAnnIdMap', {
            get: function () { return cacheValue; },
            set: (value) => {
                cacheValue = value;

                createSongMap();
            },
        });
        libraryCacheHandler.requestCacheUpdate(0);
    }

    const waitForInitialLoad = () => {
        return new Promise((resolve, reject) => {
            // const loadingScreen = document.getElementById("loadingScreen");
            if (!document.getElementById("loadingScreen")) return reject(new Error("Loading screen not found"));
            new MutationObserver((_record, observer) => {
                try { observer.disconnect(); resolve(); }
                catch (error) { observer.disconnect(); reject(error); }
            }).observe(loadingScreen, { attributes: true });
        });
    };
    waitForInitialLoad().then(() => setup());
})();