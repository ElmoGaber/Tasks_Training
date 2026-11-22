(function () {
  const display = document.getElementById('display');
  const msDisplay = document.getElementById('milliseconds');
  const startBtn = document.getElementById('startBtn');
  const lapBtn = document.getElementById('lapBtn');
  const resetBtn = document.getElementById('resetBtn');
  const lapsContainer = document.getElementById('lapsContainer');
  const clearLapsBtn = document.getElementById('clearLapsBtn');
  const lapsSection = document.getElementById('lapsSection');

  let startTime = 0;
  let elapsed = 0;
  let running = false;
  let timerId = null;
  let lapCount = 0;

  function formatTime(ms) {
    const totalMs = Math.floor(ms);
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const millis = totalMs % 1000;

    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    const msStr = String(millis).padStart(3, '0');

    return { main: h + ':' + m + ':' + s, ms: '.' + msStr };
  }

  function updateDisplay() {
    const diff = running ? elapsed + (Date.now() - startTime) : elapsed;
    const formatted = formatTime(diff);
    display.textContent = formatted.main;
    msDisplay.textContent = formatted.ms;
  }

  function start() {
    if (running) {
      pause();
      return;
    }
    startTime = Date.now();
    running = true;
    timerId = requestAnimationFrame(tick);
    startBtn.textContent = 'Pause';
    startBtn.classList.add('running');
    lapBtn.disabled = false;
    resetBtn.disabled = false;
    startBtn.setAttribute('aria-label', 'Pause');
  }

  function pause() {
    if (!running) return;
    elapsed += Date.now() - startTime;
    running = false;
    cancelAnimationFrame(timerId);
    startBtn.textContent = 'Resume';
    startBtn.classList.remove('running');
    startBtn.setAttribute('aria-label', 'Resume');
  }

  function reset() {
    const wasRunning = running;
    if (running) {
      cancelAnimationFrame(timerId);
    }
    running = false;
    elapsed = 0;
    startTime = 0;
    startBtn.textContent = 'Start';
    startBtn.classList.remove('running');
    lapBtn.disabled = true;
    resetBtn.disabled = true;
    startBtn.setAttribute('aria-label', 'Start');
    updateDisplay();
    if (wasRunning && timerId) {
      cancelAnimationFrame(timerId);
    }
  }

  function tick() {
    if (!running) return;
    updateDisplay();
    timerId = requestAnimationFrame(tick);
  }

  function recordLap() {
    if (!running) return;
    lapCount++;

    const now = Date.now();
    const currentElapsed = elapsed + (now - startTime);
    const formatted = formatTime(currentElapsed);

    const lapItem = document.createElement('div');
    lapItem.className = 'lap-item';
    lapItem.setAttribute('role', 'listitem');
    lapItem.setAttribute('aria-label', 'Lap ' + lapCount);

    const lapNumber = document.createElement('span');
    lapNumber.className = 'lap-number';
    lapNumber.textContent = 'Lap ' + lapCount;

    const lapTime = document.createElement('span');
    lapTime.className = 'lap-time';
    lapTime.textContent = formatted.main + formatted.ms;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'lap-delete';
    deleteBtn.textContent = '\u00D7';
    deleteBtn.setAttribute('aria-label', 'Delete lap ' + lapCount);

    deleteBtn.addEventListener('click', function () {
      lapItem.remove();
      if (lapsContainer.children.length === 0) {
        lapsSection.hidden = true;
      }
    });

    lapItem.appendChild(lapNumber);
    lapItem.appendChild(lapTime);
    lapItem.appendChild(deleteBtn);
    lapsContainer.appendChild(lapItem);
    lapsSection.hidden = false;

    lapItem.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  function clearLaps() {
    lapsContainer.innerHTML = '';
    lapCount = 0;
    lapsSection.hidden = true;
  }

  startBtn.addEventListener('click', start);
  lapBtn.addEventListener('click', recordLap);
  resetBtn.addEventListener('click', reset);
  clearLapsBtn.addEventListener('click', clearLaps);

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      start();
    } else if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      if (running) recordLap();
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      if (elapsed > 0 || running) reset();
    }
  });

  updateDisplay();
})();
