/* 𝐓𝐘𝐏𝐈𝐍𝐆 • 𝐌𝐀𝐒𝐓𝐄𝐑 - Typing Engine */
class TypingEngine {
  constructor() {
    this.text = '';
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
  }

  loadLesson(lesson) {
    this.lessonData = lesson;
    const exercise = lesson.exercises[Math.floor(Math.random() * lesson.exercises.length)];
    this.text = exercise.text;
    this.currentIndex = 0;
    this.errors = 0;
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
    this.timer = setInterval(() => {
      this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.calculateWPM();
      if (this.onProgress) this.onProgress(this.getStats());
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
    this.timer = setInterval(() => {
      this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.calculateWPM();
      if (this.onProgress) this.onProgress(this.getStats());
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

    const expected = this.text[this.currentIndex];
    const isCorrect = char === expected;

    if (!isCorrect) {
      this.errors++;
      if (this.onError) this.onError(this.currentIndex);
    }

    this.currentIndex++;
    this.calculateAccuracy();
    this.calculateWPM();

    const complete = this.currentIndex >= this.text.length;
    if (complete && this.onComplete) {
      this.onComplete(this.getStats());
    }

    return { valid: isCorrect, index: this.currentIndex - 1, complete, char: expected };
  }

  handleBackspace() {
    if (!this.isRunning || this.isPaused || this.currentIndex <= 0) return false;
    this.currentIndex--;
    return true;
  }

  calculateWPM() {
    if (!this.startTime || this.elapsed === 0) return;
    const minutes = this.elapsed / 60;
    const words = this.currentIndex / 5;
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
      theme: 'dark'
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
      const [lessonsRes, achievementsRes] = await Promise.all([
        fetch('./data/lessons.json'),
        fetch('./data/achievements.json')
      ]);
      this.lessons = await lessonsRes.json();
      this.achievements = await achievementsRes.json();
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }

  loadProgress() {
    const saved = localStorage.getItem('typing-master-progress');
    if (saved) this.progress = JSON.parse(saved);
  }

  saveProgress() {
    localStorage.setItem('typing-master-progress', JSON.stringify(this.progress));
  }

  loadSettings() {
    const saved = localStorage.getItem('typing-master-settings');
    if (saved) this.settings = JSON.parse(saved);
  }

  saveSettings() {
    localStorage.setItem('typing-master-settings', JSON.stringify(this.settings));
  }

  getLessonStatus(lessonId) {
    return this.progress[lessonId] || { completed: false, bestWpm: 0, bestAccuracy: 0 };
  }

  isLessonUnlocked(lesson) {
    if (lesson.number === 1) return true;
    const prev = this.lessons.find(l => l.number === lesson.number - 1);
    if (!prev) return true;
    return this.getLessonStatus(prev.id).completed;
  }

  completeLesson(lessonId, stats) {
    const current = this.getLessonStatus(lessonId);
    this.progress[lessonId] = {
      completed: true,
      bestWpm: Math.max(current.bestWpm, stats.wpm),
      bestAccuracy: Math.max(current.bestAccuracy, stats.accuracy),
      completedAt: new Date().toISOString()
    };
    this.saveProgress();
    this.checkAchievements();
    this.showToast('Lesson completed!', 'success');
  }

  checkAchievements() {
    const completedCount = Object.values(this.progress).filter(p => p.completed).length;
    const maxWpm = Math.max(...Object.values(this.progress).map(p => p.bestWpm), 0);

    const checks = [
      { id: 'first-lesson', condition: completedCount >= 1 },
      { id: 'lessons-10', condition: completedCount >= 10 },
      { id: 'lessons-25', condition: completedCount >= 25 },
      { id: 'lessons-50', condition: completedCount >= 50 },
      { id: 'lessons-100', condition: completedCount >= 100 },
      { id: 'wpm-50', condition: maxWpm >= 50 },
      { id: 'wpm-60', condition: maxWpm >= 60 },
      { id: 'wpm-80', condition: maxWpm >= 80 },
      { id: 'wpm-100', condition: maxWpm >= 100 },
      { id: 'complete-beginner', condition: completedCount >= 10 },
      { id: 'master-typist', condition: completedCount >= 100 && maxWpm >= 60 }
    ];

    checks.forEach(check => {
      if (check.condition && !this.unlockedAchievements.has(check.id)) {
        this.unlockedAchievements.add(check.id);
        const ach = this.achievements.find(a => a.id === check.id);
        if (ach) this.showToast(`Achievement: ${ach.title}`, 'achievement');
      }
    });
  }

  renderSidebar() {
    const app = document.getElementById('app');
    if (!app) return;

    const completedCount = Object.values(this.progress).filter(p => p.completed).length;
    const totalLessons = this.lessons.length;

    app.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-brand">
          <img src="./images/logo.png" alt="Logo" />
          <h1>𝐓𝐘𝐏𝐈𝐍𝐆 • 𝐌𝐀𝐒𝐓𝐄𝐑</h1>
        </div>
        <nav class="sidebar-nav">
          <button class="nav-item active" data-view="dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </button>
          <button class="nav-item" data-view="lessons">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Lessons (${completedCount}/${totalLessons})
          </button>
          <button class="nav-item" data-view="practice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Practice
          </button>
          <button class="nav-item" data-view="achievements">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
            Achievements
          </button>
          <button class="nav-item" data-view="stats">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Statistics
          </button>
          <button class="nav-item" data-view="settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </button>
        </nav>
        <div class="sidebar-footer">
          <div>𝐓𝐘𝐏𝐈𝐍𝐆 • 𝐌𝐀𝐒𝐓𝐄𝐑 v1.0</div>
          <div>Build Speed. Build Accuracy.</div>
        </div>
      </aside>
      <main class="main">
        <header class="header">
          <div class="header-title" id="header-title">Dashboard</div>
          <div class="header-actions">
            <button class="btn btn-ghost btn-sm" id="theme-toggle">🌙</button>
          </div>
        </header>
        <div class="content" id="content"></div>
      </main>
      <div class="toast-container" id="toast-container"></div>
      <div class="offline-badge" id="offline-badge">Offline Mode</div>
    `;
  }

  renderDashboard() {
    const content = document.getElementById('content');
    if (!content) return;

    const completedCount = Object.values(this.progress).filter(p => p.completed).length;
    const totalLessons = this.lessons.length;
    const maxWpm = Math.max(...Object.values(this.progress).map(p => p.bestWpm), 0);
    const avgAccuracy = completedCount > 0
      ? Math.round(Object.values(this.progress).reduce((sum, p) => sum + p.bestAccuracy, 0) / completedCount)
      : 0;

    const nextLesson = this.lessons.find(l => !this.getLessonStatus(l.id).completed) || this.lessons[0];

    content.innerHTML = `
      <div class="grid grid-4" style="margin-bottom: 24px;">
        <div class="card">
          <div class="card-title">Lessons Completed</div>
          <div class="card-value">${completedCount}/${totalLessons}</div>
        </div>
        <div class="card">
          <div class="card-title">Best WPM</div>
          <div class="card-value">${maxWpm}</div>
        </div>
        <div class="card">
          <div class="card-title">Avg Accuracy</div>
          <div class="card-value">${avgAccuracy}%</div>
        </div>
        <div class="card">
          <div class="card-title">Achievements</div>
          <div class="card-value">${this.unlockedAchievements.size}/${this.achievements.length}</div>
        </div>
      </div>
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-title">Continue Learning</div>
        <h3 style="margin: 8px 0;">Lesson ${nextLesson.number}: ${nextLesson.title}</h3>
        <p style="color: var(--text-muted); margin-bottom: 16px;">${nextLesson.description}</p>
        <button class="btn btn-primary btn-lg" id="btn-continue">Continue</button>
      </div>
      <div class="card">
        <div class="card-title">Progress</div>
        <div class="progress-bar" style="margin-top: 12px;">
          <div class="progress-bar-fill" style="width: ${(completedCount / totalLessons) * 100}%"></div>
        </div>
        <p style="color: var(--text-muted); margin-top: 8px; font-size: 0.85rem;">${Math.round((completedCount / totalLessons) * 100)}% complete</p>
      </div>
    `;

    document.getElementById('btn-continue')?.addEventListener('click', () => {
      this.startLesson(nextLesson.id);
    });
  }

  renderLessons() {
    const content = document.getElementById('content');
    if (!content) return;

    const levels = {};
    this.lessons.forEach(lesson => {
      if (!levels[lesson.level]) levels[lesson.level] = [];
      levels[lesson.level].push(lesson);
    });

    let html = '';
    Object.entries(levels).forEach(([level, levelLessons]) => {
      html += `<div class="level-header">${level}</div><div class="lesson-list">`;
      levelLessons.forEach(lesson => {
        const status = this.getLessonStatus(lesson.id);
        const unlocked = this.isLessonUnlocked(lesson);
        const className = status.completed ? 'completed' : (unlocked ? '' : 'locked');
        html += `
          <div class="lesson-item ${className}" data-lesson="${lesson.id}">
            <div class="lesson-num">${lesson.number}</div>
            <div class="lesson-info">
              <h3>${lesson.title}</h3>
              <p>${lesson.description} ${status.completed ? `(Best: ${status.bestWpm} WPM, ${status.bestAccuracy}%)` : ''}</p>
            </div>
          </div>
        `;
      });
      html += '</div>';
    });

    content.innerHTML = html;

    content.querySelectorAll('.lesson-item:not(.locked)').forEach(item => {
      item.addEventListener('click', () => {
        const lessonId = parseInt(item.dataset.lesson);
        this.startLesson(lessonId);
      });
    });
  }

  startLesson(lessonId) {
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    this.currentLesson = lesson;
    this.currentLessonIndex = this.lessons.indexOf(lesson);
    const text = this.engine.loadLesson(lesson);

    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="typing-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h2>Lesson ${lesson.number}: ${lesson.title}</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">${lesson.description}</p>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-back">← Back</button>
        </div>
        <div class="metrics-bar">
          <div class="metric"><div class="metric-label">WPM</div><div class="metric-value" id="metric-wpm">0</div></div>
          <div class="metric"><div class="metric-label">Accuracy</div><div class="metric-value" id="metric-accuracy">100%</div></div>
          <div class="metric"><div class="metric-label">Errors</div><div class="metric-value" id="metric-errors">0</div></div>
          <div class="metric"><div class="metric-label">Time</div><div class="metric-value" id="metric-time">0:00</div></div>
          <div class="metric"><div class="metric-label">Progress</div><div class="metric-value" id="metric-progress">0%</div></div>
        </div>
        <div class="typing-text" id="typing-text" tabindex="0">${this.renderText(text)}</div>
        <div style="text-align: center; margin: 20px 0;">
          <button class="btn btn-primary btn-lg" id="btn-start">Start Lesson</button>
        </div>
        <div class="finger-guide" id="finger-guide"></div>
        ${this.settings.showKeyboard ? this.renderKeyboard() : ''}
      </div>
    `;

    const typingText = document.getElementById('typing-text');
    const startBtn = document.getElementById('btn-start');

    startBtn?.addEventListener('click', () => {
      this.engine.start();
      startBtn.style.display = 'none';
      typingText.focus();
    });

    document.getElementById('btn-back')?.addEventListener('click', () => {
      this.engine.stop();
      this.renderLessons();
    });

    typingText?.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        this.engine.handleBackspace();
        this.updateDisplay();
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const result = this.engine.handleInput(e.key);
        if (result.complete) {
          this.completeLesson(lesson.id, this.engine.getStats());
          this.showResult();
        }
        this.updateDisplay();
      }
    });

    this.engine.onProgress = (stats) => {
      document.getElementById('metric-wpm').textContent = stats.wpm;
      document.getElementById('metric-accuracy').textContent = stats.accuracy + '%';
      document.getElementById('metric-errors').textContent = stats.errors;
      document.getElementById('metric-time').textContent = this.formatTime(stats.elapsed);
      document.getElementById('metric-progress').textContent = stats.progress + '%';
    };

    this.engine.onComplete = (stats) => {
      this.completeLesson(lesson.id, stats);
    };
  }

  renderText(text) {
    return text.split('').map((char, i) => {
      const display = char === ' ' ? '·' : char;
      return `<span class="char pending" data-index="${i}">${display}</span>`;
    }).join('');
  }

  updateDisplay() {
    const text = this.engine.getText();
    const currentIndex = this.engine.getCurrentIndex();
    const chars = document.querySelectorAll('.typing-text .char');

    chars.forEach((span, i) => {
      span.className = 'char';
      if (i < currentIndex) {
        span.classList.add('correct');
      } else if (i === currentIndex) {
        span.classList.add('current');
      } else {
        span.classList.add('pending');
      }
    });

    const currentChar = text[currentIndex];
    if (currentChar) {
      const guide = document.getElementById('finger-guide');
      if (guide) {
        const finger = this.getFingerForKey(currentChar);
        guide.innerHTML = finger ? `Use your <strong>${finger}</strong> finger` : '';
      }

      document.querySelectorAll('.kb-key').forEach(key => {
        key.classList.remove('current');
        if (key.dataset.key === currentChar.toLowerCase()) {
          key.classList.add('current');
        }
      });
    }
  }

  getFingerForKey(key) {
    const map = {
      'a': 'left pinky', 'q': 'left pinky', 'z': 'left pinky', '1': 'left pinky',
      's': 'left ring', 'w': 'left ring', 'x': 'left ring', '2': 'left ring',
      'd': 'left middle', 'e': 'left middle', 'c': 'left middle', '3': 'left middle',
      'f': 'left index', 'r': 'left index', 'v': 'left index', 't': 'left index', 'g': 'left index', 'b': 'left index', '4': 'left index', '5': 'left index',
      'j': 'right index', 'h': 'right index', 'n': 'right index', 'm': 'right index', 'y': 'right index', 'u': 'right index', '6': 'right index', '7': 'right index',
      'k': 'right middle', 'i': 'right middle', ',': 'right middle', '8': 'right middle',
      'l': 'right ring', 'o': 'right ring', '.': 'right ring', '9': 'right ring',
      ';': 'right pinky', 'p': 'right pinky', '/': 'right pinky', "'": 'right pinky', '0': 'right pinky', '-': 'right pinky', '=': 'right pinky',
      ' ': 'thumb'
    };
    return map[key.toLowerCase()] || '';
  }

  renderKeyboard() {
    const rows = [
      ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
      ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\'],
      ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
      ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
      ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Ctrl']
    ];

    let html = '<div class="keyboard">';
    rows.forEach(row => {
      html += '<div class="kb-row">';
      row.forEach(key => {
        let cls = 'kb-key';
        if (key === 'Backspace' || key === 'Tab' || key === 'Caps' || key === 'Enter' || key === 'Shift' || key === 'Ctrl' || key === 'Win' || key === 'Alt' || key === 'Fn') cls += ' wide';
        if (key === 'Space') cls += ' space';
        html += `<div class="${cls}" data-key="${key.toLowerCase()}">${key}</div>`;
      });
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  showResult() {
    const stats = this.engine.getStats();
    const lesson = this.currentLesson;
    const content = document.getElementById('content');

    const passed = stats.accuracy >= (lesson.requirements.accuracy || 90) &&
                   (!lesson.requirements.targetWpm || stats.wpm >= lesson.requirements.targetWpm);

    content.innerHTML = `
      <div class="result-screen">
        <h2>${passed ? '🎉 Lesson Complete!' : '⚠️ Try Again'}</h2>
        <div class="result-stats">
          <div class="result-stat"><div class="val">${stats.wpm}</div><div class="lbl">WPM</div></div>
          <div class="result-stat"><div class="val">${stats.accuracy}%</div><div class="lbl">Accuracy</div></div>
          <div class="result-stat"><div class="val">${stats.errors}</div><div class="lbl">Errors</div></div>
          <div class="result-stat"><div class="val">${this.formatTime(stats.elapsed)}</div><div class="lbl">Time</div></div>
        </div>
        ${passed ? `
          <button class="btn btn-primary btn-lg" id="btn-next">Next Lesson →</button>
        ` : `
          <button class="btn btn-primary btn-lg" id="btn-retry">Retry Lesson ↻</button>
        `}
        <button class="btn btn-secondary" id="btn-menu" style="margin-top: 12px;">Back to Lessons</button>
      </div>
    `;

    document.getElementById('btn-next')?.addEventListener('click', () => {
      const next = this.lessons[this.currentLessonIndex + 1];
      if (next) this.startLesson(next.id);
      else this.renderDashboard();
    });

    document.getElementById('btn-retry')?.addEventListener('click', () => {
      this.startLesson(lesson.id);
    });

    document.getElementById('btn-menu')?.addEventListener('click', () => {
      this.renderLessons();
    });
  }

  renderPractice() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="typing-container">
        <h2>Free Practice</h2>
        <p style="color: var(--text-muted); margin-bottom: 20px;">Type anything. No scoring, just practice.</p>
        <div class="typing-text" id="practice-text" contenteditable="true" style="min-height: 200px; outline: none;"></div>
      </div>
    `;
  }

  renderAchievements() {
    const content = document.getElementById('content');
    let html = '<h2>Achievements</h2><div class="achievement-grid">';
    this.achievements.forEach(ach => {
      const unlocked = this.unlockedAchievements.has(ach.id);
      html += `
        <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
          <div class="icon">${ach.icon}</div>
          <h4>${ach.title}</h4>
          <p>${ach.description}</p>
        </div>
      `;
    });
    html += '</div>';
    content.innerHTML = html;
  }

  renderStats() {
    const content = document.getElementById('content');
    const completed = Object.values(this.progress).filter(p => p.completed);
    const maxWpm = Math.max(...completed.map(p => p.bestWpm), 0);
    const avgWpm = completed.length > 0 ? Math.round(completed.reduce((s, p) => s + p.bestWpm, 0) / completed.length) : 0;
    const avgAcc = completed.length > 0 ? Math.round(completed.reduce((s, p) => s + p.bestAccuracy, 0) / completed.length) : 0;

    content.innerHTML = `
      <h2>Statistics</h2>
      <div class="grid grid-2" style="margin-top: 20px;">
        <div class="card"><div class="card-title">Total Practice Time</div><div class="card-value">${this.formatTime(completed.length * 120)}</div></div>
        <div class="card"><div class="card-title">Lessons Completed</div><div class="card-value">${completed.length}</div></div>
        <div class="card"><div class="card-title">Average WPM</div><div class="card-value">${avgWpm}</div></div>
        <div class="card"><div class="card-title">Average Accuracy</div><div class="card-value">${avgAcc}%</div></div>
        <div class="card"><div class="card-title">Best WPM</div><div class="card-value">${maxWpm}</div></div>
        <div class="card"><div class="card-title">Total Characters</div><div class="card-value">${completed.length * 500}</div></div>
      </div>
    `;
  }

  renderSettings() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <h2>Settings</h2>
      <div style="max-width: 500px; margin-top: 20px;">
        <div class="settings-group">
          <h3>General</h3>
          <div class="setting-row">
            <label>Sound Effects</label>
            <div class="toggle ${this.settings.sound ? 'on' : ''}" id="toggle-sound"></div>
          </div>
          <div class="setting-row">
            <label>Show Keyboard</label>
            <div class="toggle ${this.settings.showKeyboard ? 'on' : ''}" id="toggle-keyboard"></div>
          </div>
          <div class="setting-row">
            <label>Show Finger Guide</label>
            <div class="toggle ${this.settings.showFingers ? 'on' : ''}" id="toggle-fingers"></div>
          </div>
        </div>
        <div class="settings-group">
          <h3>Data</h3>
          <button class="btn btn-secondary" id="btn-reset">Reset All Progress</button>
        </div>
      </div>
    `;

    document.getElementById('toggle-sound')?.addEventListener('click', (e) => {
      this.settings.sound = !this.settings.sound;
      e.target.classList.toggle('on');
      this.saveSettings();
    });

    document.getElementById('toggle-keyboard')?.addEventListener('click', (e) => {
      this.settings.showKeyboard = !this.settings.showKeyboard;
      e.target.classList.toggle('on');
      this.saveSettings();
    });

    document.getElementById('toggle-fingers')?.addEventListener('click', (e) => {
      this.settings.showFingers = !this.settings.showFingers;
      e.target.classList.toggle('on');
      this.saveSettings();
    });

    document.getElementById('btn-reset')?.addEventListener('click', () => {
      if (confirm('Are you sure? This will delete all your progress.')) {
        this.progress = {};
        this.saveProgress();
        this.renderDashboard();
      }
    });
  }

  setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        const view = item.dataset.view;
        document.getElementById('header-title').textContent = view.charAt(0).toUpperCase() + view.slice(1);
        switch (view) {
          case 'dashboard': this.renderDashboard(); break;
          case 'lessons': this.renderLessons(); break;
          case 'practice': this.renderPractice(); break;
          case 'achievements': this.renderAchievements(); break;
          case 'stats': this.renderStats(); break;
          case 'settings': this.renderSettings(); break;
        }
      });
    });

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      document.body.dataset.theme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    });
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  checkOffline() {
    const badge = document.getElementById('offline-badge');
    const update = () => badge?.classList.toggle('show', !navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  }
}

// Initialize app
window.app = new App();
