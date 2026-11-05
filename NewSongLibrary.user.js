// ==UserScript==
// @name         New Song Library
// @version      0.4
// @description  Song List with Music Player
// @author       Kaomaru
// @match        https://animemusicquiz.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @connect      github.com
// @connect      githubusercontent.com
// @connect      raw.githubusercontent.com
// @connect      objects.githubusercontent.com
// @connect      myanimelist.net
// @connect      shikimori.io
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
    version: '0.4',
    rootId: 'nsl-root',
    storageKey: 'playerStatusList',
    quizCoverSettingKey: 'nsl-quiz-cover-enabled-v1',
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
    .nsl-layout { min-height:0; display:grid; grid-template-columns:minmax(160px,var(--nsl-sidebar-width,310px)) 10px minmax(0,1fr); gap:0; }
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
    .nsl-spoilers-active .nsl-spoiler { filter:blur(5px); transition:filter .14s ease; user-select:none; }
    .nsl-spoilers-active .nsl-spoiler:hover { filter:none; user-select:text; }
    .nsl-spoilers-active .nsl-spoiler .nsl-artist-hover-target { pointer-events:none; }
    .nsl-spoilers-active .nsl-spoiler:hover .nsl-artist-hover-target { pointer-events:auto; }
    .nsl-coverage-panel { width:min(1050px,100%); max-height:90vh; overflow:auto; border:1px solid #333c49; border-radius:18px; background:#11141b; padding:18px; color:#e6edf6; }
    .nsl-coverage-controls { display:flex; align-items:center; gap:10px; margin:12px 0; }
    .nsl-coverage-controls select { height:32px; background:#19202a; color:#e6edf6; border:1px solid #46505d; border-radius:8px; }
    .nsl-coverage-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:10px;margin:14px 0; }
    .nsl-coverage-kpis strong { display:block; font-size:22px; color:#6ee7b7; }
    .nsl-coverage-heading { font-size:16px; margin:20px 0 8px; }
    .nsl-coverage-note { color:#aebacd; font-size:12px; line-height:1.5; }
    .nsl-coverage-scroll { overflow-x:auto; }
    .nsl-coverage-table { width:100%;border-collapse:collapse;font-size:12px; }
    .nsl-coverage-table th, .nsl-coverage-table td { padding:8px 7px;text-align:left;border-bottom:1px solid #2a303b;white-space:nowrap; }
    .nsl-modal-card { width:min(860px,100%); max-height:92vh; overflow:auto; border:1px solid rgba(255,255,255,.1); border-radius:20px; background:#11141b; box-shadow:var(--shadow); }
     .nsl-modal-nav { display:flex; align-items:center; gap:7px; flex-shrink:0; }
     .nsl-modal-nav .nsl-page-btn { min-height:32px; padding:0 11px; }
     .nsl-modal-position { font-size:12px; color:var(--muted); min-width:60px; text-align:center; }
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
    /* Compact answer overlay: title wraps freely without truncation. */
    .nsl-quiz-cover { display:none; position:fixed; left:20px; top:50%; z-index:2147483646; width:238px; min-width:185px; max-width:80vw; max-height:85vh; padding:7px; border:1px solid rgba(255,255,255,.10); border-radius:13px; background:linear-gradient(180deg,rgba(17,20,27,.98),rgba(12,15,21,.98)); box-shadow:var(--shadow); overflow:auto; pointer-events:auto; resize:both; transform:translateY(-50%); }
    .nsl-quiz-cover.nsl-visible { display:flex; flex-direction:column; gap:5px; }
    .nsl-quiz-cover img { display:block; width:100%; min-height:0; flex:0 0 auto; aspect-ratio:2/3; object-fit:cover; border-radius:9px; border:1px solid rgba(255,255,255,.08); background:#0b0f15; pointer-events:none; }
    .nsl-quiz-cover-title-ru { flex:0 0 auto; min-width:0; padding:6px 7px 4px; margin:0; cursor:move; font-size:12px; line-height:1.3; text-align:center; user-select:none; white-space:normal; overflow-wrap:anywhere; word-break:normal; text-overflow:clip; color:#93c5fd; font-weight:800; border-radius:9px 9px 0 0; background:rgba(255,255,255,.03); }
    .nsl-quiz-cover-meta { flex:0 0 auto; min-width:0; display:grid; gap:3px; padding:0 6px 6px; color:#cbd5e1; font-size:10px; line-height:1.3; border-radius:0 0 9px 9px; background:rgba(255,255,255,.03); }
    .nsl-quiz-cover-meta-row { min-width:0; padding:4px 5px; border-radius:6px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.05); white-space:normal; overflow-wrap:anywhere; word-break:normal; }
    .nsl-quiz-cover-meta-label { color:#98a2b3; margin-right:4px; }
    .nsl-quiz-cover-meta-value { color:#edf1f7; }
    @media (max-width:900px){ .nsl-shell{padding:10px}.nsl-app{height:calc(100vh - 20px)}.nsl-layout{grid-template-columns:1fr}.nsl-sidebar{max-height:42vh}.nsl-player{grid-template-columns:1fr;gap:8px}.nsl-volume{justify-self:stretch;width:100%}.nsl-song{grid-template-columns:56px minmax(0,1fr) 60px 48px 90px}.nsl-info-grid{grid-template-columns:1fr} }
    .nsl-virtual-entry { box-sizing:border-box; border-bottom:1px solid rgba(255,255,255,.06); overflow:hidden; padding:4px 8px; display:flex; align-items:center; gap:8px; min-width:0; }
    .nsl-virtual-entry:has(.nsl-virtual-song) { display:block; }
    .nsl-virtual-entry.nsl-anime { margin:0; border-radius:0; border:0; }
    .nsl-virtual-entry.nsl-group-heading { border-bottom:1px solid rgba(255,255,255,.09); }
    .nsl-virtual-entry.nsl-group-heading { background:rgba(255,255,255,.06); border-bottom:1px solid rgba(255,255,255,.09); padding:0 10px; }
    .nsl-group-heading .nsl-anime-main { min-width:0; flex:1; font-size:12px; }
    .nsl-group-heading .nsl-anime-status { max-width:118px; flex:0 0 auto; }
    .nsl-virtual-inline-anime { color:#8da3c1; font-size:10px; font-weight:500; margin-left:7px; }
    .nsl-virtual-entry .nsl-song { border-top:0; padding:0 3px; grid-template-columns:50px minmax(0,1fr) 67px 50px 112px; gap:5px; }
    .nsl-virtual-entry .nsl-song-name { font-size:12px; }
    .nsl-shell.nsl-windowed .nsl-virtual-entry .nsl-song { grid-template-columns:43px minmax(0,1fr) 60px 45px 106px; }
    .nsl-virtual-entry .nsl-song .nsl-icon-btn { width:27px; height:27px; }
    .nsl-virtual-anime { display:none; }
    .nsl-anime-short { flex:1; min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
    .nsl-artist-jump { cursor:pointer; background:transparent; border:0; color:#93c5fd; text-align:left; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:700; }
    .nsl-coverage-mini { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; }
    .nsl-compact-stat { display:flex; justify-content:space-between; gap:8px; padding:3px 0; font-size:12px; border-bottom:1px solid rgba(255,255,255,.06); }
    .nsl-compact-stat span { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .nsl-coverage-kpis { margin:0 0 10px; grid-template-columns:repeat(auto-fit,minmax(105px,1fr)); gap:7px; }
    .nsl-coverage-kpis strong { font-size:18px; }
    /* Library modes: Songs / Anime / Coverage. Shared sidebar stays on screen. */
    .nsl-app { grid-template-rows:auto minmax(0,1fr) auto; }
    .nsl-library-top { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:7px 12px; border-bottom:1px solid rgba(255,255,255,.08); background:rgba(12,15,21,.9); user-select:none; }
    .nsl-shell.nsl-windowed .nsl-library-top { cursor:move; touch-action:none; }
    .nsl-library-top button, .nsl-library-top a, .nsl-library-top input, .nsl-library-top select { cursor:pointer; touch-action:auto; }
    .nsl-divider-drag { position:relative; min-width:10px; height:100%; cursor:col-resize; touch-action:none; user-select:none; }
    .nsl-divider-drag::before { content:''; position:absolute; left:4px; top:12px; bottom:12px; width:2px; border-radius:3px; background:rgba(255,255,255,.19); transition:background .15s; }
    .nsl-divider-drag:hover::before, .nsl-divider-drag.nsl-resizing::before { background:var(--accent); }
    .nsl-layout.nsl-is-resizing, .nsl-layout.nsl-is-resizing * { cursor:col-resize !important; user-select:none !important; }
    .nsl-view-tabs { display:flex; flex-wrap:wrap; gap:5px; }
    .nsl-view-tab { border:1px solid rgba(255,255,255,.10); border-radius:9px; padding:6px 12px; color:var(--text); background:rgba(255,255,255,.05); cursor:pointer; font-weight:700; font-size:12px; }
    .nsl-view-tab.is-active { color:#07130f; background:var(--accent); border-color:var(--accent); }
    .nsl-window-tools { display:flex; align-items:center; gap:8px; }
    .nsl-window-handle { color:var(--muted); font-size:12px; padding:5px 8px; cursor:inherit; user-select:none; }
    .nsl-shell.nsl-windowed .nsl-window-handle { pointer-events:none; }
    .nsl-shell:not(.nsl-windowed) .nsl-window-handle { display:none; }
    .nsl-window-toggle { flex-shrink:0; }
    .nsl-coverage-view { min-height:0; overflow:auto; padding:14px; scrollbar-width:thin; }
    .nsl-coverage-view .nsl-coverage-controls { margin:0 0 12px; }
    .nsl-anime-only .nsl-anime-head { min-height:43px; }
    .nsl-view-hidden { display:none !important; }
    .nsl-shell.nsl-windowed { inset:auto; left:clamp(0px, 6vw, 120px); top:clamp(0px, 7vh, 85px); width:min(1120px, 88vw); height:min(740px, 82vh); min-width:min(640px, 95vw); min-height:min(410px, 90vh); max-width:100vw; max-height:100vh; padding:8px; border-radius:17px; border:1px solid rgba(255,255,255,.18); box-shadow:0 25px 90px rgba(0,0,0,.7); resize:both; }
    .nsl-shell.nsl-windowed .nsl-app { height:100%; max-width:none; gap:8px; }
    .nsl-shell.nsl-windowed .nsl-layout { grid-template-columns:minmax(160px,var(--nsl-sidebar-width,310px)) 10px minmax(0,1fr); gap:0; }
    .nsl-shell.nsl-windowed .nsl-sidebar { max-height:none; }
    .nsl-shell.nsl-windowed .nsl-toolbar { flex-wrap:wrap; padding:9px 11px; }
    .nsl-shell.nsl-windowed .nsl-player { grid-template-columns:minmax(130px,1fr) minmax(205px,1.3fr) minmax(100px,.7fr); gap:8px; padding:7px 10px; }
    .nsl-shell.nsl-windowed .nsl-progress-row { grid-template-columns:35px minmax(60px,1fr) 35px; gap:5px; }
    .nsl-shell.nsl-windowed .nsl-volume { min-width:0; width:100%; }
    .nsl-shell.nsl-windowed .nsl-volume .nsl-bar { min-width:30px; }
    .nsl-shell.nsl-windowed .nsl-song { grid-template-columns:47px minmax(0,1fr) 48px 43px 88px; gap:5px; padding:5px 6px; }
    .nsl-shell.nsl-windowed .nsl-list { padding:7px; }
    /* v0.36 compact library: reduce empty vertical space without shrinking controls excessively. */
    .nsl-virtual-entry { padding:3px 9px; gap:7px; }
    .nsl-virtual-entry.nsl-group-heading { padding:0 10px; }
    .nsl-virtual-entry .nsl-song { min-height:0; padding:0 2px; }
    .nsl-virtual-entry .nsl-song .nsl-icon-btn { width:26px; height:26px; border-radius:8px; }
    .nsl-virtual-entry .nsl-song-type { padding:3px 6px; }
    .nsl-virtual-entry .nsl-anime-status { height:27px; font-size:11px; max-width:118px; }
    .nsl-virtual-entry .nsl-chip { padding:3px 7px; font-size:11px; }
    .nsl-virtual-entry .nsl-artist-jump { font-size:13px; }
    .nsl-virtual-entry .nsl-anime-short { font-size:13px; }
    .nsl-virtual-entry .nsl-song-name { font-size:12px; }
    /* v0.38: clear row boundaries in Anime view without increasing row height. */
    .nsl-virtual-entry.nsl-anime:not(.nsl-group-heading) {
      border:0;
      border-bottom:1px solid rgba(180,195,215,.17);
      border-radius:0;
      transition:background-color .12s ease;
    }
    .nsl-virtual-entry.nsl-anime:not(.nsl-group-heading):hover {
      background:rgba(110,231,183,.075);
      border-bottom-color:rgba(180,195,215,.3);
    }
    .nsl-toolbar { padding:8px 11px; gap:7px; }
    .nsl-toolbar-title { font-size:15px; }
    .nsl-toolbar-meta { font-size:11px; }
    .nsl-view-tab { padding:5px 10px; }
    .nsl-library-top { padding:6px 10px; }
    .nsl-list { padding:7px 9px; }
    .nsl-head { padding:10px 12px; }
    .nsl-filters { padding:9px; }
    .nsl-group { padding:8px; margin-bottom:8px; }
    .nsl-group-title { margin-bottom:6px; }
    .nsl-player { min-height:72px; padding:8px 12px; gap:10px; }
    .nsl-coverage-view { padding:10px; }
    .nsl-shell.nsl-windowed .nsl-list { padding:5px 7px; }
    .nsl-shell.nsl-windowed .nsl-toolbar { padding:7px 9px; }
    @media (max-width:900px) {
      .nsl-shell .nsl-layout { grid-template-columns:minmax(160px,var(--nsl-sidebar-width,310px)) 10px minmax(0,1fr); }
      .nsl-shell.nsl-windowed .nsl-layout { grid-template-columns:minmax(160px,var(--nsl-sidebar-width,310px)) 10px minmax(0,1fr); }
      .nsl-shell.nsl-windowed .nsl-player { grid-template-columns:minmax(0,1fr) minmax(0,1.6fr); }
      .nsl-shell.nsl-windowed .nsl-volume { display:none; }
      .nsl-library-top { flex-wrap:wrap; }
    }


    /* v0.39 – consistent density across every NSL view; keep readable controls. */
    .nsl-shell { padding:7px 9px 9px; }
    .nsl-app { height:calc(100vh - 34px); gap:6px; }
    .nsl-shell.nsl-windowed { padding:5px; border-radius:12px; }
    .nsl-shell.nsl-windowed .nsl-app { gap:5px; }
    .nsl-panel { border-radius:11px; }
    .nsl-layout, .nsl-shell.nsl-windowed .nsl-layout { grid-template-columns:minmax(160px,var(--nsl-sidebar-width,310px)) 8px minmax(0,1fr); }
    .nsl-divider-drag { min-width:8px; }
    .nsl-divider-drag::before { left:3px; top:8px; bottom:8px; }
    .nsl-library-top { gap:6px; padding:4px 8px; }
    .nsl-view-tabs { gap:4px; }
    .nsl-view-tab { font-size:11px; padding:4px 8px; border-radius:7px; line-height:1.2; min-height:26px; }
    .nsl-window-tools { gap:4px; }
    .nsl-window-handle { font-size:11px; padding:3px 6px; }
    .nsl-head { padding:7px 9px; }
    .nsl-title { font-size:15px; line-height:1.2; }
    .nsl-sub { font-size:10px; margin-top:1px; }
    .nsl-filters { padding:6px 7px; }
    .nsl-group { padding:6px 7px; margin-bottom:6px; border-radius:9px; }
    .nsl-group-title { font-size:11px; margin-bottom:4px; letter-spacing:.035em; }
    .nsl-grid2 { gap:3px 6px; }
    .nsl-row { gap:5px; }
    .nsl-filters .nsl-row[style*="margin-top:8px"] { margin-top:5px !important; }
    .nsl-input, .nsl-select { height:27px; border-radius:7px; padding:0 7px; font-size:11px; }
    .nsl-search-wrap .nsl-input { height:28px !important; }
    .nsl-clear-search { height:20px; width:20px; border-radius:6px; }
    .nsl-check { font-size:11px; gap:5px; min-height:20px; line-height:1.15; }
    .nsl-check input[type="checkbox"] { width:14px; height:14px; flex-basis:14px; border-radius:4px; }
    .nsl-submit, .nsl-page-btn { min-height:28px; padding:0 9px; border-radius:9px; font-size:12px; }
    .nsl-toolbar, .nsl-shell.nsl-windowed .nsl-toolbar { padding:5px 9px; gap:5px; }
    .nsl-toolbar-title { font-size:14px; line-height:1.25; }
    .nsl-toolbar-meta { font-size:10px; margin-top:1px; }
    .nsl-list, .nsl-shell.nsl-windowed .nsl-list { padding:4px 6px; }
    .nsl-virtual-entry { padding:2px 7px; gap:6px; }
    .nsl-virtual-entry.nsl-group-heading { padding:0 7px; }
    .nsl-group-heading .nsl-anime-main { font-size:12px; }
    .nsl-virtual-entry .nsl-anime-status { height:24px; max-width:112px; padding:0 6px; font-size:10px; }
    .nsl-virtual-entry .nsl-chip { padding:2px 6px; font-size:10px; }
    .nsl-virtual-entry .nsl-song { grid-template-columns:45px minmax(0,1fr) 61px 47px 103px; gap:4px; padding:0 2px; }
    .nsl-shell.nsl-windowed .nsl-virtual-entry .nsl-song { grid-template-columns:42px minmax(0,1fr) 59px 42px 97px; gap:3px; padding:0 1px; }
    .nsl-virtual-entry .nsl-song-name { font-size:12px; }
    .nsl-virtual-entry .nsl-song-type { min-width:40px; padding:2px 5px; font-size:10px; }
    .nsl-virtual-entry .nsl-song .nsl-icon-btn { width:25px; height:25px; border-radius:7px; }
    .nsl-virtual-entry .nsl-rate { height:25px; font-size:11px; }
    .nsl-virtual-entry .nsl-save { font-size:10px; gap:3px; }
    .nsl-virtual-entry .nsl-artist-jump, .nsl-virtual-entry .nsl-anime-short { font-size:12px; }
    .nsl-virtual-inline-anime { font-size:10px; margin-left:5px; }
    .nsl-player, .nsl-shell.nsl-windowed .nsl-player { min-height:60px; padding:6px 10px; gap:8px; border-radius:11px; }
    .nsl-player { grid-template-columns:minmax(130px,1fr) minmax(220px,1.65fr) minmax(120px,.75fr); }
    .nsl-player button { width:27px; height:27px; }
    .nsl-play-main { width:32px !important; height:32px !important; }
    .nsl-controls { gap:4px; }
    .nsl-control-row { gap:6px; }
    .nsl-progress-row { gap:5px; font-size:10px; }
    .nsl-track-title { font-size:12px; }
    .nsl-track-sub { font-size:11px; margin-top:2px; }
    .nsl-volume { gap:6px; width:185px; min-width:125px; }
    .nsl-volume-value { width:34px; font-size:10px; }
    .nsl-pagination { gap:5px; padding:6px; font-size:11px; }
    .nsl-anime { border-radius:10px; margin-bottom:6px; }
    .nsl-anime-head { padding:5px 8px; gap:6px; }
    .nsl-anime-main { font-size:12px; }
    .nsl-anime-tags { gap:4px; }
    .nsl-chip { padding:2px 6px; font-size:10px; }
    .nsl-anime-only .nsl-anime-head { min-height:35px; }
    .nsl-coverage-view { padding:7px 8px; }
    .nsl-coverage-view .nsl-coverage-controls { margin:0 0 7px; }
    .nsl-coverage-controls { gap:6px; margin:6px 0; }
    .nsl-coverage-controls select { height:27px; border-radius:6px; font-size:11px; }
    .nsl-coverage-mini { gap:7px; grid-template-columns:repeat(auto-fit,minmax(165px,1fr)); }
    .nsl-coverage-kpis { gap:5px; margin:0 0 7px; }
    .nsl-coverage-kpis strong { font-size:16px; }
    .nsl-coverage-heading { font-size:13px; margin:10px 0 5px; }
    .nsl-coverage-note { font-size:11px; line-height:1.4; }
    .nsl-coverage-table { font-size:11px; }
    .nsl-coverage-table th, .nsl-coverage-table td { padding:5px; }
    .nsl-compact-stat { font-size:11px; padding:2px 0; }
    .nsl-modal { padding:10px; }
    .nsl-modal-card { border-radius:13px; }
    .nsl-modal-head { padding:8px 10px; gap:7px; }
    .nsl-modal-title { font-size:15px; }
    .nsl-modal-nav { gap:4px; }
    .nsl-modal-nav .nsl-page-btn { min-height:27px; padding:0 8px; }
    .nsl-modal-position { min-width:50px; font-size:11px; }
    .nsl-close { width:29px; height:29px; border-radius:8px; font-size:18px; }
    .nsl-modal-body { padding:9px; gap:8px; }
    .nsl-info-grid { gap:6px; }
    .nsl-card { padding:7px; border-radius:10px; font-size:12px; }
    .nsl-label { font-size:10px; margin-bottom:3px; }
    .nsl-tags { gap:4px; }
    .nsl-video { max-height:380px; border-radius:10px; }
    .nsl-toast { padding:8px 10px; font-size:12px; border-radius:9px; }
    /* Keep quiz answer readable and allow Russian titles to wrap indefinitely. */
    .nsl-quiz-cover { width:225px; padding:6px; border-radius:11px; }
    .nsl-quiz-cover.nsl-visible { gap:4px; }
    .nsl-quiz-cover img { border-radius:8px; }
    .nsl-quiz-cover-title-ru { font-size:11px; line-height:1.25; padding:5px 6px 4px; white-space:normal; overflow-wrap:anywhere; text-overflow:clip; }
    .nsl-quiz-cover-meta { font-size:10px; gap:2px; padding:0 5px 5px; }
    .nsl-quiz-cover-meta-row { padding:3px 4px; }
    @media (max-width:900px) {
      .nsl-shell.nsl-windowed .nsl-volume { display:none; }
      .nsl-shell.nsl-windowed .nsl-player { grid-template-columns:minmax(0,1fr) minmax(0,1.6fr); }
    }

  `;

  GM_addStyle(css);

  class SongLibraryApp {
    constructor() {
      this.songMap = [];
      this.filteredSongs = [];
      this.shuffleOrder = null;
      this.spoilersHidden = GM_getValue('nsl-spoilers-hidden-v1', false) === true;
      this.currentModalKey = null;
      this.songByKey = new Map();
      this.songByAnnSongId = new Map();
      this.pendingSongRequests = new Map();
      this.pendingAnimeRequests = new Map();
      this.shikimoriCache = new Map();
      this.shikimoriPending = new Map();
      this.quizCoverEnabled = GM_getValue(APP.quizCoverSettingKey, true) !== false;
      this.coverRequestId = 0;
      this.savedSongs = this.readSavedSongs();
      this.page = 0;
      this.animePage = 0;
      this.activeView = 'songs';
      this.session = this.readStorage('nsl-session-v1', {});
      this.virtualData = [];
      this.virtualStart = -1;
      this.virtualRowHeight = 35;
      this.windowed = GM_getValue('nsl-windowed-v1', false) === true;
      this.sidebarWidth = Number(GM_getValue('nsl-sidebar-width-v1', 310)) || 310;
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
      this.restoreSession();
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

    readStorage(key, fallback) {
      try { const val = GM_getValue(key, ''); return typeof val === 'string' && val ? JSON.parse(val) : fallback; }
      catch (_) { return fallback; }
    }

    saveSession() {
      if (!this.ui.form) return;
      const values = {};
      for (const element of this.ui.form.elements) {
        if (!element.name || element.name === 'quizCoverEnabled') continue;
        values[element.name] = element.type === 'checkbox' ? element.checked : element.value;
      }
      const rect = this.ui.shell.getBoundingClientRect();
      const data = { filters: values, view: this.activeView, windowed: this.windowed,
        left: rect.left, top: rect.top, width: rect.width, height: rect.height,
        scroll: this.ui.list.scrollTop, volume: this.audio.volume,
        track: this.state.currentTrack?.key || null, time: Number.isFinite(this.audio.currentTime) ? this.audio.currentTime : 0 };
      GM_setValue('nsl-session-v1', JSON.stringify(data));
    }

    scheduleSessionSave() {
      clearTimeout(this.sessionSaveTimer);
      this.sessionSaveTimer = setTimeout(() => this.saveSession(), 500);
    }

    restoreSession() {
      const session = this.session;
      if (!session || typeof session !== 'object') return;
      for (const [name, value] of Object.entries(session.filters || {})) {
        const element = this.ui.form.elements[name];
        if (!element || typeof value === 'object') continue;
        if (element.type === 'checkbox') element.checked = Boolean(value);
        else element.value = String(value);
      }
      if (session.windowed) {
        this.setWindowMode(true);
        if (Number.isFinite(session.width)) this.ui.shell.style.width = Math.min(innerWidth, Math.max(640, session.width)) + 'px';
        if (Number.isFinite(session.height)) this.ui.shell.style.height = Math.min(innerHeight, Math.max(410, session.height)) + 'px';
        if (Number.isFinite(session.left)) this.ui.shell.style.left = Math.max(0, Math.min(innerWidth-100, session.left)) + 'px';
        if (Number.isFinite(session.top)) this.ui.shell.style.top = Math.max(0, Math.min(innerHeight-60, session.top)) + 'px';
      }
      if (Number.isFinite(session.volume)) this.setVolumeValue(Math.max(0, Math.min(1, session.volume)));
      this.setView(['songs','anime','coverage','artists'].includes(session.view) ? session.view : 'songs');
    }

    restoreTrackFromSession() {
      if (this.sessionTrackRestored || !this.songMap.length) return;
      this.sessionTrackRestored = true;
      const session = this.session || {};
      if (session.track) {
        const song = this.songByKey.get(session.track);
        if (song) {
          this.state.currentTrack = song;
          this.ui.trackTitle.textContent = song.songEntry.name;
          this.ui.trackSub.textContent = this.displayAnimeName(song).main + ' (resume available)';
          this.updatePlayState();
        }
      }
      if (session.view !== 'coverage' && Number.isFinite(session.scroll)) {
        this.ui.list.scrollTop = session.scroll;
        this.renderVirtual();
      }
    }

    buildUI() {
      const root = document.createElement('div');
      root.id = APP.rootId;
      root.innerHTML = `
        <div class="nsl-shell nsl-hidden" data-nsl-shell>
          <div class="nsl-app">
            <div class="nsl-library-top">
              <div class="nsl-view-tabs" role="tablist" aria-label="Library views">
                <button class="nsl-view-tab is-active" type="button" data-view="songs">Songs</button>
                <button class="nsl-view-tab" type="button" data-view="anime">Anime</button>
                <button class="nsl-view-tab" type="button" data-view="coverage">Coverage</button>
                <button class="nsl-view-tab" type="button" data-view="artists">Artists</button>
              </div>
              <div class="nsl-window-tools">
                <span class="nsl-window-handle" data-window-handle title="Drag using this top bar">Drag top bar</span>
                <button class="nsl-view-tab nsl-window-toggle" type="button" data-window-toggle title="Toggle full screen / window">Window</button>
                <button class="nsl-view-tab" type="button" data-library-close title="Close library">×</button>
              </div>
            </div>
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
              <div class="nsl-divider-drag" data-layout-divider role="separator" aria-label="Resize filters and list" aria-orientation="vertical" title="Drag to resize filters"></div>
              <main class="nsl-panel nsl-content">
                <div class="nsl-toolbar">
                  <div>
                    <div class="nsl-toolbar-title" data-content-title>Song Library</div>
                    <div class="nsl-toolbar-meta" data-result-info>Waiting for library cache...</div>
                  </div>
                  <div class="nsl-row"><button class="nsl-page-btn" type="button" data-spoilers title="Blur anime, song and artist names">🙈 Hide</button><button class="nsl-page-btn" type="button" data-shuffle title="Shuffle songs matching current filters">🔀 Shuffle</button></div>
                </div>
                <div class="nsl-list" data-list></div>
                <div class="nsl-coverage-view nsl-view-hidden" data-coverage-view>
                  <div class="nsl-coverage-controls"><label>Scope: <select data-coverage-scope><option value="filtered">Current filters</option><option value="all">Entire library</option></select></label></div>
                  <div data-coverage-content></div>
                </div>
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
              <div class="nsl-modal-nav">
                <button class="nsl-page-btn" type="button" data-modal-prev title="Previous song">◀</button>
                <span class="nsl-modal-position" data-modal-position></span>
                <button class="nsl-page-btn" type="button" data-modal-next title="Next song">▶</button>
                <button class="nsl-close" type="button" data-modal-close>×</button>
              </div>
            </div>
            <div class="nsl-modal-body" data-modal-body></div>
          </div>
        </div>
        <div class="nsl-quiz-cover" data-quiz-cover>
          <img data-quiz-cover-image alt="Anime cover">
          <div class="nsl-quiz-cover-title-ru" data-quiz-cover-title-ru></div>
          <div class="nsl-quiz-cover-meta" data-quiz-cover-meta></div>
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
      this.ui.coverageView = root.querySelector('[data-coverage-view]');
      this.ui.contentTitle = root.querySelector('[data-content-title]');
      this.ui.coverageContent = root.querySelector('[data-coverage-content]');
      this.ui.modal = root.querySelector('[data-modal]');
      this.ui.modalTitle = root.querySelector('[data-modal-title]');
      this.ui.modalPosition = root.querySelector('[data-modal-position]');
      this.ui.modalBody = root.querySelector('[data-modal-body]');
      this.ui.quizCover = root.querySelector('[data-quiz-cover]');
      this.ui.quizCoverImage = root.querySelector('[data-quiz-cover-image]');
      this.ui.quizCoverTitleRu = root.querySelector('[data-quiz-cover-title-ru]');
      this.ui.quizCoverMeta = root.querySelector('[data-quiz-cover-meta]');
      document.body.append(this.ui.quizCover);

      this.injectMenuButton();
      this.fillCustomLists();
      this.setWindowMode(this.windowed);
      this.applySidebarWidth();
      this.setView('songs');
    }

    renderFilterHtml() {
      const checks = (items) => items.map(([name, label]) => `<label class="nsl-check"><input type="checkbox" name="${name}" checked> ${label}</label>`).join('');
      return `
        <section class="nsl-group">
          <h3 class="nsl-group-title">Search</h3>
          <div class="nsl-search-wrap"><input class="nsl-input" name="search" placeholder="Type..." style="width:100%;height:34px"><button type="button" class="nsl-clear-search" data-clear-search title="Clear search">×</button></div>
          <div class="nsl-row" style="margin-top:8px;justify-content:space-between;gap:12px">
            <select class="nsl-select" name="searchIn" style="flex:1;min-width:0"><option value="all">All</option><option value="anime">Anime</option><option value="song">Name</option><option value="artist">Artist</option><option value="composer">Composer</option><option value="arranger">Arranger</option></select>
            <label class="nsl-check" style="flex:0 0 auto"><input type="checkbox" name="partial" checked> partial</label>
          </div>
          <div class="nsl-row" style="margin-top:8px;gap:8px">
            <select class="nsl-select" name="sort" style="flex:1;min-width:0"><option value="annId">Anime ID</option><option value="songId">Song ID</option><option value="year">Year</option><option value="anime">Anime name</option><option value="song">Song name</option><option value="artist">Artist</option><option value="type">Song type</option><option value="category">Song category</option><option value="animeType">Anime type</option><option value="status">Anime status</option><option value="rating">Song rating</option></select>
            <select class="nsl-select" name="sortDirection" title="Sort direction" style="width:90px;flex:0 0 90px"><option value="asc">ASC</option><option value="desc">DESC</option></select>
          </div>
        </section>
        <section class="nsl-group"><h3 class="nsl-group-title">Anime Status</h3><div class="nsl-grid2">${checks([['ptw', 'Plan to Watch'], ['watching', 'Watching'], ['completed', 'Completed'], ['onhold', 'On Hold'], ['dropped', 'Dropped'], ['statusOther', 'Other']])}</div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Anime Type</h3><div class="nsl-grid2">${checks([['tv', 'TV'], ['season', 'Season'], ['ova', 'OVA'], ['movie', 'Movie'], ['ona', 'ONA'], ['movieLower', 'movie'], ['tvSpecial', 'TV Special'], ['special', 'special'], ['doujin', 'Doujin'], ['musicVideo', 'Music Video'], ['gameCutsceneCompilation', 'Game Cutscene Compilation'], ['typeOther', 'Other']])}</div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Anime Year</h3><div class="nsl-grid2"><label class="nsl-check">From <input class="nsl-input" type="number" name="yearFrom" min="1900" max="2026" value="1900"></label><label class="nsl-check">To <input class="nsl-input" type="number" name="yearTo" min="1900" max="2026" value="2026"></label></div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Song Type</h3><div class="nsl-grid2">${checks([['op', 'Opening'], ['rebroadcast', 'Rebroadcast'], ['ed', 'Ending'], ['dub', 'Dub'], ['insert', 'Insert']])}</div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Song Category</h3><div class="nsl-grid2">${checks([['standard', 'Standard'], ['instrumental', 'Instrumental'], ['chanting', 'Chanting'], ['character', 'Character']])}</div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Saved</h3><div class="nsl-grid2">${checks([['saved', 'Saved'], ['notSaved', 'Not saved']])}</div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Rating</h3><div class="nsl-grid2">${checks([['like', 'Like'], ['dislike', 'Dislike'], ['unrated', 'Unrated']])}</div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Lists</h3><div class="nsl-grid2"><select class="nsl-select" name="list" data-list-select><option value="">None</option></select><select class="nsl-select" name="listMode"><option value="only">Only songs</option><option value="onlyA">Only anime</option><option value="dark">Dim</option><option value="remove">Remove</option></select></div></section>
        <section class="nsl-group"><h3 class="nsl-group-title">Answer overlay</h3><label class="nsl-check"><input type="checkbox" name="quizCoverEnabled" ${this.quizCoverEnabled ? 'checked' : ''}> Show cover and Russian anime title after answer</label></section>
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
      this.ui.form.addEventListener('submit', (event) => { event.preventDefault(); this.shuffleOrder = null; clearTimeout(this.renderTimer); this.page = 0; this.animePage = 0; this.render(); });
      ['keydown', 'keypress', 'keyup'].forEach((type) => {
        this.ui.form.addEventListener(type, (event) => {
          if (event.target.closest('input, select, textarea')) event.stopPropagation();
          if (type === 'keydown' && event.key === 'Escape' && event.target?.name === 'search') {
            event.preventDefault();
            event.target.value = '';
            this.shuffleOrder = null;
            clearTimeout(this.renderTimer);
            this.page = 0;
            this.animePage = 0;
            this.render();
          }
        }, true);
      });
      this.ui.form.addEventListener('change', (event) => {
        if (event.target?.name === 'quizCoverEnabled') {
          this.quizCoverEnabled = event.target.checked;
          GM_setValue(APP.quizCoverSettingKey, this.quizCoverEnabled);
          if (!this.quizCoverEnabled) this.hideQuizCover();
          return;
        }
        this.shuffleOrder = null;
        this.debouncedRender(120);
      });
      this.ui.form.addEventListener('input', (event) => {
        event.stopPropagation();
        if (event.target?.name === 'quizCoverEnabled') return;
        this.shuffleOrder = null;
        this.debouncedRender(event.target?.name === 'search' ? 700 : 180);
      });
      this.ui.root.querySelector('[data-clear-search]').addEventListener('click', () => {
        this.ui.form.elements.search.value = '';
        this.page = 0;
        this.render();
      });
      this.ui.root.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => this.setView(btn.dataset.view)));
      this.ui.root.querySelector('[data-window-toggle]').addEventListener('click', () => this.setWindowMode(!this.windowed));
      this.ui.root.querySelector('[data-library-close]').addEventListener('click', () => this.toggleUI(false));
      this.bindWindowDrag();
      this.bindLayoutDivider();
      this.ui.root.querySelector('[data-coverage-scope]').addEventListener('change', () => { this.coverageCache = null; this.renderCoverage(); });
      this.ui.list.addEventListener('scroll', () => { this.renderVirtual(); this.scheduleSessionSave(); }, {passive:true});
      this.ui.form.addEventListener('change', () => this.scheduleSessionSave());
      this.ui.form.addEventListener('input', () => this.scheduleSessionSave());
      this.ui.root.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => this.scheduleSessionSave()));
      this.audio.addEventListener('pause', () => this.scheduleSessionSave());
      this.audio.addEventListener('seeked', () => this.scheduleSessionSave());
      window.addEventListener('pagehide', () => this.saveSession());
      this.ui.root.querySelector('[data-spoilers]').addEventListener('click', () => this.toggleSpoilers());
      this.updateSpoilerUI();
      this.ui.root.querySelector('[data-shuffle]').addEventListener('click', () => this.shuffleSongs());
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
        if (this.coverDrag) this.moveQuizCover(event);
      });
      document.addEventListener('mouseup', () => { this.state.seeking = false; this.state.volumeSeeking = false; this.coverDrag = null; });
      this.ui.list.addEventListener('click', (event) => this.onListClick(event));
      this.ui.list.addEventListener('change', (event) => this.onListChange(event));
      this.ui.quizCoverTitleRu.addEventListener('mousedown', (event) => this.startCoverDrag(event));
      this.ui.modal.addEventListener('click', (event) => { if (event.target === this.ui.modal) this.closeModal(); });
      this.ui.root.querySelector('[data-modal-close]').addEventListener('click', () => this.closeModal());
      this.ui.root.querySelector('[data-modal-prev]').addEventListener('click', () => this.navigateModal(-1));
      this.ui.root.querySelector('[data-modal-next]').addEventListener('click', () => this.navigateModal(1));
      this.audio.addEventListener('timeupdate', () => this.updateProgress());
      this.audio.addEventListener('loadedmetadata', () => { if (this.pendingResumeTime) { this.audio.currentTime = Math.min(this.pendingResumeTime, this.audio.duration || this.pendingResumeTime); this.pendingResumeTime = 0; } this.updateDuration(); });
      this.audio.addEventListener('play', () => { this.state.playing = true; this.updatePlayState(); });
      this.audio.addEventListener('pause', () => { this.state.playing = false; this.updatePlayState(); });
      this.audio.addEventListener('ended', () => this.state.repeating ? this.audio.play() : this.nextTrack());
    }

    debouncedRender(delay = 350) {
      clearTimeout(this.renderTimer);
      this.renderTimer = setTimeout(() => { this.page = 0; this.animePage = 0; this.render(); }, delay);
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
      if (this.state.visible) this.applySidebarWidth();
      this.scheduleSessionSave();
    }

    setWindowMode(windowed) {
      this.windowed = Boolean(windowed);
      this.ui.shell.classList.toggle('nsl-windowed', this.windowed);
      const button = this.ui.root.querySelector('[data-window-toggle]');
      button.textContent = this.windowed ? '⛶ Full screen' : '▣ Window';
      button.title = this.windowed ? 'Switch to full screen' : 'Switch to movable window';
      GM_setValue('nsl-windowed-v1', this.windowed);
      if (this.ui.form) this.scheduleSessionSave();
      if (!this.windowed) {
        this.ui.shell.style.left = '';
        this.ui.shell.style.top = '';
      }
    }

    bindWindowDrag() {
      // The entire upper bar is the drag handle, except interactive controls.
      const bar = this.ui.root.querySelector('.nsl-library-top');
      let drag = null;
      bar.addEventListener('pointerdown', event => {
        if (!this.windowed || event.button !== 0 || event.target.closest('button, a, input, select, textarea, [role="button"]')) return;
        const rect = this.ui.shell.getBoundingClientRect();
        drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
        bar.setPointerCapture(event.pointerId);
        event.preventDefault();
      });
      bar.addEventListener('pointermove', event => {
        if (!drag || !this.windowed || drag.pointerId !== event.pointerId) return;
        const rect = this.ui.shell.getBoundingClientRect();
        this.ui.shell.style.left = `${Math.max(0, Math.min(Math.max(0, innerWidth - rect.width), drag.left + event.clientX - drag.x))}px`;
        this.ui.shell.style.top = `${Math.max(0, Math.min(Math.max(0, innerHeight - rect.height), drag.top + event.clientY - drag.y))}px`;
      });
      const stop = event => { if (drag?.pointerId === event.pointerId) drag = null; };
      bar.addEventListener('pointerup', stop);
      bar.addEventListener('pointercancel', stop);
      bar.addEventListener('lostpointercapture', stop);
    }

    applySidebarWidth() {
      const layout = this.ui.root.querySelector('.nsl-layout');
      if (!layout || layout.clientWidth < 400) return;
      // Leave at least 220px for the song/anime/coverage pane.
      const max = Math.max(160, layout.clientWidth - 230);
      this.sidebarWidth = Math.max(160, Math.min(max, this.sidebarWidth));
      layout.style.setProperty('--nsl-sidebar-width', `${this.sidebarWidth}px`);
    }

    bindLayoutDivider() {
      const divider = this.ui.root.querySelector('[data-layout-divider]');
      const layout = this.ui.root.querySelector('.nsl-layout');
      let resizing = null;
      divider.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        const sidebar = layout.querySelector('.nsl-sidebar');
        resizing = { pointerId: event.pointerId, startX: event.clientX, startWidth: sidebar.getBoundingClientRect().width };
        divider.setPointerCapture(event.pointerId);
        divider.classList.add('nsl-resizing');
        layout.classList.add('nsl-is-resizing');
        event.preventDefault();
      });
      divider.addEventListener('pointermove', event => {
        if (!resizing || resizing.pointerId !== event.pointerId) return;
        const max = Math.max(160, layout.clientWidth - 230);
        this.sidebarWidth = Math.max(160, Math.min(max, resizing.startWidth + event.clientX - resizing.startX));
        layout.style.setProperty('--nsl-sidebar-width', `${this.sidebarWidth}px`);
      });
      const finish = event => {
        if (!resizing || resizing.pointerId !== event.pointerId) return;
        resizing = null;
        divider.classList.remove('nsl-resizing');
        layout.classList.remove('nsl-is-resizing');
        GM_setValue('nsl-sidebar-width-v1', this.sidebarWidth);
      };
      divider.addEventListener('pointerup', finish);
      divider.addEventListener('pointercancel', finish);
      divider.addEventListener('lostpointercapture', finish);
      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => this.applySidebarWidth());
        observer.observe(layout);
        this.layoutResizeObserver = observer;
      }
    }

    setView(view) {
      if (!['songs', 'anime', 'coverage', 'artists'].includes(view)) return;
      this.activeView = view;
      this.ui.root.querySelectorAll('[data-view]').forEach(button => {
        const selected = button.dataset.view === view;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-selected', String(selected));
      });
      this.ui.contentTitle.textContent = ({ songs: 'Song Library', anime: 'Anime Library', coverage: 'Coverage 2.0', artists: 'Artists' })[view];
      this.ui.list.classList.toggle('nsl-view-hidden', view === 'coverage');
      this.ui.coverageView.classList.toggle('nsl-view-hidden', view !== 'coverage');
      this.virtualStart = -1;
      this.ui.list.scrollTop = 0;
      if (view === 'coverage') this.renderCoverage();
      else this.renderPage();
      this.scheduleSessionSave();
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
      this.restoreTrackFromSession();
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
      // Some credits have no structured members. Index obvious joint credits by
      // their performers too, so exact artist search includes collaborations.
      names.push(...this.splitJointArtistCredit(artist.name));
      return names.filter(Boolean);
    }

    splitJointArtistCredit(name) {
      const text = String(name || '').trim();
      if (!text || !/(\s+&\s+|\s+feat\.?\s+|\s+featuring\s+|\s*[•·]\s*|,\s+|\s+\/\s+|\s+\+\s+)/i.test(text)) return [];
      return text.split(/\s+&\s+|\s+feat\.?\s+|\s+featuring\s+|\s*[•·]\s*|,\s+|\s+\/\s+|\s+\+\s+/i)
        .map(part => part.trim()).filter(Boolean);
    }

    artistCreditNames(artist) {
      if (!artist) return ['Unknown artist'];
      const members = (artist.artistMembers || []).map(m => m?.name?.trim()).filter(Boolean);
      // A collaboration should be listed under the participating performers,
      // instead of creating another row for each combination of credits.
      if (members.length > 1) return [...new Set(members)];
      const split = this.splitJointArtistCredit(artist.name);
      if (split.length > 1) return [...new Set(split)];
      return [String(artist.name || members[0] || 'Unknown artist').trim()];
    }

    onSocketCommand(event) {
      if (!event?.command) return;
      switch (event.command) {
        case 'answer results': this.handleAnswerResults(event.data); break;
        case 'play next song':
        case 'quiz next video info':
        case 'quiz over':
        case 'quiz end result': this.hideQuizCover(); break;
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
      else if (action === 'play') this.loadTrack(song);
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
      // Match AMQ's exact category labels, including case-distinct values.
      // Any unrecognized category remains controlled by "Other".
      const name = String(categoryName || '').trim().replace(/\s+/g, ' ');
      const categoryChecks = {
        'TV': 'tv',
        'Season': 'season',
        'OVA': 'ova',
        'Movie': 'movie',
        'ONA': 'ona',
        'movie': 'movieLower',
        'TV Special': 'tvSpecial',
        'special': 'special',
        'Doujin': 'doujin',
        'Music Video': 'musicVideo',
        'Game Cutscene Compilation': 'gameCutsceneCompilation',
      };
      const checkbox = categoryChecks[name];
      if (checkbox) return this.checked(checkbox);
      // Preserve the previous handling of broader TV category labels.
      if (/^tv\s+/i.test(name)) return this.checked('tv');
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

    shuffleSongs() {
      // Fisher–Yates: shuffle only the songs matching the current filters.
      clearTimeout(this.renderTimer);
      const songs = this.filterSongs();
      const keys = songs.map((song) => song.key);
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
      }
      this.shuffleOrder = new Map(keys.map((key, index) => [key, index]));
      this.page = 0;
      this.animePage = 0;
      this.render();
    }

    sortSongs(songs) {
      if (this.shuffleOrder) {
        let next = this.shuffleOrder.size;
        for (const song of songs) if (!this.shuffleOrder.has(song.key)) this.shuffleOrder.set(song.key, next++);
        return [...songs].sort((a,b) => this.shuffleOrder.get(a.key)-this.shuffleOrder.get(b.key));
      }
      const v = this.filterValues();
      const field = v.sort || 'annId';
      const direction = v.sortDirection === 'desc' ? -1 : 1;
      const value = (s) => {
        switch(field) {
          case 'annId': return Number(s.animeEntry.annId)||0;
          case 'songId': return Number(s.song.annSongId)||0;
          case 'year': return Number(s.animeEntry.year)||0;
          case 'anime': return this.displayAnimeName(s).main;
          case 'song': return s.songEntry.name || '';
          case 'artist': return s.songEntry.artist?.name || '';
          case 'type': return Number(s.song.type)||0;
          case 'category': return Number(s.songEntry.category)||0;
          case 'animeType': return s.animeEntry.category?.name || '';
          case 'status': return Number(s.animeEntry.status)||0;
          case 'rating': return Number(s.songEntry.status)||0;
          default: return Number(s.animeEntry.annId)||0;
        }
      };
      return [...songs].sort((a,b) => {
        const va=value(a), vb=value(b);
        const compared = typeof va === 'number' && typeof vb === 'number' ? va-vb : String(va).localeCompare(String(vb),undefined,{numeric:true,sensitivity:'base'});
        return direction*compared || (Number(a.animeEntry.annId)-Number(b.animeEntry.annId)) || (Number(a.song.annSongId)-Number(b.song.annSongId));
      });
    }

    toggleSpoilers() {
      this.spoilersHidden = !this.spoilersHidden;
      GM_setValue('nsl-spoilers-hidden-v1', this.spoilersHidden);
      this.updateSpoilerUI();
    }

    updateSpoilerUI() {
      this.ui.root?.classList.toggle('nsl-spoilers-active', this.spoilersHidden);
      const btn = this.ui.root?.querySelector('[data-spoilers]');
      if (btn) { btn.textContent = this.spoilersHidden ? '👁 Reveal' : '🙈 Hide'; btn.setAttribute('aria-pressed', String(this.spoilersHidden)); }
    }

    openCoverage() {
      this.setView('coverage');
    }

    renderCoverage() {
      if (this.activeView !== 'coverage') return;
      const all = this.ui.root.querySelector('[data-coverage-scope]').value === 'all';
      const songs = all ? this.songMap : this.filteredSongs;
      // One pass, small maps and a few DOM rows. No per-category Sets of every anime.
      const groups = { year:new Map(), type:new Map(), status:new Map(), artist:new Map() };
      const unique = new Set();
      let op=0, ed=0, ins=0, saved=0;
      const count = (map,key) => map.set(key,(map.get(key)||0)+1);
      for (const song of songs) {
        unique.add(song.animeEntry.annId);
        const t = Number(song.song.type);
        if(t===1) op++; else if(t===2) ed++; else if(t===3) ins++;
        if(this.savedSongs.has(Number(song.songEntry.songId))) saved++;
        count(groups.year,String(song.animeEntry.year||'Unknown'));
        count(groups.type,String(song.animeEntry.category?.name||'Other'));
        count(groups.status,({0:'Other',1:'Watching',2:'Completed',3:'On Hold',4:'Dropped',5:'Plan to Watch'})[song.animeEntry.status]||'Other');
        count(groups.artist,song.songEntry.artist?.name||'Unknown');
      }
      const card = (title,number) => `<div class="nsl-card"><div class="nsl-label">${title}</div><strong>${number.toLocaleString()}</strong></div>`;
      const summary = (label,map,limit=8) => `<div class="nsl-card"><h4 style="margin:0 0 8px">${label}</h4>${[...map].sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([name,count])=>`<div class="nsl-compact-stat"><span title="${this.escape(name)}">${this.escape(name)}</span><strong>${count}</strong></div>`).join('')||'No data'}</div>`;
      this.ui.coverageContent.innerHTML = `<div class="nsl-coverage-kpis">${card('Anime',unique.size)}${card('Songs',songs.length)}${card('OP',op)}${card('ED',ed)}${card('Insert',ins)}${card('Saved',saved)}</div><div class="nsl-coverage-mini">${summary('By anime type',groups.type)}${summary('By MAL status',groups.status)}${summary('Top years',groups.year,10)}${summary('Top artists',groups.artist,10)}</div><p class="nsl-coverage-note">Compact one-pass statistics · ${all?'Entire library':'Current filters'}</p>`;
    }

    render() {
      this.filteredSongs = this.sortSongs(this.filterSongs());
      const count = new Set(this.filteredSongs.map(song => song.animeEntry.annId)).size;
      this.ui.resultInfo.textContent = `${this.filteredSongs.length} songs / ${count} anime${this.shuffleOrder ? ' · shuffled' : ''}${this.searchLimited ? ' · limited search' : ''}`;
      this.virtualStart = -1;
      if (this.activeView === 'coverage') this.renderCoverage();
      else this.renderPage();
      this.updatePlayState();
    }

    setPage(page) {
      this.ui.list.scrollTop = Math.max(0,page)*this.virtualRowHeight;
      this.renderVirtual();
    }

    renderPage() {
      if (this.activeView === 'coverage') return;
      this.virtualStart = -1;
      this.virtualData = this.viewRows();
      this.ui.list.textContent = '';
      this.ui.list.scrollTop = 0;
      this.renderVirtual();
    }

    viewRows() {
      if (this.activeView === 'anime') return this.getFilteredAnime().map(group => ({ kind:'anime',group }));
      if (this.activeView === 'artists') {
        const grouped = new Map();
        const canonical = new Map();
        // Build individual performer names, not separate entries for every duo.
        for (const song of this.filteredSongs) {
          for (const name of this.artistCreditNames(song.songEntry.artist)) {
            const key = name.toLocaleLowerCase();
            if (!canonical.has(key)) canonical.set(key, name);
          }
        }
        // Count using the exact same search index that the Songs view uses.
        // Includes collaborative credits and group members, only once per song.
        for (const song of this.filteredSongs) {
          const indexed = new Set((song._search?.artist || '').split(' | ').map(name => name.trim()).filter(Boolean));
          for (const key of indexed) {
            const name = canonical.get(key);
            if (!name) continue;
            let item = grouped.get(key);
            if (!item) grouped.set(key, item = {name, songs:0, anime:new Set()});
            item.songs++;
            item.anime.add(song.animeEntry.annId);
          }
        }
        return [...grouped.values()].sort((a,b) => b.songs-a.songs || a.name.localeCompare(b.name)).map(artist => ({kind:'artist',artist}));
      }
      // Keep an anime heading only once for each contiguous group. Other sort
      // modes and shuffle remain a compact one-line-per-song list.
      const sort = this.ui.form.elements.sort?.value || 'annId';
      const grouped = !this.shuffleOrder && ['annId', 'anime', 'year'].includes(sort);
      if (!grouped) return this.filteredSongs.map(song=>({kind:'song',song,inlineAnime:true}));
      const rows=[];
      let lastAnime=null;
      for (const song of this.filteredSongs) {
        const annId=String(song.animeEntry.annId);
        if (annId!==lastAnime) {
          rows.push({kind:'animeHeader',song});
          lastAnime=annId;
        }
        rows.push({kind:'song',song});
      }
      return rows;
    }

    renderVirtual() {
      if (!this.ui.list || this.activeView === 'coverage') return;
      const list=this.ui.list, data=this.virtualData || [];
      const size=this.virtualRowHeight;
      const start=Math.max(0,Math.floor(list.scrollTop / size)-6);
      const count=Math.ceil((list.clientHeight || 650)/size)+14;
      const end=Math.min(data.length,start+count);
      if (this.virtualStart === start && this.virtualEnd === end) return;
      this.virtualStart=start; this.virtualEnd=end;
      const fragment=document.createDocumentFragment();
      const top=document.createElement('div'); top.style.height=(start*size)+'px'; fragment.append(top);
      for(let i=start;i<end;i++) fragment.append(this.virtualRow(data[i]));
      const bottom=document.createElement('div'); bottom.style.height=((data.length-end)*size)+'px'; fragment.append(bottom);
      list.replaceChildren(fragment);
      this.attachArtistHovers(list);
    }

    virtualRow(item) {
      const wrap=document.createElement('div');
      wrap.className='nsl-virtual-entry';
      wrap.style.height=this.virtualRowHeight+'px';
      if (item.kind==='animeHeader') {
        const song=item.song;
        const anime=song.animeEntry;
        const name=this.displayAnimeName(song);
        wrap.classList.add('nsl-group-heading','nsl-anime');
        wrap.dataset.annId=anime.annId;
        wrap.innerHTML=`<button class="nsl-anime-main" type="button" data-anime-link title="Open anime page"><span class="nsl-spoiler">${this.escape(name.main)}</span></button><select class="nsl-anime-status nsl-status-${anime.status}" data-anime-status data-old-status="${anime.status}" title="Change MAL status">${this.animeStatusOptions(anime.status)}</select><span class="nsl-chip">${this.escape(anime.category?.name||'')}</span><span class="nsl-chip">${anime.year||'-'}</span>`;
      } else if(item.kind==='artist') {
        const a=item.artist;
        wrap.innerHTML=`<button class="nsl-artist-jump" type="button" data-artist-jump="${this.escape(a.name)}" title="Show this artist's songs">${this.escape(a.name)}</button><span class="nsl-chip">${a.songs} songs</span><span class="nsl-chip">${a.anime.size} anime</span>`;
      } else if(item.kind==='anime') {
        const a=item.group;
        const name=this.displayAnimeName(a.firstSong);
        wrap.classList.add('nsl-anime'); wrap.dataset.annId=a.annId;
        wrap.innerHTML=`<span class="nsl-anime-short nsl-spoiler">${this.escape(name.main)}</span><select class="nsl-anime-status nsl-status-${a.anime.status}" data-anime-status data-old-status="${a.anime.status}" title="Change MAL status">${this.animeStatusOptions(a.anime.status)}</select><span class="nsl-chip">${this.escape(a.anime.category?.name||'')}</span><span class="nsl-chip">${a.anime.year||'-'}</span><span class="nsl-chip">${a.songs.length} songs</span>`;
      } else {
        const song=item.song;
        const row=this.renderSongRow(song);
        row.classList.add('nsl-virtual-song');
        row.style.minHeight='0';
        if (item.inlineAnime) {
          // Show the anime in the same line instead of wasting a second row.
          const name=row.querySelector('.nsl-song-name');
          if (name) {
            const inline=document.createElement('span');
            inline.className='nsl-virtual-inline-anime nsl-spoiler';
            inline.textContent='· '+this.displayAnimeName(song).main;
            inline.title=inline.textContent;
            name.append(inline);
          }
        }
        wrap.append(row);
        return wrap;
      }
      return wrap;
    }

    getFilteredAnime() {
      const byId = new Map();
      for (const song of this.filteredSongs) {
        const key = String(song.animeEntry.annId);
        if (!byId.has(key)) byId.set(key, { annId: key, anime: song.animeEntry, firstSong: song, songs: [] });
        byId.get(key).songs.push(song);
      }
      return [...byId.values()];
    }

    renderAnimeOnly() {
      const list = this.ui.list;
      const anime = this.getFilteredAnime();
      if (!anime.length) {
        list.innerHTML = '<div class="nsl-empty">No anime found. Try changing filters.</div>';
        return;
      }
      const start = Math.max(0, Math.min(this.animePage, Math.max(0, anime.length - 1)));
      this.animePage = Math.floor(start / APP.pageSize) * APP.pageSize;
      const fragment = document.createDocumentFragment();
      fragment.append(this.animePaginationNode(anime.length));
      for (const group of anime.slice(this.animePage, this.animePage + APP.pageSize)) {
        const section = this.renderAnimeGroup({ ...group, songs: [] });
        section.classList.add('nsl-anime-only');
        const chip = section.querySelector('.nsl-anime-tags .nsl-chip:last-child');
        if (chip) chip.textContent = `${group.songs.length} songs`;
        fragment.append(section);
      }
      fragment.append(this.animePaginationNode(anime.length));
      list.append(fragment);
    }

    animePaginationNode(count) {
      const wrap = document.createElement('div');
      wrap.className = 'nsl-pagination';
      const to = Math.min(count, this.animePage + APP.pageSize);
      wrap.innerHTML = `<button class="nsl-page-btn" type="button" data-page="${this.animePage - APP.pageSize}" ${this.animePage <= 0 ? 'disabled' : ''}>Prev</button><span>${this.animePage + 1}–${to} / ${count} anime</span><button class="nsl-page-btn" type="button" data-page="${this.animePage + APP.pageSize}" ${to >= count ? 'disabled' : ''}>Next</button>`;
      return wrap;
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
          <button class="nsl-anime-main" type="button" data-anime-link title="Open anime page"><span class="nsl-spoiler">${this.escape(name.main)}${name.secondary ? `<span class="nsl-anime-alt">${this.escape(name.secondary)}</span>` : ''}</span></button>
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
        <div class="nsl-song-name"><span class="nsl-spoiler">${this.escape(song.songEntry.name)}</span> <span>— </span><span class="nsl-spoiler"><span class="nsl-artist nsl-song-artist"></span></span></div>
        <label class="nsl-save"><input type="checkbox" data-save ${saved ? 'checked' : ''}> Saved</label>
        <select class="nsl-rate" data-rate title="Like status">
          <option value="1" ${song.songEntry.status === 1 ? 'selected' : ''}>L</option>
          <option value="0" ${song.songEntry.status === 0 ? 'selected' : ''}>-</option>
          <option value="2" ${song.songEntry.status === 2 ? 'selected' : ''}>D</option>
        </select>
        <div style="display:flex;gap:5px;justify-content:flex-end;min-width:0"><button class="nsl-icon-btn" type="button" data-anime-link title="Open anime page">${icons.external}</button><button class="nsl-icon-btn" type="button" data-info title="Info">${icons.info}</button><button class="nsl-icon-btn" type="button" data-play-song title="Play">${icons.play}</button></div>`;
      return row;
    }

    onListClick(event) {
      const pageButton = event.target.closest('[data-page]');
      if (pageButton && !pageButton.disabled) return this.setPage(Number(pageButton.dataset.page));
      const artistJump = event.target.closest('[data-artist-jump]');
      if (artistJump) {
        this.ui.form.elements.search.value = artistJump.dataset.artistJump;
        this.ui.form.elements.searchIn.value = 'artist';
        this.ui.form.elements.partial.checked = false;
        this.shuffleOrder = null;
        this.setView('songs');
        this.render();
        return;
      }
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
      this.scheduleSessionSave();
      this.audio.src = `${APP.audioHost}${fileName}`;
      this.ui.trackTitle.innerHTML = `<span class="nsl-spoiler">${this.escape(song.songEntry.name)}</span> — <span class="nsl-spoiler"><span class="nsl-artist nsl-player-artist"></span></span>`;
      this.getArtistHover(song.songEntry.artist, $(this.ui.trackTitle).find('.nsl-player-artist'));
      this.ui.trackSub.innerHTML = `<span class="nsl-spoiler">${this.escape(this.displayAnimeName(song).main)}</span> (${this.escape(this.songType(song))})`;
      this.audio.play().catch((error) => {
        console.error('[NSL] Playback error:', error);
        this.state.playing = false;
        this.updatePlayState();
      });
      this.updatePlayState();
    }

    togglePlay() {
      if (!this.state.currentTrack) return;
      if (!this.audio.src) {
        this.pendingResumeTime = Number(this.session?.time) || 0;
        return this.loadSong(this.state.currentTrack);
      }
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

    navigateModal(direction) {
      if (!this.filteredSongs.length) return;
      const index = this.filteredSongs.findIndex((song) => song.key === this.currentModalKey);
      const next = (index + direction + this.filteredSongs.length) % this.filteredSongs.length;
      this.openModal(this.filteredSongs[next]);
    }

    updateModalPosition() {
      const index = this.filteredSongs.findIndex((song) => song.key === this.currentModalKey);
      this.ui.modalPosition.textContent = index < 0 ? '—' : `${index + 1} / ${this.filteredSongs.length}`;
    }

    openModal(song) {
      this.currentModalKey = song.key;
      const oldVideo = this.ui.modalBody.querySelector('video');
      if (oldVideo) { oldVideo.pause(); oldVideo.removeAttribute('src'); oldVideo.load(); }
      this.ui.modal.classList.remove('nsl-hidden');
      this.updateModalPosition();
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
      this.currentModalKey = null;
      const video = this.ui.modalBody.querySelector('video');
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
      this.ui.modal.classList.add('nsl-hidden');
    }

    renderModal(song) {
      if (this.ui.modal.classList.contains('nsl-hidden') || song.key !== this.currentModalKey) return;
      this.updateModalPosition();
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
      if (this.quizCoverEnabled) this.showQuizCover(info);
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

    startCoverDrag(event) {
      if (event.button !== 0 || !this.ui.quizCover) return;
      const rect = this.ui.quizCover.getBoundingClientRect();
      this.ui.quizCover.style.left = `${rect.left}px`;
      this.ui.quizCover.style.top = `${rect.top}px`;
      this.ui.quizCover.style.transform = 'none';
      this.coverDrag = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
      event.preventDefault();
    }

    moveQuizCover(event) {
      const cover = this.ui.quizCover;
      if (!cover || !this.coverDrag) return;
      const maxLeft = Math.max(0, window.innerWidth - cover.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - cover.offsetHeight);
      const left = Math.max(0, Math.min(maxLeft, event.clientX - this.coverDrag.offsetX));
      const top = Math.max(0, Math.min(maxTop, event.clientY - this.coverDrag.offsetY));
      cover.style.left = `${left}px`;
      cover.style.top = `${top}px`;
    }

    quizCoverKindRu(kind) {
      const map = {
        tv: 'ТВ',
        movie: 'Фильм',
        ova: 'OVA',
        ona: 'ONA',
        special: 'Спецвыпуск',
        music: 'Клип',
        tv_special: 'ТВ-спешл',
        cm: 'CM',
        pv: 'PV',
        promo: 'Промо'
      };
      const key = String(kind || '').trim().toLowerCase();
      return map[key] || String(kind || '');
    }

    async showQuizCover(info) {
      if (!this.quizCoverEnabled) return;
      // AMQ provides the MAL identifier; it is used only as an identifier for Shikimori.
      const animeId = Number(info.siteIds?.malId || 0);
      const requestId = ++this.coverRequestId;
      const cover = this.ui.quizCover;
      const image = this.ui.quizCoverImage;
      if (!cover || !image) return;

      cover.classList.add('nsl-visible');
      image.onload = null;
      image.onerror = null;
      image.removeAttribute('src');
      image.style.display = 'none';
      this.ui.quizCoverTitleRu.textContent = animeId ? 'Загрузка из Shikimori…' : 'ID аниме недоступен';
      this.ui.quizCoverMeta.textContent = animeId ? 'Загрузка информации…' : 'Не удалось определить аниме';
      if (!animeId) return;

      try {
        const anime = await this.getShikimoriAnime(animeId);
        if (requestId !== this.coverRequestId || !this.quizCoverEnabled) return;
        this.ui.quizCoverTitleRu.textContent = anime.russian || anime.licenseNameRu || anime.name || 'Название не найдено';

        const rows = [];
        const add = (label, value) => {
          const str = String(value || '').trim();
          if (!str) return;
          rows.push(`<div class="nsl-quiz-cover-meta-row" title="${this.escape(str)}"><span class="nsl-quiz-cover-meta-label">${this.escape(label)}:</span><span class="nsl-quiz-cover-meta-value">${this.escape(str)}</span></div>`);
        };
        const aired = anime.airedOn;
        const releaseDate = aired?.year
          ? [String(aired.day || '').padStart(2, '0'), String(aired.month || '').padStart(2, '0'), String(aired.year)]
              .filter((part, index) => index === 2 || Number(part) > 0).join('.')
          : '';
        add('Дата выхода', releaseDate);
        add('Студия', anime.studios?.map(item => item.name).filter(Boolean).join(', '));
        add('Первоисточник', anime.origin || anime.source);
        this.ui.quizCoverMeta.innerHTML = rows.length ? rows.join('') : 'Дополнительная информация не найдена';

        const poster = anime.poster || {};
        const url = poster.originalUrl || poster.mainUrl || poster.x96Url || '';
        if (url) {
          image.onload = () => { if (requestId === this.coverRequestId && this.quizCoverEnabled) image.style.display = 'block'; };
          image.onerror = () => { if (requestId === this.coverRequestId) image.style.display = 'none'; };
          const resolved = new URL(url, 'https://shikimori.io');
          if (resolved.hostname === 'shikimori.one') resolved.hostname = 'shikimori.io';
          if (resolved.hostname === 'shikimori.io') image.src = resolved.href;
        }
      } catch (error) {
        if (requestId !== this.coverRequestId || !this.quizCoverEnabled) return;
        console.warn('[NSL] Shikimori anime loading failed:', error);
        this.ui.quizCoverTitleRu.textContent = 'Не удалось загрузить Shikimori';
        this.ui.quizCoverMeta.textContent = 'Проверь доступ к shikimori.io';
      }
    }

    async getShikimoriAnime(animeId) {
      if (this.shikimoriCache.has(animeId)) return this.shikimoriCache.get(animeId);
      if (this.shikimoriPending.has(animeId)) return this.shikimoriPending.get(animeId);
      const pending = (async () => {
        // One request to Shikimori; no AniList, Jikan or MyAnimeList requests for the cover window.
        const query = `query ($id: String!) {
          animes(ids: $id, limit: 1) {
            id malId name russian licenseNameRu kind origin
            airedOn { year month day }
            poster { originalUrl mainUrl }
            studios { name }
            genres { name russian }
          }
        }`;
        const response = await this.gmRequest({
          method: 'POST',
          url: 'https://shikimori.io/api/graphql',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          data: JSON.stringify({ query, variables: { id: String(animeId) } }),
        });
        if (response.status < 200 || response.status >= 300) throw new Error(`Shikimori HTTP ${response.status}`);
        const payload = JSON.parse(response.responseText || '{}');
        if (payload.errors?.length) throw new Error(payload.errors.map(e => e.message).join('; '));
        const items = payload.data?.animes || [];
        const anime = items.find(a => Number(a.malId) === animeId) || null;
        if (!anime) throw new Error(`No Shikimori anime found for MAL ID ${animeId}`);
        this.shikimoriCache.set(animeId, anime);
        return anime;
      })();
      this.shikimoriPending.set(animeId, pending);
      try { return await pending; }
      finally { this.shikimoriPending.delete(animeId); }
    }

    hideQuizCover() {
      this.coverRequestId += 1;
      this.ui.quizCover?.classList.remove('nsl-visible');
      this.ui.quizCoverImage?.removeAttribute('src');
      if (this.ui.quizCoverImage) this.ui.quizCoverImage.style.display = 'none';
      if (this.ui.quizCoverMeta) this.ui.quizCoverMeta.textContent = '';
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
