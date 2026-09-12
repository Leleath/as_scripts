// ==UserScript==
// @name         New Song Library
// @version      0.17
// @description  Song List with Music Player
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

(() => {
  'use strict';

  const APP = {
    version: '0.20',
    rootId: 'nsl-root',
    storageKey: 'playerStatusList',
    audioHost: 'https://naedist.animemusicquiz.com/',
    pageSize: 100,
    searchLimit: 3000,
    malStatusMap: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 },
  };

  const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  const $ = win.jQuery || window.jQuery;
  const socketName = 'socket';

  const icons = {
    play: '<svg viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80v352c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9l288-176c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>',
    pause: '<svg viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48v288c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48h-32z"/></svg>',
    prev: '<svg viewBox="0 0 320 512"><path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241V96c0-17.7-14.3-32-32-32S0 78.3 0 96v320c0 17.7 14.3 32 32 32s32-14.3 32-32V271l11.5 9.6 192 160z"/></svg>',
    next: '<svg viewBox="0 0 320 512"><path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32v320c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"/></svg>',
    repeat: '<svg viewBox="0 0 512 512"><path d="M0 256C0 150 86 64 192 64h160V32c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l64 64c12.5 12.5 12.5 32.8 0 45.3l-64 64c-9.2 9.2-22.9 11.9-34.9 6.9S352 172.9 352 160v-32H192c-70.7 0-128 57.3-128 128 0 17.7-14.3 32-32 32S0 273.7 0 256zm512 0c0 106-86 192-192 192H160v32c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-64-64c-12.5-12.5-12.5-32.8 0-45.3l64-64c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6v32h160c70.7 0 128-57.3 128-128 0-17.7 14.3-32 32-32s32 14.3 32 32z"/></svg>',
    info: '<svg viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24v-64h-24c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-80c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>',
    external: '<svg viewBox="0 0 512 512"><path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112v320c0 44.2 35.8 80 80 80h320c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v112c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16h112c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>',
    volume: '<svg viewBox="0 0 640 512"><path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256S557.5 113.8 503.3 69.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64v384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64v-64c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg>',
    mute: '<svg viewBox="0 0 576 512"><path d="M301.1 34.8C312.6 40 320 51.4 320 64v384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64v-64c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"/></svg>',
  };

  const css = `
    #${APP.rootId}, #${APP.rootId} * { box-sizing: border-box; }
    #${APP.rootId} { --bg:#0e1014; --panel:#171a21; --panel2:#20242d; --soft:#2d3340; --text:#edf1f7; --muted:#98a2b3; --accent:#6ee7b7; --accent2:#60a5fa; --danger:#fb7185; --warn:#fbbf24; --purple:#c084fc; --shadow:0 18px 70px rgba(0,0,0,.42); color:var(--text); font-family:Inter,Segoe UI,Arial,sans-serif; }
    .nsl-hidden { display:none !important; }
    .nsl-shell { position:fixed; inset:0; z-index:100; background:linear-gradient(180deg,rgba(7,9,13,.92),rgba(7,9,13,.82)); backdrop-filter:blur(8px); padding:12px 14px 14px; overflow:hidden; }
    .nsl-app { height:calc(100vh - 64px); max-width:1320px; margin:0 auto; display:grid; grid-template-rows:minmax(0,1fr) auto; gap:12px; }
    .nsl-layout { min-height:0; display:grid; grid-template-columns:310px minmax(0,1fr); gap:12px; }
    .nsl-panel { min-height:0; border:1px solid rgba(255,255,255,.08); border-radius:18px; background:rgba(23,26,33,.94); box-shadow:var(--shadow); overflow:hidden; }
    .nsl-sidebar { display:flex; flex-direction:column; }
    .nsl-head { padding:14px; border-bottom:1px solid rgba(255,255,255,.08); background:linear-gradient(135deg,rgba(110,231,183,.12),rgba(96,165,250,.08)); }
    .nsl-title { margin:0; font-size:18px; letter-spacing:.2px; }
    .nsl-sub { color:var(--muted); font-size:12px; margin-top:3px; }
    .nsl-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px; }
    .nsl-stat { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:8px; }
    .nsl-stat strong { display:block; font-size:18px; color:var(--accent); }
    .nsl-stat span { font-size:11px; color:var(--muted); text-transform:uppercase; }
    .nsl-filters { overflow:auto; padding:12px; scrollbar-width:thin; }
    .nsl-group { margin-bottom:10px; padding:10px; border-radius:14px; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.06); }
    .nsl-group-title { display:flex; align-items:center; justify-content:space-between; margin:0 0 8px; font-size:12px; font-weight:800; color:#dbeafe; text-transform:uppercase; letter-spacing:.06em; }
    .nsl-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:6px 8px; }
    .nsl-row { display:flex; gap:6px; align-items:center; }
    .nsl-search-wrap { position:relative; flex:1; min-width:0; }
    .nsl-search-wrap .nsl-input { padding-right:30px; }
    .nsl-clear-search { position:absolute; right:5px; top:50%; transform:translateY(-50%); width:22px; height:22px; border:0; border-radius:8px; background:rgba(255,255,255,.08); color:var(--muted); cursor:pointer; line-height:1; font-size:16px; }
    .nsl-clear-search:hover { color:var(--text); background:rgba(255,255,255,.14); }
    .nsl-input, .nsl-select { width:100%; min-width:0; height:30px; border:1px solid rgba(255,255,255,.1); border-radius:10px; background:#0d1016; color:var(--text); padding:0 9px; outline:none; }
    .nsl-input:focus, .nsl-select:focus { border-color:var(--accent2); }
    .nsl-check { display:flex; align-items:center; gap:7px; min-height:22px; color:#d6dce6; font-size:12px; cursor:pointer; }
    .nsl-check input { margin:0; }
    .nsl-check input[type="checkbox"] { appearance:none; -webkit-appearance:none; width:16px; height:16px; flex:0 0 16px; border-radius:5px; border:1px solid rgba(255,255,255,.28); background:linear-gradient(180deg,#111722,#080b10); box-shadow:inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(0,0,0,.25); cursor:pointer; display:grid; place-items:center; transition:.12s ease; }
    .nsl-check input[type="checkbox"]::after { content:""; width:8px; height:5px; border-left:2px solid #061017; border-bottom:2px solid #061017; transform:rotate(-45deg) scale(0); margin-top:-2px; transition:.12s ease; }
    .nsl-check input[type="checkbox"]:checked { border-color:rgba(110,231,183,.95); background:linear-gradient(135deg,var(--accent),var(--accent2)); box-shadow:0 0 0 2px rgba(110,231,183,.13), 0 6px 14px rgba(96,165,250,.18); }
    .nsl-check input[type="checkbox"]:checked::after { transform:rotate(-45deg) scale(1); }
    .nsl-check input[type="checkbox"]:hover { border-color:rgba(110,231,183,.75); }
    .nsl-save input[type="checkbox"] { appearance:none; -webkit-appearance:none; width:16px; height:16px; flex:0 0 16px; border-radius:5px; border:1px solid rgba(255,255,255,.28); background:#0d1016; display:grid; place-items:center; cursor:pointer; }
    .nsl-save input[type="checkbox"]::after { content:""; width:8px; height:5px; border-left:2px solid #061017; border-bottom:2px solid #061017; transform:rotate(-45deg) scale(0); margin-top:-2px; transition:.12s ease; }
    .nsl-save input[type="checkbox"]:checked { border-color:rgba(110,231,183,.95); background:linear-gradient(135deg,var(--accent),var(--accent2)); }
    .nsl-save input[type="checkbox"]:checked::after { transform:rotate(-45deg) scale(1); }

    .nsl-submit, .nsl-page-btn { border:0; border-radius:12px; min-height:32px; padding:0 12px; background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#061017; font-weight:800; cursor:pointer; }
    .nsl-submit { width:100%; }
    .nsl-page-btn:disabled { cursor:not-allowed; opacity:.45; filter:grayscale(1); }
    .nsl-content { display:flex; flex-direction:column; min-width:0; min-height:0; }
    .nsl-toolbar { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.08); }
    .nsl-toolbar-title { font-weight:850; font-size:16px; }
    .nsl-toolbar-meta { font-size:12px; color:var(--muted); }
    .nsl-list { min-height:0; overflow:auto; padding:12px; scrollbar-width:thin; }
    .nsl-empty { padding:42px 16px; text-align:center; color:var(--muted); }
    .nsl-anime { margin-bottom:12px; border:1px solid rgba(255,255,255,.07); border-radius:16px; overflow:hidden; }
    .nsl-anime.nsl-dim { opacity: .45; }
    .nsl-song.nsl-dim { opacity: .45; }
    .nsl-anime.nsl-dim > .nsl-song.nsl-dim { opacity: 1; }
    .nsl-anime-head { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:10px; padding:9px 11px; background:rgba(255,255,255,.075); }
    .nsl-anime-main { min-width:0; border:0; padding:0; background:none; color:inherit; text-align:left; font:inherit; font-weight:850; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer; }
    .nsl-anime-main:hover { color:#93c5fd; text-decoration:underline; }
    .nsl-anime-alt { margin-left:6px; color:var(--muted); font-weight:500; font-size:12px; }
    .nsl-anime-tags { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:6px; }
    .nsl-chip { display:inline-flex; align-items:center; gap:4px; border-radius:999px; padding:3px 7px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.07); font-size:11px; color:#cbd5e1; white-space:nowrap; }
    .nsl-anime-status { height:26px; max-width:128px; border:1px solid rgba(255,255,255,.12); border-radius:999px; background:#111722; color:var(--text); padding:0 7px; font-size:11px; cursor:pointer; }
    .nsl-anime-status:disabled { opacity:.55; cursor:wait; }
    .nsl-status-1 { color:#67e8f9; } .nsl-status-2 { color:#86efac; } .nsl-status-3 { color:#fde68a; } .nsl-status-4 { color:#fb7185; } .nsl-status-5 { color:#93c5fd; }
    .nsl-song { display:grid; grid-template-columns:68px minmax(0,1fr) 82px 58px 108px; gap:8px; align-items:center; min-height:38px; padding:6px 9px; border-top:1px solid rgba(255,255,255,.055); }
    .nsl-song:hover { background:rgba(255,255,255,.045); }
    .nsl-song.nsl-playing { background:rgba(110,231,183,.11); box-shadow:inset 3px 0 0 var(--accent); }
    .nsl-song-type { display:inline-flex; align-items:center; justify-content:center; min-width:48px; padding:4px 7px; border-radius:999px; font-size:11px; font-weight:900; background:rgba(255,255,255,.07); }
    .nsl-type-1 { color:#86efac; } .nsl-type-2 { color:#c4b5fd; } .nsl-type-3 { color:#fca5a5; }
    .nsl-song-name { min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:13px; font-weight:750; }
    .nsl-artist { color:#b9c0cc; font-weight:500; }
    .nsl-artist-hover-target { color:#93c5fd; cursor:pointer; }
    .nsl-save { display:flex; align-items:center; justify-content:center; gap:5px; font-size:11px; color:var(--muted); }
    .nsl-rate { width:100%; height:28px; border-radius:9px; border:1px solid rgba(255,255,255,.09); background:#0d1016; color:var(--text); }
    .nsl-icon-btn { width:30px; height:30px; display:inline-flex; align-items:center; justify-content:center; border:0; border-radius:10px; cursor:pointer; background:rgba(255,255,255,.075); color:var(--text); }
    .nsl-icon-btn:hover { background:rgba(255,255,255,.13); }
    .nsl-icon-btn svg, .nsl-player button svg, .nsl-volume-btn svg { width:14px; height:14px; fill:currentColor; }
    .nsl-pagination { display:flex; justify-content:center; align-items:center; gap:8px; padding:10px; color:var(--muted); font-size:12px; }
    .nsl-player { position:relative; z-index:10003; min-height:82px; width:100%; display:grid; grid-template-columns:minmax(180px,1fr) minmax(420px,1.65fr) minmax(230px,.85fr); align-items:center; gap:16px; padding:10px 16px; border:1px solid rgba(255,255,255,.10); border-radius:18px; background:rgba(18,21,28,.98); box-shadow:var(--shadow); }
    .nsl-track-title { min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:800; font-size:13px; }
    .nsl-track-sub { min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--muted); font-size:12px; margin-top:3px; }
    .nsl-controls { display:flex; flex-direction:column; align-items:stretch; gap:8px; min-width:0; width:100%; }
    .nsl-control-row { display:flex; align-items:center; justify-content:center; gap:8px; }
    .nsl-player button { border:0; cursor:pointer; color:var(--text); background:rgba(255,255,255,.08); border-radius:999px; width:30px; height:30px; display:inline-flex; align-items:center; justify-content:center; }
    .nsl-play-main { width:36px !important; height:36px !important; background:var(--text) !important; color:#0d1016 !important; }
    .nsl-repeat-on { color:var(--accent) !important; box-shadow:0 0 0 1px rgba(110,231,183,.38) inset; }
    .nsl-progress-row { width:100%; display:grid; grid-template-columns:42px minmax(220px,1fr) 42px; align-items:center; gap:8px; color:var(--muted); font-size:11px; }
    .nsl-bar { height:6px; border-radius:999px; background:rgba(255,255,255,.16); cursor:pointer; overflow:hidden; }
    .nsl-bar-fill { height:100%; width:0%; border-radius:inherit; background:linear-gradient(90deg,var(--accent),var(--accent2)); }
    .nsl-volume { justify-self:end; display:flex; align-items:center; gap:8px; width:230px; max-width:100%; min-width:180px; }
    .nsl-volume .nsl-bar { flex:1 1 auto; min-width:90px; }
    .nsl-volume-btn { border:0; background:none; color:var(--muted); cursor:pointer; flex:0 0 30px; }
    .nsl-volume-value { width:38px; text-align:right; color:var(--muted); font-size:11px; font-variant-numeric:tabular-nums; }
    .nsl-modal { position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.65); padding:18px; }
    .nsl-modal-card { width:min(860px,100%); max-height:92vh; overflow:auto; border:1px solid rgba(255,255,255,.1); border-radius:20px; background:#11141b; box-shadow:var(--shadow); }
    .nsl-modal-head { position:sticky; top:0; z-index:2; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 14px; background:rgba(17,20,27,.96); border-bottom:1px solid rgba(255,255,255,.08); }
    .nsl-modal-title { margin:0; font-size:18px; }
    .nsl-close { border:0; background:rgba(255,255,255,.08); color:var(--text); width:34px; height:34px; border-radius:12px; cursor:pointer; font-size:20px; }
    .nsl-modal-body { padding:14px; display:grid; gap:12px; }
    .nsl-video { width:100%; max-height:420px; border-radius:16px; background:#050607; }
    .nsl-info-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
    .nsl-card { border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:10px; background:rgba(255,255,255,.04); min-width:0; }
    .nsl-label { color:var(--muted); font-size:11px; text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px; }
    .nsl-card-value { white-space:normal; overflow-wrap:anywhere; }
    .nsl-tags { display:flex; flex-wrap:wrap; gap:6px; }
    .nsl-links a { color:#93c5fd; margin-right:10px; text-decoration:none; }
    .nsl-toggle-button { font-size:40px; height:45px; width:112px; }
    .nsl-toast { position:fixed; right:22px; bottom:22px; z-index:10020; max-width:min(420px,calc(100vw - 44px)); padding:11px 14px; border:1px solid rgba(255,255,255,.12); border-radius:12px; background:#18202b; color:var(--text); box-shadow:var(--shadow); font-size:13px; }
    .nsl-toast.nsl-error { border-color:rgba(251,113,133,.55); color:#fecdd3; }
    @media (max-width:900px){ .nsl-shell{padding:10px}.nsl-app{height:calc(100vh - 20px)}.nsl-layout{grid-template-columns:1fr}.nsl-sidebar{max-height:42vh}.nsl-player{grid-template-columns:1fr;gap:8px}.nsl-volume{justify-self:stretch;width:100%}.nsl-song{grid-template-columns:56px minmax(0,1fr) 70px 50px 100px}.nsl-info-grid{grid-template-columns:1fr} }
  `;

  GM_addStyle(css);

  class SongLibraryApp {
    constructor() {
      this.songMap = [];
      this.filteredSongs = [];
      this.songByKey = new Map();
      this.songByAnnSongId = new Map();
      this.pendingSongRequests = new Map();
      this.pendingAnimeRequests = new Map();
      this.savedSongs = this.readSavedSongs();
      this.page = 0;
      this.state = { visible: false, currentTrack: null, playing: false, repeating: false, seeking: false, volumeSeeking: false, volume: 0.8, lastVolume: 0.8 };
      this.audio = new Audio();
      this.audio.volume = this.state.volume;
      this.ui = {};
      this.boundSocketHandler = this.onSocketCommand.bind(this);
    }

    init() {
      if (document.getElementById(APP.rootId)) return;
      this.buildUI();
      this.bindUI();
      this.bindSocket();
      this.hookLibraryCache();
    }

    get socket() { return win?.[socketName]?._socket; }

    emit(command, data = {}) {
      if (!this.socket?.emit) return;
      this.socket.emit('command', { type: 'library', command, data });
    }

    readSavedSongs() {
      try {
        const raw = GM_getValue(APP.storageKey, '[]');
        const parsed = JSON.parse(raw);
        return new Set(Array.isArray(parsed) ? parsed.map(Number) : []);
      } catch (_) {
        return new Set();
      }
    }

    persistSavedSongs() {
      GM_setValue(APP.storageKey, JSON.stringify([...this.savedSongs]));
    }

    buildUI() {
      const root = document.createElement('div');
      root.id = APP.rootId;
      root.innerHTML = `
        <div class="nsl-shell nsl-hidden" data-nsl-shell>
          <div class="nsl-app">
            <div class="nsl-layout">
              <aside class="nsl-panel nsl-sidebar">
                <div class="nsl-head">
                  <h2 class="nsl-title">New Song Library</h2>
                  <div class="nsl-sub">Refactor ${APP.version}</div>
                </div>
                <form class="nsl-filters" data-filter-form>
                  ${this.renderFilterHtml()}
                  <button class="nsl-submit" type="submit">Search</button>
                </form>
              </aside>
              <main class="nsl-panel nsl-content">
                <div class="nsl-toolbar">
                  <div>
                    <div class="nsl-toolbar-title">Song Library</div>
                    <div class="nsl-toolbar-meta" data-result-info>Waiting for library cache...</div>
                  </div>
                  <button class="nsl-page-btn" type="button" data-refresh>Refresh</button>
                </div>
                <div class="nsl-list" data-list></div>
              </main>
            </div>
            <footer class="nsl-player">
              <div>
                <div class="nsl-track-title" data-track-title>No track selected</div>
                <div class="nsl-track-sub" data-track-sub>Pick a song from the list</div>
              </div>
              <div class="nsl-controls">
                <div class="nsl-control-row">
                  <button type="button" data-prev title="Previous">${icons.prev}</button>
                  <button class="nsl-play-main" type="button" data-play title="Play">${icons.play}</button>
                  <button type="button" data-repeat title="Repeat">${icons.repeat}</button>
                  <button type="button" data-next title="Next">${icons.next}</button>
                </div>
                <div class="nsl-progress-row">
                  <span data-time-current>0:00</span>
                  <div class="nsl-bar" data-progress-bar><div class="nsl-bar-fill" data-progress-fill></div></div>
                  <span data-time-total>0:00</span>
                </div>
              </div>
              <div class="nsl-volume">
                <button class="nsl-volume-btn" type="button" data-volume-toggle>${icons.volume}</button>
                <div class="nsl-bar" data-volume-bar title="Volume"><div class="nsl-bar-fill" data-volume-fill style="width:80%"></div></div><span class="nsl-volume-value" data-volume-value>80%</span>
              </div>
            </footer>
          </div>
        </div>
        <div class="nsl-modal nsl-hidden" data-modal>
          <div class="nsl-modal-card">
            <div class="nsl-modal-head">
              <h3 class="nsl-modal-title" data-modal-title>Song info</h3>
              <button class="nsl-close" type="button" data-modal-close>×</button>
            </div>
            <div class="nsl-modal-body" data-modal-body></div>
          </div>
        </div>`;

      const gameContainer = document.getElementById('gameContainer') || document.body;
      gameContainer.append(root);
      this.ui.root = root;
      this.ui.shell = root.querySelector('[data-nsl-shell]');
      this.ui.form = root.querySelector('[data-filter-form]');
      this.ui.list = root.querySelector('[data-list]');
      this.ui.resultInfo = root.querySelector('[data-result-info]');
      this.ui.trackTitle = root.querySelector('[data-track-title]');
      this.ui.trackSub = root.querySelector('[data-track-sub]');
      this.ui.playButton = root.querySelector('[data-play]');
      this.ui.repeatButton = root.querySelector('[data-repeat]');
      this.ui.progressFill = root.querySelector('[data-progress-fill]');
      this.ui.progressBar = root.querySelector('[data-progress-bar]');
      this.ui.timeCurrent = root.querySelector('[data-time-current]');
      this.ui.timeTotal = root.querySelector('[data-time-total]');
      this.ui.volumeFill = root.querySelector('[data-volume-fill]');
      this.ui.volumeBar = root.querySelector('[data-volume-bar]');
      this.ui.volumeToggle = root.querySelector('[data-volume-toggle]');
      this.ui.volumeValue = root.querySelector('[data-volume-value]');
      this.ui.modal = root.querySelector('[data-modal]');
      this.ui.modalTitle = root.querySelector('[data-modal-title]');
      this.ui.modalBody = root.querySelector('[data-modal-body]');

      this.injectMenuButton();
      this.fillCustomLists();
    }

    renderFilterHtml() {
      const checks = (items) => items.map(([name, label]) => `<label class="nsl-check"><input type="checkbox" name="${name}" checked> ${label}</label>`).join('');
      return `
        <section class="nsl-group">
          <h3 class="nsl-group-title">Search</h3>
          <div class="nsl-row"><input class="nsl-input" name="search" placeholder="Type..."><label class="nsl-check"><input type="checkbox" name="partial" checked> partial</label></div>
          <div class="nsl-grid2" style="margin-top:8px">
            <select class="nsl-select" name="searchIn"><option value="all">All</option><option value="anime">Anime</option><option value="song">Name</option><option value="artist">Artist</option><option value="composer">Composer</option><option value="arranger">Arranger</option></select>
            <select class="nsl-select" name="sort"><option value="idAsc" selected>annId Asc</option><option value="idDesc">annId Desc</option><option value="nameAsc">Name Asc</option><option value="nameDesc">Name Desc</option></select>
          </div>
        </section>
        <section class="nsl-group"><h3 class="nsl-group-title">Anime Status</h3><div class="nsl-grid2">${checks([['ptw', 'Plan to Watch'], ['watching', 'Watching'], ['completed', 'Completed'], ['onhold', 'On Hold'], ['dropped', 'Dropped'], ['statusOther', 'Other']])}</div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Anime Type</h3><div class="nsl-grid2">${checks([['tv', 'TV'], ['movie', 'Movie'], ['special', 'Special'], ['ova', 'OVA'], ['ona', 'ONA'], ['typeOther', 'Other']])}</div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Anime Year</h3><div class="nsl-grid2"><label class="nsl-check">From <input class="nsl-input" type="number" name="yearFrom" min="1900" max="2026" value="1900"></label><label class="nsl-check">To <input class="nsl-input" type="number" name="yearTo" min="1900" max="2026" value="2026"></label></div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Song Type</h3><div class="nsl-grid2">${checks([['op', 'Opening'], ['rebroadcast', 'Rebroadcast'], ['ed', 'Ending'], ['dub', 'Dub'], ['insert', 'Insert']])}</div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Song Category</h3><div class="nsl-grid2">${checks([['standard', 'Standard'], ['instrumental', 'Instrumental'], ['chanting', 'Chanting'], ['character', 'Character']])}</div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Saved</h3><div class="nsl-grid2">${checks([['saved', 'Saved'], ['notSaved', 'Not saved']])}</div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Rating</h3><div class="nsl-grid2">${checks([['like', 'Like'], ['dislike', 'Dislike'], ['unrated', 'Unrated']])}</div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Lists</h3><div class="nsl-grid2"><select class="nsl-select" name="list" data-list-select><option value="">None</option></select><select class="nsl-select" name="listMode"><option value="only">Only songs</option><option value="onlyA">Only anime</option><option value="dark">Dim</option><option value="remove">Remove</option></select></div></section>
      `;
    }

    injectMenuButton() {
      const menu = document.getElementById('rightMenuBarPartContainer');
      if (!menu || document.getElementById('nsl-open-button')) return;
      const btn = document.createElement('div');
      btn.id = 'nsl-open-button';
      btn.className = 'rightLeftButtonBottom clickAble nsl-toggle-button';
      btn.style.position = 'absolute';
      btn.style.right = '180px';
      btn.style.bottom = '0px';
      btn.style.zIndex = '-1';
      btn.innerHTML = '<span id="optionGlyphIcon" class="glyphicon glyphicon-music" aria-hidden="true"></span>';
      btn.addEventListener('click', () => this.toggleUI());
      menu.append(btn);
    }

    fillCustomLists() {
      const select = this.ui.root.querySelector('[data-list-select]');
      if (!select || !win.customListHandler?.customListMap) return;
      select.innerHTML = '<option value="">None</option>';
      win.customListHandler.customListMap.forEach((list) => {
        const opt = document.createElement('option');
        opt.value = String(list.customListId);
        opt.textContent = list._name || `List ${list.customListId}`;
        select.append(opt);
      });
    }

    bindUI() {
      this.ui.form.addEventListener('submit', (event) => { event.preventDefault(); this.page = 0; this.render(); });
      ['keydown', 'keypress', 'keyup'].forEach((type) => {
        this.ui.form.addEventListener(type, (event) => {
          if (event.target.closest('input, select, textarea')) event.stopPropagation();
          if (type === 'keydown' && event.key === 'Escape' && event.target?.name === 'search') {
            event.preventDefault();
            event.target.value = '';
            this.page = 0;
            this.render();
          }
        }, true);
      });
      this.ui.form.addEventListener('change', () => this.debouncedRender(120));
      this.ui.form.addEventListener('input', (event) => {
        event.stopPropagation();
        this.debouncedRender(event.target?.name === 'search' ? 700 : 180);
      });
      this.ui.root.querySelector('[data-refresh]').addEventListener('click', () => this.refreshLibrary());
      this.ui.root.querySelector('[data-prev]').addEventListener('click', () => this.prevTrack());
      this.ui.root.querySelector('[data-next]').addEventListener('click', () => this.nextTrack());
      this.ui.playButton.addEventListener('click', () => this.togglePlay());
      this.ui.repeatButton.addEventListener('click', () => this.toggleRepeat());
      this.ui.volumeToggle.addEventListener('click', () => this.toggleMute());
      this.ui.progressBar.addEventListener('mousedown', (event) => { this.state.seeking = true; this.setProgress(event); });
      this.ui.volumeBar.addEventListener('mousedown', (event) => { this.state.volumeSeeking = true; this.setVolume(event); });
      this.ui.volumeBar.addEventListener('wheel', (event) => {
        event.preventDefault();
        const next = Math.max(0, Math.min(1, this.audio.volume + (event.deltaY < 0 ? 0.05 : -0.05)));
        this.setVolumeValue(next);
      }, { passive: false });
      document.addEventListener('mousemove', (event) => {
        if (this.state.seeking) this.setProgress(event);
        if (this.state.volumeSeeking) this.setVolume(event);
      });
      document.addEventListener('mouseup', () => { this.state.seeking = false; this.state.volumeSeeking = false; });
      this.ui.list.addEventListener('click', (event) => this.onListClick(event));
      this.ui.list.addEventListener('change', (event) => this.onListChange(event));
      this.ui.modal.addEventListener('click', (event) => { if (event.target === this.ui.modal) this.closeModal(); });
      this.ui.root.querySelector('[data-modal-close]').addEventListener('click', () => this.closeModal());
      this.audio.addEventListener('timeupdate', () => this.updateProgress());
      this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
      this.audio.addEventListener('play', () => { this.state.playing = true; this.updatePlayState(); });
      this.audio.addEventListener('pause', () => { this.state.playing = false; this.updatePlayState(); });
      this.audio.addEventListener('ended', () => this.state.repeating ? this.audio.play() : this.nextTrack());
    }

    debouncedRender(delay = 350) {
      clearTimeout(this.renderTimer);
      this.renderTimer = setTimeout(() => { this.page = 0; this.render(); }, delay);
    }

    bindSocket() {
      if (this.socket?.addEventListener) this.socket.addEventListener('command', this.boundSocketHandler);
    }

    hookLibraryCache() {
      const handler = win.libraryCacheHandler;
      if (!handler) return;
      let cacheValue = handler.annSongIdAnnIdMap;
      try {
        Object.defineProperty(handler, 'annSongIdAnnIdMap', {
          configurable: true,
          get: () => cacheValue,
          set: (value) => { cacheValue = value; this.createSongMap(); },
        });
      } catch (_) {
        // If AMQ already sealed the property, the refresh button still gives a manual fallback.
      }
      handler.requestCacheUpdate?.(0);
      setTimeout(() => { if (!this.songMap.length) this.createSongMap(); }, 1500);
    }

    refreshLibrary() {
      win.libraryCacheHandler?.requestCacheUpdate?.(0);
      this.createSongMap();
    }

    toggleUI(force) {
      this.state.visible = typeof force === 'boolean' ? force : !this.state.visible;
      this.ui.shell.classList.toggle('nsl-hidden', !this.state.visible);
    }

    createSongMap() {
      const animeCache = win.libraryCacheHandler?.animeCache;
      if (!animeCache) return;
      const songs = [];
      Object.values(animeCache).forEach((anime) => {
        Object.values(anime.songMap || {}).forEach((song) => {
          songs.push({
            key: this.songKey(anime.annId, song.songEntry?.songId),
            song: {
              annId: song.annId,
              annSongId: song.annSongId,
              dub: Number(song.dub || 0),
              number: Number(song.number || 0),
              rebroadcast: Number(song.rebroadcast || 0),
              type: Number(song.type || 0),
              uploadStatus: song.uploadStatus,
              uploaded: song.uploaded,
              wrongIndex: song.wrongIndex,
              audio: null,
            },
            songEntry: {
              arranger: song.songEntry?.arranger,
              arrangerArtistId: song.songEntry?.arrangerArtistId,
              arrangerGroupId: song.songEntry?.arrangerGroupId,
              artist: song.songEntry?.artist,
              category: Number(song.songEntry?.category || 0),
              composer: song.songEntry?.composer,
              composerArtistId: song.songEntry?.composerArtistId,
              composerGroupId: song.songEntry?.composerGroupId,
              dub: song.songEntry?.dub,
              name: song.songEntry?.name || '',
              rebroadcast: song.songEntry?.rebroadcast,
              searchIndex: song.songEntry?.searchIndex,
              searchNames: this.normalizedNames(song.songEntry?.searchNames || [song.songEntry?.name]),
              songArtistId: song.songEntry?.songArtistId,
              songGroupId: song.songEntry?.songGroupId,
              songId: song.songEntry?.songId,
              status: 0,
            },
            animeEntry: {
              annId: anime.annId,
              category: anime.category || { name: '' },
              mainNames: anime.mainNames || {},
              names: anime.names || [],
              searchIndex: anime.searchIndex,
              searchNames: this.normalizedNames(anime.searchNames || Object.values(anime.mainNames || {})),
              seasonId: anime.seasonId,
              year: Number(anime.year || 0),
              status: 0,
            },
          });
        });
      });
      this.songMap = songs;
      this.rebuildIndexes();
      this.fillCustomLists();
      this.render();
      this.emit('get anime status list');
      this.emit('get player status list');
    }

    rebuildIndexes() {
      this.songByKey.clear();
      this.songByAnnSongId.clear();
      this.songMap.forEach((song) => {
        song.key = this.songKey(song.animeEntry.annId, song.songEntry.songId);
        song._search = this.prepareSearchIndex(song);
        this.songByKey.set(song.key, song);
        this.songByAnnSongId.set(Number(song.song.annSongId), song);
      });
    }

    songKey(annId, songId) { return `${annId}:${songId}`; }

    normalizedNames(names) {
      return (Array.isArray(names) ? names : [names]).filter(Boolean).map((name) => String(name).toLowerCase());
    }

    prepareSearchIndex(song) {
      const join = (items) => this.normalizedNames(items).join(' | ');
      const anime = join(song.animeEntry.searchNames);
      const songName = join(song.songEntry.searchNames);
      const artist = join(this.artistNamesFast(song.songEntry.artist));
      const composer = join(this.artistNamesFast(song.songEntry.composer));
      const arranger = join(this.artistNamesFast(song.songEntry.arranger));
      return { anime, song: songName, artist, composer, arranger, all: `${anime} | ${songName} | ${artist} | ${composer} | ${arranger}` };
    }

    artistNamesFast(artist) {
      if (!artist) return [];
      const names = [...(artist.searchNames || []), artist.name].filter(Boolean);
      (artist.artistMembers || []).forEach((member) => names.push(...(member.searchNames || []), member.name));
      (artist.groupMembers || []).forEach((member) => names.push(...(member.searchNames || []), member.name));
      return names.filter(Boolean);
    }

    onSocketCommand(event) {
      if (!event?.command) return;
      switch (event.command) {
        case 'answer results': this.handleAnswerResults(event.data); break;
        case 'get song extended info': this.receiveSongInfo(event.data); break;
        case 'get anime extended info': this.receiveAnimeInfo(event.data); break;
        case 'get anime status list': this.applyAnimeStatuses(event.data?.animeListMap || {}); break;
        case 'get player status list': this.applySongStatuses(event.data?.statusListMap || {}); break;
        case 'anime list update result': this.emit('get anime status list'); break;
      }
    }

    receiveSongInfo(data) {
      const song = this.findSongFromExtended(data);
      if (!song) return;
      song.amqSong = data;
      const action = this.pendingSongRequests.get(Number(data.annSongId));
      this.pendingSongRequests.delete(Number(data.annSongId));
      if (action === 'modal') this.renderModal(song);
      else this.loadTrack(song);
    }

    receiveAnimeInfo(data) {
      const song = this.songMap.find((item) => Number(item.animeEntry.annId) === Number(data.annId));
      if (!song) return;
      this.songMap.filter((item) => Number(item.animeEntry.annId) === Number(data.annId)).forEach((item) => { item.amqAnime = data; });
      const key = String(data.annId);
      const actions = this.pendingAnimeRequests.get(key) || [];
      this.pendingAnimeRequests.delete(key);
      actions.forEach((action) => this.runAnimeAction(song, action));
    }

    requestAnimeInfo(song, action) {
      if (song.amqAnime) return this.runAnimeAction(song, action);
      const key = String(song.animeEntry.annId);
      const actions = this.pendingAnimeRequests.get(key) || [];
      actions.push(action);
      this.pendingAnimeRequests.set(key, actions);
      if (actions.length === 1) this.emit('get anime extended info', { annId: song.animeEntry.annId, includeFileNames: true });
    }

    runAnimeAction(song, action) {
      if (action.type === 'modal') return this.renderModal(song);
      if (action.type === 'open') return this.openAnimeLink(song, action.popup);
      if (action.type === 'status') return this.updateMalStatus(song, action.status, action.select, action.oldStatus);
    }

    findSongFromExtended(data) {
      if (data?.annSongId && this.songByAnnSongId.has(Number(data.annSongId))) return this.songByAnnSongId.get(Number(data.annSongId));
      return this.songMap.find((song) => Number(song.songEntry.songId) === Number(data?.songId) && Number(song.animeEntry.annId) === Number(data?.annId));
    }

    applyAnimeStatuses(statusMap) {
      this.songMap.forEach((song) => { song.animeEntry.status = Number(statusMap[song.animeEntry.annId] || 0); });
      this.render();
    }

    applySongStatuses(statusMap) {
      this.songMap.forEach((song) => { song.songEntry.status = Number(statusMap[song.song.annSongId] || 0); });
      this.render();
    }

    filterValues() { return Object.fromEntries(new FormData(this.ui.form).entries()); }
    checked(name) { return Boolean(this.ui.form.elements[name]?.checked); }

    filterSongs() {
      const values = this.filterValues();
      const query = String(values.search || '').trim().toLowerCase();
      const partial = this.checked('partial');
      const yearFrom = Number(values.yearFrom || 1900);
      const yearTo = Number(values.yearTo || 2026);
      const selectedList = this.getSelectedCustomList(values.list);
      this.onlyAnimeIds = selectedList && values.listMode === 'onlyA'
        ? new Set(this.songMap.filter((item) => selectedList.songMap?.has(item.song.annSongId)).map((item) => Number(item.animeEntry.annId)))
        : null;
      const allowSaved = this.checked('saved');
      const allowNotSaved = this.checked('notSaved');
      const allowRebroadcast = this.checked('rebroadcast');
      const allowDub = this.checked('dub');
      const result = [];
      const limitedSearch = query.length > 0;
      for (const song of this.songMap) {
        if (limitedSearch && result.length >= APP.searchLimit) break;
        const saved = this.savedSongs.has(Number(song.songEntry.songId));
        if (!allowSaved && saved) continue;
        if (!allowNotSaved && !saved) continue;
        if (!allowRebroadcast && song.song.rebroadcast === 1) continue;
        if (!allowDub && song.song.dub === 1) continue;
        if (song.animeEntry.year < yearFrom || song.animeEntry.year > yearTo) continue;
        if (!this.songRatingAllowed(song.songEntry.status)) continue;
        if (!this.songTypeAllowed(song.song.type)) continue;
        if (!this.animeStatusAllowed(song.animeEntry.status)) continue;
        if (!this.songCategoryAllowed(song.songEntry.category)) continue;
        if (!this.animeTypeAllowed(song.animeEntry.category?.name || '')) continue;
        if (selectedList && values.listMode === 'only' && !selectedList.songMap?.has(song.song.annSongId)) continue;
        if (this.onlyAnimeIds && !this.onlyAnimeIds.has(Number(song.animeEntry.annId))) continue;
        if (selectedList && values.listMode === 'remove' && selectedList.songMap?.has(song.song.annSongId)) continue;
        if (query && !this.matchesSearch(song, query, partial, values.searchIn)) continue;
        result.push(song);
      }
      this.searchLimited = limitedSearch && result.length >= APP.searchLimit;
      return result;
    }

    getSelectedCustomList(id) {
      if (!id || !win.customListHandler?.customListMap) return null;
      return win.customListHandler.customListMap.get(Number(id)) || null;
    }

    songRatingAllowed(status) {
      if (status === 1) return this.checked('like');
      if (status === 2) return this.checked('dislike');
      return this.checked('unrated');
    }

    songTypeAllowed(type) {
      if (type === 1) return this.checked('op');
      if (type === 2) return this.checked('ed');
      if (type === 3) return this.checked('insert');
      return false;
    }

    animeStatusAllowed(status) {
      const map = { 1: 'watching', 2: 'completed', 3: 'onhold', 4: 'dropped', 5: 'ptw' };
      return this.checked(map[status] || 'statusOther');
    }

    songCategoryAllowed(category) {
      const map = { 1: 'instrumental', 2: 'chanting', 3: 'character', 4: 'standard' };
      return this.checked(map[category] || 'standard');
    }

    animeTypeAllowed(categoryName) {
      const [firstRaw, secondRaw = ''] = String(categoryName).split(' ');
      const first = firstRaw.toLowerCase();
      const second = secondRaw.toLowerCase();
      if (first === 'tv') return second === 'special' ? this.checked('special') : this.checked('tv');
      if (first === 'season') return this.checked('tv');
      if (first === 'movie') return this.checked('movie');
      if (first === 'ova') return this.checked('ova');
      if (first === 'ona') return this.checked('ona');
      if (first === 'special') return this.checked('special');
      return this.checked('typeOther');
    }

    matchesSearch(song, query, partial, area) {
      const index = song._search || this.prepareSearchIndex(song);
      const text = index[area] || index.all || '';
      if (partial) return text.includes(query);
      return text.split(' | ').some((name) => name === query);
    }

    artistNames(artist) {
      if (!artist) return [];
      const names = [...(artist.searchNames || [])];
      (artist.artistMembers || []).forEach((member) => names.push(...(member.searchNames || [])));
      (artist.groupMembers || []).forEach((member) => names.push(...(member.searchNames || [])));
      return this.normalizedNames(names);
    }

    nameBucketMatches(names, query, partial) {
      return this.normalizedNames(names).some((name) => partial ? name.includes(query) : name === query);
    }

    sortSongs(songs) {
      const sort = this.filterValues().sort || 'idAsc';
      const animeName = (song) => this.displayAnimeName(song).main || '';
      return [...songs].sort((a, b) => {
        const bySong = a.song.type - b.song.type || a.song.number - b.song.number || String(a.songEntry.name).localeCompare(String(b.songEntry.name));
        if (sort === 'idAsc') return a.animeEntry.annId - b.animeEntry.annId || bySong;
        if (sort === 'idDesc') return b.animeEntry.annId - a.animeEntry.annId || bySong;
        if (sort === 'nameDesc') return -animeName(a).localeCompare(animeName(b)) || bySong;
        return animeName(a).localeCompare(animeName(b)) || bySong;
      });
    }

    render() {
      this.filteredSongs = this.sortSongs(this.filterSongs());
      const uniqueAnime = new Set(this.filteredSongs.map((song) => song.animeEntry.annId));
      this.ui.resultInfo.textContent = `${this.filteredSongs.length} songs / ${uniqueAnime.size} animes${this.searchLimited ? ' · showing first ' + APP.searchLimit : ''}`;
      this.renderPage();
      this.updatePlayState();
    }

    setPage(page) {
      this.page = Math.max(0, Math.min(page, Math.max(0, this.filteredSongs.length - 1)));
      this.renderPage();
      this.ui.list.scrollTop = 0;
    }

    renderPage() {
      const list = this.ui.list;
      list.textContent = '';
      if (!this.filteredSongs.length) {
        list.innerHTML = '<div class="nsl-empty">Nothing found. Try changing filters.</div>';
        return;
      }
      const fragment = document.createDocumentFragment();
      fragment.append(this.paginationNode());
      const visible = this.filteredSongs.slice(this.page, this.page + APP.pageSize);
      this.groupByAnime(visible).forEach((group) => fragment.append(this.renderAnimeGroup(group)));
      fragment.append(this.paginationNode());
      list.append(fragment);
      this.attachArtistHovers(list);
    }

    groupByAnime(songs) {
      const groups = [];
      let current = null;
      songs.forEach((song) => {
        if (!current || current.annId !== song.animeEntry.annId) {
          current = { annId: song.animeEntry.annId, anime: song.animeEntry, firstSong: song, songs: [] };
          groups.push(current);
        }
        current.songs.push(song);
      });
      return groups;
    }

    paginationNode() {
      const wrap = document.createElement('div');
      wrap.className = 'nsl-pagination';
      const from = this.filteredSongs.length ? this.page + 1 : 0;
      const to = Math.min(this.page + APP.pageSize, this.filteredSongs.length);
      wrap.innerHTML = `<button class="nsl-page-btn" type="button" data-page="${this.page - APP.pageSize}" ${this.page <= 0 ? 'disabled' : ''}>Prev</button><span>${from}–${to} / ${this.filteredSongs.length}</span><button class="nsl-page-btn" type="button" data-page="${this.page + APP.pageSize}" ${to >= this.filteredSongs.length ? 'disabled' : ''}>Next</button>`;
      wrap.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-page]');
        if (btn && !btn.disabled) this.setPage(Number(btn.dataset.page));
      });
      return wrap;
    }

    renderAnimeGroup(group) {
      const values = this.filterValues();
      const selectedList = this.getSelectedCustomList(values.list);
      const dim = selectedList && values.listMode === 'dark' && group.songs.length > 0 && group.songs.every((song) => selectedList.songMap?.has(song.song.annSongId));
      const name = this.displayAnimeName(group.firstSong);
      const section = document.createElement('section');
      section.className = `nsl-anime${dim ? ' nsl-dim' : ''}`;
      section.dataset.annId = group.anime.annId;
      section.innerHTML = `
        <div class="nsl-anime-head">
          <button class="nsl-anime-main" type="button" data-anime-link title="Open anime page">${this.escape(name.main)}${name.secondary ? `<span class="nsl-anime-alt">${this.escape(name.secondary)}</span>` : ''}</button>
          <div class="nsl-anime-tags"><select class="nsl-anime-status nsl-status-${group.anime.status}" data-anime-status data-old-status="${group.anime.status}" title="Change MyAnimeList status">${this.animeStatusOptions(group.anime.status)}</select><span class="nsl-chip">${this.escape(group.anime.category?.name || 'Unknown')}</span><span class="nsl-chip">${group.anime.year || '-'}</span><span class="nsl-chip">${group.songs.length} songs</span></div>
        </div>`;
      group.songs.forEach((song) => {
        const songRow = this.renderSongRow(song);
        if (selectedList && values.listMode === 'dark' && selectedList.songMap?.has(song.song.annSongId)) songRow.classList.add('nsl-dim');
        if (selectedList && values.listMode === 'onlyA' && !selectedList.songMap?.has(song.song.annSongId)) songRow.classList.add('nsl-dim');
        section.append(songRow);
      });
      return section;
    }

    renderSongRow(song) {
      const row = document.createElement('div');
      row.className = 'nsl-song';
      row.dataset.key = song.key;
      const saved = this.savedSongs.has(Number(song.songEntry.songId));
      row.innerHTML = `
        <div><span class="nsl-song-type nsl-type-${song.song.type}">${this.escape(this.songType(song, true))}</span></div>
        <div class="nsl-song-name" title="${this.escape(song.songEntry.name)}">${this.escape(song.songEntry.name)} <span>— </span><span class="nsl-artist nsl-song-artist"></span></div>
        <label class="nsl-save"><input type="checkbox" data-save ${saved ? 'checked' : ''}> Saved</label>
        <select class="nsl-rate" data-rate title="Like status">
          <option value="1" ${song.songEntry.status === 1 ? 'selected' : ''}>L</option>
          <option value="0" ${song.songEntry.status === 0 ? 'selected' : ''}>-</option>
          <option value="2" ${song.songEntry.status === 2 ? 'selected' : ''}>D</option>
        </select>
        <div style="display:flex;gap:6px;justify-content:flex-end;min-width:0"><button class="nsl-icon-btn" type="button" data-anime-link title="Open anime page">${icons.external}</button><button class="nsl-icon-btn" type="button" data-info title="Info">${icons.info}</button><button class="nsl-icon-btn" type="button" data-play-song title="Play">${icons.play}</button></div>`;
      return row;
    }

    onListClick(event) {
      const pageButton = event.target.closest('[data-page]');
      if (pageButton && !pageButton.disabled) return this.setPage(Number(pageButton.dataset.page));
      const animeLink = event.target.closest('[data-anime-link]');
      if (animeLink) {
        const container = animeLink.closest('.nsl-song, .nsl-anime');
        const song = container?.classList.contains('nsl-song')
          ? this.songByKey.get(container.dataset.key)
          : this.songMap.find((item) => String(item.animeEntry.annId) === String(container?.dataset.annId));
        if (song) this.openAnime(song);
        return;
      }
      const row = event.target.closest('.nsl-song');
      if (!row) return;
      const song = this.songByKey.get(row.dataset.key);
      if (!song) return;
      if (event.target.closest('[data-play-song]')) this.loadSong(song);
      if (event.target.closest('[data-info]')) this.openModal(song);
    }

    onListChange(event) {
      if (event.target.matches('[data-anime-status]')) {
        const section = event.target.closest('.nsl-anime');
        const song = this.songMap.find((item) => String(item.animeEntry.annId) === String(section?.dataset.annId));
        if (song) this.changeAnimeStatus(song, Number(event.target.value), event.target);
        return;
      }
      const row = event.target.closest('.nsl-song');
      if (!row) return;
      const song = this.songByKey.get(row.dataset.key);
      if (!song) return;
      if (event.target.matches('[data-save]')) this.setSaved(song.songEntry.songId, event.target.checked);
      if (event.target.matches('[data-rate]')) this.setSongRating(song, Number(event.target.value));
    }

    setSaved(songId, checked) {
      const id = Number(songId);
      if (checked) this.savedSongs.add(id); else this.savedSongs.delete(id);
      this.persistSavedSongs();
    }

    setSongRating(song, status) {
      song.songEntry.status = status;
      this.emit('set song like status', { annSongId: song.song.annSongId, stateId: status });
    }

    openAnime(song) {
      const fallbackUrl = `https://www.animenewsnetwork.com/encyclopedia/anime.php?id=${encodeURIComponent(song.animeEntry.annId)}`;
      const popup = win.open(fallbackUrl, '_blank');
      if (!popup) {
        this.showToast('The browser blocked the anime page. Allow pop-ups for Anime Music Quiz.', true);
        return;
      }
      try { popup.opener = null; } catch (_) {}
      this.requestAnimeInfo(song, { type: 'open', popup });
    }

    openAnimeLink(song, popup) {
      const anime = song.amqAnime || {};
      const url = anime.malId
        ? `https://myanimelist.net/anime/${encodeURIComponent(anime.malId)}`
        : anime.anilistId
          ? `https://anilist.co/anime/${encodeURIComponent(anime.anilistId)}`
          : anime.kitsuId
            ? `https://kitsu.app/anime/${encodeURIComponent(anime.kitsuId)}`
            : `https://www.animenewsnetwork.com/encyclopedia/anime.php?id=${encodeURIComponent(song.animeEntry.annId)}`;
      if (popup && !popup.closed) popup.location.replace(url);
      else win.open(url, '_blank', 'noopener,noreferrer');
    }

    changeAnimeStatus(song, status, select) {
      const oldStatus = Number(select.dataset.oldStatus || song.animeEntry.status || 0);
      if (status === oldStatus) return;
      select.disabled = true;
      this.requestAnimeInfo(song, { type: 'status', status, select, oldStatus });
    }

    async updateMalStatus(song, status, select, oldStatus) {
      try {
        const malId = Number(song.amqAnime?.malId);
        if (!malId) throw new Error('This anime has no MyAnimeList ID.');
        const malStatus = APP.malStatusMap[status];
        if (!malStatus) throw new Error('Unsupported MyAnimeList status.');

        const editUrl = `https://myanimelist.net/ownlist/anime/${malId}/edit?hideLayout=1`;
        const page = await this.gmRequest({ method: 'GET', url: editUrl });
        if (page.status < 200 || page.status >= 300) throw new Error(`MyAnimeList returned HTTP ${page.status}.`);
        const doc = new DOMParser().parseFromString(page.responseText, 'text/html');
        const csrf = doc.querySelector('meta[name="csrf_token"]')?.content;
        if (!csrf) throw new Error('Sign in to MyAnimeList in this browser, then try again.');

        const valueOf = (...selectors) => {
          for (const selector of selectors) {
            const element = doc.querySelector(selector);
            if (element?.value != null && element.value !== '') return Number(element.value);
          }
          return null;
        };
        const payload = { anime_id: malId, status: malStatus, csrf_token: csrf };
        const score = valueOf('#add_anime_score', '[name="score"]');
        const progress = valueOf('#add_anime_num_watched_episodes', '[name="num_watched_episodes"]');
        if (score != null) payload.score = score;
        if (progress != null) payload.num_watched_episodes = progress;

        const postStatus = (operation) => this.gmRequest({
          method: 'POST',
          url: `https://myanimelist.net/ownlist/anime/${operation}.json`,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', Origin: 'https://myanimelist.net', Referer: editUrl },
          data: JSON.stringify(payload),
        });
        const accepted = (response) => response.status >= 200 && response.status < 300 && !/^\s*</.test(response.responseText || '');
        const firstOperation = oldStatus ? 'edit' : 'add';
        let result = await postStatus(firstOperation);
        if (!accepted(result)) result = await postStatus(firstOperation === 'edit' ? 'add' : 'edit');
        if (!accepted(result)) {
          throw new Error(`MyAnimeList did not accept the change (HTTP ${result.status}). Make sure you are signed in.`);
        }

        this.songMap
          .filter((item) => Number(item.animeEntry.annId) === Number(song.animeEntry.annId))
          .forEach((item) => { item.animeEntry.status = status; });
        this.render();
        this.showToast(`${this.displayAnimeName(song).main}: ${this.animeStatusLabel(status)} saved to MyAnimeList.`);
      } catch (error) {
        console.error('[NSL] MyAnimeList status update failed:', error);
        if (select?.isConnected) {
          select.value = String(oldStatus);
          select.disabled = false;
        }
        this.showToast(error?.message || 'Unable to update MyAnimeList.', true);
      }
    }

    gmRequest(details) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          timeout: 15000,
          anonymous: false,
          ...details,
          onload: resolve,
          onerror: () => reject(new Error('Network error while contacting MyAnimeList.')),
          ontimeout: () => reject(new Error('MyAnimeList request timed out.')),
        });
      });
    }

    showToast(message, error = false) {
      this.ui.root.querySelector('.nsl-toast')?.remove();
      const toast = document.createElement('div');
      toast.className = `nsl-toast${error ? ' nsl-error' : ''}`;
      toast.textContent = message;
      this.ui.root.append(toast);
      setTimeout(() => toast.remove(), error ? 6500 : 3500);
    }

    loadSong(song) {
      if (this.state.currentTrack?.key === song.key && this.state.playing) return this.togglePlay();
      if (!song.amqSong?.fileName) {
        this.pendingSongRequests.set(Number(song.song.annSongId), 'play');
        this.emit('get song extended info', { annSongId: song.song.annSongId, includeFileNames: true });
        return;
      }
      this.loadTrack(song);
    }

    loadTrack(song) {
      const fileName = song.song.audio || song.amqSong?.fileName;
      if (!fileName) return;
      song.song.audio = fileName;
      this.state.currentTrack = song;
      this.audio.src = `${APP.audioHost}${fileName}`;
      this.ui.trackTitle.innerHTML = `${this.escape(song.songEntry.name)} — <span class="nsl-artist nsl-player-artist"></span>`;
      this.getArtistHover(song.songEntry.artist, $(this.ui.trackTitle).find('.nsl-player-artist'));
      this.ui.trackSub.textContent = `${this.displayAnimeName(song).main} (${this.songType(song)})`;
      this.audio.play().catch((error) => {
        console.error('[NSL] Playback error:', error);
        this.state.playing = false;
        this.updatePlayState();
      });
      this.updatePlayState();
    }

    togglePlay() {
      if (!this.state.currentTrack) return;
      if (this.audio.paused) this.audio.play().catch(console.error);
      else this.audio.pause();
    }

    toggleRepeat() {
      this.state.repeating = !this.state.repeating;
      this.ui.repeatButton.classList.toggle('nsl-repeat-on', this.state.repeating);
    }

    prevTrack() {
      if (!this.filteredSongs.length) return;
      const index = this.currentFilteredIndex();
      const nextIndex = index <= 0 ? this.filteredSongs.length - 1 : index - 1;
      this.loadSong(this.filteredSongs[nextIndex]);
    }

    nextTrack() {
      if (!this.filteredSongs.length) return;
      const index = this.currentFilteredIndex();
      const nextIndex = index < 0 || index >= this.filteredSongs.length - 1 ? 0 : index + 1;
      this.loadSong(this.filteredSongs[nextIndex]);
    }

    currentFilteredIndex() {
      const key = this.state.currentTrack?.key;
      return this.filteredSongs.findIndex((song) => song.key === key);
    }

    updatePlayState() {
      const isPlaying = !this.audio.paused && Boolean(this.state.currentTrack);
      this.state.playing = isPlaying;
      this.ui.playButton.innerHTML = isPlaying ? icons.pause : icons.play;
      this.ui.list.querySelectorAll('.nsl-song').forEach((row) => {
        const active = this.state.currentTrack?.key === row.dataset.key && isPlaying;
        row.classList.toggle('nsl-playing', active);
        const btn = row.querySelector('[data-play-song]');
        if (btn) btn.innerHTML = active ? icons.pause : icons.play;
      });
    }

    setProgress(event) {
      if (!Number.isFinite(this.audio.duration)) return;
      const ratio = this.pointerRatio(event, this.ui.progressBar);
      this.audio.currentTime = ratio * this.audio.duration;
      this.ui.progressFill.style.width = `${ratio * 100}%`;
    }

    updateProgress() {
      if (this.state.seeking || !Number.isFinite(this.audio.duration)) return;
      const ratio = this.audio.currentTime / this.audio.duration;
      this.ui.progressFill.style.width = `${ratio * 100}%`;
      this.ui.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
    }

    updateDuration() { this.ui.timeTotal.textContent = this.formatTime(this.audio.duration); }

    setVolumeValue(value) {
      this.state.volume = value;
      this.audio.volume = value;
      this.ui.volumeFill.style.width = `${value * 100}%`;
      if (this.ui.volumeValue) this.ui.volumeValue.textContent = `${Math.round(value * 100)}%`;
      this.ui.volumeToggle.innerHTML = value === 0 ? icons.mute : icons.volume;
    }

    setVolume(event) {
      const ratio = this.pointerRatio(event, this.ui.volumeBar);
      this.state.volume = ratio;
      this.audio.volume = ratio;
      this.ui.volumeFill.style.width = `${ratio * 100}%`;
      if (this.ui.volumeValue) this.ui.volumeValue.textContent = `${Math.round(ratio * 100)}%`;
      this.ui.volumeToggle.innerHTML = ratio === 0 ? icons.mute : icons.volume;
    }

    toggleMute() {
      if (this.audio.volume > 0) {
        this.state.lastVolume = this.audio.volume;
        this.audio.volume = 0;
        this.ui.volumeFill.style.width = '0%';
        if (this.ui.volumeValue) this.ui.volumeValue.textContent = '0%';
        this.ui.volumeToggle.innerHTML = icons.mute;
      } else {
        const value = this.state.lastVolume || 0.8;
        this.audio.volume = value;
        this.state.volume = value;
        this.ui.volumeFill.style.width = `${value * 100}%`;
        if (this.ui.volumeValue) this.ui.volumeValue.textContent = `${Math.round(value * 100)}%`;
        this.ui.volumeToggle.innerHTML = icons.volume;
      }
    }

    pointerRatio(event, element) {
      const rect = element.getBoundingClientRect();
      return Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    }

    openModal(song) {
      this.ui.modal.classList.remove('nsl-hidden');
      this.ui.modalTitle.textContent = this.displayAnimeName(song).main;
      this.ui.modalBody.innerHTML = '<div class="nsl-empty">Loading extended info...</div>';
      let waiting = false;
      if (!song.amqSong) {
        this.pendingSongRequests.set(Number(song.song.annSongId), 'modal');
        this.emit('get song extended info', { annSongId: song.song.annSongId, includeFileNames: true });
        waiting = true;
      }
      if (!song.amqAnime) {
        this.requestAnimeInfo(song, { type: 'modal' });
        waiting = true;
      }
      if (!waiting) this.renderModal(song);
    }

    closeModal() {
      const video = this.ui.modalBody.querySelector('video');
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
      this.ui.modal.classList.add('nsl-hidden');
    }

    renderModal(song) {
      if (this.ui.modal.classList.contains('nsl-hidden')) return;
      const videoSrc = song.amqSong?.fileNameMap?.['720'] || song.amqSong?.fileNameMap?.['480'] || '';
      const anime = song.amqAnime || {};
      this.ui.modalTitle.textContent = this.displayAnimeName(song).full;
      this.ui.modalBody.innerHTML = `
        ${videoSrc ? `<video class="nsl-video" src="${APP.audioHost}${this.escapeAttr(videoSrc)}" autoplay controls></video>` : '<div class="nsl-card">No video file found.</div>'}
        <div class="nsl-card"><div class="nsl-label">Song</div><div class="nsl-card-value"><b>${this.escape(song.songEntry.name)}</b> — <span class="nsl-artist elNSLModalSongArtist"></span> <span class="nsl-chip">${this.escape(this.songType(song))}</span></div></div>
        <div class="nsl-info-grid">
          <div class="nsl-card"><div class="nsl-label">Composer</div><div class="nsl-card-value nsl-artist elNSLModalSongComposer"></div></div>
          <div class="nsl-card"><div class="nsl-label">Arranger</div><div class="nsl-card-value nsl-artist elNSLModalSongArranger"></div></div>
          <div class="nsl-card"><div class="nsl-label">Difficulty</div><div class="nsl-card-value">${this.escape(song.amqSong?.globalPercent ?? '-')} / ${this.escape(song.amqSong?.recentPercent ?? '-')}</div></div>
        </div>
        <div class="nsl-info-grid">
          <div class="nsl-card"><div class="nsl-label">AnnId</div><div class="nsl-card-value">${this.escape(song.animeEntry.annId)}</div></div>
          <div class="nsl-card"><div class="nsl-label">AnnSongId</div><div class="nsl-card-value">${this.escape(song.song.annSongId)}</div></div>
          <div class="nsl-card"><div class="nsl-label">SongId</div><div class="nsl-card-value">${this.escape(song.songEntry.songId)}</div></div>
        </div>
        <div class="nsl-card"><div class="nsl-label">Genres</div><div class="nsl-tags">${this.tagsHtml(anime.genres)}</div></div>
        <div class="nsl-card"><div class="nsl-label">Tags</div><div class="nsl-tags">${this.tagsHtml(anime.tags)}</div></div>
        <div class="nsl-card nsl-links"><div class="nsl-label">Links</div>${this.linksHtml(anime)}</div>`;
      const $modal = $(this.ui.modalBody);
      this.getArtistHover(song.songEntry.artist, $modal.find('.elNSLModalSongArtist'));
      this.getArtistHover(song.songEntry.composer, $modal.find('.elNSLModalSongComposer'));
      this.getArtistHover(song.songEntry.arranger, $modal.find('.elNSLModalSongArranger'));
    }

    attachArtistHovers(container) {
      container.querySelectorAll('.nsl-song').forEach((row) => {
        const song = this.songByKey.get(row.dataset.key);
        if (!song) return;
        this.getArtistHover(song.songEntry.artist, $(row).find('.nsl-song-artist'));
      });
    }

    getArtistHover(artist, element) {
      const $element = element?.jquery ? element : $(element);
      if (!$element?.length) return;

      $element
        .empty()
        .removeClass('nsl-artist-hover-target');

      if (!artist?.name) {
        $element.text('-');
        return;
      }

      $element
        .text(artist.name)
        .addClass('nsl-artist-hover-target');

      let ArtistHoverClass = win.ArtistHover;
      if (!ArtistHoverClass && typeof unsafeWindow !== 'undefined') ArtistHoverClass = unsafeWindow.ArtistHover;
      if (!ArtistHoverClass && typeof ArtistHover !== 'undefined') ArtistHoverClass = ArtistHover;

      if (typeof ArtistHoverClass === 'function') {
        try {
          new ArtistHoverClass(artist, $element, undefined, null, false);
        } catch (error) {
          console.warn('[NSL] ArtistHover failed:', error);
        }
      }
    }

    tagsHtml(items = []) {
      return items.length ? items.map((item) => `<span class="nsl-chip">${this.escape(item)}</span>`).join('') : '<span class="nsl-chip">-</span>';
    }

    linksHtml(anime) {
      const links = [];
      if (anime.annId) links.push(`<a target="_blank" href="https://www.animenewsnetwork.com/encyclopedia/anime.php?id=${encodeURIComponent(anime.annId)}">ANN</a>`);
      if (anime.malId) links.push(`<a target="_blank" href="https://myanimelist.net/anime/${encodeURIComponent(anime.malId)}">MAL</a>`);
      if (anime.anilistId) links.push(`<a target="_blank" href="https://anilist.co/anime/${encodeURIComponent(anime.anilistId)}">Anilist</a>`);
      if (anime.kitsuId) links.push(`<a target="_blank" href="https://kitsu.app/anime/${encodeURIComponent(anime.kitsuId)}">Kitsu</a>`);
      return links.join('') || '-';
    }

    handleAnswerResults(data) {
      const info = data?.songInfo;
      if (!info) return;
      const artistId = info.artistInfo && ('artistId' in info.artistInfo ? info.artistInfo.artistId : info.artistInfo.groupId);
      const found = this.songMap.find((song) => Number(song.animeEntry.annId) === Number(info.annId) && song.songEntry.name === info.songName && (artistId == song.songEntry.artist?.groupId || artistId == song.songEntry.songArtistId));
      if (!found) return;
      const timer = setInterval(() => {
        const target = document.getElementById('qpSongType');
        if (!target || document.getElementById('nsl-answer-save')) return;
        const wrap = document.createElement('div');
        wrap.id = 'nsl-answer-save';
        wrap.innerHTML = `<label for="nsl-answer-save-checkbox">Saved</label> <input id="nsl-answer-save-checkbox" type="checkbox" ${this.savedSongs.has(Number(found.songEntry.songId)) ? 'checked' : ''}>`;
        wrap.querySelector('input').addEventListener('change', (event) => this.setSaved(found.songEntry.songId, event.target.checked));
        target.append(wrap);
        clearInterval(timer);
      }, 100);
      setTimeout(() => clearInterval(timer), 5000);
    }

    displayAnimeName(song) {
      const ja = song.animeEntry.mainNames?.JA || '';
      const en = song.animeEntry.mainNames?.EN || '';
      const main = ja || en || `ANN ${song.animeEntry.annId}`;
      const secondary = ja && en && ja !== en ? en : '';
      return { main, secondary, full: secondary ? `${main} / ${secondary}` : main };
    }

    songType(song, short = false) {
      let suffix = song.song.number ? ` ${song.song.number}` : '';
      if (song.song.rebroadcast) suffix += ' R';
      if (song.song.dub) suffix += ' D';
      if (song.song.type === 1) return `${short ? 'OP' : 'Opening'}${suffix}`;
      if (song.song.type === 2) return `${short ? 'ED' : 'Ending'}${suffix}`;
      return `${short ? 'INS' : 'Insert'}${suffix}`;
    }

    animeStatusLabel(status) {
      return ({ 1: 'Watching', 2: 'Completed', 3: 'On Hold', 4: 'Dropped', 5: 'Plan to Watch' })[status] || 'Other';
    }

    animeStatusOptions(status) {
      const options = status === 0 ? [[0, 'Not in MAL']] : [];
      options.push([1, 'Watching'], [2, 'Completed'], [3, 'On Hold'], [4, 'Dropped'], [5, 'Plan to Watch']);
      return options.map(([value, label]) => `<option value="${value}" ${Number(status) === value ? 'selected' : ''} ${value === 0 ? 'disabled' : ''}>${label}</option>`).join('');
    }

    formatTime(seconds) {
      if (!Number.isFinite(seconds)) return '0:00';
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${minutes}:${secs}`;
    }

    escape(value) {
      const div = document.createElement('div');
      div.textContent = value == null ? '' : String(value);
      return div.innerHTML;
    }

    escapeAttr(value) { return this.escape(value).replace(/"/g, '&quot;'); }
  }

  function waitForInitialLoad() {
    return new Promise((resolve) => {
      const loading = document.getElementById('loadingScreen');
      if (!loading) return resolve();
      if (loading.classList.contains('hidden') || loading.style.display === 'none') return resolve();
      const observer = new MutationObserver(() => {
        if (loading.classList.contains('hidden') || loading.style.display === 'none') {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(loading, { attributes: true, attributeFilter: ['class', 'style'] });
      setTimeout(() => { observer.disconnect(); resolve(); }, 10000);
    });
  }

  waitForInitialLoad().then(() => {
    const app = new SongLibraryApp();
    app.init();
    win.NSLRefactor = app;
  });
})();
