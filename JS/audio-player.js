// ========== Initialize when page loads ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 Initializing audio player...');
    initializeAudioPlayer();
});

// ========== Audio Player Initialization ==========
function initializeAudioPlayer() {
    // Get DOM elements
    const audioElement = document.getElementById('audio-element');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const uploadInput = document.getElementById('audio-upload');
    const currentSong = document.getElementById('current-song');
    const progress = document.getElementById('progress');
    const currentTime = document.getElementById('current-time');
    const duration = document.getElementById('duration');

    // Check if audio player elements exist
    if (!audioElement || !playBtn || !uploadInput) {
        console.log('⚠️ Audio player elements not found - skipping initialization');
        return;
    }

    console.log('✅ Audio player elements found');

    let currentAudioURL = null;

    // ========== File Upload Handler ==========
    uploadInput.addEventListener('change', function(event) {
        console.log('📁 File upload triggered');
        
        const file = event.target.files[0];
        if (!file) {
            console.log('❌ No file selected');
            return;
        }

        console.log(`📄 File selected: ${file.name} (${file.type}, ${(file.size/1024/1024).toFixed(2)}MB)`);

        // Validate file
        if (!isValidAudioFile(file)) {
            return;
        }

        // Clean up previous URL
        if (currentAudioURL) {
            URL.revokeObjectURL(currentAudioURL);
        }

        // Create new audio URL
        try {
            currentAudioURL = URL.createObjectURL(file);
            audioElement.src = currentAudioURL;
            
            // Force load the audio
            audioElement.load();
            
            // Update display
            if (currentSong) {
                currentSong.textContent = file.name;
            }
            
            // Update the artist text
            const artistElement = document.querySelector('.artist');
            if (artistElement) {
                artistElement.textContent = 'Ready to play';
            }

            // Enable play button, disable others
            playBtn.disabled = false;
            playBtn.querySelector('span').textContent = '▶️';
            if (pauseBtn) pauseBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = true;

            // Reset progress
            if (progress) {
                progress.style.width = '0%';
            }

            showNotification(`Loaded: ${file.name}`, 'success');
            console.log('✅ Audio file loaded successfully');

        } catch (error) {
            console.error('❌ Error loading file:', error);
            showNotification('Error loading audio file', 'error');
        }
    });

    // ========== Play Button ==========
    playBtn.addEventListener('click', function() {
        console.log('▶️ Play button clicked');

        if (!audioElement.src || audioElement.src === window.location.href) {
            showNotification('Please upload an audio file first!', 'warning');
            return;
        }

        console.log('🎵 Attempting to play audio...');
        console.log('Audio src:', audioElement.src);
        console.log('Ready state:', audioElement.readyState);

        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('✅ Audio playing successfully');
                    playBtn.disabled = true;
                    if (pauseBtn) pauseBtn.disabled = false;
                    if (stopBtn) stopBtn.disabled = false;
                    
                    // Update artist text
                    const artistElement = document.querySelector('.artist');
                    if (artistElement) {
                        artistElement.textContent = 'Now playing';
                    }
                })
                .catch((error) => {
                    console.error('❌ Play failed:', error);
                    console.error('Error name:', error.name);
                    console.error('Error message:', error.message);
                    showNotification(`Play failed: ${error.message}`, 'error');
                });
        }
    });

    // ========== Pause Button ==========
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            console.log('⏸️ Pause button clicked');
            audioElement.pause();
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            
            // Update artist text
            const artistElement = document.querySelector('.artist');
            if (artistElement) {
                artistElement.textContent = 'Paused';
            }
        });
    }

    // ========== Stop Button ==========
    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            console.log('⏹️ Stop button clicked');
            audioElement.pause();
            audioElement.currentTime = 0;
            playBtn.disabled = false;
            if (pauseBtn) pauseBtn.disabled = true;
            stopBtn.disabled = true;
            
            if (progress) {
                progress.style.width = '0%';
            }
            
            // Update time displays
            if (currentTime) {
                currentTime.textContent = '0:00';
            }
            
            // Update artist text
            const artistElement = document.querySelector('.artist');
            if (artistElement) {
                artistElement.textContent = 'Stopped';
            }
        });
    }

    // ========== Progress Bar Click Handler ==========
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.addEventListener('click', function(e) {
            if (!audioElement.duration) return;
            
            const rect = progressBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            audioElement.currentTime = percentage * audioElement.duration;
        });
    }

    // ========== Audio Events ==========
    audioElement.addEventListener('timeupdate', function() {
        if (audioElement.duration && progress) {
            const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
            progress.style.width = progressPercent + '%';
        }

        // Update time displays
        if (currentTime) {
            currentTime.textContent = formatTime(audioElement.currentTime);
        }
        if (duration && audioElement.duration && !isNaN(audioElement.duration)) {
            duration.textContent = formatTime(audioElement.duration);
        }
    });

    audioElement.addEventListener('ended', function() {
        console.log('🏁 Audio playback ended');
        playBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = true;
        
        // Update artist text
        const artistElement = document.querySelector('.artist');
        if (artistElement) {
            artistElement.textContent = 'Finished';
        }
        
        showNotification('Song finished!', 'info');
    });

    audioElement.addEventListener('loadedmetadata', function() {
        console.log('📊 Audio metadata loaded');
        if (audioElement.duration) {
            console.log(`⏱️ Duration: ${formatTime(audioElement.duration)}`);
            if (duration) {
                duration.textContent = formatTime(audioElement.duration);
            }
        }
    });

    audioElement.addEventListener('error', function(e) {
        console.error('❌ Audio error:', e);
        if (audioElement.error) {
            console.error('Error code:', audioElement.error.code);
            console.error('Error message:', audioElement.error.message);
            
            let errorMessage = 'Error playing audio file';
            switch(audioElement.error.code) {
                case 1:
                    errorMessage = 'Audio loading aborted';
                    break;
                case 2:
                    errorMessage = 'Network error while loading audio';
                    break;
                case 3:
                    errorMessage = 'Audio decoding error';
                    break;
                case 4:
                    errorMessage = 'Audio format not supported';
                    break;
            }
            showNotification(errorMessage, 'error');
        }
    });

    audioElement.addEventListener('canplay', function() {
        console.log('✅ Audio can play');
        console.log('Duration:', audioElement.duration);
        console.log('Ready state:', audioElement.readyState);
    });

    // ========== Keyboard Shortcuts ==========
    document.addEventListener('keydown', function(e) {
        // Only if not typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Only if audio is loaded
        if (!audioElement.src || audioElement.src === window.location.href) {
            return;
        }

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (audioElement.paused) {
                    if (!playBtn.disabled) playBtn.click();
                } else {
                    if (pauseBtn && !pauseBtn.disabled) pauseBtn.click();
                }
                break;
            case 'KeyM':
                e.preventDefault();
                audioElement.muted = !audioElement.muted;
                showNotification(audioElement.muted ? 'Muted' : 'Unmuted', 'info');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                audioElement.currentTime = Math.max(0, audioElement.currentTime - 5);
                break;
            case 'ArrowRight':
                e.preventDefault();
                audioElement.currentTime = Math.min(audioElement.duration, audioElement.currentTime + 5);
                break;
            case 'ArrowUp':
                e.preventDefault();
                audioElement.volume = Math.min(1, audioElement.volume + 0.1);
                showNotification(`Volume: ${Math.round(audioElement.volume * 100)}%`, 'info');
                break;
            case 'ArrowDown':
                e.preventDefault();
                audioElement.volume = Math.max(0, audioElement.volume - 0.1);
                showNotification(`Volume: ${Math.round(audioElement.volume * 100)}%`, 'info');
                break;
        }
    });

    console.log('🎉 Audio player initialized successfully');
}

