/* 𝐓𝐘𝐏𝐈𝐍𝐆 • 𝐌𝐀𝐒𝐓𝐄𝐑 - Typing Engine v2 */
class TypingEngine {
 constructor() {
 this.text = "";
 this.currentIndex = 0;
 this.errors = 0;
 this.startTime = null;
 this.isRunning = false;
 this.isPaused = false;
 this.wpm = 0;
 this.accuracy = 100;
 this.timer = null;
 this.elapsed = 0;
 this.lessonData = null;
 this.onComplete = null;
 this.onProgress = null;
 this.onError = null;
 this.errorIndices = new Set(); // FIX: track which indices have errors
 }

 loadLesson(lesson) {
 this.lessonData = lesson;
 const exercise = lesson.exercises[Math.floor(Math.random() * lesson.exercises.length)];
 this.text = exercise.text;
 this.currentIndex = 0;
 this.errors = 0;
 this.errorIndices.clear(); // FIX: clear error tracking on new lesson
 this.startTime = null;
 this.isRunning = false;
 this.isPaused = false;
 this.wpm = 0;
 this.accuracy = 100;
 this.elapsed = 0;
 if (this.timer) clearInterval(this.timer);
 return this.text;
 }

 start() {
 if (this.isRunning) return;
 this.isRunning = true;
 this.isPaused = false;
 this.startTime = Date.now() - (this.elapsed * 1000);
 var self = this;
 this.timer = setInterval(function() {
 self.elapsed = Math.floor((Date.now() - self.startTime) / 1000);
 self.calculateWPM();
 if (self.onProgress) self.onProgress(self.getStats());
 }, 1000);
 }

 pause() {
 if (!this.isRunning || this.isPaused) return;
 this.isPaused = true;
 clearInterval(this.timer);
 this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
 }

 resume() {
 if (!this.isPaused) return;
 this.isPaused = false;
 this.startTime = Date.now() - (this.elapsed * 1000);
 var self = this;
 this.timer = setInterval(function() {
 self.elapsed = Math.floor((Date.now() - self.startTime) / 1000);
 self.calculateWPM();
 if (self.onProgress) self.onProgress(self.getStats());
 }, 1000);
 }

 stop() {
 this.isRunning = false;
 this.isPaused = false;
 if (this.timer) clearInterval(this.timer);
 }

 handleInput(char) {
 if (!this.isRunning || this.isPaused) return { valid: false };
 if (this.currentIndex >= this.text.length) return { valid: false, complete: true };

 var expected = this.text[this.currentIndex];
 var isCorrect = char === expected;

 if (!isCorrect) {
 this.errors++;
 this.errorIndices.add(this.currentIndex); // FIX: track error index
 if (this.onError) this.onError(this.currentIndex);
 }

 this.currentIndex++;
 this.calculateAccuracy();
 this.calculateWPM();

 var complete = this.currentIndex >= this.text.length;
 if (complete && this.onComplete) {
 this.onComplete(this.getStats());
 }

 return { valid: isCorrect, index: this.currentIndex - 1, complete: complete, char: expected };
 }

 handleBackspace() {
 if (!this.isRunning || this.isPaused || this.currentIndex <= 0) return false;
 this.currentIndex--;
 this.errorIndices.delete(this.currentIndex); // FIX: remove error mark on backspace
 this.calculateAccuracy(); // FIX: recalculate accuracy after backspace
 return true;
 }

 calculateWPM() {
 if (!this.startTime || this.elapsed === 0) return;
 var minutes = this.elapsed / 60;
 var words = this.currentIndex / 5;
 this.wpm = Math.round(words / minutes);
 }

 calculateAccuracy() {
 if (this.currentIndex === 0) {
 this.accuracy = 100;
 return;
 }
 this.accuracy = Math.round(((this.currentIndex - this.errors) / this.currentIndex) * 100);
 }

