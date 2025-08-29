/**
 * AudioManager - Centralized audio management singleton
 * Handles all game audio including music, sound effects, and UI sounds
 */
export default class AudioManager {
    static instance = null;

    constructor() {
        if (AudioManager.instance) {
            return AudioManager.instance;
        }

        AudioManager.instance = this;
        
        // Audio categories with individual volume controls
        this.volumes = {
            master: 1.0,
            music: 0.7,
            sfx: 0.8,
            ui: 0.6
        };

        // Audio storage
        this.sounds = new Map();
        this.currentMusic = null;
        this.musicFadeTime = 1000;
        
        // State
        this.muted = false;
        this.initialized = false;
        
        // Load saved settings
        this.loadSettings();
    }

    static getInstance() {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    /**
     * Initialize the audio system with a Phaser scene
     */
    init(scene) {
        this.scene = scene;
        this.initialized = true;
        
        // Apply user settings
        this.applyVolumeSettings();
        
        console.log('AudioManager initialized');
    }

    /**
     * Preload all audio assets
     */
    preloadAudio(scene) {
        // Background Music
        scene.load.audio('menu-music', [
            'assets/audio/music/menu-theme.ogg',
            'assets/audio/music/menu-theme.mp3'
        ]);
        
        scene.load.audio('game-music', [
            'assets/audio/music/game-theme.ogg', 
            'assets/audio/music/game-theme.mp3'
        ]);

        // Sound Effects
        scene.load.audio('gem-select', [
            'assets/audio/sfx/gem-select.ogg',
            'assets/audio/sfx/gem-select.mp3'
        ]);
        
        scene.load.audio('gem-swap', [
            'assets/audio/sfx/gem-swap.ogg',
            'assets/audio/sfx/gem-swap.mp3'
        ]);
        
        scene.load.audio('match-3', [
            'assets/audio/sfx/match-3.ogg',
            'assets/audio/sfx/match-3.mp3'
        ]);
        
        scene.load.audio('match-4', [
            'assets/audio/sfx/match-4.ogg',
            'assets/audio/sfx/match-4.mp3'
        ]);
        
        scene.load.audio('match-5', [
            'assets/audio/sfx/match-5.ogg',
            'assets/audio/sfx/match-5.mp3'
        ]);
        
        scene.load.audio('cascade', [
            'assets/audio/sfx/cascade.ogg',
            'assets/audio/sfx/cascade.mp3'
        ]);
        
        scene.load.audio('achievement', [
            'assets/audio/sfx/achievement.ogg',
            'assets/audio/sfx/achievement.mp3'
        ]);
        
        scene.load.audio('power-up', [
            'assets/audio/sfx/power-up.ogg',
            'assets/audio/sfx/power-up.mp3'
        ]);
        
        scene.load.audio('level-complete', [
            'assets/audio/sfx/level-complete.ogg',
            'assets/audio/sfx/level-complete.mp3'
        ]);
        
        scene.load.audio('game-over', [
            'assets/audio/sfx/game-over.ogg',
            'assets/audio/sfx/game-over.mp3'
        ]);

        // UI Sounds
        scene.load.audio('button-hover', [
            'assets/audio/ui/button-hover.ogg',
            'assets/audio/ui/button-hover.mp3'
        ]);
        
        scene.load.audio('button-click', [
            'assets/audio/ui/button-click.ogg',
            'assets/audio/ui/button-click.mp3'
        ]);
        
        scene.load.audio('menu-transition', [
            'assets/audio/ui/menu-transition.ogg',
            'assets/audio/ui/menu-transition.mp3'
        ]);
    }

    /**
     * Create all sound objects after preloading
     */
    createSounds(scene) {
        const soundKeys = [
            // Music
            'menu-music', 'game-music',
            // SFX
            'gem-select', 'gem-swap', 'match-3', 'match-4', 'match-5',
            'cascade', 'achievement', 'power-up', 'level-complete', 'game-over',
            // UI
            'button-hover', 'button-click', 'menu-transition'
        ];

        soundKeys.forEach(key => {
            try {
                const sound = scene.sound.add(key, {
                    volume: this.getVolumeForSound(key)
                });
                this.sounds.set(key, sound);
            } catch (error) {
                console.warn(`Failed to create sound: ${key}`, error);
            }
        });

        console.log(`Created ${this.sounds.size} sound objects`);
    }

    /**
     * Play a sound effect
     */
    playSFX(key, config = {}) {
        if (!this.initialized || this.muted) return;
        
        const sound = this.sounds.get(key);
        if (!sound) {
            console.warn(`Sound not found: ${key}`);
            return;
        }

        const volume = (config.volume || 1) * this.volumes.sfx * this.volumes.master;
        
        try {
            sound.play({
                volume,
                rate: config.rate || 1,
                detune: config.detune || 0,
                seek: config.seek || 0,
                delay: config.delay || 0
            });
        } catch (error) {
            console.warn(`Failed to play sound: ${key}`, error);
        }
    }

    /**
     * Play UI sound
     */
    playUI(key, config = {}) {
        if (!this.initialized || this.muted) return;
        
        const sound = this.sounds.get(key);
        if (!sound) return;

        const volume = (config.volume || 1) * this.volumes.ui * this.volumes.master;
        
        try {
            sound.play({ ...config, volume });
        } catch (error) {
            console.warn(`Failed to play UI sound: ${key}`, error);
        }
    }

    /**
     * Play or switch background music
     */
    playMusic(key, config = {}) {
        if (!this.initialized) return;

        const newMusic = this.sounds.get(key);
        if (!newMusic) {
            console.warn(`Music not found: ${key}`);
            return;
        }

        // Fade out current music
        if (this.currentMusic && this.currentMusic.isPlaying) {
            this.fadeOutMusic(this.currentMusic, this.musicFadeTime);
        }

        // Fade in new music
        this.currentMusic = newMusic;
        
        if (!this.muted) {
            this.fadeInMusic(newMusic, config);
        }
    }

    /**
     * Stop current music
     */
    stopMusic() {
        if (this.currentMusic) {
            this.fadeOutMusic(this.currentMusic, this.musicFadeTime / 2);
            this.currentMusic = null;
        }
    }

    /**
     * Fade in music
     */
    fadeInMusic(music, config = {}) {
        const targetVolume = (config.volume || 1) * this.volumes.music * this.volumes.master;
        
        music.play({
            volume: 0,
            loop: config.loop !== false, // Default to loop
            rate: config.rate || 1
        });

        if (this.scene) {
            this.scene.tweens.add({
                targets: music,
                volume: targetVolume,
                duration: this.musicFadeTime,
                ease: 'Linear'
            });
        }
    }

    /**
     * Fade out music
     */
    fadeOutMusic(music, duration = 1000) {
        if (!music || !music.isPlaying) return;

        if (this.scene) {
            this.scene.tweens.add({
                targets: music,
                volume: 0,
                duration: duration,
                ease: 'Linear',
                onComplete: () => {
                    music.stop();
                }
            });
        } else {
            music.stop();
        }
    }

    /**
     * Get appropriate volume for a sound based on its category
     */
    getVolumeForSound(key) {
        if (key.includes('music')) {
            return this.volumes.music * this.volumes.master;
        } else if (key.includes('button') || key.includes('menu') || key.includes('ui')) {
            return this.volumes.ui * this.volumes.master;
        } else {
            return this.volumes.sfx * this.volumes.master;
        }
    }

    /**
     * Set volume for a category
     */
    setVolume(category, value) {
        this.volumes[category] = Math.max(0, Math.min(1, value));
        this.applyVolumeSettings();
        this.saveSettings();
    }

    /**
     * Get volume for a category
     */
    getVolume(category) {
        return this.volumes[category] || 0;
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.muted = !this.muted;
        
        if (this.muted) {
            if (this.currentMusic) {
                this.currentMusic.pause();
            }
        } else {
            if (this.currentMusic) {
                this.currentMusic.resume();
            }
        }
        
        this.saveSettings();
        return this.muted;
    }

    /**
     * Apply volume settings to all sounds
     */
    applyVolumeSettings() {
        this.sounds.forEach((sound, key) => {
            if (sound && !sound.isPlaying) {
                sound.setVolume(this.getVolumeForSound(key));
            }
        });

        // Apply to current music
        if (this.currentMusic && !this.muted) {
            this.currentMusic.setVolume(this.volumes.music * this.volumes.master);
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        const settings = {
            volumes: this.volumes,
            muted: this.muted
        };
        localStorage.setItem('gemstone-cascade-audio', JSON.stringify(settings));
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('gemstone-cascade-audio');
            if (saved) {
                const settings = JSON.parse(saved);
                this.volumes = { ...this.volumes, ...settings.volumes };
                this.muted = settings.muted || false;
            }
        } catch (error) {
            console.warn('Failed to load audio settings', error);
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.stopMusic();
        this.sounds.forEach(sound => {
            if (sound) {
                sound.destroy();
            }
        });
        this.sounds.clear();
        this.initialized = false;
    }

    // Convenience methods for common sounds
    playGemSelect() { this.playSFX('gem-select'); }
    playGemSwap() { this.playSFX('gem-swap'); }
    playMatch(gemCount) {
        const soundKey = gemCount >= 5 ? 'match-5' : gemCount === 4 ? 'match-4' : 'match-3';
        this.playSFX(soundKey);
    }
    playCascade() { this.playSFX('cascade'); }
    playAchievement() { this.playSFX('achievement'); }
    playPowerUp() { this.playSFX('power-up'); }
    playLevelComplete() { this.playSFX('level-complete'); }
    playGameOver() { this.playSFX('game-over'); }
    playButtonHover() { this.playUI('button-hover'); }
    playButtonClick() { this.playUI('button-click'); }
    playMenuTransition() { this.playUI('menu-transition'); }
}