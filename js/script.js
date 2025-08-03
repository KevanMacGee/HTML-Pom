document.addEventListener('DOMContentLoaded', () => {
    // Request audio permission through user interaction
    document.addEventListener('click', function initAudio() {
        const audio = new Audio();
        audio.play().catch(() => {});
        document.removeEventListener('click', initAudio);
    }, { once: true });

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
    let timerInterval = null;  // Add this line

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
    const workSound = createAudioElement('sounds/work-start.mp3', 'sounds/work-start.ogg');
    const breakSound = createAudioElement('sounds/break-start.mp3', 'sounds/break-start.ogg');
    const longBreakSound = createAudioElement('sounds/long-break-start.mp3', 'sounds/long-break-start.ogg');

    // Add these constants at the top with other constants
    const STORAGE_KEYS = {
        END_TIME: 'pomodoroEndTime',
        CURRENT_MODE: 'pomodoroCurrentMode',
        CYCLES: 'pomodoroCycles',
        IS_LONG_BREAK: 'pomodoroIsLongBreak',
        TARGET_CYCLES: 'pomodoroTargetCycles'
    };

    let lastRealTime = null;
    let lastVisibleTime = Date.now();
    let wasRunning = false;

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateStatus() {
        // Update text content
        let statusText = isWorkTime ? 'Work Time' : (isLongBreak ? 'Long Break' : 'Break Time');
        if (!isRunning) {
            statusText += ' (Paused)';
        }
        statusDisplay.textContent = statusText;

        // Update CSS classes using classList for better maintainability
        statusDisplay.className = 'status-text'; // Reset to base class

        if (isWorkTime) {
            statusDisplay.classList.add('text-success');
        } else {
            statusDisplay.classList.add('text-primary');
        }

        if (isRunning) {
            statusDisplay.classList.add('pulse-animation');
        }
    }

    function updateCycleCount() {
        cycleDisplay.textContent = `Pomodoros completed: ${cyclesCompleted}${targetCycles ? ` / ${targetCycles}` : ''}`;
    }

    // Replace the updateTimer function with this improved version
    function updateTimer() {
        if (!isRunning) return;

        const currentTime = Date.now();
        if (lastRealTime === null) {
            lastRealTime = currentTime;
            return;
        }

        // Calculate actual elapsed time
        const realElapsed = Math.floor((currentTime - lastRealTime) / 1000);
        lastRealTime = currentTime;

        if (realElapsed > 0) {
            // Update timeLeft considering actual elapsed time
            timeLeft = Math.max(0, timeLeft - realElapsed);
            updateDisplay();

            // Handle timer completion
            if (timeLeft === 0) {
                handleTimerCompletion();
                lastRealTime = null; // Reset for next cycle
            }
        }
    }

    // Update the handleTimerCompletion function to use the simpler audio
    function handleTimerCompletion() {
        if (isWorkTime) {
            isWorkTime = false;
            isWorkComplete = true;

            if ((cyclesCompleted + 1) % CYCLES_BEFORE_LONG_BREAK === 0) {
                isLongBreak = true;
                timeLeft = LONG_BREAK_TIME;
                playSound(longBreakSound); // Already using playSound helper ✓
            } else {
                isLongBreak = false;
                timeLeft = BREAK_TIME;
                playSound(breakSound); // Already using playSound helper ✓
            }
        } else {
            if (isWorkComplete) {
                cyclesCompleted++;
                updateCycleCount();
                checkCycleTarget();
            }
            isWorkTime = true;
            isWorkComplete = false;
            timeLeft = WORK_TIME;
            playSound(workSound); // Already using playSound helper ✓
        }
        updateStatus();
    }

    // Update toggleTimer to initialize lastRealTime
    function toggleTimer() {
        if (isRunning) {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            isRunning = false;
            lastRealTime = null;
            safeRemoveItem(STORAGE_KEYS.END_TIME);
            toggleBtn.textContent = 'Start';
            toggleBtn.className = 'btn btn-primary btn-lg';
        } else {
            isRunning = true;
            lastRealTime = Date.now();
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            timerInterval = setInterval(updateTimer, 1000);
            saveTimerState();

            // Play appropriate sound
            if (isWorkTime) {
                playSound(workSound);
            } else if (isLongBreak) {
                playSound(longBreakSound);
            } else {
                playSound(breakSound);
            }

            toggleBtn.textContent = 'Pause';
            toggleBtn.className = 'btn btn-warning btn-lg';
        }
        updateStatus();
    }

    function resetTimer() {
        // Clear interval and reset running state
        clearInterval(timerInterval);
        isRunning = false;
        lastRealTime = null;

        // Reset timer state
        isWorkTime = true;
        isWorkComplete = false;
        isLongBreak = false;
        timeLeft = WORK_TIME;
        cyclesCompleted = 0;

        // Clean up all timer-related localStorage items
        safeRemoveItem(STORAGE_KEYS.END_TIME);
        safeRemoveItem(STORAGE_KEYS.CURRENT_MODE);
        safeRemoveItem(STORAGE_KEYS.CYCLES);
        safeRemoveItem(STORAGE_KEYS.IS_LONG_BREAK);

        // Reset UI elements
        toggleBtn.textContent = 'Start';
        toggleBtn.className = 'btn btn-primary btn-lg';

        // Update displays
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
        try {
            const workDuration = parseFloat(workDurationInput.value);
            const breakDuration = parseFloat(breakDurationInput.value);
            const longBreakDuration = parseFloat(longBreakDurationInput.value);
            const cycles = parseInt(cycleTargetInput.value, 10);

            if (workDuration && breakDuration && longBreakDuration && cycles) {
                safeSetItem('workDuration', workDuration.toString());
                safeSetItem('breakDuration', breakDuration.toString());
                safeSetItem('longBreakDuration', longBreakDuration.toString());
                safeSetItem('targetCycles', cycles.toString());

                WORK_TIME = Math.floor(workDuration * 60);
                BREAK_TIME = Math.floor(breakDuration * 60);
                LONG_BREAK_TIME = Math.floor(longBreakDuration * 60);
                targetCycles = cycles;

                if (!isRunning) {
                    timeLeft = WORK_TIME;
                    updateDisplay();
                }
            }
        } catch (error) {
            console.warn('Error saving settings:', error);
        }
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
        try {
            const storedEndTime = safeGetItem(STORAGE_KEYS.END_TIME);
            if (!storedEndTime) return false;

            const now = Date.now();
            const endTime = parseInt(storedEndTime, 10);

            if (now >= endTime) {
                // Selectively remove timer-related items only
                safeRemoveItem(STORAGE_KEYS.END_TIME);
                safeRemoveItem(STORAGE_KEYS.CURRENT_MODE);
                return false;
            }

            const remainingTime = Math.ceil((endTime - now) / 1000);
            timeLeft = remainingTime;

            const storedMode = safeGetItem(STORAGE_KEYS.CURRENT_MODE);
            if (storedMode) {
                isWorkTime = storedMode === 'work';
            }

            const storedCycles = safeGetItem(STORAGE_KEYS.CYCLES);
            if (storedCycles) {
                cyclesCompleted = parseInt(storedCycles, 10);
            }

            const storedIsLongBreak = safeGetItem(STORAGE_KEYS.IS_LONG_BREAK);
            if (storedIsLongBreak) {
                isLongBreak = storedIsLongBreak === 'true';
            }

            return true;
        } catch (error) {
            console.warn('Error checking stored timer:', error);
            return false;
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

    // Add visibility change handler that uses the same logic
    document.addEventListener('visibilitychange', () => {
        if (!isRunning) return;

        if (document.hidden) {
            // Store the time when tab becomes hidden
            lastVisibleTime = Date.now();
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;  // Add this
            }
        } else {
            // Calculate elapsed time and update timer state
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - lastVisibleTime) / 1000);

            // Update timeLeft
            timeLeft = Math.max(0, timeLeft - elapsedSeconds);
            updateDisplay();

            // Clear any existing interval just in case
            if (timerInterval) {
                clearInterval(timerInterval);
            }

            // If timer completed while hidden, handle it
            if (timeLeft === 0) {
                handleTimerCompletion();
                lastRealTime = null;
            }

            // Always restart the interval if we're still running
            if (isRunning) {
                lastRealTime = now;
                timerInterval = setInterval(updateTimer, 1000);
            }
        }
    });
});

// Replace the createAudioElement function with this simpler version
function createAudioElement(mp3Path, oggPath) {
    const audio = new Audio();

    // Add sources
    const mp3Source = document.createElement('source');
    const oggSource = document.createElement('source');

    mp3Source.src = mp3Path;
    mp3Source.type = 'audio/mpeg';
    oggSource.src = oggPath;
    oggSource.type = 'audio/ogg';

    audio.appendChild(mp3Source);
    audio.appendChild(oggSource);
    audio.load(); // Preload the audio

    return audio;
}

// Replace the playSound function with this simpler version
function playSound(audio) {
    if (audio) {
        audio.currentTime = 0;
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Audio playback failed:', error);
            });
        }
    }
}

// Add these helper functions for localStorage management
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn(`Failed to save to localStorage: ${error.message}`);
    }
}

function safeGetItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item !== null ? item : defaultValue;
    } catch (error) {
        console.warn(`Failed to read from localStorage: ${error.message}`);
        return defaultValue;
    }
}

function safeRemoveItem(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn(`Failed to remove from localStorage: ${error.message}`);
    }
}