 getStats() {
 return {
 wpm: this.wpm,
 accuracy: this.accuracy,
 errors: this.errors,
 elapsed: this.elapsed,
 progress: Math.round((this.currentIndex / this.text.length) * 100),
 currentIndex: this.currentIndex,
 totalChars: this.text.length,
 isRunning: this.isRunning,
 isPaused: this.isPaused
 };
 }

 getIsRunning() {
 return this.isRunning;
 }

 getText() {
 return this.text;
 }

 getCurrentIndex() {
 return this.currentIndex;
 }

 getErrorIndices() { // FIX: expose error indices
 return this.errorIndices;
 }
}

/* App Controller */
class App {
 constructor() {
 this.engine = new TypingEngine();
 this.lessons = [];
 this.currentLesson = null;
 this.currentLessonIndex = 0;
 this.progress = {};
 this.settings = {
 sound: true,
 showKeyboard: true,
 showFingers: true,
 showGlass: true,
 theme: "dark"
 };
 this.achievements = [];
 this.unlockedAchievements = new Set();
 this.init();
 }

 async init() {
 await this.loadData();
 this.loadProgress();
 this.loadSettings();
 this.renderSidebar();
 this.renderDashboard();
 this.setupEventListeners();
 this.checkOffline();
 }

 async loadData() {
 try {
 var lessonsRes = await fetch("./data/lessons.json");
 var achievementsRes = await fetch("./data/achievements.json");
 this.lessons = await lessonsRes.json();
 this.achievements = await achievementsRes.json();
 } catch (e) {
 console.error("Failed to load data:", e);
 }
 }

 loadProgress() {
 try {
 var saved = localStorage.getItem("typing-master-progress-v2");
 if (saved) this.progress = JSON.parse(saved);
 } catch (e) {
 this.progress = {};
 }
 }

 saveProgress() {
 try {
 localStorage.setItem("typing-master-progress-v2", JSON.stringify(this.progress));
 } catch (e) {
 console.error("Failed to save progress:", e);
 }
 }

 loadSettings() {
 try {
 var saved = localStorage.getItem("typing-master-settings-v2");
 if (saved) {
 var parsed = JSON.parse(saved);
 for (var key in parsed) {
 this.settings[key] = parsed[key];
 }
 }
 } catch (e) {
 console.error("Failed to load settings:", e);
 }
 }

 saveSettings() {
 try {
 localStorage.setItem("typing-master-settings-v2", JSON.stringify(this.settings));
 } catch (e) {
 console.error("Failed to save settings:", e);
 }
 }

 getLessonStatus(lessonId) {
 return this.progress[lessonId] || { completed: false, bestWpm: 0, bestAccuracy: 0 };
 }

 isLessonUnlocked(lesson) {
 if (lesson.number === 1) return true;
 var prev = this.lessons.find(function(l) { return l.number === lesson.number - 1; });
 if (!prev) return true;
 return this.getLessonStatus(prev.id).completed;
 }

 completeLesson(lessonId, stats) {
 var current = this.getLessonStatus(lessonId);
 this.progress[lessonId] = {
 completed: true,
 bestWpm: Math.max(current.bestWpm, stats.wpm),
 bestAccuracy: Math.max(current.bestAccuracy, stats.accuracy),
 completedAt: new Date().toISOString()
 };
 this.saveProgress();
 this.checkAchievements();
 this.showToast("Lesson completed!", "success");
 this.updateSidebarCount();
 }

 updateSidebarCount() {
 var count = Object.values(this.progress).filter(function(p) { return p.completed; }).length;
 var total = this.lessons.length;
 var el = document.querySelector("[data-view='lessons']");
 if (el) {
 var svg = el.querySelector("svg").outerHTML;
 el.innerHTML = svg + "Lessons (" + count + "/" + total + ")";
 }
 }

