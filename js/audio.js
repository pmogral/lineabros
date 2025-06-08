class AudioManager {
    constructor() {
        this.backgroundMusic = new Audio('audio/audiobackground.mp3');
        this.efrogsMusic = new Audio('audio/audioaudio-efrogs.mp3');
        this.lineaKangMusic = new Audio('audio/lineakangmusic.mp3');
        this.isMuted = false;
        this.audioInitialized = false;
        this.currentMusic = null;

        // Add error handling
        this.backgroundMusic.addEventListener('error', (e) => {
            console.error('Error loading background music:', e);
        });
        this.efrogsMusic.addEventListener('error', (e) => {
            console.error('Error loading E-Frogs music:', e);
        });
        this.lineaKangMusic.addEventListener('error', (e) => {
            console.error('Error loading Linea Kang music:', e);
        });

        // Add load event listeners (removed console logs to prevent spam)
        this.backgroundMusic.addEventListener('canplaythrough', () => {
            // Audio loaded and ready
        });
        this.efrogsMusic.addEventListener('canplaythrough', () => {
            // Audio loaded and ready
        });
        this.lineaKangMusic.addEventListener('canplaythrough', () => {
            // Audio loaded and ready
        });
    }

    initializeAudio() {
        if (this.audioInitialized) return;

        // Set up audio properties
        this.backgroundMusic.loop = true;
        this.efrogsMusic.loop = true;
        this.lineaKangMusic.loop = true;

        // Set initial volume
        this.backgroundMusic.volume = 0.5;
        this.efrogsMusic.volume = 0.5;
        this.lineaKangMusic.volume = 0.5;

        this.audioInitialized = true;
        // Audio system initialized
    }

    async playBackgroundMusic(characterIndex) {
        if (!this.audioInitialized) return;

        try {
            // Stop all other music
            await this.stopAllMusic();

            if (characterIndex === 0) { // Linea Kang character
                this.lineaKangMusic.currentTime = 0;
                await this.lineaKangMusic.play();
                this.currentMusic = this.lineaKangMusic;
            } else if (characterIndex === 2) { // E-Frogs character
                this.efrogsMusic.currentTime = 0;
                await this.efrogsMusic.play();
                this.currentMusic = this.efrogsMusic;
            } else {
                this.backgroundMusic.currentTime = 0;
                await this.backgroundMusic.play();
                this.currentMusic = this.backgroundMusic;
            }
        } catch (error) {
            // Silently handle autoplay prevention
            if (error.name === 'NotAllowedError') {
                return;
            }
            console.log('Error playing background music:', error);
        }
    }

    async stopAllMusic() {
        try {
            await this.backgroundMusic.pause();
            await this.efrogsMusic.pause();
            await this.lineaKangMusic.pause();
            this.currentMusic = null;
        } catch (error) {
            // Silently handle any stop errors
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const volume = this.isMuted ? 0 : 0.5;
        
        this.backgroundMusic.volume = volume;
        this.efrogsMusic.volume = volume;
        this.lineaKangMusic.volume = volume;
    }
}

// Make AudioManager available globally
window.AudioManager = AudioManager; 
