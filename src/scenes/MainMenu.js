import Phaser from 'phaser';

export default class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
        const { width, height } = this.scale;

        // Title
        const title = this.add.text(width / 2, height / 3, 'GEMSTONE CASCADE', {
            fontSize: '48px',
            fontFamily: 'Poppins',
            fontWeight: '700',
            color: '#00FFFF',
            stroke: '#FF00FF',
            strokeThickness: 2
        });
        title.setOrigin(0.5);

        // Add glow effect to title
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });

        // Start button
        const startButton = this.add.rectangle(width / 2, height / 2, 200, 60, 0x00FFFF, 0.8);
        const startText = this.add.text(width / 2, height / 2, 'START GAME', {
            fontSize: '24px',
            fontFamily: 'Poppins',
            fontWeight: '600',
            color: '#0A0A1A'
        });
        startText.setOrigin(0.5);

        // Make button interactive
        startButton.setInteractive({ useHandCursor: true });
        
        // Button hover effects
        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x00FFFF, 1);
            this.tweens.add({
                targets: startButton,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x00FFFF, 0.8);
            this.tweens.add({
                targets: startButton,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        startButton.on('pointerdown', () => {
            this.scene.start('GameBoard');
        });

        // High score display
        const highScore = this.getHighScore();
        if (highScore > 0) {
            this.add.text(width / 2, height * 0.75, `High Score: ${highScore}`, {
                fontSize: '20px',
                fontFamily: 'Poppins',
                color: '#FF00FF'
            }).setOrigin(0.5);
        }

        // Achievements button
        const achievementsButton = this.add.rectangle(width / 2, height * 0.65, 200, 50, 0xFF00FF, 0.6);
        const achievementsText = this.add.text(width / 2, height * 0.65, 'ACHIEVEMENTS', {
            fontSize: '18px',
            fontFamily: 'Poppins',
            color: '#FFFFFF'
        });
        achievementsText.setOrigin(0.5);

        achievementsButton.setInteractive({ useHandCursor: true });
        
        achievementsButton.on('pointerover', () => {
            achievementsButton.setFillStyle(0xFF00FF, 0.8);
        });

        achievementsButton.on('pointerout', () => {
            achievementsButton.setFillStyle(0xFF00FF, 0.6);
        });

        // Add particles for background effect
        this.createBackgroundParticles();
    }

    getHighScore() {
        const saved = localStorage.getItem('gemstone-cascade-highscore');
        return saved ? parseInt(saved) : 0;
    }

    createBackgroundParticles() {
        // Create simple particle effect using shapes
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, this.scale.width),
                Phaser.Math.Between(0, this.scale.height),
                Phaser.Math.Between(1, 3),
                Phaser.Math.RND.pick([0x00FFFF, 0xFF00FF]),
                0.3
            );

            this.tweens.add({
                targets: particle,
                y: '-=600',
                duration: Phaser.Math.Between(10000, 20000),
                repeat: -1,
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, this.scale.width);
                    particle.y = this.scale.height + 10;
                }
            });
        }
    }
}