 checkAchievements() {
 var completedCount = Object.values(this.progress).filter(function(p) { return p.completed; }).length;
 var maxWpm = 0;
 Object.values(this.progress).forEach(function(p) {
 if (p.bestWpm > maxWpm) maxWpm = p.bestWpm;
 });

 var checks = [
 { id: "first-lesson", condition: completedCount >= 1 },
 { id: "lessons-10", condition: completedCount >= 10 },
 { id: "lessons-25", condition: completedCount >= 25 },
 { id: "lessons-50", condition: completedCount >= 50 },
 { id: "lessons-100", condition: completedCount >= 100 },
 { id: "wpm-50", condition: maxWpm >= 50 },
 { id: "wpm-60", condition: maxWpm >= 60 },
 { id: "wpm-80", condition: maxWpm >= 80 },
 { id: "wpm-100", condition: maxWpm >= 100 },
 { id: "complete-beginner", condition: completedCount >= 10 },
 { id: "master-typist", condition: completedCount >= 100 && maxWpm >= 60 }
 ];

 var self = this;
 checks.forEach(function(check) {
 if (check.condition && !self.unlockedAchievements.has(check.id)) {
 self.unlockedAchievements.add(check.id);
 var ach = self.achievements.find(function(a) { return a.id === check.id; });
 if (ach) self.showToast("Achievement: " + ach.title, "achievement");
 }
 });
 }

 renderSidebar() {
 var app = document.getElementById("app");
 if (!app) return;

 var completedCount = Object.values(this.progress).filter(function(p) { return p.completed; }).length;
 var totalLessons = this.lessons.length;

 var svgDashboard = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>';
 var svgLessons = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
 var svgPractice = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
 var svgAchievements = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>';
 var svgStats = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>';
 var svgSettings = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.67 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.67 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.67a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

 app.innerHTML = '<div class="sidebar">' +
 '<div class="sidebar-brand">' +
 '<img src="./icons/favicon.svg" alt="" />' +
 '<h1>𝐓𝐘𝐏𝐈𝐍𝐆 • 𝐌𝐀𝐒𝐓𝐄𝐑</h1>' +
 '</div>' +
 '<nav class="sidebar-nav">' +
 '<button class="nav-item active" data-view="dashboard">' + svgDashboard + 'Dashboard</button>' +
 '<button class="nav-item" data-view="lessons">' + svgLessons + 'Lessons (' + completedCount + '/' + totalLessons + ')</button>' +
 '<button class="nav-item" data-view="practice">' + svgPractice + 'Practice</button>' +
 '<button class="nav-item" data-view="achievements">' + svgAchievements + 'Achievements</button>' +
 '<button class="nav-item" data-view="stats">' + svgStats + 'Statistics</button>' +
 '<button class="nav-item" data-view="settings">' + svgSettings + 'Settings</button>' +
 '</nav>' +
 '<div class="sidebar-footer">v2.0 • Offline Ready</div>' +
 '</div>' +
 '<div class="main">' +
 '<header class="header">' +
 '<div class="header-title" id="header-title">Dashboard</div>' +
 '<div style="display:flex;gap:10px;align-items:center;">' +
 '<button class="btn btn-ghost btn-sm" id="theme-toggle">Theme</button>' +
 '</div>' +
 '</header>' +
 '<div class="content" id="content"></div>' +
 '</div>' +
 '<div class="toast-container" id="toast-container"></div>' +
 '<div class="offline-badge" id="offline-badge">Offline Mode</div>';
 }

