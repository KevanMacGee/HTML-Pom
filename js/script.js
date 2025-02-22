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
    const cycleTargetInput = document.getElementById('cycleTarget');
    let cyclesCompleted = 0;
    let targetCycles = 4;
    let isWorkComplete = false;  // Add this flag to track work completion

    // Changed from 45 and 15 minutes to 15 seconds each
    let WORK_TIME = 15;  // 15 seconds
    let BREAK_TIME = 15; // 15 seconds
    let LONG_BREAK_TIME = 15 * 60; // 15 minutes in seconds
    const CYCLES_BEFORE_LONG_BREAK = 4;
    let timeLeft = WORK_TIME;
    let isRunning = false;
    let isWorkTime = true;
    let isLongBreak = false;

    // Add sound file constants
    const workSound = new Audio('sounds/work-start.mp3');
    const breakSound = new Audio('sounds/break-start.mp3');
    const longBreakSound = new Audio('sounds/long-break-start.mp3');

    // Add these constants at the top with other constants
    const STORAGE_KEYS = {
        END_TIME: 'pomodoroEndTime',
        CURRENT_MODE: 'pomodoroCurrentMode',
        CYCLES: 'pomodoroCycles',
        IS_LONG_BREAK: 'pomodoroIsLongBreak',
        TARGET_CYCLES: 'pomodoroTargetCycles'  // Add this for consistency
    };

    let lastTime = 0;
    let elapsed = 0;
    let lastRealTime = null;

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
        cycleDisplay.textContent = `Pomodoros completed: ${cyclesCompleted}${targetCycles ? ` / ${targetCycles}` : ''}`;
    }

    function updateTimer(currentTime) {
        if (!isRunning) return;

        // Handle tab becoming active again
        if (lastRealTime === null) {
            lastRealTime = Date.now();
            lastTime = currentTime;
            requestAnimationFrame(updateTimer);
            return;
        }

        // Calculate real elapsed time
        const realNow = Date.now();
        const realElapsed = realNow - lastRealTime;
        lastRealTime = realNow;

        // If more than 1 second has passed (tab was inactive)
        if (realElapsed > 1000) {
            const secondsToSubtract = Math.floor(realElapsed / 1000);
            timeLeft = Math.max(0, timeLeft - secondsToSubtract);
            elapsed = realElapsed % 1000;
            
            // Check if timer should have ended during inactive period
            if (timeLeft === 0) {
                handleTimerCompletion();
            }
        } else {
            // Normal active tab behavior
            if (!lastTime) {
                lastTime = currentTime;
            }

            elapsed += currentTime - lastTime;
            lastTime = currentTime;

            if (elapsed >= 1000) {
                timeLeft--;
                elapsed = elapsed % 1000;

                if (timeLeft < 0) {
                    handleTimerCompletion();
                }
            }
        }

        updateDisplay();
        requestAnimationFrame(updateTimer);
    }

    function handleTimerCompletion() {
        if (isWorkTime) {
            isWorkTime = false;
            isWorkComplete = true;
            
            if ((cyclesCompleted + 1) % CYCLES_BEFORE_LONG_BREAK === 0) {
                isLongBreak = true;
                timeLeft = LONG_BREAK_TIME;
                longBreakSound.play();
            } else {
                isLongBreak = false;
                timeLeft = BREAK_TIME;
                breakSound.play();
            }
        } else {
            if (isWorkComplete) {
                cyclesCompleted++;
                updateCycleCount();
                checkCycleTarget();
            }
            isWorkTime = true;
            isWorkComplete = false;
            isLongBreak = false;
            timeLeft = WORK_TIME;
            workSound.play();
        }
        updateStatus();
    }

    // Modify the toggleTimer function
    function toggleTimer() {
        if (isRunning) {
            // Clear storage when pausing
            localStorage.removeItem(STORAGE_KEYS.END_TIME);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_MODE);
            localStorage.removeItem(STORAGE_KEYS.CYCLES);
            localStorage.removeItem(STORAGE_KEYS.IS_LONG_BREAK);
            
            isRunning = false;
            lastTime = 0;
            lastRealTime = null;
            elapsed = 0;
            toggleBtn.textContent = 'Start';
            toggleBtn.className = 'btn btn-primary btn-lg';
        } else {
            isRunning = true;
            lastRealTime = Date.now();
            
            // Store end time and current state
            const endTime = Date.now() + (timeLeft * 1000);
            localStorage.setItem(STORAGE_KEYS.END_TIME, endTime.toString());
            localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, isWorkTime ? 'work' : 'break');
            localStorage.setItem(STORAGE_KEYS.CYCLES, cyclesCompleted.toString());
            localStorage.setItem(STORAGE_KEYS.IS_LONG_BREAK, isLongBreak.toString());
            
            if (isWorkTime) {
                workSound.play();
            } else {
                breakSound.play();
            }
            requestAnimationFrame(updateTimer);
            toggleBtn.textContent = 'Pause';
            toggleBtn.className = 'btn btn-warning btn-lg';
        }
        updateStatus();
    }

    function resetTimer() {
        isRunning = false;
        lastTime = 0;
        elapsed = 0;
        isWorkTime = true;
        isLongBreak = false;
        isWorkComplete = false;  // Reset work completion flag
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
        cycleTargetInput.value = targetCycles;
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

        targetCycles = parseInt(cycleTargetInput.value) || 0; // 0 means unlimited

        // Store settings in localStorage
        localStorage.setItem('workTime', WORK_TIME.toString());
        localStorage.setItem('breakTime', BREAK_TIME.toString());
        localStorage.setItem('longBreakTime', LONG_BREAK_TIME.toString());
        localStorage.setItem(STORAGE_KEYS.TARGET_CYCLES, targetCycles.toString());

        resetTimer();
        bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
        updateCycleCount();
    }

    // Optional: Add check for target completion
    function checkCycleTarget() {
        if (targetCycles && cyclesCompleted >= targetCycles) {
            isRunning = false;
            toggleBtn.textContent = 'Start';
            toggleBtn.className = 'btn btn-primary btn-lg';
            // Optional: Play a completion sound or show a notification
        }
    }

    // Add this function to check stored time on page load
    function checkStoredTimer() {
        const storedEndTime = localStorage.getItem(STORAGE_KEYS.END_TIME);
        if (storedEndTime) {
            const endTime = parseInt(storedEndTime);
            const now = Date.now();
            if (endTime > now) {
                // Restore timer state
                timeLeft = Math.ceil((endTime - now) / 1000);
                isWorkTime = localStorage.getItem(STORAGE_KEYS.CURRENT_MODE) === 'work';
                cyclesCompleted = parseInt(localStorage.getItem(STORAGE_KEYS.CYCLES) || '0');
                isLongBreak = localStorage.getItem(STORAGE_KEYS.IS_LONG_BREAK) === 'true';
                
                // Auto-start timer
                toggleTimer();
            } else {
                // Clear expired timer
                localStorage.clear();
            }
        }
    }

    function loadStoredSettings() {
        // Helper function to safely parse numbers with validation
        const safeParseInt = (value, defaultValue) => {
            const parsed = parseInt(value);
            return (!isNaN(parsed) && parsed > 0) ? parsed : defaultValue;
        };

        WORK_TIME = safeParseInt(localStorage.getItem('workTime'), 15);
        BREAK_TIME = safeParseInt(localStorage.getItem('breakTime'), 15);
        LONG_BREAK_TIME = safeParseInt(localStorage.getItem('longBreakTime'), 900);
        targetCycles = safeParseInt(localStorage.getItem(STORAGE_KEYS.TARGET_CYCLES), 4);

        // Clean up invalid values if found
        if (WORK_TIME !== parseInt(localStorage.getItem('workTime'))) {
            localStorage.setItem('workTime', WORK_TIME.toString());
        }
        if (BREAK_TIME !== parseInt(localStorage.getItem('breakTime'))) {
            localStorage.setItem('breakTime', BREAK_TIME.toString());
        }
        if (LONG_BREAK_TIME !== parseInt(localStorage.getItem('longBreakTime'))) {
            localStorage.setItem('longBreakTime', LONG_BREAK_TIME.toString());
        }
        if (targetCycles !== parseInt(localStorage.getItem(STORAGE_KEYS.TARGET_CYCLES))) {
            localStorage.setItem(STORAGE_KEYS.TARGET_CYCLES, targetCycles.toString());
        }
    }

    settingsBtn.addEventListener('click', openSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    toggleBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);

    loadStoredSettings();
    updateDisplay();
    updateCycleCount();
    checkStoredTimer();
});
