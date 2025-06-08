class Game {
    constructor() {
        console.log('Game constructor started');
        this.canvas = document.getElementById('gameCanvas');
        console.log('Canvas element:', this.canvas);
        this.ctx = this.canvas.getContext('2d');
        console.log('Canvas context:', this.ctx);
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
        console.log('Canvas dimensions set:', this.canvas.width, this.canvas.height);
        
        // Initialize loading screen elements
        this.loadingScreen = document.getElementById('loadingScreen');
        this.progressBar = document.querySelector('.progress');
        this.loadingText = document.querySelector('.loading-text');
        
        // Initialize audio manager
        this.audioManager = new AudioManager();
        
        this.currentLevel = 1;
        this.score = 0;
        this.keys = {};
        this.bossDefeated = false;
        this.gameState = 'loading'; // Start with loading state
        this.lastGameState = null; // Track last game state to prevent console spam
        this.lastDamageTime = 0;
        this.damageCooldown = 1000;
        this.selectedCharacter = 0;
        this.powerUps = [];
        this.platforms = []; // Initialize empty platforms array
        this.player = null; // Initialize player as null
        this.enemies = []; // Initialize enemies array

        // Wallet integration properties
        this.walletConnected = false;
        this.userAddress = null;
        this.transactionCount = 0;

        // Load all assets
        this.loadAssets().then(() => {
            console.log('Assets loaded successfully');
        });

        // Listen for wallet connection event
        window.addEventListener('walletConnected', (event) => {
            this.handleWalletConnected(event.detail);
        });

        this.setupEventListeners();
        this.gameLoop();
        this.gameOverAnimY = null;
        this.gameOverAnimStart = null;
    }
    
    async loadAssets() {
        // Count total assets correctly
        const totalAssets = 17; // Updated count: 3 enemy images + 4 character images + 1 Linea Kang selection image + 4 background images + 2 screen images + 1 logo + 1 snowball + 1 fireball
        let loadedAssets = 0;

        const updateProgress = () => {
            loadedAssets++;
            const progress = Math.min((loadedAssets / totalAssets) * 100, 100); // Cap at 100%
            this.progressBar.style.width = `${progress}%`;
            this.loadingText.textContent = `Loading... ${Math.round(progress)}%`;
            
            // If all assets are loaded, hide loading screen and show wallet screen
            if (loadedAssets === totalAssets) {
                setTimeout(() => {
                    // Hide loading screen
                    if (this.loadingScreen) {
                        this.loadingScreen.style.display = 'none';
                        this.loadingScreen.style.visibility = 'hidden';
                    }
                    
                    // Show wallet screen if not connected, otherwise go to character select
                    if (!this.walletConnected) {
                        const walletScreen = document.getElementById('walletScreen');
                        if (walletScreen) {
                            walletScreen.style.display = 'flex';
                        }
                    } else {
                        this.gameState = 'characterSelect';
                    }
                    // Don't auto-play music - wait for user interaction
                }, 500); // Add a small delay for smooth transition
            }
        };

        // Load enemy images
        this.enemyImage = new Image();
        this.enemyImageLoaded = false;
        this.enemyImage.onload = () => { this.enemyImageLoaded = true; updateProgress(); };
        this.enemyImage.src = 'images/enemy-eth-fud.webp';

        // Load ethfud2 image for levels 11-20
        this.enemyImage2 = new Image();
        this.enemyImage2Loaded = false;
        this.enemyImage2.onload = () => { this.enemyImage2Loaded = true; updateProgress(); };
        this.enemyImage2.src = 'images/ethfud2.webp';

        // Load ethfud3 image for levels 21-30
        this.enemyImage3 = new Image();
        this.enemyImage3Loaded = false;
        this.enemyImage3.onload = () => { this.enemyImage3Loaded = true; updateProgress(); };
        this.enemyImage3.src = 'images/ethfud3.webp';

        // Preload boss image
        this.bossImage = new Image();
        this.bossImageLoaded = false;
        this.bossImage.onload = () => { this.bossImageLoaded = true; updateProgress(); };
        this.bossImage.src = 'images/bosslar.webp';

        this.characterImages = [
            { 
                name: 'Linea Kang', 
                src: 'images/imageslinea-kang-spritesheet.webp', 
                selectSrc: 'images/liunobackgr.webp', // Separate image for character selection
                image: new Image(), 
                selectImage: new Image(), // Separate image object for selection screen
                loaded: false,
                selectLoaded: false
            },
            { name: 'MetaFox', src: 'images/MetaFox.webp', image: new Image(), loaded: false },
            { name: 'E-Frogs', src: 'images/E-Frogs.webp', image: new Image(), loaded: false },
            { name: 'Foxy', src: 'images/Foxy.webp', image: new Image(), loaded: false }
        ];
        this.characterImages.forEach((char, i) => {
            char.image.onload = () => { this.characterImages[i].loaded = true; updateProgress(); };
            char.image.src = char.src;
            
            // Load separate selection image for Linea Kang
            if (char.selectSrc) {
                char.selectImage.onload = () => { this.characterImages[i].selectLoaded = true; updateProgress(); };
                char.selectImage.src = char.selectSrc;
            }
        });
        
        // Load city background image
        this.cityBgImage = new Image();
        this.cityBgImageLoaded = false;
        this.cityBgImage.onload = () => { this.cityBgImageLoaded = true; updateProgress(); };
        this.cityBgImage.src = 'images/city-background.webp';

        // Load backgr2 image for levels 11-20
        this.backgr2Image = new Image();
        this.backgr2ImageLoaded = false;
        this.backgr2Image.onload = () => { this.backgr2ImageLoaded = true; updateProgress(); };
        this.backgr2Image.src = 'images/backgr2.webp';

        // Load backgr3 image for levels 21-30
        this.backgr3Image = new Image();
        this.backgr3ImageLoaded = false;
        this.backgr3Image.onload = () => { this.backgr3ImageLoaded = true; updateProgress(); };
        this.backgr3Image.src = 'images/backgr3.webp';

        // Load backgr4 image for levels 31-50
        this.backgr4Image = new Image();
        this.backgr4ImageLoaded = false;
        this.backgr4Image.onload = () => { this.backgr4ImageLoaded = true; updateProgress(); };
        this.backgr4Image.src = 'images/backgr4.webp';

        // Load character select background image
        this.characterSelectBgImage = new Image();
        this.characterSelectBgImageLoaded = false;
        this.characterSelectBgImage.onload = () => { this.characterSelectBgImageLoaded = true; updateProgress(); };
        this.characterSelectBgImage.src = 'images/startscreenbg.webp';

        // Load info screen background image
        this.infoScreenBgImage = new Image();
        this.infoScreenBgImageLoaded = false;
        this.infoScreenBgImage.onload = () => { this.infoScreenBgImageLoaded = true; updateProgress(); };
        this.infoScreenBgImage.src = 'images/infoscreenbg.webp';

        // Load LineaBros logo
        this.lineaBrosLogo = new Image();
        this.lineaBrosLogoLoaded = false;
        this.lineaBrosLogo.onload = () => { this.lineaBrosLogoLoaded = true; updateProgress(); };
        this.lineaBrosLogo.src = 'images/lineabros-logo.webp';

        // Load snowball image during initial loading
        this.snowballImage = new Image();
        this.snowballImageLoaded = false;
        this.snowballImage.onload = () => { this.snowballImageLoaded = true; updateProgress(); };
        this.snowballImage.src = 'images/eth-snowball.webp';

        // Load fireball image for Linea Kang character
        this.fireballImage = new Image();
        this.fireballImageLoaded = false;
        this.fireballImage.onload = () => { this.fireballImageLoaded = true; updateProgress(); };
        this.fireballImage.src = 'images/fireballnobackgr.webp';

        // Add music button properties
        this.musicButton = {
            x: GAME_CONFIG.CANVAS_WIDTH - 50,
            y: 10,
            width: 40,
            height: 40,
            isHovered: false
        };

        // Wait for all assets to load
        return new Promise((resolve) => {
            const checkAllLoaded = () => {
                if (loadedAssets === totalAssets) {
                    resolve();
                } else {
                    setTimeout(checkAllLoaded, 100);
                }
            };
            checkAllLoaded();
        });
    }
    
    loadLevel(levelIndex) {
        const level = LEVELS[levelIndex - 1];
        this.currentLevelBackground = level.background; // Store background value (color or image path)
        this.platforms = level.platforms;
        // Preserve lives across levels
        const prevLives = this.player ? this.player.lives : 3;
        this.player = new Player(100, 300, this.selectedCharacter, this);
        this.player.lives = prevLives;
        this.enemies = level.enemies.map(enemy => 
            new Enemy(enemy.x, enemy.y, levelIndex, enemy.isBoss, this)
        );
        this.bossDefeated = false;
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Initialize audio on first user interaction
            if (!this.audioManager.audioInitialized) {
                this.audioManager.initializeAudio();
            }
            
            // Handle mute toggle
            if (e.key.toLowerCase() === 'm') {
                this.audioManager.toggleMute();
            }
            
            // Character selection state
            if (this.gameState === 'characterSelect') {
                if (e.key === 'ArrowLeft' || e.key === 'a') {
                    this.selectedCharacter = (this.selectedCharacter + this.characterImages.length - 1) % this.characterImages.length;
                    console.log('Selected character:', this.selectedCharacter);
                } else if (e.key === 'ArrowRight' || e.key === 'd') {
                    this.selectedCharacter = (this.selectedCharacter + 1) % this.characterImages.length;
                    console.log('Selected character:', this.selectedCharacter);
                } else if (e.key === 'Enter') {
                    this.gameState = 'menu';
                }
                return;
            }
            
            // Handle menu state
            if (this.gameState === 'menu' && e.key === 'Enter') {
                this.gameState = 'playing';
                this.resetGame();
                console.log('Starting game with character:', this.selectedCharacter);
                this.audioManager.playBackgroundMusic(this.selectedCharacter);
            }
            
            // Game over state: wait for Enter to return to character select
            if (this.gameState === 'gameOver' && e.key === 'Enter') {
                this.gameState = 'characterSelect';
                this.resetGame();
                return;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Add mouse event listeners for music button
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Check if mouse is over music button
            const btn = this.musicButton;
            this.musicButton.isHovered = 
                mouseX >= btn.x && 
                mouseX <= btn.x + btn.width && 
                mouseY >= btn.y && 
                mouseY <= btn.y + btn.height;
        });

        this.canvas.addEventListener('click', (e) => {
            // Initialize audio on first user interaction
            if (!this.audioManager.audioInitialized) {
                this.audioManager.initializeAudio();
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Check if music button was clicked
            const btn = this.musicButton;
            if (mouseX >= btn.x && 
                mouseX <= btn.x + btn.width && 
                mouseY >= btn.y && 
                mouseY <= btn.y + btn.height) {
                this.audioManager.toggleMute();
            }
        });
    }
    
    handleInput() {
        // Movement
        if (this.keys[KEYS.LEFT]) {
            this.player.velocityX = -GAME_CONFIG.PLAYER_SPEED;
            this.player.direction = -1;
        } else if (this.keys[KEYS.RIGHT]) {
            this.player.velocityX = GAME_CONFIG.PLAYER_SPEED;
            this.player.direction = 1;
        } else {
            this.player.velocityX = 0;
        }
        
        // Jumping
        if (this.keys[KEYS.UP]) {
            this.player.jump();
        }
        
        // Dropping
        if (this.keys[KEYS.DOWN]) {
            this.player.drop();
        }
        
        // Shooting
        if (this.keys[KEYS.SPACE]) {
            this.player.shoot();
        }
    }
    
    checkLevelComplete() {
        // For boss levels, check if boss is defeated and all regular enemies are cleared
        const currentLevel = LEVELS[this.currentLevel - 1];
        if (currentLevel.isBossLevel) {
            // Check if there are any regular enemies left
            const regularEnemiesLeft = this.enemies.some(enemy => !enemy.isBoss);
            return this.bossDefeated && !regularEnemiesLeft;
        }
        // For regular levels, check if all enemies are defeated
        return this.enemies.length === 0;
    }
    
    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel <= GAME_CONFIG.MAX_LEVELS) {
            this.loadLevel(this.currentLevel);
        } else {
            // Game completed
            alert('Congratulations! You completed all levels! Your final score: ' + this.score);
            this.currentLevel = 1;
            this.score = 0;
            this.loadLevel(this.currentLevel);
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    checkCircleRectCollision(circle, rect) {
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        return distanceSquared < (circle.radius * circle.radius);
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        this.handleInput();
        this.player.update(this.platforms);
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player, this.platforms);
            
            // Check collision with player using the new method
            if (this.player.checkEnemyCollision(enemy)) {
                const currentTime = Date.now();
                // Only take damage if cooldown has passed
                if (currentTime - this.lastDamageTime > this.damageCooldown) {
                    this.player.takeDamage(GAME_CONFIG.ENEMY_DAMAGE);
                    this.lastDamageTime = currentTime;
                    // Only apply horizontal knockback, not vertical
                    const knockbackForce = 10;
                    this.player.velocityX = (this.player.x < enemy.x ? -knockbackForce : knockbackForce);
                }
            }
        });
        
        // Check snowball collisions with enemies
        this.player.snowballs = this.player.snowballs.filter(snowball => {
            let snowballHit = false;
            
            this.enemies.forEach(enemy => {
                if (!snowballHit && enemy.state === 'normal' && 
                    this.checkCircleRectCollision(snowball, enemy)) {
                    enemy.takeDamage(1);
                    if (enemy.isBoss && enemy.health <= 0) {
                        this.bossDefeated = true;
                        this.score += GAME_CONFIG.BOSS_SCORE;
                        // Add life power-ups when boss is defeated based on level
                        const healthDrops = this.currentLevel === 20 ? 2 :
                                          this.currentLevel === 30 ? 3 :
                                          this.currentLevel === 40 ? 3 : 1;
                        
                        for (let i = 0; i < healthDrops; i++) {
                            this.powerUps.push({
                                x: enemy.x + (i * 30), // Offset each health drop slightly
                                y: enemy.y,
                                width: 26,
                                height: 26,
                                type: 'life',
                                velocityY: 0
                            });
                        }
                    }
                    snowballHit = true;
                } else if (!snowballHit && enemy.state === 'frozen' && 
                    this.checkCircleRectCollision(snowball, enemy)) {
                    enemy.state = 'snowball';
                    enemy.snowballTimer = 300; // 5 seconds
                    enemy.velocityX = 0; // Stop the enemy
                    snowballHit = true;
                }
            });
            
            return !snowballHit;
        });

        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            // Apply gravity to power-up
            powerUp.velocityY += GAME_CONFIG.GRAVITY;
            powerUp.y += powerUp.velocityY;
            
            // Check platform collisions
            this.platforms.forEach(platform => {
                if (this.checkCollision(powerUp, platform)) {
                    if (powerUp.velocityY > 0) {
                        powerUp.y = platform.y - powerUp.height;
                        powerUp.velocityY = 0;
                    }
                }
            });

            // Check collision with player
            if (this.checkCollision(powerUp, this.player)) {
                if (powerUp.type === 'life') {
                    this.player.lives = Math.min(this.player.lives + 1, 5); // Max 5 lives
                }
                return false; // Remove power-up after collection
            }

            // Remove if fallen off screen
            if (powerUp.y > GAME_CONFIG.CANVAS_HEIGHT) {
                return false;
            }

            return true;
        });
        
        // Check player collision with snowball enemies
        this.enemies.forEach(enemy => {
            if (enemy.state === 'snowball') {
                // Check collision with player
                if (this.checkCollision(this.player, enemy)) {
                    // Push the snowball in player's direction
                    enemy.velocityX = this.player.direction * GAME_CONFIG.SNOWBALL_SPEED;
                }
                
                // Check collision with other snowball enemies
                this.enemies.forEach(otherEnemy => {
                    if (otherEnemy !== enemy && otherEnemy.state === 'snowball' &&
                        this.checkCollision(enemy, otherEnemy)) {
                        // Make the hit enemy fly
                        enemy.velocityY = -GAME_CONFIG.SNOWBALL_JUMP_FORCE * 1.5;
                        enemy.velocityX = (enemy.x < otherEnemy.x ? -1 : 1) * GAME_CONFIG.SNOWBALL_SPEED * 2;
                    }
                });
                
                // Apply gravity to snowball enemies
                enemy.velocityY += GAME_CONFIG.GRAVITY;
                enemy.x += enemy.velocityX;
                enemy.y += enemy.velocityY;
                
                // Check platform collisions for snowball enemies
                this.platforms.forEach(platform => {
                    if (this.checkCollision(enemy, platform)) {
                        if (enemy.velocityY > 0) {
                            enemy.y = platform.y - enemy.height;
                            enemy.velocityY = 0;
                        }
                    }
                });
            }
        });
        
        // Remove enemies that fall off screen
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.y > GAME_CONFIG.CANVAS_HEIGHT) {
                if (enemy.state === 'snowball') {
                    const score = enemy.isBoss ? GAME_CONFIG.BOSS_SCORE : GAME_CONFIG.SCORE_PER_ENEMY;
                    this.score += score;
                }
                return false;
            }
            return true;
        });
        
        // Check if level is complete
        if (this.checkLevelComplete()) {
            this.nextLevel();
        }
        
        // Check if player is dead
        if (this.player.lives <= 0 && this.gameState === 'playing') {
            this.gameState = 'gameOver';
            this.gameOverAnimY = -100; // Start above the screen
            this.gameOverAnimStart = Date.now();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background based on level
        if (this.currentLevel <= 10) {
            if (this.cityBgImageLoaded) {
                this.ctx.drawImage(this.cityBgImage, 0, 0, this.canvas.width, this.canvas.height);
            }
        } else if (this.currentLevel <= 20) {
            if (this.backgr2ImageLoaded) {
                this.ctx.drawImage(this.backgr2Image, 0, 0, this.canvas.width, this.canvas.height);
            }
        } else if (this.currentLevel <= 30) {
            if (this.backgr3ImageLoaded) {
                this.ctx.drawImage(this.backgr3Image, 0, 0, this.canvas.width, this.canvas.height);
            }
        } else {
            if (this.backgr4ImageLoaded) {
                this.ctx.drawImage(this.backgr4Image, 0, 0, this.canvas.width, this.canvas.height);
            }
        }

        // Only draw platforms if they exist
        if (this.platforms && this.platforms.length > 0) {
            // Draw platforms
            this.platforms.forEach(platform => {
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            });

            // Draw LineaBros logo under the ground platform, centered and fully visible
            const floorPlatform = this.platforms.reduce((lowest, p) => p.y > lowest.y ? p : lowest, this.platforms[0]);
            if (this.lineaBrosLogoLoaded && floorPlatform) {
                const logoWidth = this.lineaBrosLogo.width;
                const logoHeight = this.lineaBrosLogo.height;
                // Calculate max possible width/height to fit under the platform
                const availableWidth = this.canvas.width;
                const availableHeight = this.canvas.height - (floorPlatform.y + floorPlatform.height);
                let drawWidth = logoWidth;
                let drawHeight = logoHeight;
                // Scale down if needed
                const widthRatio = availableWidth / logoWidth;
                const heightRatio = availableHeight / logoHeight;
                const scale = Math.min(widthRatio, heightRatio, 1);
                drawWidth = logoWidth * scale;
                drawHeight = logoHeight * scale;
                const drawX = (this.canvas.width - drawWidth) / 2;
                const drawY = floorPlatform.y + floorPlatform.height + (availableHeight - drawHeight) / 2;
                this.ctx.drawImage(this.lineaBrosLogo, drawX, drawY, drawWidth, drawHeight);
            }
        }
        // Platform palettes and block sizes for variety
        const palettes = [
            // [main, highlight, shadow, stroke]
            ['#7ecaf6', '#e0f7fa', '#3a5a7a', '#5dade2'], // blue ice
            ['#f7d358', '#fff9c4', '#b7950b', '#bfa100'], // yellow sand
            ['#b388ff', '#e1bee7', '#512da8', '#9575cd'], // purple crystal
            ['#a5d6a7', '#e8f5e9', '#388e3c', '#66bb6a'], // green grass
            ['#ffab91', '#ffe0b2', '#d84315', '#ff7043'], // orange clay
            ['#b0bec5', '#eceff1', '#263238', '#78909c'], // gray stone
        ];
        const blockSizes = [10, 12, 14, 16, 18, 20];
        // Pick palette and block size based on level
        const palette = palettes[(this.currentLevel - 1) % palettes.length];
        const blockSize = blockSizes[(this.currentLevel - 1) % blockSizes.length];
        this.platforms.forEach(platform => {
            // Main body
            this.ctx.fillStyle = palette[0];
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            // Top highlight
            this.ctx.fillStyle = palette[1];
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height * 0.25);
            // Bottom shadow
            this.ctx.fillStyle = palette[2];
            this.ctx.fillRect(platform.x, platform.y + platform.height * 0.75, platform.width, platform.height * 0.25);
        });
        // Draw player with invincibility flash effect
        if (this.player && (this.gameState === 'playing' || this.gameState === 'gameOver')) {
            if (this.player.isInvincible) {
                this.ctx.globalAlpha = 0.5; // Flash effect
            }
            this.player.draw(this.ctx);
            this.ctx.globalAlpha = 1.0; // Reset alpha
        }
        // Draw enemies
        if (this.enemies && this.enemies.length > 0) {
            this.enemies.forEach(enemy => enemy.draw(this.ctx));
        }
        // Draw pixel-art HUD
        this.drawPixelHUD();
        
        // Draw power-ups
        if (this.powerUps && this.powerUps.length > 0) {
            this.powerUps.forEach(powerUp => {
                if (powerUp.type === 'life') {
                    // Draw heart power-up with larger size
                    this.ctx.fillStyle = '#e74c3c';
                    this.drawLargePixelHeart(powerUp.x + powerUp.width/2 - 5, powerUp.y + powerUp.height/2 - 5);
                }
            });
        }
        
        if (this.gameState === 'characterSelect') {
            this.drawCharacterSelect();
            return;
        }
        if (this.gameState === 'gameOver') {
            this.drawGameOver();
            return;
        }
    }
    
    drawPixelHUD() {
        // Only draw HUD if game is in playing state and player exists
        if (this.gameState !== 'playing' || !this.player) {
            return;
        }

        // Pixel-art style HUD with improved design - 20% smaller
        const hudX = 0;
        const hudY = 0;
        const hudWidth = 192; // Reduced from 240 (20% smaller)
        const hudHeight = 52; // Reduced from 65 (20% smaller)
        const padding = 3; // Reduced from 4
        const borderThickness = 2;

        // Draw HUD background with pixel art style
        this.ctx.save();
        
        // Draw multiple shadow layers for depth
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(hudX + 3, hudY + 3, hudWidth, hudHeight);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(hudX + 2, hudY + 2, hudWidth, hudHeight);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(hudX + 1, hudY + 1, hudWidth, hudHeight);
        
        // Draw main HUD background with enhanced gradient
        const gradient = this.ctx.createLinearGradient(hudX, hudY, hudX, hudY + hudHeight);
        gradient.addColorStop(0, '#34495e');
        gradient.addColorStop(0.3, '#2c3e50');
        gradient.addColorStop(0.7, '#1a252f');
        gradient.addColorStop(1, '#0f1419');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(hudX, hudY, hudWidth, hudHeight);
        
        // Draw inner glow effect
        const innerGlow = this.ctx.createLinearGradient(hudX, hudY, hudX, hudY + hudHeight);
        innerGlow.addColorStop(0, 'rgba(52, 152, 219, 0.3)');
        innerGlow.addColorStop(0.5, 'rgba(52, 152, 219, 0.1)');
        innerGlow.addColorStop(1, 'rgba(52, 152, 219, 0.05)');
        this.ctx.fillStyle = innerGlow;
        this.ctx.fillRect(hudX + 1, hudY + 1, hudWidth - 2, hudHeight - 2);
        
        // Draw animated border with cycling colors
        const time = Date.now() * 0.003;
        const borderColors = [
            `hsl(${(time * 60) % 360}, 70%, 60%)`,
            `hsl(${(time * 60 + 120) % 360}, 70%, 60%)`,
            `hsl(${(time * 60 + 240) % 360}, 70%, 60%)`
        ];
        
        // Outer border frame
        this.ctx.fillStyle = borderColors[0];
        this.ctx.fillRect(hudX - 1, hudY - 1, hudWidth + 2, 1); // Top
        this.ctx.fillRect(hudX - 1, hudY + hudHeight, hudWidth + 2, 1); // Bottom
        this.ctx.fillRect(hudX - 1, hudY - 1, 1, hudHeight + 2); // Left
        this.ctx.fillRect(hudX + hudWidth, hudY - 1, 1, hudHeight + 2); // Right
        
        // Draw pixel art border with enhanced pattern
        this.ctx.fillStyle = '#3498db';
        // Top border with pixel art pattern
        for (let x = hudX; x < hudX + hudWidth; x += 4) {
            const height = (x / 4) % 2 === 0 ? borderThickness : borderThickness + 1;
            this.ctx.fillStyle = borderColors[Math.floor((x / 8) % 3)];
            this.ctx.fillRect(x, hudY, 2, height);
        }
        // Bottom border with pixel art pattern
        for (let x = hudX; x < hudX + hudWidth; x += 4) {
            const height = (x / 4) % 2 === 0 ? borderThickness : borderThickness + 1;
            this.ctx.fillStyle = borderColors[Math.floor((x / 8) % 3)];
            this.ctx.fillRect(x, hudY + hudHeight - height, 2, height);
        }
        // Left border with pixel art pattern
        for (let y = hudY; y < hudY + hudHeight; y += 4) {
            const width = (y / 4) % 2 === 0 ? borderThickness : borderThickness + 1;
            this.ctx.fillStyle = borderColors[Math.floor((y / 8) % 3)];
            this.ctx.fillRect(hudX, y, width, 2);
        }
        // Right border with pixel art pattern
        for (let y = hudY; y < hudY + hudHeight; y += 4) {
            const width = (y / 4) % 2 === 0 ? borderThickness : borderThickness + 1;
            this.ctx.fillStyle = borderColors[Math.floor((y / 8) % 3)];
            this.ctx.fillRect(hudX + hudWidth - width, y, width, 2);
        }

        // Draw enhanced corner decorations with glow
        const cornerSize = 4;
        this.ctx.shadowColor = '#e74c3c';
        this.ctx.shadowBlur = 3;
        this.ctx.fillStyle = '#e74c3c';
        // Top-left corner
        this.ctx.fillRect(hudX, hudY, cornerSize, cornerSize);
        // Top-right corner
        this.ctx.fillRect(hudX + hudWidth - cornerSize, hudY, cornerSize, cornerSize);
        // Bottom-left corner
        this.ctx.fillRect(hudX, hudY + hudHeight - cornerSize, cornerSize, cornerSize);
        // Bottom-right corner
        this.ctx.fillRect(hudX + hudWidth - cornerSize, hudY + hudHeight - cornerSize, cornerSize, cornerSize);
        this.ctx.shadowBlur = 0;

        // Draw HUD content with enhanced pixel art style
        const textX = hudX + padding + 16;
        const lineHeight = 16;
        let textY = hudY + padding + 5;

        // Set enhanced pixel art font with shadow
        this.ctx.font = 'bold 10px "Press Start 2P", "VT323", monospace';
        this.ctx.textBaseline = 'top';

        // Level display with enhanced styling
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 2;
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillText('LEVEL', textX, textY);
        
        // Add glow effect to level number
        this.ctx.shadowColor = '#f1c40f';
        this.ctx.shadowBlur = 4;
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`${this.currentLevel}`, textX + 68, textY);
        
        // Score display with enhanced styling
        textY += lineHeight;
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 2;
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillText('SCORE', textX, textY);
        
        // Add glow effect to score number
        this.ctx.shadowColor = '#2ecc71';
        this.ctx.shadowBlur = 4;
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`${this.score}`, textX + 68, textY);

        // Lives display with enhanced styling
        textY += lineHeight;
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 2;
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillText('LIVES', textX, textY);
        this.ctx.shadowBlur = 0;
        
        // Draw heart icons for lives (keeping original heart symbols)
        const iconX = textX + 68;
        const iconY = textY + 2;
        const iconSpacing = 11;

        if (this.selectedCharacter === 2) { // E-Frogs character index is 2
            // Draw frog icons for E-Frogs lives with glow
            this.ctx.shadowColor = '#2ecc71';
            this.ctx.shadowBlur = 2;
            this.ctx.fillStyle = '#2ecc71';
            for (let i = 0; i < this.player.lives; i++) {
                this.drawPixelFrog(iconX + (i * iconSpacing), iconY);
            }
        } else {
            // Draw heart icons for other characters' lives with glow
            this.ctx.shadowColor = '#e74c3c';
            this.ctx.shadowBlur = 2;
            this.ctx.fillStyle = '#e74c3c';
            for (let i = 0; i < this.player.lives; i++) {
                this.drawPixelHeart(iconX + (i * iconSpacing), iconY);
            }
        }
        this.ctx.shadowBlur = 0;

        // Draw music toggle button
        this.drawMusicButton();

        this.ctx.restore();
    }
    
    drawPixelHeart(x, y) {
        this.ctx.fillStyle = this.ctx.fillStyle; // Use the current fill style (should be red)
        // Draw a classic pixel art heart (approx 8x8)
        this.ctx.fillRect(x + 1, y + 0, 2, 2);
        this.ctx.fillRect(x + 5, y + 0, 2, 2);
        this.ctx.fillRect(x + 0, y + 1, 8, 2);
        this.ctx.fillRect(x + 1, y + 3, 6, 2);
        this.ctx.fillRect(x + 2, y + 5, 4, 2);
        this.ctx.fillRect(x + 3, y + 7, 2, 2);
    }

    drawLargePixelHeart(x, y) {
        this.ctx.fillStyle = this.ctx.fillStyle; // Use the current fill style (should be red)
        // Draw a larger pixel art heart (approx 10x10, 30% larger)
        this.ctx.fillRect(x + 1, y + 0, 3, 3);
        this.ctx.fillRect(x + 6, y + 0, 3, 3);
        this.ctx.fillRect(x + 0, y + 1, 10, 3);
        this.ctx.fillRect(x + 1, y + 4, 8, 3);
        this.ctx.fillRect(x + 2, y + 7, 6, 3);
        this.ctx.fillRect(x + 4, y + 10, 2, 3);
    }

    drawPixelFrog(x, y) {
        this.ctx.fillStyle = this.ctx.fillStyle; // Use the current fill style (should be green)
        // Draw a simple pixel art frog (approx 8x8)
        this.ctx.fillRect(x + 2, y + 0, 4, 2); // Head
        this.ctx.fillRect(x + 0, y + 2, 8, 2); // Body
        this.ctx.fillRect(x + 1, y + 4, 2, 2); // Left foot
        this.ctx.fillRect(x + 5, y + 4, 2, 2); // Right foot
        this.ctx.fillRect(x + 2, y + 6, 4, 2); // Bottom of body
    }
    
    drawMusicButton() {
        const btn = this.musicButton;
        
        // Draw button background with hover effect
        this.ctx.fillStyle = this.audioManager.isMuted ? '#e74c3c' : '#2ecc71';
        if (btn.isHovered) {
            // Add a glow effect when hovered
            this.ctx.shadowColor = '#fff';
            this.ctx.shadowBlur = 10;
        }
        this.ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
        this.ctx.shadowBlur = 0;
        
        // Draw button border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
        
        // Draw speaker icon
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        if (this.audioManager.isMuted) {
            // Draw muted speaker icon
            this.ctx.moveTo(btn.x + 10, btn.y + 10);
            this.ctx.lineTo(btn.x + 30, btn.y + 10);
            this.ctx.lineTo(btn.x + 30, btn.y + 30);
            this.ctx.lineTo(btn.x + 10, btn.y + 30);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Draw X
            this.ctx.beginPath();
            this.ctx.moveTo(btn.x + 15, btn.y + 15);
            this.ctx.lineTo(btn.x + 25, btn.y + 25);
            this.ctx.moveTo(btn.x + 25, btn.y + 15);
            this.ctx.lineTo(btn.x + 15, btn.y + 25);
            this.ctx.stroke();
        } else {
            // Draw active speaker icon
            this.ctx.moveTo(btn.x + 10, btn.y + 10);
            this.ctx.lineTo(btn.x + 10, btn.y + 30);
            this.ctx.lineTo(btn.x + 20, btn.y + 30);
            this.ctx.lineTo(btn.x + 20, btn.y + 10);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Draw sound waves
            this.ctx.beginPath();
            this.ctx.arc(btn.x + 20, btn.y + 20, 5, -Math.PI/4, Math.PI/4);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(btn.x + 20, btn.y + 20, 8, -Math.PI/4, Math.PI/4);
            this.ctx.stroke();
        }

        // Draw tooltip when hovered
        if (btn.isHovered) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(btn.x - 100, btn.y + btn.height + 5, 100, 25);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.audioManager.isMuted ? 'Click to unmute' : 'Click to mute',
                btn.x - 50,
                btn.y + btn.height + 20
            );
            this.ctx.textAlign = 'left'; // Reset text alignment
        }
    }
    
    drawCharacterSelect() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw character select background
        if (this.characterSelectBgImageLoaded) {
            this.ctx.drawImage(this.characterSelectBgImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback to a solid color if the image is not loaded
            this.ctx.fillStyle = '#222';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Title for character select (move lower)
        this.ctx.font = 'bold 36px "Press Start 2P", "VT323", monospace';
        this.ctx.fillStyle = '#ffe066'; // Golden color for better visibility
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 4;
        this.ctx.fillText('SELECT YOUR CHARACTER', this.canvas.width / 2, 250);
        this.ctx.shadowBlur = 0; // Reset shadow for other elements

        // Center the character images dynamically (move lower)
        const charCount = this.characterImages.length;
        const spacing = 180;
        const totalWidth = (charCount - 1) * spacing;
        const baseX = this.canvas.width / 2 - totalWidth / 2;
        const charY = 370;
        this.characterImages.forEach((char, i) => {
            const x = baseX + i * spacing;
            const y = charY;
            
            // Draw selection box with glow effect for selected character
            if (i === this.selectedCharacter) {
                // Add glow effect
                this.ctx.shadowColor = '#ffe066';
                this.ctx.shadowBlur = 15;
                this.ctx.strokeStyle = '#ffe066';
                this.ctx.lineWidth = 6;
            } else {
                this.ctx.shadowBlur = 0;
                this.ctx.strokeStyle = '#888';
                this.ctx.lineWidth = 2;
            }
            this.ctx.strokeRect(x - 69, y - 69, 138, 138);
            this.ctx.shadowBlur = 0;

            // Draw character image with special effects
            if (i === 0 && char.selectLoaded) { // Linea Kang with separate selection image
                // Add a special glow behind Linea Kang
                this.ctx.shadowColor = '#00d4ff';
                this.ctx.shadowBlur = 15;
                this.ctx.drawImage(char.selectImage, x - 57.5, y - 57.5, 115, 115);
                this.ctx.shadowBlur = 0;
            } else if (char.loaded) {
                if (i === 1) { // MetaFox
                    // Add a subtle glow behind MetaFox
                    this.ctx.shadowColor = '#ff8c00';
                    this.ctx.shadowBlur = 10;
                    this.ctx.drawImage(char.image, x - 57.5, y - 57.5, 115, 115);
                    this.ctx.shadowBlur = 0;
                } else {
                    this.ctx.drawImage(char.image, x - 57.5, y - 57.5, 115, 115);
                }
            } else {
                this.ctx.fillStyle = '#444';
                this.ctx.fillRect(x - 57.5, y - 57.5, 115, 115);
            }

            // Draw name with character-specific colors
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            switch(i) {
                case 0: // Linea Kang
                    this.ctx.fillStyle = '#00d4ff'; // Cyan/Blue
                    break;
                case 1: // MetaFox
                    this.ctx.fillStyle = '#ff8c00'; // Orange
                    break;
                case 2: // E-Frogs
                    this.ctx.fillStyle = '#2ecc71'; // Green
                    break;
                case 3: // Foxy
                    this.ctx.fillStyle = '#ffb347'; // Light orange
                    break;
            }
            this.ctx.fillText(char.name, x, y + 95);
        });



        // Draw instructions
        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText('Use ← → to choose, Enter to start', this.canvas.width / 2, charY + 150);
    }
    
    resetGame() {
        // Reset all game state variables
        this.score = 0;
        this.bossDefeated = false;
        this.powerUps = [];
        this.gameOverAnimY = null;
        this.gameOverAnimStart = null;
        this.lastDamageTime = 0;
        this.currentLevel = 1;  // Reset to level 1
        
        // Reset player if it exists
        if (this.player) {
            this.player.lives = 3;
            this.player.snowballs = [];
            this.player.velocityX = 0;
            this.player.velocityY = 0;
            this.player.isInvincible = false;
        }
        
        // Reset enemies array
        this.enemies = [];
        
        // Load the level fresh
        this.loadLevel(this.currentLevel);
    }
    
    drawMenu() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background image if loaded, otherwise use fallback color
        if (this.infoScreenBgImageLoaded) {
            this.ctx.drawImage(this.infoScreenBgImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = '#34495e';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw title in pixel art style
        this.ctx.font = 'bold 48px "Press Start 2P", "VT323", monospace';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('HOW TO PLAY', this.canvas.width / 2, 100);
        
        // Draw instructions in pixel art style
        this.ctx.font = '20px "Press Start 2P", "VT323", monospace';
        this.ctx.textAlign = 'left';
        
        // Game rules
        const rules = [
            'GAME RULES:',
            '• Defeat all enemies to clear each level',
            '• Freeze enemies with Ethballs',
            '• Push frozen enemies to eliminate them',
            '• Collect hearts dropped by bosses',
            '• Maximum 5 lives',
            '',
            'CONTROLS:',
            '← → : Move left/right',
            '↑ : Jump',
            '↓ : Drop through platforms',
            'SPACE : Shoot Ethballs',
            'M : Toggle music'
        ];
        
        // Draw each line with pixel art style
        let y = 150;
        rules.forEach(line => {
            if (line.startsWith('•') || line.includes(':')) {
                this.ctx.fillStyle = '#2ecc71'; // Green for bullet points and controls
            } else {
                this.ctx.fillStyle = '#ffffff'; // White for regular text
            }
            this.ctx.fillText(line, this.canvas.width / 2 - 200, y);
            y += 30;
        });
        
        // Draw start prompt with flashing effect
        this.ctx.font = 'bold 24px "Press Start 2P", "VT323", monospace';
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.textAlign = 'center';
        // Create flashing effect based on time
        const flashSpeed = 500; // milliseconds
        const flashIntensity = Math.abs(Math.sin(Date.now() / flashSpeed));
        this.ctx.globalAlpha = 0.5 + flashIntensity * 0.5; // Flashes between 0.5 and 1.0 opacity
        this.ctx.fillText('Press ENTER to Start', this.canvas.width / 2, this.canvas.height - 50);
        this.ctx.globalAlpha = 1.0; // Reset alpha
    }
    
    drawGameOver() {
        // Do NOT clear or redraw the background, just overlay the text
        // Animate the GAME OVER text falling from top to center
        const duration = 2000; // 2 seconds
        const now = Date.now();
        if (this.gameOverAnimStart === null) this.gameOverAnimStart = now;
        const elapsed = Math.min(now - this.gameOverAnimStart, duration);
        const startY = -100;
        const endY = this.canvas.height / 2 - 60;
        const y = startY + (endY - startY) * (elapsed / duration);
        // Retro pixel-art style
        this.ctx.font = 'bold 64px "Press Start 2P", "VT323", monospace';
        this.ctx.fillStyle = '#ff6f61';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 8;
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, y);
        this.ctx.shadowBlur = 0;
        // Score frame
        const scoreFrameWidth = 340;
        const scoreFrameHeight = 60;
        const scoreFrameX = this.canvas.width / 2 - scoreFrameWidth / 2;
        const scoreFrameY = y + 60;
        this.ctx.save();
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(scoreFrameX, scoreFrameY, scoreFrameWidth, scoreFrameHeight);
        this.ctx.strokeStyle = '#ffe066';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(scoreFrameX, scoreFrameY, scoreFrameWidth, scoreFrameHeight);
        // Score label
        this.ctx.font = 'bold 28px "Press Start 2P", "VT323", monospace';
        this.ctx.fillStyle = '#ffe066';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('SCORE:', scoreFrameX + 24, scoreFrameY + 36);
        // Score number bold and centered
        this.ctx.font = 'bold 36px "Press Start 2P", "VT323", monospace';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(this.score, scoreFrameX + scoreFrameWidth - 24, scoreFrameY + 38);
        this.ctx.restore();
        // Prompt
        this.ctx.font = 'bold 24px "Press Start 2P", "VT323", monospace';  // Increased font size and made it bold
        this.ctx.fillStyle = '#ffe066';  // Changed to golden color
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#000';  // Added shadow for better visibility
        this.ctx.shadowBlur = 4;
        this.ctx.fillText('Press Enter to Return to the Main Menu', this.canvas.width / 2, y + 140);
        this.ctx.shadowBlur = 0;  // Reset shadow
    }
    
    handleWalletConnected(walletData) {
        console.log('Game.handleWalletConnected called with:', walletData);
        this.walletConnected = true;
        this.userAddress = walletData.address;
        this.transactionCount = walletData.transactionCount;
        
        // Ensure wallet screen is hidden
        const walletScreen = document.getElementById('walletScreen');
        if (walletScreen) {
            walletScreen.style.display = 'none';
            walletScreen.style.visibility = 'hidden';
            console.log('Wallet screen hidden from game handler');
        }
        
        // Ensure loading screen is hidden
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'none';
            this.loadingScreen.style.visibility = 'hidden';
            console.log('Loading screen hidden');
        }
        
        // Transition to character select immediately
        this.gameState = 'characterSelect';
        console.log('Game state changed to:', this.gameState);
        
        // Force a redraw to ensure the character select screen appears
        this.drawCharacterSelect();
        
        // Also force a canvas redraw in case the game loop missed it
        setTimeout(() => {
            if (this.gameState === 'characterSelect') {
                console.log('Double-checking character select screen is visible');
                this.drawCharacterSelect();
            }
        }, 50);
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    gameLoop() {
        // Only log game state changes
        if (this.lastGameState !== this.gameState) {
            console.log('Game state:', this.gameState);
            this.lastGameState = this.gameState;
        }

        if (this.gameState === 'menu') {
            this.drawMenu();
        } else if (this.gameState === 'characterSelect') {
            this.drawCharacterSelect();
        } else {
            this.update();
            this.draw();
            // If game over, keep animating the text
            if (this.gameState === 'gameOver') {
                this.drawGameOver();
            }
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    startGame() {
        console.log('Game.startGame called');
        this.gameState = 'characterSelect';
        // Ensure loading screen is completely hidden
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'none';
            this.loadingScreen.style.visibility = 'hidden';
        }
        console.log('Game state set to:', this.gameState);
    }
}

// Make startGame function globally accessible
window.startGame = function() {
    console.log('Global startGame called');
    if (window.gameInstance) {
        console.log('Found game instance, calling startGame');
        window.gameInstance.startGame();
    } else {
        console.error('Game instance not found!');
    }
};

// Initialize game
window.addEventListener('load', () => {
    console.log('Window loaded, initializing game...');
    // Ensure loading screen is visible on start
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.visibility = 'visible';
    }
    window.gameInstance = new Game();
    window.game = window.gameInstance; // Also store as window.game for wallet integration
    console.log('Game instance created and stored globally');
});

// Add this at the end of the file
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');
}); 