 renderDashboard() {
 var content = document.getElementById("content");
 if (!content) return;

 var completedCount = Object.values(this.progress).filter(function(p) { return p.completed; }).length;
 var totalLessons = this.lessons.length;
 var maxWpm = 0;
 Object.values(this.progress).forEach(function(p) {
 if (p.bestWpm > maxWpm) maxWpm = p.bestWpm;
 });
 var avgAccuracy = 0;
 var completedList = Object.values(this.progress).filter(function(p) { return p.completed; });
 if (completedList.length > 0) {
 avgAccuracy = Math.round(completedList.reduce(function(sum, p) { return sum + p.bestAccuracy; }, 0) / completedList.length);
 }
 var nextLesson = this.lessons.find(function(l) { return !this.getLessonStatus(l.id).completed; }, this) || this.lessons[0];
 var progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

 content.innerHTML = '<div class="grid grid-4">' +
 '<div class="card"><div class="card-title">Lessons Completed</div><div class="card-value">' + completedCount + '/' + totalLessons + '</div></div>' +
 '<div class="card"><div class="card-title">Best WPM</div><div class="card-value">' + maxWpm + '</div></div>' +
 '<div class="card"><div class="card-title">Avg Accuracy</div><div class="card-value">' + avgAccuracy + '%</div></div>' +
 '<div class="card"><div class="card-title">Achievements</div><div class="card-value">' + this.unlockedAchievements.size + '/' + this.achievements.length + '</div></div>' +
 '</div>' +
 '<div class="grid grid-2" style="margin-top:20px;">' +
 '<div class="card">' +
 '<div class="card-title">Continue Learning</div>' +
 '<h3 style="margin-bottom:8px;font-size:1.1rem;">Lesson ' + nextLesson.number + ': ' + nextLesson.title + '</h3>' +
 '<p style="color:rgba(255,255,255,0.5);margin-bottom:16px;">' + nextLesson.description + '</p>' +
 '<button class="btn btn-primary" id="btn-continue">Start Lesson</button>' +
 '</div>' +
 '<div class="card">' +
 '<div class="card-title">Progress</div>' +
 '<div class="progress-bar" style="margin:12px 0;"><div class="progress-bar-fill" style="width:' + progressPct + '%"></div></div>' +
 '<p style="color:rgba(255,255,255,0.5);font-size:0.85rem;">' + progressPct + '% complete</p>' +
 '</div>' +
 '</div>';

 var self = this;
 document.getElementById("btn-continue")?.addEventListener("click", function() {
 self.startLesson(nextLesson.id);
 });
 }

 renderLessons() {
 var content = document.getElementById("content");
 if (!content) return;

 var levels = {};
 this.lessons.forEach(function(lesson) {
 if (!levels[lesson.level]) levels[lesson.level] = [];
 levels[lesson.level].push(lesson);
 });

 var html = "";
 for (var level in levels) {
 html += '<div class="level-header">' + level + '</div><div class="lesson-list">';
 levels[level].forEach(function(lesson) {
 var status = this.getLessonStatus(lesson.id);
 var unlocked = this.isLessonUnlocked(lesson);
 var className = status.completed ? "completed" : (unlocked ? "" : "locked");
 var extra = status.completed ? " (Best: " + status.bestWpm + " WPM, " + status.bestAccuracy + "%)" : "";
 html += '<div class="lesson-item ' + className + '" data-lesson="' + lesson.id + '">' +
 '<div class="lesson-num">' + lesson.number + '</div>' +
 '<div class="lesson-info"><h3>' + lesson.title + '</h3><p>' + lesson.description + extra + '</p></div>' +
 '</div>';
 }, this);
 html += '</div>';
 }

 content.innerHTML = html;

 var self = this;
 content.querySelectorAll(".lesson-item:not(.locked)").forEach(function(item) {
 item.addEventListener("click", function() {
 var lessonId = parseInt(this.dataset.lesson);
 self.startLesson(lessonId);
 });
 });
 }

