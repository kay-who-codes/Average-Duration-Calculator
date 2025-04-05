document.addEventListener('DOMContentLoaded', () => {
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const addBtn = document.getElementById('add-btn');
    const durationsContainer = document.getElementById('durations-container');
    const noDurationsMsg = document.getElementById('no-durations');
    
    // Results elements
    const meanResult = document.getElementById('mean-result');
    const medianResult = document.getElementById('median-result');
    const modeResult = document.getElementById('mode-result');
    const avgDeviationResult = document.getElementById('avg-deviation-result');
    const longestDeviationResult = document.getElementById('longest-deviation-result');
    const shortestDeviationResult = document.getElementById('shortest-deviation-result');
    const totalResult = document.getElementById('total-result');
    const countResult = document.getElementById('count-result');

    let durations = [];

    // Load durations from localStorage if available
    if (localStorage.getItem('durations')) {
        durations = JSON.parse(localStorage.getItem('durations'));
        renderDurations();
        calculateStatistics();
    }

    addBtn.addEventListener('click', addDuration);

    // Add duration when Enter key is pressed in any input
    [hoursInput, minutesInput, secondsInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addDuration();
            }
        });
    });

    function addDuration() {
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;

        // Validate minutes and seconds
        if (minutes > 59 || seconds > 59) {
            alert('Minutes and seconds must be less than 60');
            return;
        }

        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        if (totalSeconds === 0) {
            alert('Please enter a duration greater than 0');
            return;
        }

        durations.push(totalSeconds);
        saveDurations();
        renderDurations();
        calculateStatistics();
        
        // Reset inputs
        hoursInput.value = '';
        minutesInput.value = '';
        secondsInput.value = '';
        hoursInput.focus();
    }

    function renderDurations() {
        durationsContainer.innerHTML = '';
        
        if (durations.length === 0) {
            noDurationsMsg.style.display = 'block';
            return;
        }
        
        noDurationsMsg.style.display = 'none';
        
        durations.forEach((duration, index) => {
            const durationElement = document.createElement('div');
            durationElement.className = 'duration-chip';
            
            const durationText = document.createElement('span');
            durationText.textContent = formatDuration(duration);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-duration';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', () => removeDuration(index));
            
            durationElement.appendChild(durationText);
            durationElement.appendChild(removeBtn);
            durationsContainer.appendChild(durationElement);
        });
    }

    function removeDuration(index) {
        durations.splice(index, 1);
        saveDurations();
        renderDurations();
        calculateStatistics();
    }

    function saveDurations() {
        localStorage.setItem('durations', JSON.stringify(durations));
    }

    function calculateStatistics() {
        if (durations.length === 0) {
            resetResults();
            return;
        }
        
        // Sort durations for calculations
        const sortedDurations = [...durations].sort((a, b) => a - b);
        
        // Basic calculations
        const count = durations.length;
        const total = sortedDurations.reduce((sum, duration) => sum + duration, 0);
        
        // Averages
        const mean = total / count;
        const median = calculateMedian(sortedDurations);
        const mode = calculateMode(sortedDurations);
        
        // Deviations
        const avgDeviation = calculateAverageDeviation(sortedDurations, mean);
        const longestDeviation = sortedDurations[sortedDurations.length - 1] - sortedDurations[0];
        const shortestDeviation = calculateShortestDeviation(sortedDurations);
        
        // Update UI
        meanResult.textContent = formatDuration(mean);
        medianResult.textContent = formatDuration(median);
        modeResult.textContent = mode ? formatDuration(mode) : 'No mode';
        avgDeviationResult.textContent = formatDuration(avgDeviation);
        longestDeviationResult.textContent = formatDuration(longestDeviation);
        shortestDeviationResult.textContent = formatDuration(shortestDeviation);
        totalResult.textContent = formatDuration(total);
        countResult.textContent = count;
    }

    function resetResults() {
        meanResult.textContent = '--';
        medianResult.textContent = '--';
        modeResult.textContent = '--';
        avgDeviationResult.textContent = '--';
        longestDeviationResult.textContent = '--';
        shortestDeviationResult.textContent = '--';
        totalResult.textContent = '--';
        countResult.textContent = '0';
    }

    function calculateMedian(sortedDurations) {
        const middle = Math.floor(sortedDurations.length / 2);
        
        if (sortedDurations.length % 2 === 0) {
            return (sortedDurations[middle - 1] + sortedDurations[middle]) / 2;
        } else {
            return sortedDurations[middle];
        }
    }

    function calculateMode(sortedDurations) {
        const frequencyMap = {};
        let maxFrequency = 0;
        let modes = [];
        
        sortedDurations.forEach(duration => {
            frequencyMap[duration] = (frequencyMap[duration] || 0) + 1;
            
            if (frequencyMap[duration] > maxFrequency) {
                maxFrequency = frequencyMap[duration];
                modes = [duration];
            } else if (frequencyMap[duration] === maxFrequency) {
                modes.push(duration);
            }
        });
        
        // Return null if all values are unique or if there are multiple modes
        return maxFrequency > 1 && modes.length === 1 ? modes[0] : null;
    }

    function calculateAverageDeviation(sortedDurations, mean) {
        const totalDeviation = sortedDurations.reduce((sum, duration) => {
            return sum + Math.abs(duration - mean);
        }, 0);
        
        return totalDeviation / sortedDurations.length;
    }

    function calculateShortestDeviation(sortedDurations) {
        if (sortedDurations.length < 2) return 0;
        
        let shortest = Infinity;
        
        for (let i = 1; i < sortedDurations.length; i++) {
            const deviation = sortedDurations[i] - sortedDurations[i - 1];
            if (deviation < shortest) {
                shortest = deviation;
            }
        }
        
        return shortest;
    }

    function formatDuration(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        
        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);
        
        return parts.join(' ');
    }
});