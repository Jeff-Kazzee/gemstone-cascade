import Phaser from 'phaser';
import MainMenu from './scenes/MainMenu.js';
import GameBoard from './scenes/GameBoard.js';
import GameOver from './scenes/GameOver.js';

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0A0A1A',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MainMenu, GameBoard, GameOver],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Hide loading text when game starts
window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
    
    // Remove loading text once first scene is ready
    game.events.once('ready', () => {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    });
});

export default config;