 startLesson(lessonId) {
 var lesson = this.lessons.find(function(l) { return l.id === lessonId; });
 if (!lesson) return;

 this.currentLesson = lesson;
 this.currentLessonIndex = this.lessons.indexOf(lesson);
 var text = this.engine.loadLesson(lesson);

 var content = document.getElementById("content");
 content.innerHTML = '<div class="typing-container">' +
 '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
 '<div><h2 style="font-size:1.2rem;font-weight:600;">Lesson ' + lesson.number + ': ' + lesson.title + '</h2><p style="color:rgba(255,255,255,0.5);font-size:0.85rem;">' + lesson.description + '</p></div>' +
 '<button class="btn btn-secondary btn-sm" id="btn-back">Back</button>' +
 '</div>' +
 '<div class="metrics-bar">' +
 '<div class="metric"><div class="metric-label">WPM</div><div class="metric-value" id="metric-wpm">0</div></div>' +
 '<div class="metric"><div class="metric-label">Accuracy</div><div class="metric-value" id="metric-accuracy">100%</div></div>' +
 '<div class="metric"><div class="metric-label">Errors</div><div class="metric-value" id="metric-errors">0</div></div>' +
 '<div class="metric"><div class="metric-label">Time</div><div class="metric-value" id="metric-time">0:00</div></div>' +
 '<div class="metric"><div class="metric-label">Progress</div><div class="metric-value" id="metric-progress">0%</div></div>' +
 '</div>' +
 '<div class="typing-text" id="typing-text" tabindex="0">' + this.renderText(text) + '</div>' +
 '<div style="text-align:center;margin-top:16px;">' +
 '<button class="btn btn-primary btn-lg" id="btn-start">Click to Start Typing</button>' +
 '</div>' +
 '<div id="finger-guide" class="finger-guide"></div>' +
 (this.settings.showKeyboard ? this.renderKeyboard() : "") +
 '</div>';

 var typingText = document.getElementById("typing-text");
 var startBtn = document.getElementById("btn-start");
 var self = this;

 var doStart = function() {
 self.engine.start();
 if (startBtn) startBtn.style.display = "none";
 if (typingText) typingText.focus();
 };

 if (startBtn) {
 startBtn.addEventListener("click", doStart);
 }

 var backBtn = document.getElementById("btn-back");
 if (backBtn) {
 backBtn.addEventListener("click", function() {
 self.engine.stop();
 self.renderLessons();
 });
 }

 if (typingText) {
 typingText.addEventListener("keydown", function(e) {
 if (e.key === "Enter" && !self.engine.getIsRunning()) {
 e.preventDefault();
 doStart();
 return;
 }
 if (e.key === "Backspace") {
 e.preventDefault();
 self.engine.handleBackspace();
 self.updateDisplay();
 return;
 }
 if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
 e.preventDefault();
 if (!self.engine.getIsRunning()) {
 doStart();
 }
 var result = self.engine.handleInput(e.key);
 if (result.complete) {
 self.completeLesson(lesson.id, self.engine.getStats());
 self.showResult();
 }
 self.updateDisplay();
 }
 });
 }

 this.engine.onProgress = function(stats) {
 var wpmEl = document.getElementById("metric-wpm");
 var accEl = document.getElementById("metric-accuracy");
 var errEl = document.getElementById("metric-errors");
 var timeEl = document.getElementById("metric-time");
 var progEl = document.getElementById("metric-progress");
 if (wpmEl) wpmEl.textContent = stats.wpm;
 if (accEl) accEl.textContent = stats.accuracy + "%";
 if (errEl) errEl.textContent = stats.errors;
 if (timeEl) timeEl.textContent = self.formatTime(stats.elapsed);
 if (progEl) progEl.textContent = stats.progress + "%";
 };