// ========== Utility Functions ==========
function isValidAudioFile(file) {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/x-m4a'];
    const validExtensions = ['mp3', 'wav', 'ogg', 'mp4', 'aac', 'm4a'];
    
    // Check MIME type
    if (validTypes.includes(file.type)) {
        return true;
    }
    
    // Check file extension as fallback
    const extension = file.name.split('.').pop().toLowerCase();
    if (validExtensions.includes(extension)) {
        return true;
    }
    
    showNotification('Please select a valid audio file (MP3, WAV, OGG, MP4, AAC)', 'error');
    return false;
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.audio-notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'audio-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
        background-color: ${getNotificationColor(type)};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

function getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    return colors[type] || colors.info;
}

// ========== Global Debug Function ==========
window.debugAudioPlayer = function() {
    const audio = document.getElementById('audio-element');
    console.log('=== AUDIO PLAYER DEBUG ===');
    console.log('Audio element:', audio);
    console.log('Audio src:', audio ? audio.src : 'N/A');
    console.log('Audio ready state:', audio ? audio.readyState : 'N/A');
    console.log('Audio error:', audio ? audio.error : 'N/A');
    console.log('Audio paused:', audio ? audio.paused : 'N/A');
    console.log('Audio duration:', audio ? audio.duration : 'N/A');
    console.log('Audio current time:', audio ? audio.currentTime : 'N/A');
    console.log('Can play type MP3:', audio ? audio.canPlayType('audio/mpeg') : 'N/A');
};