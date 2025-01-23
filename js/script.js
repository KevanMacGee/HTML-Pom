document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer');
    const statusDisplay = document.getElementById('status');
    const toggleBtn = document.getElementById('toggleBtn');
    const resetBtn = document.getElementById('resetBtn');

    const WORK_TIME = 45 * 60; // 45 minutes in seconds
    const BREAK_TIME = 15 * 60; // 15 minutes in seconds

    let timeLeft = WORK_TIME;
    let isRunning = false;
    let isWorkTime = true;
    let timer = null;

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
            timer = setInterval(() => {
                timeLeft--;
                if (timeLeft < 0) {
                    isWorkTime = !isWorkTime;
                    timeLeft = isWorkTime ? WORK_TIME : BREAK_TIME;
                    updateStatus();
                    new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVK/n77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoODlGt5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQcZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaRw0PVK/n77BdGAg+ltrzxnUoBSh+zPLaizsIGGS57OihUBELTKXh8bllHgU1jdT0z3wvBSJ1xe/glEILElyx6OyrWRUIRJve8sFuJAUug8/z1oU2Bhxqvu7mnEoPDlGt5O+zYRoGPJPY88p3KgUme8rx3I4+CRVht+rqpVMSC0mi4PK8aiAFM4nT89GAMQYfccPu45ZFDBFYr+ftrVwWCECY3PLEcSYGK4DN8tiIOQcZZ7zs559OEAxPqOPwtmQcBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hWFApGnt/yv2wiBTCG0fPTgzQHHG/A7eSaSA0PVK/n77BdGAg+ltvyxnUoBSh9y/LaizsIGGS57OihUhEKTKXh8blmHgU1jdTy0HwvBSF1xe/glEQKElux6OyrWRUIRJzd8sFuJAUug8/z1oU2Bhxqvu7mnEoPDlGt5O+zYRoGPJLZ88p3KgUmfMrx3I4+CRVht+rqpVMSC0mi4PK8aiAFM4nT89GAMQYfccPu45ZFDBFYr+ftrVwWCECY3PLEcSYGK4DN8tiIOQcZZ7zs559OEAxPqOPwtmQcBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hWFApGnt/yv2wiBTCG0fPTgzQHHG/A7eSaSA0PVK/n77BdGAg+ltvyxnUoBSh9y/LaizsIGGS57OihUhEKTKXh8blmHgU1jdTy0HwvBSF1xe/glEQKElux6OyrWRUIRJzd8sFuJAUug8/z1oU2Bhxqvu7mnEoPDlGt5O+zYRoGPJLZ88p3KgUmfMrx3I4+CRVht+rqpVMSC0mi4PK8aiAFM4nT89GAMQYfccPu45ZFDBFYr+ftrVwWCECY3PLEcSYGK4DN8tiIOQcZZ7zs559OEAxPqOPwtmQcBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hWFApGnt/yv2wiBTCG0fPTgzQHHG/A7eSaSA0PVK/n77BdGAg+ltvyxnUoBSh9y/LaizsIGGS57OihUhEKTKXh8blmHgU1jdTy0HwvBSF1xe/glEQKElux6OyrWRUIRJzd8sFuJAUtg8/z1oU2BhxpvuA=').play();
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

    toggleBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);
    updateDisplay();
});