 this.engine.onComplete = function(stats) {
 self.completeLesson(lesson.id, stats);
 };
 }

 renderText(text) {
 var html = "";
 for (var i = 0; i < text.length; i++) {
 var char = text[i];
 var display = char === " " ? "&nbsp;" : char; // FIX: use &nbsp; instead of middle dot
 html += '<span class="char pending" data-index="' + i + '">' + display + '</span>';
 }
 return html;
 }

 updateDisplay() {
 var text = this.engine.getText();
 var currentIndex = this.engine.getCurrentIndex();
 var errorIndices = this.engine.getErrorIndices(); // FIX: get error indices
 var chars = document.querySelectorAll(".typing-text .char");

 chars.forEach(function(span, i) {
 span.className = "char";
 if (i < currentIndex) {
 if (errorIndices.has(i)) { // FIX: check if this index had an error
 span.classList.add("error");
 } else {
 span.classList.add("correct");
 }
 } else if (i === currentIndex) {
 span.classList.add("current");
 } else {
 span.classList.add("pending");
 }
 });

 var currentChar = text[currentIndex];
 if (currentChar) {
 var guide = document.getElementById("finger-guide");
 if (guide) {
 var finger = this.getFingerForKey(currentChar);
 guide.innerHTML = finger ? "Use your <strong>" + finger + "</strong> finger" : "";
 }

 document.querySelectorAll(".kb-key").forEach(function(key) {
 key.classList.remove("current");
 if (key.dataset.key === currentChar.toLowerCase()) {
 key.classList.add("current");
 }
 });
 }
 }

 getFingerForKey(key) {
 var map = {
 "a": "left pinky", "q": "left pinky", "z": "left pinky", "1": "left pinky",
 "s": "left ring", "w": "left ring", "x": "left ring", "2": "left ring",
 "d": "left middle", "e": "left middle", "c": "left middle", "3": "left middle",
 "f": "left index", "r": "left index", "v": "left index", "t": "left index", "g": "left index", "b": "left index", "4": "left index", "5": "left index",
 "j": "right index", "h": "right index", "n": "right index", "m": "right index", "y": "right index", "u": "right index", "6": "right index", "7": "right index",
 "k": "right middle", "i": "right middle", ",": "right middle", "8": "right middle",
 "l": "right ring", "o": "right ring", ".": "right ring", "9": "right ring",
 ";": "right pinky", "p": "right pinky", "/": "right pinky", "\'": "right pinky", "0": "right pinky", "-": "right pinky", "=": "right pinky",
 " ": "thumb"
 };
 return map[key.toLowerCase()] || "";
 }

 renderKeyboard() {
 var rows = [
 ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
 ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\"],
 ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "\'", "Enter"],
 ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
 ["Ctrl", "Win", "Alt", "Space", "Alt", "Fn", "Ctrl"]
 ];

 var html = '<div class="keyboard">';
 rows.forEach(function(row) {
 html += '<div class="kb-row">';
 row.forEach(function(key) {
 var cls = "kb-key";
 var wideKeys = ["Backspace", "Tab", "Caps", "Enter", "Shift", "Ctrl", "Win", "Alt", "Fn"];
 if (wideKeys.indexOf(key) !== -1) cls += " wide";
 if (key === "Space") cls += " space";
 html += '<div class="' + cls + '" data-key="' + key.toLowerCase() + '">' + key + '</div>';
 });
 html += '</div>';
 });
 html += '</div>';
 return html;
 }

 showResult() {
 var stats = this.engine.getStats();
 var lesson = this.currentLesson;
 var content = document.getElementById("content");

 var passed = stats.accuracy >= (lesson.requirements.accuracy || 90) &&
 (!lesson.requirements.targetWpm || stats.wpm >= lesson.requirements.targetWpm);

 var nextBtn = passed ?
 '<button class="btn btn-primary btn-lg" id="btn-next">Next Lesson</button>' :
 '';

 content.innerHTML = '<div class="result-screen">' +
 '<h2 style="font-size:1.8rem;margin-bottom:8px;">' + (passed ? "Lesson Complete!" : "Try Again") + '</h2>' +
 '<div class="result-stats">' +
 '<div class="result-stat"><div class="val">' + stats.wpm + '</div><div class="lbl">WPM</div></div>' +
 '<div class="result-stat"><div class="val">' + stats.accuracy + '%</div><div class="lbl">Accuracy</div></div>' +
 '<div class="result-stat"><div class="val">' + stats.errors + '</div><div class="lbl">Errors</div></div>' +
 '<div class="result-stat"><div class="val">' + this.formatTime(stats.elapsed) + '</div><div class="lbl">Time</div></div>' +
 '</div>' +
 nextBtn +
 '<button class="btn btn-secondary" id="btn-retry" style="margin-left:8px;">Retry</button>' +
 '<button class="btn btn-ghost" id="btn-menu" style="margin-left:8px;">Menu</button>' +
 '</div>';

 var self = this;
 var nextBtnEl = document.getElementById("btn-next");
 if (nextBtnEl) {
 nextBtnEl.addEventListener("click", function() {
 var next = self.lessons[self.currentLessonIndex + 1];
 if (next) self.startLesson(next.id);
 else self.renderDashboard();
 });
 }

 var retryBtnEl = document.getElementById("btn-retry");
 if (retryBtnEl) {
 retryBtnEl.addEventListener("click", function() {
 self.startLesson(lesson.id);
 });
 }

 var menuBtnEl = document.getElementById("btn-menu");
 if (menuBtnEl) {
 menuBtnEl.addEventListener("click", function() {
 self.renderLessons();
 });
 }
 }

 renderPractice() {
 var content = document.getElementById("content");
 content.innerHTML = '<h2>Free Practice</h2><p style="color:rgba(255,255,255,0.5);">Type anything. No scoring, just practice.</p>';
 }

 renderAchievements() {
 var content = document.getElementById("content");
 var html = '<h2>Achievements</h2><div class="achievement-grid">';
 this.achievements.forEach(function(ach) {
 var unlocked = this.unlockedAchievements.has(ach.id);
 html += '<div class="achievement-card ' + (unlocked ? "unlocked" : "locked") + '">' +
 '<div class="icon">' + ach.icon + '</div>' +
 '<h4>' + ach.title + '</h4>' +
 '<p>' + ach.description + '</p>' +
 '</div>';
 }, this);
 html += '</div>';
 content.innerHTML = html;
 }

 renderStats() {
 var content = document.getElementById("content");
 var completed = Object.values(this.progress).filter(function(p) { return p.completed; });
 var maxWpm = 0;
 completed.forEach(function(p) { if (p.bestWpm > maxWpm) maxWpm = p.bestWpm; });
 var avgWpm = completed.length > 0 ? Math.round(completed.reduce(function(s, p) { return s + p.bestWpm; }, 0) / completed.length) : 0;
 var avgAcc = completed.length > 0 ? Math.round(completed.reduce(function(s, p) { return s + p.bestAccuracy; }, 0) / completed.length) : 0;

 content.innerHTML = '<h2>Statistics</h2>' +
 '<div class="grid grid-2" style="margin-top:20px;">' +
 '<div class="card"><div class="card-title">Total Practice Time</div><div class="card-value">' + this.formatTime(completed.length * 120) + '</div></div>' +
 '<div class="card"><div class="card-title">Lessons Completed</div><div class="card-value">' + completed.length + '</div></div>' +
 '<div class="card"><div class="card-title">Average WPM</div><div class="card-value">' + avgWpm + '</div></div>' +
 '<div class="card"><div class="card-title">Average Accuracy</div><div class="card-value">' + avgAcc + '%</div></div>' +
 '<div class="card"><div class="card-title">Best WPM</div><div class="card-value">' + maxWpm + '</div></div>' +
 '<div class="card"><div class="card-title">Total Characters</div><div class="card-value">' + (completed.length * 500) + '</div></div>' +
 '</div>';
 }

 renderSettings() {
 var content = document.getElementById("content");
 content.innerHTML = '<h2>Settings</h2>' +
 '<div class="settings-group">' +
 '<h3>General</h3>' +
 '<div class="setting-row"><span>Sound Effects</span><div class="toggle ' + (this.settings.sound ? "on" : "") + '" id="toggle-sound"></div></div>' +
 '<div class="setting-row"><span>Show Keyboard</span><div class="toggle ' + (this.settings.showKeyboard ? "on" : "") + '" id="toggle-keyboard"></div></div>' +
 '<div class="setting-row"><span>Show Finger Guide</span><div class="toggle ' + (this.settings.showFingers ? "on" : "") + '" id="toggle-fingers"></div></div>' +
 '</div>' +
 '<div class="settings-group">' +
 '<h3>Appearance</h3>' +
 '<div class="setting-row"><span>Liquid Glass Effect</span><div class="toggle ' + (this.settings.showGlass ? "on" : "") + '" id="toggle-glass"></div></div>' +
 '</div>' +
 '<div style="margin-top:20px;">' +
 '<button class="btn btn-secondary" id="btn-reset">Reset All Progress</button>' +
 '</div>';

 var self = this;

 var soundToggle = document.getElementById("toggle-sound");
 if (soundToggle) {
 soundToggle.addEventListener("click", function(e) {
 self.settings.sound = !self.settings.sound;
 e.target.classList.toggle("on");
 self.saveSettings();
 });
 }

 var kbToggle = document.getElementById("toggle-keyboard");
 if (kbToggle) {
 kbToggle.addEventListener("click", function(e) {
 self.settings.showKeyboard = !self.settings.showKeyboard;
 e.target.classList.toggle("on");
 self.saveSettings();
 });
 }

 var fingerToggle = document.getElementById("toggle-fingers");
 if (fingerToggle) {
 fingerToggle.addEventListener("click", function(e) {
 self.settings.showFingers = !self.settings.showFingers;
 e.target.classList.toggle("on");
 self.saveSettings();
 });
 }

 var glassToggle = document.getElementById("toggle-glass");
 if (glassToggle) {
 glassToggle.addEventListener("click", function(e) {
 self.settings.showGlass = !self.settings.showGlass;
 e.target.classList.toggle("on");
 self.saveSettings();
 self.applyGlassEffect();
 });
 }

 var resetBtn = document.getElementById("btn-reset");
 if (resetBtn) {
 resetBtn.addEventListener("click", function() {
 if (confirm("Are you sure? This will delete all your progress.")) {
 self.progress = {};
 self.saveProgress();
 self.renderDashboard();
 }
 });
 }
 }

 applyGlassEffect() {
 var cards = document.querySelectorAll(".card, .lesson-item, .typing-text, .kb-key, .result-stat, .achievement-card");
 cards.forEach(function(el) {
 if (this.settings.showGlass) {
 el.style.backdropFilter = "blur(24px)";
 el.style.webkitBackdropFilter = "blur(24px)";
 } else {
 el.style.backdropFilter = "none";
 el.style.webkitBackdropFilter = "none";
 el.style.background = "rgba(255,255,255,0.06)";
 }
 }, this);
 }

 setupEventListeners() {
 var self = this;
 document.querySelectorAll(".nav-item").forEach(function(item) {
 item.addEventListener("click", function() {
 document.querySelectorAll(".nav-item").forEach(function(n) { n.classList.remove("active"); });
 this.classList.add("active");
 var view = this.dataset.view;
 document.getElementById("header-title").textContent = view.charAt(0).toUpperCase() + view.slice(1);
 switch (view) {
 case "dashboard": self.renderDashboard(); break;
 case "lessons": self.renderLessons(); break;
 case "practice": self.renderPractice(); break;
 case "achievements": self.renderAchievements(); break;
 case "stats": self.renderStats(); break;
 case "settings": self.renderSettings(); break;
 }
 });
 });

 var themeBtn = document.getElementById("theme-toggle");
 if (themeBtn) {
 themeBtn.addEventListener("click", function() {
 document.body.dataset.theme = document.body.dataset.theme === "light" ? "dark" : "light";
 });
 }
 }

 showToast(message, type) {
 type = type || "success";
 var container = document.getElementById("toast-container");
 if (!container) return;
 var toast = document.createElement("div");
 toast.className = "toast " + type;
 toast.textContent = message;
 container.appendChild(toast);
 setTimeout(function() { toast.remove(); }, 3000);
 }

 formatTime(seconds) {
 var m = Math.floor(seconds / 60);
 var s = seconds % 60;
 return m + ":" + (s < 10 ? "0" : "") + s;
 }

 checkOffline() {
 var badge = document.getElementById("offline-badge");
 var update = function() {
 if (badge) badge.classList.toggle("show", !navigator.onLine);
 };
 window.addEventListener("online", update);
 window.addEventListener("offline", update);
 update();
 }
}

// Initialize app
window.app = new App();
