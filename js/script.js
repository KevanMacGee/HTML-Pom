document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer');
    const statusDisplay = document.getElementById('status');
    const toggleBtn = document.getElementById('toggleBtn');
    const resetBtn = document.getElementById('resetBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const workDurationInput = document.getElementById('workDuration');
    const breakDurationInput = document.getElementById('breakDuration');
    const longBreakDurationInput = document.getElementById('longBreakDuration');

    // Changed from 45 and 15 minutes to 15 seconds each
    let WORK_TIME = 15;  // 15 seconds
    let BREAK_TIME = 15; // 15 seconds
    let LONG_BREAK_TIME = 15 * 60; // 15 minutes in seconds
    let timeLeft = WORK_TIME;
    let isRunning = false;
    let isWorkTime = true;
    let timer = null;

    // Add sound file constants
    const workSound = new Audio('sounds/work-start.mp3');
    const breakSound = new Audio('sounds/break-start.mp3');

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateStatus() {
        let statusText = isWorkTime ? 'Work Time' : 'Break Time';
        if (!isRunning) {
            statusText += ' (Paused)';
            statusDisplay.classList.remove('pulse-animation');
        } else {
            statusDisplay.classList.add('pulse-animation');
        }
        statusDisplay.textContent = statusText;
        statusDisplay.className = `status-text text-${isWorkTime ? 'success' : 'primary'}${isRunning ? ' pulse-animation' : ''}`;
    }

    function toggleTimer() {
        if (isRunning) {
            clearInterval(timer);
            toggleBtn.textContent = 'Start';
            toggleBtn.className = 'btn btn-primary btn-lg';
        } else {
            // Play sound when timer starts based on current mode
            if (isWorkTime) {
                workSound.play();
            } else {
                breakSound.play();
            }

            timer = setInterval(() => {
                timeLeft--;
                if (timeLeft < 0) {
                    isWorkTime = !isWorkTime;
                    timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
                    updateStatus();
                    // Play sound at transition
                    if (isWorkTime) {
                        workSound.play();
                    } else {
                        breakSound.play();
                    }
                }
                updateDisplay();
            }, 1000);
            toggleBtn.textContent = 'Pause';
            toggleBtn.className = 'btn btn-warning btn-lg';
        }
        isRunning = !isRunning;
        updateStatus();
    }

    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        isWorkTime = true;
        timeLeft = WORK_TIME;
        toggleBtn.textContent = 'Start';
        toggleBtn.className = 'btn btn-primary btn-lg';
        updateDisplay();
        updateStatus();
    }

    function openSettings() {
        workDurationInput.value = WORK_TIME / 60;
        breakDurationInput.value = BREAK_TIME / 60;
        longBreakDurationInput.value = LONG_BREAK_TIME / 60;
        new bootstrap.Modal(document.getElementById('settingsModal')).show();
    }

    function saveSettings() {
        WORK_TIME = parseInt(workDurationInput.value) * 60;
        BREAK_TIME = parseInt(breakDurationInput.value) * 60;
        LONG_BREAK_TIME = parseInt(longBreakDurationInput.value) * 60;
        resetTimer();
        bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
    }

    settingsBtn.addEventListener('click', openSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    toggleBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);

    updateDisplay();
});
