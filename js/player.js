class Player {
    constructor(x, y, characterIndex = 0, game = null) {
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.PLAYER_WIDTH;
        this.height = GAME_CONFIG.PLAYER_HEIGHT;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.direction = 1; // 1 for right, -1 for left
        this.isShooting = false;
        this.snowballs = [];
        this.color = '#3498db';
        this.lives = 3;
        this.isInvincible = false;
        this.invincibilityDuration = 1000; // 1 second of invincibility
        this.invincibilityTimer = 0;
        this.isDropping = false;
        this.initialJumpY = 0; // Track the Y position when jump starts
        this.onPlatform = false;
        this.currentPlatform = null;
        this.platforms = []; // Store platforms reference
        this.game = game;
        
        // Animation properties for sprite sheet
        this.animationFrame = 0;
        this.animationSpeed = 0.15; // Speed of animation
        this.lastAnimationTime = 0;
        this.isWalking = false;
        
        // Sprite sheet properties for Linea Kang
        this.spriteFrameWidth = 0; // Will be calculated when image loads
        this.spriteFrameHeight = 0; // Will be calculated when image loads
        this.totalFrames = 4; // 4 frames in the sprite sheet
        this.currentSpriteFrame = 0; // Current frame index (0-3)
        this.runningFrameCounter = 0; // Counter for running animation timing
        
        // Pre-calculated frame positions for performance
        this.framePositions = [
            { col: 0, row: 0 }, // Frame 0: Idle (top-left)
            { col: 1, row: 0 }, // Frame 1: Jump (top-right)
            { col: 0, row: 1 }, // Frame 2: Run1 (bottom-left)
            { col: 1, row: 1 }  // Frame 3: Run2 (bottom-right)
        ];
        
        // Use pre-loaded character images from game instance
        if (game && game.characterImages && game.characterImages[characterIndex]) {
            this.image = game.characterImages[characterIndex].image;
            this.imageLoaded = game.characterImages[characterIndex].loaded;
            // Calculate sprite frame dimensions for Linea Kang immediately if loaded
            if (characterIndex === 0 && this.imageLoaded) {
                this.calculateSpriteFrameDimensions();
            }
        } else {
            // Fallback: load image directly if game instance not available
            const characterImages = [
                'images/imageslinea-kang-spritesheet.webp',
                'images/MetaFox.webp',
                'images/E-Frogs.webp',
                'images/Foxy.webp'
            ];
            this.image = new Image();
            this.imageLoaded = false;
            this.image.onload = () => {
                this.imageLoaded = true;
                // Calculate sprite frame dimensions for Linea Kang
                if (characterIndex === 0) {
                    this.calculateSpriteFrameDimensions();
                }
            };
            this.image.onerror = (e) => {
                this.imageLoaded = false;
            };
            this.image.src = characterImages[characterIndex] || characterImages[0];
        }

        // Use pre-loaded projectile images from game instance
        this.characterIndex = characterIndex;
        if (game && game.snowballImage && game.fireballImage) {
            this.snowballImage = game.snowballImage;
            this.snowballImageLoaded = game.snowballImageLoaded;
            this.fireballImage = game.fireballImage;
            this.fireballImageLoaded = game.fireballImageLoaded;
        } else {
            // Fallback: load projectile images directly
            this.snowballImage = new Image();
            this.snowballImageLoaded = false;
            this.snowballImage.onload = () => { this.snowballImageLoaded = true; };
            this.snowballImage.src = 'images/eth-snowball.webp';
            
            this.fireballImage = new Image();
            this.fireballImageLoaded = false;
            this.fireballImage.onload = () => { this.fireballImageLoaded = true; };
            this.fireballImage.src = 'images/fireballnobackgr.webp';
        }
    }

    takeDamage(amount) {
        if (!this.isInvincible) {
            this.lives -= amount;
            this.isInvincible = true;
            this.invincibilityTimer = Date.now();
            this.color = '#e74c3c';
        }
    }

    update(platforms) {
        this.platforms = platforms; // Update platforms reference
        
        // Update invincibility
        if (this.isInvincible && Date.now() - this.invincibilityTimer > this.invincibilityDuration) {
            this.isInvincible = false;
            this.color = '#3498db';
        }

        // Apply gravity
        this.velocityY += GAME_CONFIG.GRAVITY;

        // Check if we've reached maximum jump height
        if (this.isJumping && this.velocityY < 0) {
            const jumpHeight = this.initialJumpY - this.y;
            if (jumpHeight >= GAME_CONFIG.MAX_JUMP_HEIGHT) {
                this.velocityY = 0; // Stop upward movement
            }
        }

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Platform collisions
        this.onPlatform = false;
        this.currentPlatform = null;
        let canFall = true;

        // First, check if we're trying to drop through a platform
        if (this.isDropping) {
            for (const platform of platforms) {
                if (this.checkCollision(platform)) {
                    // If we're dropping, move below the platform
                    // But only if it's not the bottom platform (y === 500)
                    if (platform.y < 500) {
                        // Check if there's a gap to fall through
                        const canDropThrough = this.checkForGap(platform);
                        if (canDropThrough) {
                            this.y = platform.y + platform.height;
                            canFall = false;
                        } else {
                            // If no gap, stop dropping
                            this.isDropping = false;
                            this.y = platform.y - this.height;
                            this.velocityY = 0;
                            this.onPlatform = true;
                            this.currentPlatform = platform;
                            this.isJumping = false;
                        }
                    } else {
                        // If it's the bottom platform, stop dropping
                        this.isDropping = false;
                        this.y = platform.y - this.height;
                        this.velocityY = 0;
                        this.onPlatform = true;
                        this.currentPlatform = platform;
                        this.isJumping = false;
                    }
                    break;
                }
            }
        }

        // Then check for normal platform collisions
        if (canFall) {
            let standingPlatform = null;
            for (const platform of platforms) {
                // Check if player's feet are over the platform
                const feetX = this.x + this.width / 2;
                const feetY = this.y + this.height + 1;
                const isOverPlatform = feetX >= platform.x && feetX <= platform.x + platform.width;
                const isTouching = this.y + this.height <= platform.y + platform.height &&
                                   this.y + this.height >= platform.y &&
                                   this.x + this.width > platform.x &&
                                   this.x < platform.x + platform.width;
                if (isOverPlatform && isTouching && this.velocityY >= 0 && !this.isDropping) {
                    standingPlatform = platform;
                    break;
                }
            }
            if (standingPlatform) {
                this.y = standingPlatform.y - this.height;
                this.velocityY = 0;
                this.onPlatform = true;
                this.currentPlatform = standingPlatform;
                this.isJumping = false;
            }
        }

        // Update jumping state
        if (this.onPlatform) {
            this.isJumping = false;
        }

        // Update walking animation state - more responsive detection
        this.isWalking = Math.abs(this.velocityX) > 0.05 && this.onPlatform;
        
        // Update sprite animation for Linea Kang (non-blocking)
        if (this.characterIndex === 0) { // Only for Linea Kang
            this.updateSpriteAnimation();
        }
        
        // Apply friction
        if (this.velocityX !== 0) {
            this.velocityX *= 0.9;
            if (Math.abs(this.velocityX) < 0.1) {
                this.velocityX = 0;
            }
        }

        // Update snowballs
        this.snowballs = this.snowballs.filter(snowball => {
            snowball.x += snowball.velocityX;
            snowball.y += snowball.velocityY;
            return snowball.x > 0 && snowball.x < GAME_CONFIG.CANVAS_WIDTH;
        });

        // Screen boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > GAME_CONFIG.CANVAS_WIDTH) {
            this.x = GAME_CONFIG.CANVAS_WIDTH - this.width;
        }

        // Reset dropping state when not on a platform
        if (!this.onPlatform) {
            this.isDropping = false;
        }
    }

    checkCollision(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = GAME_CONFIG.JUMP_FORCE;
            this.isJumping = true;
            this.initialJumpY = this.y; // Record the Y position when jump starts
        }
    }

    drop() {
        if (!this.isDropping && this.onPlatform && this.currentPlatform) {
            // Only allow dropping if there's a gap to fall through
            if (this.checkForGap(this.currentPlatform)) {
                this.isDropping = true;
                this.velocityY = 2; // Slightly faster initial drop
            }
        }
    }

    shoot() {
        if (!this.isShooting) {
            const snowball = {
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                radius: GAME_CONFIG.SNOWBALL_RADIUS,
                velocityX: this.direction * GAME_CONFIG.SNOWBALL_SPEED,
                velocityY: 0
            };
            this.snowballs.push(snowball);
            this.isShooting = true;
            setTimeout(() => this.isShooting = false, 200);
        }
    }

    draw(ctx) {
        // Draw player with invulnerability flash
        if (!this.isInvincible || Math.floor(Date.now() / 100) % 2 === 0) {
            if (this.imageLoaded) {
                // Special sprite sheet rendering for Linea Kang
                if (this.characterIndex === 0) {
                    this.drawLineaKangSprite(ctx);
                } else {
                    // Draw normal character image for other characters
                    if (this.direction === 1) {
                        ctx.drawImage(this.image, this.x, this.y, this.width * 1.15, this.height * 1.15);
                    } else {
                        // Flip the image horizontally when facing left
                        ctx.save();
                        ctx.translate(this.x + this.width * 1.15, this.y);
                        ctx.scale(-1, 1);
                        ctx.drawImage(this.image, 0, 0, this.width * 1.15, this.height * 1.15);
                        ctx.restore();
                    }
                }
            } else {
                // Fallback to rectangle if image is not loaded
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width * 1.15, this.height * 1.15);
            }
        }

        // Draw projectiles (snowballs or fireballs based on character)
        this.snowballs.forEach(snowball => {
            if (this.characterIndex === 0) { // Linea Kang character
                if (this.fireballImageLoaded) {
                    const size = snowball.radius * 2;
                    ctx.drawImage(this.fireballImage, snowball.x - snowball.radius, snowball.y - snowball.radius, size, size);
                } else {
                    // Fallback to orange circle for fireball
                    ctx.fillStyle = '#ff6600';
                    ctx.beginPath();
                    ctx.arc(snowball.x, snowball.y, snowball.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else { // Other characters use snowballs
                if (this.snowballImageLoaded) {
                    const size = snowball.radius * 2;
                    ctx.drawImage(this.snowballImage, snowball.x - snowball.radius, snowball.y - snowball.radius, size, size);
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(snowball.x, snowball.y, snowball.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }

    calculateSpriteFrameDimensions() {
        // Calculate frame dimensions for the 4-frame sprite sheet
        // Arranged in 2x2 grid: [Idle][Jump]
        //                       [Run1][Run2]
        if (this.image && this.image.width > 0) {
            this.spriteFrameWidth = this.image.width / 2;  // 2 columns
            this.spriteFrameHeight = this.image.height / 2; // 2 rows
        }
    }

    updateSpriteAnimation() {
        // Determine which frame to show based on player state
        // Frame layout: [0:Idle][1:Jump]
        //               [2:Run1][3:Run2]
        if (this.isJumping) {
            // Top right frame for jumping - immediate response
            this.currentSpriteFrame = 1;
        } else if (this.isWalking) {
            // Immediate response for walking - no delays
            const currentTime = Date.now();
            
            // Start with running frame immediately when walking starts
            if (this.currentSpriteFrame === 0) {
                this.currentSpriteFrame = 2;
                this.lastAnimationTime = currentTime;
                this.runningFrameCounter = 0;
            }
            
            // Faster animation cycling - reduced to 120ms for smoother feel
            if (currentTime - this.lastAnimationTime > 120) {
                this.runningFrameCounter++;
                this.currentSpriteFrame = 2 + (this.runningFrameCounter % 2); // Alternate between 2 and 3
                this.lastAnimationTime = currentTime;
            }
        } else {
            // Top left frame for idle - immediate response
            this.currentSpriteFrame = 0;
            this.runningFrameCounter = 0;
        }
    }

    drawLineaKangSprite(ctx) {
        // Ensure sprite frame dimensions are calculated (only once)
        if (this.spriteFrameWidth === 0 || this.spriteFrameHeight === 0) {
            this.calculateSpriteFrameDimensions();
            // If still not available after calculation, fall back to full image
            if (this.spriteFrameWidth === 0 || this.spriteFrameHeight === 0) {
                if (this.direction === 1) {
                    ctx.drawImage(this.image, this.x, this.y, this.width * 1.15, this.height * 1.15);
                } else {
                    ctx.save();
                    ctx.translate(this.x + this.width * 1.15, this.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(this.image, 0, 0, this.width * 1.15, this.height * 1.15);
                    ctx.restore();
                }
                return;
            }
        }
        
        // Use pre-calculated frame positions for maximum performance
        const framePos = this.framePositions[this.currentSpriteFrame];
        const sourceX = framePos.col * this.spriteFrameWidth;
        const sourceY = framePos.row * this.spriteFrameHeight;
        const sourceWidth = this.spriteFrameWidth;
        const sourceHeight = this.spriteFrameHeight;
        
        // Draw the current frame
        ctx.save();
        
        if (this.direction === 1) {
            // Moving right - draw normally
            ctx.drawImage(
                this.image,
                sourceX, sourceY, sourceWidth, sourceHeight,
                this.x, this.y, this.width * 1.15, this.height * 1.15
            );
        } else {
            // Moving left - flip horizontally
            ctx.translate(this.x + this.width * 1.15, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.image,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, this.width * 1.15, this.height * 1.15
            );
        }
        
        ctx.restore();
    }

    checkForGap(currentPlatform) {
        // Check if there's a gap between the current platform and the one below
        const playerCenterX = this.x + this.width / 2;
        const checkY = currentPlatform.y + currentPlatform.height + 5; // Check slightly below the platform

        // Look for a platform directly below
        for (const platform of this.platforms) {
            if (platform === currentPlatform) continue;

            // Check if there's a platform below with a gap
            if (platform.y > currentPlatform.y) {
                const gapSize = platform.y - (currentPlatform.y + currentPlatform.height);
                
                // If there's a significant gap (more than player height)
                if (gapSize > this.height) {
                    // Check if the platform below is within reach
                    if (playerCenterX >= platform.x && 
                        playerCenterX <= platform.x + platform.width) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    checkEnemyCollision(enemy) {
        // Only check collision if enemy is in normal state
        if (enemy.state !== 'normal') return false;

        // Get the collision box for the player
        const playerBox = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };

        // Get the collision box for the enemy
        const enemyBox = {
            x: enemy.x,
            y: enemy.y,
            width: enemy.width,
            height: enemy.height
        };

        // Check if the player is above the enemy
        const isAboveEnemy = playerBox.y + playerBox.height <= enemyBox.y + 10; // 10 pixel tolerance

        // Only return true if there's a collision AND the player is not above the enemy
        return this.checkCollision(enemyBox) && !isAboveEnemy;
    }
} 