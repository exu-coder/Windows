var w=Object.defineProperty;var x=(l,e,t)=>e in l?w(l,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):l[e]=t;var d=(l,e,t)=>x(l,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();const k={theme:"dark",soundEffects:!0,typingSounds:!0,masterVolume:.5,showKeyboard:!0,showFingerGuide:!0,showWpm:!0,showAccuracy:!0,showErrors:!0,showTimer:!0,backspaceAllowed:!0,keyboardLayout:"us-qwerty",reducedMotion:!1},g={version:1,firstLaunch:!0,experienceLevel:"complete-beginner",focusGoal:"both",currentLessonId:1,lessons:{},keyStats:{},testResults:[],lessonResults:[],achievements:{},gameScores:[],totalPracticeTimeMs:0,totalKeystrokes:0,totalCharacters:0,totalErrors:0,currentStreak:0,longestStreak:0,lastPracticeDate:"",bestWpm:0,averageWpm:0,averageAccuracy:0,settings:{...k}},v={"`":"left-pinky",1:"left-pinky",q:"left-pinky",a:"left-pinky",z:"left-pinky",2:"left-ring",w:"left-ring",s:"left-ring",x:"left-ring",3:"left-middle",e:"left-middle",d:"left-middle",c:"left-middle",4:"left-index",5:"left-index",r:"left-index",t:"left-index",f:"left-index",g:"left-index",v:"left-index",b:"left-index",6:"right-index",7:"right-index",y:"right-index",u:"right-index",h:"right-index",j:"right-index",n:"right-index",m:"right-index",8:"right-middle",i:"right-middle",k:"right-middle",",":"right-middle",9:"right-ring",o:"right-ring",l:"right-ring",".":"right-ring",0:"right-pinky","-":"right-pinky","=":"right-pinky",p:"right-pinky","[":"right-pinky","]":"right-pinky","\\":"right-pinky",";":"right-pinky","'":"right-pinky","/":"right-pinky"," ":"thumb",ShiftLeft:"left-pinky",ShiftRight:"right-pinky",Tab:"left-pinky",CapsLock:"left-pinky",Enter:"right-pinky",Backspace:"right-pinky",ControlLeft:"left-pinky",ControlRight:"right-pinky",AltLeft:"left-thumb",AltRight:"right-thumb"},T={"left-pinky":"Left Pinky","left-ring":"Left Ring","left-middle":"Left Middle","left-index":"Left Index","left-thumb":"Left Thumb","right-index":"Right Index","right-middle":"Right Middle","right-ring":"Right Ring","right-pinky":"Right Pinky","right-thumb":"Right Thumb",thumb:"Thumbs"},E="TypingMasterDB",L=1,u="progress",b="userProgress";class S{constructor(){d(this,"db",null);d(this,"memoryFallback",null);d(this,"useMemory",!1)}async init(){try{this.db=await this.openDB()}catch{this.useMemory=!0,this.memoryFallback=this.loadFromLocalStorage()||structuredClone(g)}}openDB(){return new Promise((e,t)=>{const s=indexedDB.open(E,L);s.onerror=()=>t(s.error),s.onsuccess=()=>e(s.result),s.onupgradeneeded=i=>{const r=i.target.result;r.objectStoreNames.contains(u)||r.createObjectStore(u)}})}loadFromLocalStorage(){try{const e=localStorage.getItem("tm_progress");if(e)return JSON.parse(e)}catch{}return null}saveToLocalStorage(e){try{localStorage.setItem("tm_progress",JSON.stringify(e))}catch{}}async loadUserProgress(){return this.useMemory?this.memoryFallback||structuredClone(g):new Promise(e=>{if(!this.db){e(this.loadFromLocalStorage()||structuredClone(g));return}const i=this.db.transaction(u,"readonly").objectStore(u).get(b);i.onsuccess=()=>{const r=i.result;if(r&&r.version)e(this.migrate(r));else{const n=this.loadFromLocalStorage();e(n||structuredClone(g))}},i.onerror=()=>{e(this.loadFromLocalStorage()||structuredClone(g))}})}async saveUserProgress(e){if(this.saveToLocalStorage(e),this.useMemory){this.memoryFallback=e;return}return new Promise(t=>{if(!this.db){t();return}const s=this.db.transaction(u,"readwrite");s.objectStore(u).put(e,b),s.oncomplete=()=>t(),s.onerror=()=>t()})}migrate(e){return e.settings||(e.settings={...g.settings}),e.lessons||(e.lessons={}),e.keyStats||(e.keyStats={}),e.testResults||(e.testResults=[]),e.lessonResults||(e.lessonResults=[]),e.achievements||(e.achievements={}),e.gameScores||(e.gameScores=[]),e}async exportData(){const e=await this.loadUserProgress();return JSON.stringify(e,null,2)}async importData(e){try{const t=JSON.parse(e);if(!t||typeof t!="object"||!t.version)return!1;const s=this.migrate(t);return s.firstLaunch=!1,await this.saveUserProgress(s),!0}catch{return!1}}async resetAllData(){const e=structuredClone(g);await this.saveUserProgress(e)}async updateSettings(e){const t=await this.loadUserProgress();return t.settings={...t.settings,...e},await this.saveUserProgress(t),t}async saveLessonProgress(e,t){const s=await this.loadUserProgress(),i=s.lessons[e]||{lessonId:e,completed:!1,attempts:0,bestAccuracy:0,bestWpm:0,lastAttempt:0,timesCompleted:0};s.lessons[e]={...i,...t},await this.saveUserProgress(s)}async addTestResult(e){const t=await this.loadUserProgress();t.testResults.unshift(e),t.testResults.length>100&&(t.testResults.length=100),e.wpm>t.bestWpm&&(t.bestWpm=e.wpm),await this.saveUserProgress(t)}async addLessonResult(e){const t=await this.loadUserProgress();t.lessonResults.unshift(e),t.lessonResults.length>200&&(t.lessonResults.length=200),await this.saveUserProgress(t)}async updateKeyStats(e,t,s){const i=await this.loadUserProgress(),r=e.toLowerCase(),n=i.keyStats[r]||{key:r,attempts:0,correct:0,errors:0,totalTimeMs:0,lastPracticed:0,masteryScore:50,nextReview:Date.now()};n.attempts++,t?n.correct++:n.errors++,n.totalTimeMs+=s,n.lastPracticed=Date.now();const a=n.correct/n.attempts;n.masteryScore=Math.round(a*100);const c=a>.95?7:a>.85?3:a>.7?1:.5;n.nextReview=Date.now()+c*24*60*60*1e3,i.keyStats[r]=n,await this.saveUserProgress(i)}async unlockAchievement(e,t){var i;const s=await this.loadUserProgress();return(i=s.achievements[e])!=null&&i.unlocked?!1:(s.achievements[e]={...t,unlocked:!0,unlockedAt:Date.now()},await this.saveUserProgress(s),!0)}async addGameScore(e){const t=await this.loadUserProgress();t.gameScores.unshift(e),t.gameScores.length>50&&(t.gameScores.length=50),await this.saveUserProgress(t)}}class M{constructor(){d(this,"ctx",null);d(this,"enabled",!0);d(this,"typingEnabled",!0);d(this,"volume",.5);d(this,"lastPlay",0)}ensureCtx(){return this.ctx||(this.ctx=new(window.AudioContext||window.webkitAudioContext)),this.ctx.state==="suspended"&&this.ctx.resume(),this.ctx}setEnabled(e){this.enabled=e}setTypingEnabled(e){this.typingEnabled=e}setVolume(e){this.volume=Math.max(0,Math.min(1,e))}playTone(e,t,s="sine",i=1){if(!this.enabled)return;const r=performance.now();if(!(r-this.lastPlay<30)){this.lastPlay=r;try{const n=this.ensureCtx(),a=n.createOscillator(),c=n.createGain();a.type=s,a.frequency.value=e,c.gain.value=this.volume*i*.15,c.gain.exponentialRampToValueAtTime(.001,n.currentTime+t),a.connect(c),c.connect(n.destination),a.start(),a.stop(n.currentTime+t)}catch{}}}playKeyCorrect(){this.typingEnabled&&this.playTone(880,.04,"sine",.6)}playKeyError(){this.typingEnabled&&this.playTone(180,.08,"square",.5)}playClick(){this.playTone(600,.03,"sine",.4)}playStart(){this.playTone(440,.08,"sine",.7),setTimeout(()=>this.playTone(550,.08,"sine",.7),80)}playComplete(){this.playTone(523,.1,"sine",.8),setTimeout(()=>this.playTone(659,.1,"sine",.8),100),setTimeout(()=>this.playTone(784,.15,"sine",.8),200)}playAchievement(){this.playTone(523,.1,"triangle",.9),setTimeout(()=>this.playTone(659,.1,"triangle",.9),120),setTimeout(()=>this.playTone(784,.1,"triangle",.9),240),setTimeout(()=>this.playTone(1047,.2,"triangle",.9),360)}playCountdown(){this.playTone(660,.1,"sine",.7)}playGameSuccess(){this.playTone(784,.12,"sine",.8),setTimeout(()=>this.playTone(1047,.18,"sine",.8),120)}playGameFailure(){this.playTone(200,.15,"sawtooth",.5),setTimeout(()=>this.playTone(150,.2,"sawtooth",.5),120)}}class C{constructor(){d(this,"targetText","");d(this,"position",0);d(this,"errors",0);d(this,"correctChars",0);d(this,"incorrectChars",0);d(this,"backspaces",0);d(this,"startTime",0);d(this,"elapsedPaused",0);d(this,"pauseStart",0);d(this,"isPaused",!1);d(this,"isRunning",!1);d(this,"isComplete",!1);d(this,"typedChars",[]);d(this,"onKey");d(this,"onUpdate");d(this,"onComplete");d(this,"allowBackspace",!0);d(this,"lastKeyTime",0)}setText(e){this.targetText=e,this.reset()}setAllowBackspace(e){this.allowBackspace=e}onKeyPress(e){this.onKey=e}onMetricsUpdate(e){this.onUpdate=e}onFinished(e){this.onComplete=e}start(){this.isRunning=!0,this.isPaused=!1,this.startTime=performance.now(),this.elapsedPaused=0,this.lastKeyTime=this.startTime}pause(){!this.isRunning||this.isPaused||(this.isPaused=!0,this.pauseStart=performance.now())}resume(){this.isPaused&&(this.elapsedPaused+=performance.now()-this.pauseStart,this.isPaused=!1)}reset(){this.position=0,this.errors=0,this.correctChars=0,this.incorrectChars=0,this.backspaces=0,this.startTime=0,this.elapsedPaused=0,this.isPaused=!1,this.isRunning=!1,this.isComplete=!1,this.typedChars=[],this.lastKeyTime=0}getPosition(){return this.position}getTarget(){return this.targetText}getIsComplete(){return this.isComplete}getIsRunning(){return this.isRunning&&!this.isPaused}getIsPaused(){return this.isPaused}handleKeyDown(e){var a,c;if(!this.isRunning||this.isPaused||this.isComplete)return!1;if(([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab"].includes(e.key)||e.key==="Backspace")&&e.preventDefault(),e.key==="Backspace"){if(!this.allowBackspace||this.position===0)return!0;if(this.position--,this.backspaces++,this.typedChars.length){const o=this.typedChars.pop();o&&o.correct}return this.emitUpdate(),!0}if(["Shift","Control","Alt","Meta","CapsLock"].includes(e.key))return!1;const s=this.targetText[this.position];if(s===void 0)return!0;const i=e.key,r=i===s,n=performance.now();if(n-this.lastKeyTime,this.lastKeyTime=n,this.typedChars.push({char:i,correct:r}),r?(this.correctChars++,this.position++):(this.incorrectChars++,this.errors++,this.position++),(a=this.onKey)==null||a.call(this,{correct:r,expected:s,received:i,position:this.position}),this.emitUpdate(),this.position>=this.targetText.length){this.isComplete=!0,this.isRunning=!1;const o=this.getMetrics();(c=this.onComplete)==null||c.call(this,o)}return!0}getMetrics(){const e=this.getElapsedMs(),t=e/6e4||1/6e4,s=this.correctChars+this.incorrectChars,i=Math.round(s/5/t),r=Math.max(0,Math.round((s/5-this.errors)/t)),n=s>0?Math.round(this.correctChars/s*1e3)/10:100,a=this.targetText.length?Math.min(100,this.position/this.targetText.length*100):0;return{wpm:i,netWpm:r,cpm:Math.round(s/t),accuracy:n,errors:this.errors,correctChars:this.correctChars,incorrectChars:this.incorrectChars,backspaces:this.backspaces,elapsedMs:e,progress:a,charsPerSecond:e>0?s/(e/1e3):0,wordsTyped:Math.floor(this.correctChars/5)}}getElapsedMs(){if(!this.startTime)return 0;const e=this.isPaused?this.pauseStart:performance.now();return Math.max(0,e-this.startTime-this.elapsedPaused)}emitUpdate(){var e;(e=this.onUpdate)==null||e.call(this,this.getMetrics())}getDisplayState(){const e=[];for(let t=0;t<this.targetText.length;t++){let s="pending";if(t<this.position){const i=this.typedChars[t];s=i&&i.correct?"correct":"error"}else t===this.position&&(s="current");e.push({char:this.targetText[t],state:s})}return e}}async function P(){const l=[];try{const e=await fetch("./data/lessons/index.json");if(e.ok){const t=await e.json();if(t.parts&&Array.isArray(t.parts)){for(const s of t.parts)try{const i=await fetch(`./data/lessons/${s.file}`);if(i.ok){const r=await i.json();r!=null&&r.lessons&&l.push(...r.lessons)}}catch{console.warn("Failed to load part",s.file)}if(l.length>0)return l.sort((s,i)=>s.id-i.id)}}}catch{console.warn("Index load failed, trying fallback")}try{const e=await fetch("./data/lessons.json");if(e.ok){const t=await e.json();if(Array.isArray(t))return t}}catch{}return l.sort((e,t)=>e.id-t.id)}function m(l,e){return l.find(t=>t.id===e)}const f=[{id:"first-lesson",title:"First Steps",description:"Complete your first lesson",icon:"🎯"},{id:"lessons-10",title:"Getting Started",description:"Complete 10 lessons",icon:"📚"},{id:"lessons-25",title:"Dedicated Learner",description:"Complete 25 lessons",icon:"📖"},{id:"lessons-50",title:"Halfway There",description:"Complete 50 lessons",icon:"⭐"},{id:"lessons-100",title:"Century Club",description:"Complete 100 lessons",icon:"💯"},{id:"wpm-50",title:"Speed Starter",description:"Reach 50 WPM",icon:"⚡"},{id:"wpm-60",title:"Swift Fingers",description:"Reach 60 WPM",icon:"🚀"},{id:"wpm-80",title:"Speed Demon",description:"Reach 80 WPM",icon:"💨"},{id:"wpm-100",title:"Century Speed",description:"Reach 100 WPM",icon:"🏆"},{id:"chars-5k",title:"5K Characters",description:"Type 5,000 characters",icon:"✍️"},{id:"chars-10k",title:"10K Characters",description:"Type 10,000 characters",icon:"📝"},{id:"time-1h",title:"One Hour Club",description:"Practice for 1 hour total",icon:"⏱️"},{id:"time-5h",title:"Dedicated",description:"Practice for 5 hours total",icon:"🕐"},{id:"streak-7",title:"Week Warrior",description:"7-day practice streak",icon:"🔥"},{id:"streak-30",title:"Monthly Master",description:"30-day practice streak",icon:"🌟"},{id:"complete-beginner",title:"Foundation Complete",description:"Finish the Foundation level",icon:"🏗️"},{id:"master-typist",title:"Master Typist",description:"100+ lessons and 60+ WPM",icon:"👑"},{id:"perfect-accuracy",title:"Perfect Accuracy",description:"Complete a lesson with 100% accuracy",icon:"💎"},{id:"no-mistakes",title:"Flawless",description:"Finish a test with zero errors",icon:"✨"}];class I{constructor(){d(this,"listeners",[])}getRoute(){return window.location.hash.replace(/^#\/?/,"")||"dashboard"}navigate(e){const t=e.replace(/^\//,"");window.location.hash!=="#"+t&&(window.location.hash=t),this.listeners.forEach(s=>s(t))}onChange(e){this.listeners.push(e)}}class B{constructor(){d(this,"storage",new S);d(this,"audio",new M);d(this,"engine",new C);d(this,"progress");d(this,"lessons",[]);d(this,"router",new I);d(this,"currentView","");d(this,"boundKeyHandler",null)}async init(){await this.storage.init(),this.progress=await this.storage.loadUserProgress(),this.applyTheme(),this.audio.setEnabled(this.progress.settings.soundEffects),this.audio.setTypingEnabled(this.progress.settings.typingSounds),this.audio.setVolume(this.progress.settings.masterVolume),this.lessons=await P(),this.ensureAchievements(),this.renderShell(),this.setupOfflineIndicator(),this.setupKeyboardShortcuts(),this.progress.firstLaunch?this.router.navigate("onboarding"):this.router.navigate(this.router.getRoute()||"dashboard"),this.router.onChange(e=>this.renderView(e)),window.addEventListener("hashchange",()=>{this.router.navigate(this.router.getRoute())})}ensureAchievements(){for(const e of f)this.progress.achievements[e.id]||(this.progress.achievements[e.id]={...e,unlocked:!1})}applyTheme(){const e=this.progress.settings.theme;let t=e;e==="system"&&(t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"),document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark")}renderShell(){const e=document.getElementById("app");e.innerHTML=`
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <svg viewBox="0 0 100 100" fill="none"><rect x="8" y="28" width="84" height="52" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/><rect x="18" y="38" width="12" height="12" rx="2" fill="#3b82f6"/><rect x="34" y="38" width="12" height="12" rx="2" fill="#64748b"/><rect x="50" y="38" width="12" height="12" rx="2" fill="#64748b"/><rect x="66" y="38" width="12" height="12" rx="2" fill="#64748b"/><rect x="26" y="54" width="48" height="10" rx="2" fill="#8b5cf6"/><path d="M50 12 L58 22 L42 22 Z" fill="#3b82f6"/></svg>
          <h1>Typing Master</h1>
        </div>
        <nav class="sidebar-nav" id="nav">
          ${this.navItems().map(t=>`
            <button class="nav-item" data-route="${t.route}">
              ${t.icon}<span>${t.label}</span>
            </button>
          `).join("")}
        </nav>
        <div class="sidebar-footer">Build Speed. Build Accuracy.<br>Build Muscle Memory.</div>
      </aside>
      <div class="main">
        <header class="header">
          <div class="header-title" id="page-title">Dashboard</div>
          <div class="header-actions">
            <button class="btn btn-ghost btn-sm" id="theme-toggle" title="Toggle theme">◐</button>
          </div>
        </header>
        <main class="content" id="content"></main>
      </div>
      <div class="toast-container" id="toasts"></div>
      <div class="offline-badge" id="offline-badge">OFFLINE MODE — Progress saved on this device</div>
    `,document.getElementById("nav").addEventListener("click",t=>{const s=t.target.closest("[data-route]");s&&this.router.navigate(s.dataset.route)}),document.getElementById("theme-toggle").addEventListener("click",()=>{const t=this.progress.settings.theme,s=t==="dark"?"light":t==="light"?"system":"dark";this.progress.settings.theme=s,this.storage.saveUserProgress(this.progress),this.applyTheme(),this.toast(`Theme: ${s}`,"success")})}navItems(){const e=t=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${t}</svg>`;return[{route:"dashboard",label:"Dashboard",icon:e('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>')},{route:"learn",label:"Learn",icon:e('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>')},{route:"practice",label:"Practice",icon:e('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')},{route:"test",label:"Typing Test",icon:e('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>')},{route:"games",label:"Games",icon:e('<polygon points="5 3 19 12 5 21 5 3"/>')},{route:"review",label:"Review",icon:e('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>')},{route:"statistics",label:"Statistics",icon:e('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>')},{route:"achievements",label:"Achievements",icon:e('<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>')},{route:"keyboard",label:"Keyboard",icon:e('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10"/>')},{route:"settings",label:"Settings",icon:e('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>')},{route:"about",label:"About",icon:e('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>')}]}setActiveNav(e){document.querySelectorAll(".nav-item").forEach(t=>{t.classList.toggle("active",t.dataset.route===e.split("/")[0])})}renderView(e){this.unbindTyping(),this.currentView=e,this.setActiveNav(e);const t=document.getElementById("content"),s=document.getElementById("page-title"),i=e.split("/")[0],r={dashboard:"Dashboard",learn:"Learn",practice:"Practice",test:"Typing Test",games:"Games",review:"Weak Key Review",statistics:"Statistics",achievements:"Achievements",keyboard:"Keyboard Guide",settings:"Settings",about:"About",onboarding:"Welcome",lesson:"Lesson",result:"Results"};switch(s.textContent=r[i]||"Typing Master",i){case"dashboard":t.innerHTML=this.viewDashboard();break;case"learn":t.innerHTML=this.viewLearn(),this.bindLearn();break;case"practice":t.innerHTML=this.viewPractice(),this.bindPractice();break;case"test":t.innerHTML=this.viewTest(),this.bindTest();break;case"games":t.innerHTML=this.viewGames(),this.bindGames();break;case"review":t.innerHTML=this.viewReview(),this.bindReview();break;case"statistics":t.innerHTML=this.viewStatistics();break;case"achievements":t.innerHTML=this.viewAchievements();break;case"keyboard":t.innerHTML=this.viewKeyboard();break;case"settings":t.innerHTML=this.viewSettings(),this.bindSettings();break;case"about":t.innerHTML=this.viewAbout();break;case"onboarding":t.innerHTML=this.viewOnboarding(),this.bindOnboarding();break;case"lesson":{const n=parseInt(e.split("/")[1]||"1",10);t.innerHTML=this.viewLesson(n),this.bindLesson(n);break}default:t.innerHTML=this.viewDashboard()}}viewDashboard(){const e=this.progress,t=Object.values(e.lessons).filter(r=>r.completed).length,s=m(this.lessons,e.currentLessonId),i=this.getWeakKeys(5);return`
      <div class="grid grid-4" style="margin-bottom:24px">
        <div class="card"><div class="card-title">Best WPM</div><div class="card-value">${e.bestWpm||0}</div></div>
        <div class="card"><div class="card-title">Avg Accuracy</div><div class="card-value">${e.averageAccuracy||0}%</div></div>
        <div class="card"><div class="card-title">Lessons Done</div><div class="card-value">${t}/${this.lessons.length}</div></div>
        <div class="card"><div class="card-title">Streak</div><div class="card-value">${e.currentStreak} day${e.currentStreak!==1?"s":""}</div></div>
      </div>
      <div class="card" style="margin-bottom:24px">
        <div class="card-title">Continue Learning</div>
        <h2 style="font-size:1.2rem;margin:8px 0">${s?s.title:"All lessons complete!"}</h2>
        <p style="color:var(--text-muted);margin-bottom:16px">${s?s.description:"Great job mastering the course."}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-primary btn-lg" id="btn-continue">Continue Lesson</button>
          <button class="btn btn-secondary" id="btn-practice">Practice</button>
          <button class="btn btn-secondary" id="btn-test">Take a Test</button>
          <button class="btn btn-ghost" id="btn-review">Review Weak Keys</button>
        </div>
      </div>
      ${i.length?`
      <div class="card">
        <div class="card-title">Weakest Keys</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px">
          ${i.map(r=>`<span style="background:var(--bg-hover);padding:6px 14px;border-radius:6px;font-family:var(--mono)">${r.key.toUpperCase()} — ${r.masteryScore}%</span>`).join("")}
        </div>
      </div>`:""}
    `}viewLearn(){var s;const e=[...new Set(this.lessons.map(i=>i.level))];let t="";for(const i of e){const r=this.lessons.filter(n=>n.level===i);t+=`<div class="level-header">${i}</div><div class="lesson-list">`;for(const n of r){const a=this.progress.lessons[n.id],c=a==null?void 0:a.completed,o=n.id>1&&!((s=this.progress.lessons[n.id-1])!=null&&s.completed)&&n.difficulty>1&&!c;t+=`
          <div class="lesson-item ${c?"completed":""} ${o?"locked":""}" data-id="${n.id}">
            <div class="lesson-num">${c?"✓":n.number}</div>
            <div class="lesson-info">
              <h3>${n.title}</h3>
              <p>${n.description}</p>
            </div>
          </div>`}t+="</div>"}return t}bindLearn(){var e,t,s,i;document.querySelectorAll(".lesson-item:not(.locked)").forEach(r=>{r.addEventListener("click",()=>{const n=r.dataset.id;this.router.navigate(`lesson/${n}`)})}),(e=document.getElementById("btn-continue"))==null||e.addEventListener("click",()=>{this.router.navigate(`lesson/${this.progress.currentLessonId}`)}),(t=document.getElementById("btn-practice"))==null||t.addEventListener("click",()=>this.router.navigate("practice")),(s=document.getElementById("btn-test"))==null||s.addEventListener("click",()=>this.router.navigate("test")),(i=document.getElementById("btn-review"))==null||i.addEventListener("click",()=>this.router.navigate("review"))}viewLesson(e){const t=m(this.lessons,e);return t?`
      <div class="typing-container">
        <div style="margin-bottom:16px">
          <h2 style="font-size:1.2rem">${t.title}</h2>
          <p style="color:var(--text-muted);font-size:0.9rem">${t.description}</p>
        </div>
        <div class="progress-bar" style="margin-bottom:16px"><div class="progress-bar-fill" id="lesson-progress" style="width:0%"></div></div>
        <div class="metrics-bar" id="metrics">
          <div class="metric"><div class="metric-label">WPM</div><div class="metric-value" id="m-wpm">0</div></div>
          <div class="metric"><div class="metric-label">Accuracy</div><div class="metric-value" id="m-acc">100%</div></div>
          <div class="metric"><div class="metric-label">Errors</div><div class="metric-value" id="m-err">0</div></div>
          <div class="metric"><div class="metric-label">Time</div><div class="metric-value" id="m-time">0:00</div></div>
        </div>
        <div class="typing-text" id="typing-text" tabindex="0"></div>
        <div class="finger-guide" id="finger-guide"></div>
        <div class="keyboard" id="keyboard"></div>
        <div style="text-align:center;margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" id="btn-start">Start Lesson</button>
          <button class="btn btn-secondary" id="btn-pause" style="display:none">Pause</button>
          <button class="btn btn-ghost" id="btn-restart">Restart</button>
        </div>
      </div>
    `:"<p>Lesson not found.</p>"}bindLesson(e){var c;const t=m(this.lessons,e);if(!t)return;let s=0;const i=t.exercises;let r=((c=i[0])==null?void 0:c.text)||"";this.engine.setText(r),this.engine.setAllowBackspace(this.progress.settings.backspaceAllowed),this.renderTypingText(),this.renderKeyboard(),this.updateFingerGuide(r[0]||"");const n=document.getElementById("btn-start"),a=document.getElementById("btn-pause");n.addEventListener("click",()=>{var o;this.audio.playStart(),this.engine.start(),n.style.display="none",a.style.display="",(o=document.getElementById("typing-text"))==null||o.focus(),this.bindTyping()}),a.addEventListener("click",()=>{this.engine.getIsPaused()?(this.engine.resume(),a.textContent="Pause",this.bindTyping()):(this.engine.pause(),a.textContent="Resume",this.unbindTyping())}),document.getElementById("btn-restart").addEventListener("click",()=>{var o;this.unbindTyping(),s=0,r=((o=i[0])==null?void 0:o.text)||"",this.engine.setText(r),this.engine.reset(),this.renderTypingText(),this.renderKeyboard(),this.updateFingerGuide(r[0]||""),n.style.display="",a.style.display="none",a.textContent="Pause",this.updateMetricsDisplay({wpm:0,accuracy:100,errors:0,elapsedMs:0,progress:0})}),this.engine.onKeyPress(o=>{o.correct?this.audio.playKeyCorrect():this.audio.playKeyError(),this.storage.updateKeyStats(o.expected,o.correct,100),this.renderTypingText(),this.highlightKey(o.expected,o.correct);const p=this.engine.getTarget()[this.engine.getPosition()];this.updateFingerGuide(p||"")}),this.engine.onMetricsUpdate(o=>{this.updateMetricsDisplay(o);const p=document.getElementById("lesson-progress");p&&(p.style.width=o.progress+"%")}),this.engine.onFinished(async o=>{this.unbindTyping(),this.audio.playComplete();const p=o.accuracy>=(t.requirements.accuracy||90);await this.storage.addLessonResult({lessonId:e,timestamp:Date.now(),wpm:o.wpm,accuracy:o.accuracy,errors:o.errors,duration:o.elapsedMs,completed:p});const h=this.progress.lessons[e]||{lessonId:e,completed:!1,attempts:0,bestAccuracy:0,bestWpm:0,lastAttempt:0,timesCompleted:0};h.attempts++,h.lastAttempt=Date.now(),o.accuracy>h.bestAccuracy&&(h.bestAccuracy=o.accuracy),o.wpm>h.bestWpm&&(h.bestWpm=o.wpm),p&&(h.completed=!0,h.timesCompleted++,e>=this.progress.currentLessonId&&(this.progress.currentLessonId=Math.min(e+1,this.lessons.length))),this.progress.lessons[e]=h,this.progress.totalPracticeTimeMs+=o.elapsedMs,this.progress.totalKeystrokes+=o.correctChars+o.incorrectChars,this.progress.totalCharacters+=o.correctChars,this.progress.totalErrors+=o.errors,o.wpm>this.progress.bestWpm&&(this.progress.bestWpm=o.wpm),this.updateStreak(),this.recalcAverages(),await this.storage.saveUserProgress(this.progress),await this.checkAchievements(),p&&s<i.length-1?(s++,r=i[s].text,this.engine.setText(r),this.engine.reset(),this.renderTypingText(),this.renderKeyboard(),this.updateFingerGuide(r[0]||""),n.style.display="",a.style.display="none",this.toast(`Exercise ${s+1}/${i.length}`,"success")):this.showLessonResult(o,p,t)})}showLessonResult(e,t,s){var r,n,a;const i=document.getElementById("content");i.innerHTML=`
      <div class="result-screen">
        <h2>${t?"Lesson Complete!":"Keep Practicing"}</h2>
        <p style="color:var(--text-muted);margin-bottom:20px">${t?"Great work!":`Need ${s.requirements.accuracy}% accuracy to pass.`}</p>
        <div class="result-stats">
          <div class="result-stat"><div class="val">${e.wpm}</div><div class="lbl">WPM</div></div>
          <div class="result-stat"><div class="val">${e.accuracy}%</div><div class="lbl">Accuracy</div></div>
          <div class="result-stat"><div class="val">${e.errors}</div><div class="lbl">Errors</div></div>
          <div class="result-stat"><div class="val">${e.netWpm}</div><div class="lbl">Net WPM</div></div>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" id="res-again">Try Again</button>
          ${t?'<button class="btn btn-accent" id="res-next">Next Lesson</button>':""}
          <button class="btn btn-secondary" id="res-dash">Dashboard</button>
        </div>
      </div>
    `,(r=document.getElementById("res-again"))==null||r.addEventListener("click",()=>this.router.navigate(`lesson/${s.id}`)),(n=document.getElementById("res-next"))==null||n.addEventListener("click",()=>this.router.navigate(`lesson/${s.id+1}`)),(a=document.getElementById("res-dash"))==null||a.addEventListener("click",()=>this.router.navigate("dashboard"))}viewPractice(){return`
      <div class="typing-container">
        <p style="color:var(--text-muted);margin-bottom:16px">Free practice — type the text below. Focus on accuracy.</p>
        <div class="metrics-bar">
          <div class="metric"><div class="metric-label">WPM</div><div class="metric-value" id="m-wpm">0</div></div>
          <div class="metric"><div class="metric-label">Accuracy</div><div class="metric-value" id="m-acc">100%</div></div>
          <div class="metric"><div class="metric-label">Errors</div><div class="metric-value" id="m-err">0</div></div>
        </div>
        <div class="typing-text" id="typing-text" tabindex="0"></div>
        <div class="keyboard" id="keyboard"></div>
        <div style="text-align:center;margin-top:20px">
          <button class="btn btn-primary" id="btn-start">Start Practice</button>
          <button class="btn btn-ghost" id="btn-new">New Text</button>
        </div>
      </div>
    `}bindPractice(){const e=["the quick brown fox jumps over the lazy dog","practice makes progress every single day","typing master helps you build muscle memory","accuracy first then speed will follow naturally","keep your fingers on the home row keys always"];let t=e[Math.floor(Math.random()*e.length)];this.engine.setText(t),this.renderTypingText(),this.renderKeyboard(),document.getElementById("btn-start").addEventListener("click",()=>{var s;this.audio.playStart(),this.engine.start(),this.bindTyping(),(s=document.getElementById("typing-text"))==null||s.focus()}),document.getElementById("btn-new").addEventListener("click",()=>{this.unbindTyping(),t=e[Math.floor(Math.random()*e.length)],this.engine.setText(t),this.engine.reset(),this.renderTypingText()}),this.engine.onKeyPress(s=>{s.correct?this.audio.playKeyCorrect():this.audio.playKeyError(),this.renderTypingText(),this.highlightKey(s.expected,s.correct)}),this.engine.onMetricsUpdate(s=>this.updateMetricsDisplay(s)),this.engine.onFinished(s=>{this.unbindTyping(),this.audio.playComplete(),this.toast(`Done! ${s.wpm} WPM, ${s.accuracy}% accuracy`,"success")})}viewTest(){return`
      <div class="typing-container">
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;justify-content:center">
          <label>Duration:
            <select id="test-duration">
              <option value="15">15 sec</option>
              <option value="30">30 sec</option>
              <option value="60" selected>1 min</option>
              <option value="120">2 min</option>
              <option value="300">5 min</option>
            </select>
          </label>
          <label>Mode:
            <select id="test-mode">
              <option value="words">Words</option>
              <option value="quotes">Quotes</option>
              <option value="paragraph">Paragraph</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
        </div>
        <div class="metrics-bar">
          <div class="metric"><div class="metric-label">WPM</div><div class="metric-value" id="m-wpm">0</div></div>
          <div class="metric"><div class="metric-label">Accuracy</div><div class="metric-value" id="m-acc">100%</div></div>
          <div class="metric"><div class="metric-label">Time Left</div><div class="metric-value" id="m-time">1:00</div></div>
        </div>
        <div class="typing-text" id="typing-text" tabindex="0"></div>
        <div style="text-align:center;margin-top:20px">
          <button class="btn btn-primary btn-lg" id="btn-start-test">Start Test</button>
        </div>
      </div>
    `}bindTest(){const e=["the","be","to","of","and","a","in","that","have","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us"];let t=null,s=60;const i=()=>{const r=document.getElementById("test-mode").value;if(r==="quotes")return"The only way to learn to type well is through consistent deliberate practice every single day.";if(r==="paragraph")return"Typing is a fundamental skill in the modern world. Whether you write emails, code software, or create documents, the ability to type quickly and accurately saves time and reduces frustration. Touch typing allows you to focus on ideas rather than finding keys.";let n="";for(let a=0;a<80;a++)n+=e[Math.floor(Math.random()*e.length)]+" ";return n.trim()};document.getElementById("btn-start-test").addEventListener("click",()=>{var a;s=parseInt(document.getElementById("test-duration").value,10);const n=i();this.engine.setText(n),this.engine.reset(),this.renderTypingText(),this.audio.playStart(),this.engine.start(),this.bindTyping(),(a=document.getElementById("typing-text"))==null||a.focus(),document.getElementById("btn-start-test").style.display="none",t=window.setInterval(()=>{s--;const c=document.getElementById("m-time");c&&(c.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`),s<=0&&(t&&clearInterval(t),this.finishTest())},1e3)}),this.engine.onKeyPress(r=>{r.correct?this.audio.playKeyCorrect():this.audio.playKeyError(),this.renderTypingText()}),this.engine.onMetricsUpdate(r=>{const n=document.getElementById("m-wpm"),a=document.getElementById("m-acc");n&&(n.textContent=String(r.wpm)),a&&(a.textContent=r.accuracy+"%")})}async finishTest(){var i,r;this.unbindTyping(),this.engine.pause();const e=this.engine.getMetrics();this.audio.playComplete();const t={id:Date.now().toString(36),timestamp:Date.now(),duration:e.elapsedMs,mode:"standard",wpm:e.wpm,netWpm:e.netWpm,accuracy:e.accuracy,errors:e.errors,correctChars:e.correctChars,incorrectChars:e.incorrectChars,totalChars:e.correctChars+e.incorrectChars};await this.storage.addTestResult(t),this.progress=await this.storage.loadUserProgress(),e.wpm>this.progress.bestWpm&&(this.progress.bestWpm=e.wpm,await this.storage.saveUserProgress(this.progress)),await this.checkAchievements();const s=document.getElementById("content");s.innerHTML=`
      <div class="result-screen">
        <h2>Test Complete</h2>
        <div class="result-stats">
          <div class="result-stat"><div class="val">${e.wpm}</div><div class="lbl">WPM</div></div>
          <div class="result-stat"><div class="val">${e.accuracy}%</div><div class="lbl">Accuracy</div></div>
          <div class="result-stat"><div class="val">${e.errors}</div><div class="lbl">Errors</div></div>
          <div class="result-stat"><div class="val">${e.netWpm}</div><div class="lbl">Net WPM</div></div>
        </div>
        <p style="color:var(--text-muted);margin-bottom:16px">Personal best: ${this.progress.bestWpm} WPM</p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn btn-primary" id="test-again">Try Again</button>
          <button class="btn btn-secondary" id="test-dash">Dashboard</button>
        </div>
      </div>
    `,(i=document.getElementById("test-again"))==null||i.addEventListener("click",()=>this.router.navigate("test")),(r=document.getElementById("test-dash"))==null||r.addEventListener("click",()=>this.router.navigate("dashboard"))}viewGames(){return`
      <div class="grid grid-3">
        <div class="card" style="cursor:pointer" id="game-rush">
          <h3 style="margin-bottom:8px">Key Rush</h3>
          <p style="color:var(--text-muted);font-size:0.9rem">Type characters before the timer runs out. Build combos for higher scores.</p>
        </div>
        <div class="card" style="cursor:pointer" id="game-fall">
          <h3 style="margin-bottom:8px">Word Fall</h3>
          <p style="color:var(--text-muted);font-size:0.9rem">Words fall from the top. Type them before they reach the bottom.</p>
        </div>
        <div class="card" style="cursor:pointer" id="game-run">
          <h3 style="margin-bottom:8px">Typing Run</h3>
          <p style="color:var(--text-muted);font-size:0.9rem">Race forward by typing correctly. Mistakes slow you down.</p>
        </div>
      </div>
      <div id="game-container" style="margin-top:24px"></div>
    `}bindGames(){var e,t,s;(e=document.getElementById("game-rush"))==null||e.addEventListener("click",()=>this.startKeyRush()),(t=document.getElementById("game-fall"))==null||t.addEventListener("click",()=>this.startWordFall()),(s=document.getElementById("game-run"))==null||s.addEventListener("click",()=>this.startTypingRun())}startKeyRush(){const e=document.getElementById("game-container");let t=0,s=0,i=3,r="",n=3;const a="abcdefghijklmnopqrstuvwxyz",c=()=>{r=a[Math.floor(Math.random()*a.length)],n=Math.max(1.2,3-t*.02)};c(),e.innerHTML=`
      <div class="game-area" style="padding:40px;text-align:center">
        <div style="font-size:0.9rem;color:var(--text-muted)">Score: <span id="g-score">0</span> | Combo: <span id="g-combo">0</span> | Lives: <span id="g-lives">3</span></div>
        <div style="font-size:4rem;font-weight:700;margin:40px 0;font-family:var(--mono)" id="g-char">${r}</div>
        <div class="progress-bar" style="max-width:200px;margin:0 auto"><div class="progress-bar-fill" id="g-timer" style="width:100%"></div></div>
        <p style="margin-top:20px;color:var(--text-muted)">Type the letter shown</p>
      </div>
    `;let o=setInterval(()=>{n-=.05;const h=Math.max(0,n/3*100),y=document.getElementById("g-timer");if(y&&(y.style.width=h+"%"),n<=0){if(i--,s=0,document.getElementById("g-lives").textContent=String(i),i<=0){clearInterval(o),this.audio.playGameFailure(),e.innerHTML=`<div class="game-area" style="padding:40px;text-align:center"><h2>Game Over</h2><p>Score: ${t}</p><button class="btn btn-primary" style="margin-top:16px" onclick="location.hash='#games'">Back</button></div>`,this.storage.addGameScore({game:"key-rush",score:t,timestamp:Date.now(),level:1});return}c(),document.getElementById("g-char").textContent=r}},50);const p=h=>{h.key.toLowerCase()===r?(t+=10+s*2,s++,this.audio.playKeyCorrect(),c(),document.getElementById("g-char").textContent=r,document.getElementById("g-score").textContent=String(t),document.getElementById("g-combo").textContent=String(s)):h.key.length===1&&(s=0,this.audio.playKeyError(),document.getElementById("g-combo").textContent="0")};window.addEventListener("keydown",p),e._cleanup=()=>{clearInterval(o),window.removeEventListener("keydown",p)}}startWordFall(){const e=document.getElementById("game-container"),t=["type","fast","code","learn","skill","focus","speed","words","master","practice","keyboard","finger","home","row","shift"];let s=0,i=3,r=t[0],n="";e.innerHTML=`
      <div class="game-area" style="padding:30px;text-align:center">
        <div style="font-size:0.9rem;color:var(--text-muted)">Score: <span id="g-score">0</span> | Lives: <span id="g-lives">3</span></div>
        <div style="font-size:2rem;font-weight:700;margin:50px 0;font-family:var(--mono)" id="g-word">${r}</div>
        <div style="font-family:var(--mono);font-size:1.2rem;color:var(--primary)" id="g-input"></div>
        <p style="margin-top:20px;color:var(--text-muted)">Type the word</p>
      </div>
    `;const a=c=>{c.key==="Backspace"?n=n.slice(0,-1):c.key.length===1&&(n+=c.key.toLowerCase()),document.getElementById("g-input").textContent=n,n===r?(s+=r.length*10,this.audio.playKeyCorrect(),r=t[Math.floor(Math.random()*t.length)],n="",document.getElementById("g-word").textContent=r,document.getElementById("g-input").textContent="",document.getElementById("g-score").textContent=String(s)):n.length>=r.length&&(i--,this.audio.playKeyError(),n="",r=t[Math.floor(Math.random()*t.length)],document.getElementById("g-word").textContent=r,document.getElementById("g-input").textContent="",document.getElementById("g-lives").textContent=String(i),i<=0&&(window.removeEventListener("keydown",a),this.audio.playGameFailure(),e.innerHTML=`<div class="game-area" style="padding:40px;text-align:center"><h2>Game Over</h2><p>Score: ${s}</p><button class="btn btn-primary" style="margin-top:16px" onclick="location.hash='#games'">Back</button></div>`,this.storage.addGameScore({game:"word-fall",score:s,timestamp:Date.now(),level:1})))};window.addEventListener("keydown",a)}startTypingRun(){const e=document.getElementById("game-container"),t="the quick brown fox jumps over the lazy dog and then runs around the track as fast as possible";let s=0,i=0;e.innerHTML=`
      <div class="game-area" style="padding:30px">
        <div style="font-size:0.9rem;color:var(--text-muted);margin-bottom:16px">Distance: <span id="g-dist">0</span>m</div>
        <div style="height:8px;background:var(--bg-hover);border-radius:4px;margin-bottom:24px">
          <div id="g-track" style="height:100%;width:0%;background:var(--primary);border-radius:4px;transition:width 0.1s"></div>
        </div>
        <div class="typing-text" id="g-text" style="font-size:1.2rem"></div>
      </div>
    `;const r=()=>{const a=document.getElementById("g-text");a.innerHTML=t.split("").map((c,o)=>o<s?`<span class="char correct">${c===" "?"·":c}</span>`:o===s?`<span class="char current">${c===" "?"·":c}</span>`:`<span class="char pending">${c===" "?"·":c}</span>`).join("")};r();const n=a=>{a.key===t[s]?(s++,i+=2,this.audio.playKeyCorrect(),document.getElementById("g-dist").textContent=String(i),document.getElementById("g-track").style.width=Math.min(100,s/t.length*100)+"%",s>=t.length?(window.removeEventListener("keydown",n),this.audio.playGameSuccess(),e.innerHTML=`<div class="game-area" style="padding:40px;text-align:center"><h2>Finish!</h2><p>Distance: ${i}m</p><button class="btn btn-primary" style="margin-top:16px" onclick="location.hash='#games'">Back</button></div>`,this.storage.addGameScore({game:"typing-run",score:i,timestamp:Date.now(),level:1})):r()):a.key.length===1&&this.audio.playKeyError()};window.addEventListener("keydown",n)}viewReview(){const e=this.getWeakKeys(10);return e.length?(e.map(t=>t.key).join(" ").repeat(4),`
      <div class="card" style="margin-bottom:20px">
        <div class="card-title">Your Weakest Keys</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
          ${e.map(t=>`<span style="background:var(--bg-hover);padding:6px 14px;border-radius:6px;font-family:var(--mono)">${t.key.toUpperCase()} — ${t.masteryScore}%</span>`).join("")}
        </div>
      </div>
      <div class="typing-container">
        <div class="metrics-bar">
          <div class="metric"><div class="metric-label">WPM</div><div class="metric-value" id="m-wpm">0</div></div>
          <div class="metric"><div class="metric-label">Accuracy</div><div class="metric-value" id="m-acc">100%</div></div>
        </div>
        <div class="typing-text" id="typing-text" tabindex="0"></div>
        <div style="text-align:center;margin-top:16px">
          <button class="btn btn-primary" id="btn-start">Start Review Drill</button>
        </div>
      </div>
    `):`<div class="card"><p>No weak keys detected yet. Complete more lessons to get personalized review drills.</p>
        <button class="btn btn-primary" style="margin-top:12px" id="btn-go-learn">Go to Learn</button></div>`}bindReview(){var i,r;(i=document.getElementById("btn-go-learn"))==null||i.addEventListener("click",()=>this.router.navigate("learn"));const e=this.getWeakKeys(8);if(!e.length)return;const t=e.map(n=>n.key);let s="";for(let n=0;n<40;n++)s+=t[Math.floor(Math.random()*t.length)]+(n%5===4?" ":"");this.engine.setText(s.trim()),this.renderTypingText(),(r=document.getElementById("btn-start"))==null||r.addEventListener("click",()=>{var n;this.engine.start(),this.bindTyping(),(n=document.getElementById("typing-text"))==null||n.focus()}),this.engine.onKeyPress(n=>{n.correct?this.audio.playKeyCorrect():this.audio.playKeyError(),this.storage.updateKeyStats(n.expected,n.correct,80),this.renderTypingText()}),this.engine.onMetricsUpdate(n=>this.updateMetricsDisplay(n)),this.engine.onFinished(()=>{this.unbindTyping(),this.audio.playComplete(),this.toast("Review drill complete!","success")})}viewStatistics(){const e=this.progress,t=e.testResults.slice(0,10);return`
      <div class="grid grid-3" style="margin-bottom:24px">
        <div class="card"><div class="card-title">Total Practice</div><div class="card-value">${Math.round(e.totalPracticeTimeMs/6e4)} min</div></div>
        <div class="card"><div class="card-title">Keystrokes</div><div class="card-value">${e.totalKeystrokes.toLocaleString()}</div></div>
        <div class="card"><div class="card-title">Total Errors</div><div class="card-value">${e.totalErrors}</div></div>
      </div>
      <div class="card" style="margin-bottom:20px">
        <div class="card-title">Recent Tests</div>
        ${t.length?`<table style="width:100%;margin-top:12px;font-size:0.9rem">
          <tr style="color:var(--text-muted);text-align:left"><th style="padding:6px 0">Date</th><th>WPM</th><th>Accuracy</th><th>Errors</th></tr>
          ${t.map(s=>`<tr><td style="padding:6px 0">${new Date(s.timestamp).toLocaleDateString()}</td><td>${s.wpm}</td><td>${s.accuracy}%</td><td>${s.errors}</td></tr>`).join("")}
        </table>`:'<p style="color:var(--text-muted);margin-top:8px">No tests yet.</p>'}
      </div>
      <div class="card">
        <div class="card-title">Key Mastery</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
          ${Object.values(e.keyStats).sort((s,i)=>s.masteryScore-i.masteryScore).slice(0,20).map(s=>`<span style="background:var(--bg-hover);padding:4px 10px;border-radius:4px;font-family:var(--mono);font-size:0.85rem">${s.key.toUpperCase()} ${s.masteryScore}%</span>`).join("")||'<span style="color:var(--text-muted)">Practice more to see key stats.</span>'}
        </div>
      </div>
    `}viewAchievements(){return`<div class="achievement-grid">
      ${Object.values(this.progress.achievements).map(t=>`
        <div class="achievement-card ${t.unlocked?"unlocked":"locked"}">
          <div class="icon">${t.icon}</div>
          <h4>${t.title}</h4>
          <p>${t.description}</p>
          ${t.unlocked&&t.unlockedAt?`<p style="font-size:0.7rem;margin-top:6px">${new Date(t.unlockedAt).toLocaleDateString()}</p>`:""}
        </div>
      `).join("")}
    </div>`}viewKeyboard(){return`
      <div class="card" style="margin-bottom:20px">
        <p style="color:var(--text-muted);margin-bottom:16px">US QWERTY layout. Home row keys are marked. Place index fingers on F and J (the keys with bumps).</p>
        <div class="keyboard" id="keyboard"></div>
      </div>
      <div class="grid grid-2">
        <div class="card">
          <div class="card-title">Left Hand</div>
          <p style="font-size:0.9rem;margin-top:8px">Pinky: Q A Z 1<br>Ring: W S X 2<br>Middle: E D C 3<br>Index: R T F G V B 4 5</p>
        </div>
        <div class="card">
          <div class="card-title">Right Hand</div>
          <p style="font-size:0.9rem;margin-top:8px">Index: Y U H J N M 6 7<br>Middle: I K , 8<br>Ring: O L . 9<br>Pinky: P ; / 0 - =</p>
        </div>
      </div>
    `}viewSettings(){const e=this.progress.settings;return`
      <div class="settings-group">
        <h3>Appearance</h3>
        <div class="setting-row"><label>Theme</label>
          <select id="set-theme"><option value="dark" ${e.theme==="dark"?"selected":""}>Dark</option><option value="light" ${e.theme==="light"?"selected":""}>Light</option><option value="system" ${e.theme==="system"?"selected":""}>System</option></select>
        </div>
      </div>
      <div class="settings-group">
        <h3>Sound</h3>
        <div class="setting-row"><label>Sound Effects</label><div class="toggle ${e.soundEffects?"on":""}" id="set-sfx" data-key="soundEffects"></div></div>
        <div class="setting-row"><label>Typing Sounds</label><div class="toggle ${e.typingSounds?"on":""}" id="set-typing" data-key="typingSounds"></div></div>
        <div class="setting-row"><label>Volume</label><input type="range" id="set-vol" min="0" max="100" value="${e.masterVolume*100}"></div>
      </div>
      <div class="settings-group">
        <h3>Display</h3>
        <div class="setting-row"><label>Show Keyboard</label><div class="toggle ${e.showKeyboard?"on":""}" data-key="showKeyboard"></div></div>
        <div class="setting-row"><label>Show Finger Guide</label><div class="toggle ${e.showFingerGuide?"on":""}" data-key="showFingerGuide"></div></div>
        <div class="setting-row"><label>Allow Backspace</label><div class="toggle ${e.backspaceAllowed?"on":""}" data-key="backspaceAllowed"></div></div>
      </div>
      <div class="settings-group">
        <h3>Data</h3>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
          <button class="btn btn-secondary" id="btn-export">Export Progress</button>
          <button class="btn btn-secondary" id="btn-import">Import Progress</button>
          <button class="btn btn-ghost" id="btn-reset" style="color:var(--error)">Reset All Data</button>
        </div>
        <input type="file" id="import-file" accept=".json" style="display:none">
      </div>
    `}bindSettings(){var e,t,s,i,r,n;(e=document.getElementById("set-theme"))==null||e.addEventListener("change",async a=>{this.progress.settings.theme=a.target.value,await this.storage.saveUserProgress(this.progress),this.applyTheme()}),document.querySelectorAll(".toggle").forEach(a=>{a.addEventListener("click",async()=>{const c=a.dataset.key;c&&(this.progress.settings[c]=!this.progress.settings[c],a.classList.toggle("on"),this.audio.setEnabled(this.progress.settings.soundEffects),this.audio.setTypingEnabled(this.progress.settings.typingSounds),await this.storage.saveUserProgress(this.progress))})}),(t=document.getElementById("set-vol"))==null||t.addEventListener("input",a=>{const c=parseInt(a.target.value,10)/100;this.progress.settings.masterVolume=c,this.audio.setVolume(c),this.storage.saveUserProgress(this.progress)}),(s=document.getElementById("btn-export"))==null||s.addEventListener("click",async()=>{const a=await this.storage.exportData(),c=new Blob([a],{type:"application/json"}),o=document.createElement("a");o.href=URL.createObjectURL(c),o.download="typing-master-progress.json",o.click(),this.toast("Progress exported","success")}),(i=document.getElementById("btn-import"))==null||i.addEventListener("click",()=>{var a;(a=document.getElementById("import-file"))==null||a.click()}),(r=document.getElementById("import-file"))==null||r.addEventListener("change",async a=>{var h;const c=(h=a.target.files)==null?void 0:h[0];if(!c)return;const o=await c.text();await this.storage.importData(o)?(this.progress=await this.storage.loadUserProgress(),this.applyTheme(),this.toast("Progress imported","success"),this.router.navigate("dashboard")):this.toast("Invalid progress file","error")}),(n=document.getElementById("btn-reset"))==null||n.addEventListener("click",async()=>{confirm("Reset ALL progress? This cannot be undone.")&&(await this.storage.resetAllData(),this.progress=await this.storage.loadUserProgress(),this.toast("All data reset","success"),this.router.navigate("onboarding"))})}viewAbout(){return`
      <div class="card" style="max-width:600px">
        <h2 style="margin-bottom:12px">Typing Master</h2>
        <p style="color:var(--text-muted);margin-bottom:16px"><em>Build Speed. Build Accuracy. Build Muscle Memory.</em></p>
        <p style="margin-bottom:12px">A professional touch-typing tutor designed for Windows PCs and desktop browsers. Learn from complete beginner to advanced typist with 125 progressive lessons.</p>
        <h3 style="margin:16px 0 8px;font-size:1rem">Privacy</h3>
        <p style="color:var(--text-muted);font-size:0.9rem">All progress is stored locally on your device using IndexedDB and LocalStorage. Nothing is uploaded. No accounts, no tracking, no ads.</p>
        <h3 style="margin:16px 0 8px;font-size:1rem">WPM Calculation</h3>
        <p style="color:var(--text-muted);font-size:0.9rem">Gross WPM = (characters typed / 5) / minutes. Net WPM accounts for errors. Standard 5 characters = 1 word.</p>
        <h3 style="margin:16px 0 8px;font-size:1rem">Offline</h3>
        <p style="color:var(--text-muted);font-size:0.9rem">This app works offline after the first load via service worker caching.</p>
        <p style="margin-top:20px;font-size:0.8rem;color:var(--text-dim)">Version 1.0.0 · English only · US QWERTY</p>
      </div>
    `}viewOnboarding(){return`
      <div class="onboarding">
        <h2>Welcome to Typing Master</h2>
        <p>Let's personalize your training. No account needed.</p>
        <div id="ob-step1">
          <h3 style="margin-bottom:12px">Your experience level</h3>
          <div class="onboarding-options">
            <div class="onboarding-opt" data-val="complete-beginner"><h3>Complete Beginner</h3><p>Never learned touch typing</p></div>
            <div class="onboarding-opt" data-val="beginner"><h3>Beginner</h3><p>Know the home row basics</p></div>
            <div class="onboarding-opt" data-val="intermediate"><h3>Intermediate</h3><p>Can type but want to improve</p></div>
            <div class="onboarding-opt" data-val="advanced"><h3>Advanced</h3><p>Focus on speed and accuracy</p></div>
          </div>
        </div>
        <div id="ob-step2" style="display:none">
          <h3 style="margin-bottom:12px">Your focus</h3>
          <div class="onboarding-options">
            <div class="onboarding-opt" data-val="accuracy"><h3>Accuracy</h3><p>Fewer mistakes first</p></div>
            <div class="onboarding-opt" data-val="speed"><h3>Speed</h3><p>Type faster</p></div>
            <div class="onboarding-opt" data-val="both"><h3>Both</h3><p>Balanced training</p></div>
          </div>
        </div>
        <div id="ob-step3" style="display:none">
          <h3 style="margin-bottom:12px">Keyboard layout</h3>
          <div class="onboarding-options">
            <div class="onboarding-opt selected" data-val="us-qwerty"><h3>US QWERTY</h3><p>Standard Windows keyboard</p></div>
          </div>
          <button class="btn btn-primary btn-lg" id="ob-start" style="margin-top:20px">Start My Training</button>
        </div>
      </div>
    `}bindOnboarding(){var s;let e="complete-beginner",t="both";document.querySelectorAll("#ob-step1 .onboarding-opt").forEach(i=>{i.addEventListener("click",()=>{document.querySelectorAll("#ob-step1 .onboarding-opt").forEach(r=>r.classList.remove("selected")),i.classList.add("selected"),e=i.dataset.val,document.getElementById("ob-step1").style.display="none",document.getElementById("ob-step2").style.display=""})}),document.querySelectorAll("#ob-step2 .onboarding-opt").forEach(i=>{i.addEventListener("click",()=>{document.querySelectorAll("#ob-step2 .onboarding-opt").forEach(r=>r.classList.remove("selected")),i.classList.add("selected"),t=i.dataset.val,document.getElementById("ob-step2").style.display="none",document.getElementById("ob-step3").style.display=""})}),(s=document.getElementById("ob-start"))==null||s.addEventListener("click",async()=>{this.progress.firstLaunch=!1,this.progress.experienceLevel=e,this.progress.focusGoal=t,e==="intermediate"&&(this.progress.currentLessonId=26),e==="advanced"&&(this.progress.currentLessonId=56),await this.storage.saveUserProgress(this.progress),this.audio.playStart(),this.router.navigate("dashboard")})}renderTypingText(){const e=document.getElementById("typing-text");if(!e)return;const t=this.engine.getDisplayState();e.innerHTML=t.map(s=>{const i=s.char===" "?"·":s.char;return`<span class="char ${s.state}">${i}</span>`}).join("")}renderKeyboard(){const e=document.getElementById("keyboard");if(!e)return;const t=[["`","1","2","3","4","5","6","7","8","9","0","-","="],["q","w","e","r","t","y","u","i","o","p","[","]","\\"],["a","s","d","f","g","h","j","k","l",";","'"],["z","x","c","v","b","n","m",",",".","/"],[" "]],s=new Set(["a","s","d","f","j","k","l",";"]);e.innerHTML=t.map((i,r)=>`<div class="kb-row">${i.map(n=>{const a=["kb-key"];return n===" "&&a.push("space"),s.has(n)&&a.push("home"),`<div class="${a.join(" ")}" data-key="${n}">${n===" "?"Space":n.toUpperCase()}</div>`}).join("")}</div>`).join("")}highlightKey(e,t){document.querySelectorAll(".kb-key").forEach(n=>n.classList.remove("current","correct","error"));const s=e.toLowerCase(),i=document.querySelector(`.kb-key[data-key="${s}"]`);i&&(i.classList.add(t?"correct":"error"),setTimeout(()=>i.classList.remove("correct","error"),200));const r=this.engine.getTarget()[this.engine.getPosition()];if(r){const n=document.querySelector(`.kb-key[data-key="${r.toLowerCase()}"]`);n==null||n.classList.add("current")}}updateFingerGuide(e){const t=document.getElementById("finger-guide");if(!t||!this.progress.settings.showFingerGuide){t&&(t.textContent="");return}if(!e){t.textContent="";return}const s=v[e.toLowerCase()]||v[e]||"",i=T[s]||"";if(e===e.toUpperCase()&&e!==e.toLowerCase()){const r=s.startsWith("left")?"Right Pinky (Right Shift)":"Left Pinky (Left Shift)";t.innerHTML=`Use <strong>${i}</strong> for <strong>${e}</strong> + <strong>${r}</strong>`}else t.innerHTML=i?`Use your <strong>${i}</strong>`:""}updateMetricsDisplay(e){const t=document.getElementById("m-wpm"),s=document.getElementById("m-acc"),i=document.getElementById("m-err"),r=document.getElementById("m-time");if(t&&(t.textContent=String(e.wpm||0)),s&&(s.textContent=(e.accuracy??100)+"%"),i&&(i.textContent=String(e.errors||0)),r&&e.elapsedMs!==void 0){const n=Math.floor(e.elapsedMs/1e3);r.textContent=`${Math.floor(n/60)}:${String(n%60).padStart(2,"0")}`}}bindTyping(){this.unbindTyping(),this.boundKeyHandler=e=>{this.engine.handleKeyDown(e)},window.addEventListener("keydown",this.boundKeyHandler)}unbindTyping(){this.boundKeyHandler&&(window.removeEventListener("keydown",this.boundKeyHandler),this.boundKeyHandler=null)}getWeakKeys(e){return Object.values(this.progress.keyStats).filter(t=>t.attempts>=3).sort((t,s)=>t.masteryScore-s.masteryScore).slice(0,e)}updateStreak(){const e=new Date().toISOString().slice(0,10);if(this.progress.lastPracticeDate===e)return;const t=new Date(Date.now()-864e5).toISOString().slice(0,10);this.progress.lastPracticeDate===t?this.progress.currentStreak++:this.progress.currentStreak=1,this.progress.currentStreak>this.progress.longestStreak&&(this.progress.longestStreak=this.progress.currentStreak),this.progress.lastPracticeDate=e}recalcAverages(){const e=this.progress.lessonResults;if(!e.length)return;const t=e.slice(0,20);this.progress.averageWpm=Math.round(t.reduce((s,i)=>s+i.wpm,0)/t.length),this.progress.averageAccuracy=Math.round(t.reduce((s,i)=>s+i.accuracy,0)/t.length)}async checkAchievements(){var i;const e=this.progress,t=Object.values(e.lessons).filter(r=>r.completed).length,s=[["first-lesson",t>=1],["lessons-10",t>=10],["lessons-25",t>=25],["lessons-50",t>=50],["lessons-100",t>=100],["wpm-50",e.bestWpm>=50],["wpm-60",e.bestWpm>=60],["wpm-80",e.bestWpm>=80],["wpm-100",e.bestWpm>=100],["chars-5k",e.totalCharacters>=5e3],["chars-10k",e.totalCharacters>=1e4],["time-1h",e.totalPracticeTimeMs>=36e5],["time-5h",e.totalPracticeTimeMs>=18e6],["streak-7",e.longestStreak>=7],["streak-30",e.longestStreak>=30],["complete-beginner",t>=10],["master-typist",t>=100&&e.bestWpm>=60]];for(const[r,n]of s)if(n&&!((i=e.achievements[r])!=null&&i.unlocked)){const a=f.find(c=>c.id===r);a&&await this.storage.unlockAchievement(r,{...a,unlocked:!1})&&(this.progress.achievements[r]={...a,unlocked:!0,unlockedAt:Date.now()},this.audio.playAchievement(),this.toast(`Achievement unlocked: ${a.title}`,"achievement"))}}setupOfflineIndicator(){const e=document.getElementById("offline-badge"),t=()=>{navigator.onLine?e==null||e.classList.remove("show"):e==null||e.classList.add("show")};window.addEventListener("online",t),window.addEventListener("offline",t),t()}setupKeyboardShortcuts(){window.addEventListener("keydown",e=>{e.key==="Escape"&&this.engine.getIsRunning()&&(this.engine.pause(),this.toast("Paused — press Escape or Resume","success")),e.key==="F2"&&(e.preventDefault(),this.progress.settings.showKeyboard=!this.progress.settings.showKeyboard,this.storage.saveUserProgress(this.progress)),e.key==="F3"&&(e.preventDefault(),this.progress.settings.soundEffects=!this.progress.settings.soundEffects,this.audio.setEnabled(this.progress.settings.soundEffects),this.storage.saveUserProgress(this.progress),this.toast(`Sound ${this.progress.settings.soundEffects?"ON":"OFF"}`,"success"))})}toast(e,t="success"){const s=document.getElementById("toasts");if(!s)return;const i=document.createElement("div");i.className=`toast ${t}`,i.textContent=e,s.appendChild(i),setTimeout(()=>i.remove(),3500)}}"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./service-worker.js").catch(()=>{})});const A=new B;A.init().then(()=>{const l=document.getElementById("splash");l&&setTimeout(()=>{l.classList.add("hide"),setTimeout(()=>l.remove(),400)},600)}).catch(l=>{console.error("Failed to start Typing Master:",l);const e=document.getElementById("splash");e&&(e.innerHTML=`
      <h1 style="color:#f8fafc;font-family:system-ui">Typing Master</h1>
      <p style="color:#f87171;font-family:system-ui">Failed to load. Please refresh.</p>
    `)});
