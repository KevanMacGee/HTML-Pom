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
    const cycleDisplay = document.getElementById('cycleCount');
    let cyclesCompleted = 0;

    // Changed from 45 and 15 minutes to 15 seconds each
    let WORK_TIME = 15;  // 15 seconds
    let BREAK_TIME = 15; // 15 seconds
    let LONG_BREAK_TIME = 15 * 60; // 15 minutes in seconds
    const CYCLES_BEFORE_LONG_BREAK = 4;
    let timeLeft = WORK_TIME;
    let isRunning = false;
    let isWorkTime = true;
    let isLongBreak = false;
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
        let statusText = isWorkTime ? 'Work Time' : (isLongBreak ? 'Long Break' : 'Break Time');
        if (!isRunning) {
            statusText += ' (Paused)';
            statusDisplay.classList.remove('pulse-animation');
        } else {
            statusDisplay.classList.add('pulse-animation');
        }
        statusDisplay.textContent = statusText;
        statusDisplay.className = `status-text text-${isWorkTime ? 'success' : 'primary'}${isRunning ? ' pulse-animation' : ''}`;
    }

    function updateCycleCount() {
        cycleDisplay.textContent = `Cycles completed: ${cyclesCompleted}`;
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
                    if (isWorkTime) {
                        isWorkTime = false;
                        cyclesCompleted++;
                        updateCycleCount();
                        
                        // Check if we should trigger a long break
                        if (cyclesCompleted % CYCLES_BEFORE_LONG_BREAK === 0) {
                            isLongBreak = true;
                            timeLeft = LONG_BREAK_TIME;
                        } else {
                            isLongBreak = false;
                            timeLeft = BREAK_TIME;
                        }
                        breakSound.play();
                    } else {
                        isWorkTime = true;
                        isLongBreak = false;
                        timeLeft = WORK_TIME;
                        workSound.play();
                    }
                    updateStatus();
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
        isLongBreak = false;
        cyclesCompleted = 0;
        timeLeft = WORK_TIME;
        toggleBtn.textContent = 'Start';
        toggleBtn.className = 'btn btn-primary btn-lg';
        updateDisplay();
        updateStatus();
        updateCycleCount();
    }

    function openSettings() {
        workDurationInput.value = WORK_TIME / 60;
        breakDurationInput.value = BREAK_TIME / 60;
        longBreakDurationInput.value = LONG_BREAK_TIME / 60;
        new bootstrap.Modal(document.getElementById('settingsModal')).show();
    }

    function saveSettings() {
        // Convert input values to numbers and validate (minimum 0.25 minutes = 15 seconds)
        const workMinutes = Math.max(0.25, parseFloat(workDurationInput.value) || 0.25);
        const breakMinutes = Math.max(0.25, parseFloat(breakDurationInput.value) || 0.25);
        const longBreakMinutes = Math.max(0.25, parseFloat(longBreakDurationInput.value) || 0.25);

        // Update the input values to show validated numbers
        workDurationInput.value = workMinutes;
        breakDurationInput.value = breakMinutes;
        longBreakDurationInput.value = longBreakMinutes;

        // Convert minutes to seconds and save
        WORK_TIME = Math.round(workMinutes * 60);
        BREAK_TIME = Math.round(breakMinutes * 60);
        LONG_BREAK_TIME = Math.round(longBreakMinutes * 60);

        // Reset timer with new values
        resetTimer();
        bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
    }

    settingsBtn.addEventListener('click', openSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    toggleBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);

    updateDisplay();
    updateCycleCount();
});
