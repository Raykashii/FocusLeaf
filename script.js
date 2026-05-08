// ===========================
// PAGE NAVIGATION
// ===========================
function showApp() {
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

function showLanding() {
  document.getElementById('app').classList.add('hidden');
  document.getElementById('landing').classList.remove('hidden');
}

// ===========================
// TIMER
// ===========================
const MODES = [
  { label: 'Focus',       duration: 25 * 60, stroke: '#87A878' },
  { label: 'Short Break', duration: 5  * 60, stroke: '#7BAFC4' },
  { label: 'Long Break',  duration: 15 * 60, stroke: '#A89078' },
];

const CIRC = 2 * Math.PI * 80;

let currentMode = 0;
let timeLeft    = MODES[0].duration;
let running     = false;
let timerInterval = null;
let sessions    = 0;

const timerDisplay = document.getElementById('timerDisplay');
const modeLabel    = document.getElementById('modeLabel');
const startBtn     = document.getElementById('startBtn');
const timerCircle  = document.getElementById('timerCircle');
const sessionCount = document.getElementById('sessionCount');

function formatTime(s) {
  const m   = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}

function updateCircle() {
  const progress = 1 - timeLeft / MODES[currentMode].duration;
  const offset   = CIRC * (1 - progress);
  timerCircle.style.strokeDashoffset = offset;
  timerCircle.setAttribute('stroke', MODES[currentMode].stroke);
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
  modeLabel.textContent    = MODES[currentMode].label;
  updateCircle();
}

function selectMode(idx) {
  currentMode = idx;
  timeLeft    = MODES[idx].duration;
  running     = false;
  clearInterval(timerInterval);
  startBtn.textContent = '▶ Start';

  // Update tab styles
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });

  updateDisplay();
}

function toggleTimer() {
  if (running) {
    running = false;
    clearInterval(timerInterval);
    startBtn.textContent = '▶ Start';
  } else {
    running = true;
    startBtn.textContent = '⏸ Pause';
    timerInterval = setInterval(() => {
      timeLeft--;
      updateDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        running = false;
        startBtn.textContent = '▶ Start';
        onTimerEnd();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  running  = false;
  timeLeft = MODES[currentMode].duration;
  startBtn.textContent = '▶ Start';
  updateDisplay();
}

function onTimerEnd() {
  if (currentMode === 0) {
    sessions++;
    sessionCount.textContent = sessions;
    fetchQuote();
  }
  playBeep();
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
  } catch (e) {
    console.log('Audio not supported');
  }
}

//timer display
selectMode(0);

// ===========================
// FETCH QUOTE (Quotable API)
// ===========================
const quoteText   = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');

async function fetchQuote() {
  quoteText.style.opacity = '0.4';
  quoteText.textContent   = 'Fetching inspiration...';
  quoteAuthor.textContent = '';

  const res  = await fetch('https://dummyjson.com/quotes/random');
  const data = await res.json();
  quoteText.textContent   = `"${data.quote}"`;
  quoteAuthor.textContent = `— ${data.author}`;
  quoteText.style.opacity = '1';
}

// ===========================
// TO-DO LIST
// ===========================
let tasks = JSON.parse(localStorage.getItem('focusleaf_tasks') || '[]');

const taskList  = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');
const emptyMsg  = document.getElementById('emptyMsg');

function saveTasks() {
  localStorage.setItem('focusleaf_tasks', JSON.stringify(tasks));
}

function renderTasks() {
  // Remove all task items (keep emptyMsg)
  document.querySelectorAll('.task-item').forEach(el => el.remove());

  emptyMsg.style.display = tasks.length === 0 ? 'block' : 'none';

  tasks.forEach(task => {
    const item = document.createElement('div');
    item.className = `task-item${task.done ? ' done' : ''}`;
    item.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked   = task.done;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const text = document.createElement('span');
    text.className   = 'task-text';
    text.textContent = task.text;

    const del = document.createElement('button');
    del.className   = 'task-delete';
    del.textContent = '×';
    del.addEventListener('click', () => deleteTask(task.id));

    item.appendChild(checkbox);
    item.appendChild(text);
    item.appendChild(del);
    taskList.appendChild(item);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  taskInput.value = '';
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

renderTasks();
