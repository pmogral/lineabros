class Enemy {
    constructor(x, y, level = 1, isBoss = false, gameInstance) {
        this.x = x;
        this.y = y;
        this.width = isBoss ? GAME_CONFIG.BOSS_WIDTH : GAME_CONFIG.ENEMY_WIDTH;
        this.height = isBoss ? GAME_CONFIG.BOSS_HEIGHT : GAME_CONFIG.ENEMY_HEIGHT;
        this.velocityX = 0;
        this.velocityY = 0;
        this.direction = -1; // Start moving left
        this.state = 'normal'; // normal, frozen, snowball
        this.freezeTimer = 0;
        this.snowballTimer = 0;
        this.lastDirectionChange = 0;
        this.stuckTimer = 0;
        this.lastX = x;
        this.level = level;
        this.isBoss = isBoss;
        this.health = isBoss ? GAME_CONFIG.BOSS_HEALTH : 1;
        this.speed = isBoss ? GAME_CONFIG.BOSS_SPEED : 
            (GAME_CONFIG.ENEMY_SPEED + (level - 1) * GAME_CONFIG.ENEMY_SPEED_INCREASE);
        this.jumpChance = isBoss ? 0.05 : 
            (GAME_CONFIG.ENEMY_JUMP_CHANCE + (level - 1) * GAME_CONFIG.ENEMY_JUMP_CHANCE_INCREASE);
        this.canJump = true;
        this.jumpCooldown = 0;
        this.platformCheckTimer = 0;
        this.attackCooldown = 0;
        this.summonCooldown = 0;
        this.attackPattern = 'normal'; // normal, jumpAttack, groundSlam
        this.attackTimer = 0;
        this.isJumping = false;
        this.isSlamming = false;
        this.game = gameInstance;
        
        // Use preloaded boss image if this is a boss
        if (this.isBoss) {
            this.bossImage = this.game.bossImage;
            this.bossImageLoaded = this.game.bossImageLoaded;
        }
    }

    update(player, platforms) {
        if (this.state === 'normal') {
            // Boss specific behavior
            if (this.isBoss) {
                this.updateBossBehavior(player, platforms);
            } else {
                this.updateNormalBehavior(player, platforms);
            }
        } else if (this.state === 'frozen') {
            this.freezeTimer--;
            if (this.freezeTimer <= 0) {
                this.state = 'normal';
            }
        } else if (this.state === 'snowball') {
            this.snowballTimer--;
            if (this.snowballTimer <= 0) {
                this.state = 'normal';
                this.velocityX = 0;
                this.velocityY = 0;
            }
        }
    }

    updateBossBehavior(player, platforms) {
        const distanceToPlayer = Math.abs(this.x - player.x);
        
        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.summonCooldown > 0) this.summonCooldown--;

        // Summon minions periodically
        if (this.summonCooldown === 0 && this.game.enemies.length < GAME_CONFIG.MAX_ENEMIES_PER_LEVEL) {
            this.summonMinions();
            this.summonCooldown = GAME_CONFIG.BOSS_SUMMON_COOLDOWN;
        }

        // Choose attack pattern based on distance and health
        if (this.attackCooldown === 0) {
            if (distanceToPlayer < 100) {
                this.attackPattern = 'groundSlam';
            } else if (player.y < this.y - 100) {
                this.attackPattern = 'jumpAttack';
            } else {
                this.attackPattern = 'normal';
            }
            this.attackTimer = 60; // 1 second for attack animation
        }

        // Execute current attack pattern
        switch (this.attackPattern) {
            case 'jumpAttack':
                if (this.attackTimer > 0) {
                    if (this.attackTimer === 60) {
                        this.velocityY = GAME_CONFIG.BOSS_JUMP_ATTACK_FORCE;
                        this.isJumping = true;
                    }
                    this.velocityX = this.direction * this.speed * 2;
                }
                break;

            case 'groundSlam':
                if (this.attackTimer > 0) {
                    if (this.attackTimer === 60) {
                        this.velocityY = GAME_CONFIG.BOSS_GROUND_SLAM_FORCE;
                        this.isSlamming = true;
                    }
                }
                break;

            default:
                // Normal movement
                if (distanceToPlayer < GAME_CONFIG.ENEMY_DETECTION_RANGE) {
                    this.direction = player.x < this.x ? -1 : 1;
                    this.velocityX = this.direction * this.speed;
                } else {
                    this.velocityX = this.direction * this.speed * 0.5;
                }
        }

        // Apply gravity and movement
        this.velocityY += GAME_CONFIG.GRAVITY;
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Platform collisions
        let onPlatform = false;
        for (const platform of platforms) {
            if (this.checkCollision(platform)) {
                if (this.velocityY > 0) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    onPlatform = true;
                    
                    // Reset attack states when landing
                    if (this.isJumping || this.isSlamming) {
                        this.isJumping = false;
                        this.isSlamming = false;
                        this.attackCooldown = GAME_CONFIG.BOSS_ATTACK_COOLDOWN;
                    }
                }
            }
        }

        // Screen boundaries
        if (this.x < 0) {
            this.x = 0;
            this.direction *= -1;
        }
        if (this.x + this.width > GAME_CONFIG.CANVAS_WIDTH) {
            this.x = GAME_CONFIG.CANVAS_WIDTH - this.width;
            this.direction *= -1;
        }

        // Update attack timer
        if (this.attackTimer > 0) {
            this.attackTimer--;
        }
    }

    summonMinions() {
        const spawnPositions = [
            { x: this.x - 100, y: this.y },
            { x: this.x + 100, y: this.y },
            { x: this.x, y: this.y - 50 }
        ];

        for (let i = 0; i < GAME_CONFIG.BOSS_MINION_COUNT; i++) {
            const pos = spawnPositions[i];
            if (pos) {
                const minion = new Enemy(pos.x, pos.y, this.level, false, this.game);
                this.game.enemies.push(minion);
            }
        }
    }

    updateNormalBehavior(player, platforms) {
        // Update platform check timer
        this.platformCheckTimer++;
        if (this.platformCheckTimer >= 30) { // Check every 30 frames
            this.platformCheckTimer = 0;
            this.checkPlatformAhead(platforms);
        }

        // Update jump cooldown
        if (this.jumpCooldown > 0) {
            this.jumpCooldown--;
        }

        // Basic movement
        this.velocityX = this.direction * this.speed;

        // Apply gravity
        this.velocityY += GAME_CONFIG.GRAVITY;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Platform collision
        let onPlatform = false;
        for (const platform of platforms) {
            if (this.checkCollision(platform)) {
                if (this.velocityY > 0) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    onPlatform = true;
                    this.canJump = true;
                }
            }
        }

        // Wall collision
        if (this.x <= 0 || this.x + this.width >= GAME_CONFIG.CANVAS_WIDTH) {
            this.direction *= -1;
            this.x = Math.max(0, Math.min(this.x, GAME_CONFIG.CANVAS_WIDTH - this.width));
        }

        // Player detection and behavior
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if player is above and within range
        if (dy < 0 && Math.abs(dx) < GAME_CONFIG.ENEMY_DETECTION_RANGE) {
            // Try to jump to reach player
            if (this.canJump && this.jumpCooldown === 0 && Math.random() < this.jumpChance * 2) {
                this.velocityY = GAME_CONFIG.ENEMY_JUMP_FORCE;
                this.canJump = false;
                this.jumpCooldown = 60; // 1 second cooldown
            }
        }

        // Modified behavior for levels after 20
        if (this.level > 20) {
            // Reduced chase range for higher levels
            const chaseRange = GAME_CONFIG.ENEMY_CHASE_RANGE * 0.7;
            
            // More random movement
            if (Math.random() < 0.02) { // 2% chance to change direction randomly
                this.direction *= -1;
            }
            
            // Random jumps when on platform
            if (onPlatform && Math.random() < 0.01) { // 1% chance to jump randomly
                this.velocityY = GAME_CONFIG.ENEMY_JUMP_FORCE;
                this.canJump = false;
                this.jumpCooldown = 60;
            }
            
            // Chase player with reduced probability
            if (distance < chaseRange && Math.random() < 0.7) { // 70% chance to chase when in range
                this.direction = Math.sign(dx);
            }
        } else {
            // Original behavior for levels 1-20
            if (distance < GAME_CONFIG.ENEMY_CHASE_RANGE) {
                this.direction = Math.sign(dx);
            }
            
            // Random direction changes
            if (Math.random() < GAME_CONFIG.ENEMY_DIRECTION_CHANGE_CHANCE) {
                this.direction *= -1;
            }
        }

        // Stuck detection
        if (Math.abs(this.x - this.lastX) < 1) {
            this.stuckTimer++;
            if (this.stuckTimer > 60) { // 1 second
                this.direction *= -1;
                this.stuckTimer = 0;
                // Try to jump when stuck
                if (this.canJump && this.jumpCooldown === 0) {
                    this.velocityY = GAME_CONFIG.ENEMY_JUMP_FORCE;
                    this.canJump = false;
                    this.jumpCooldown = 60;
                }
            }
        } else {
            this.stuckTimer = 0;
        }

        this.lastX = this.x;
    }

    performBossAttack(player) {
        // Create a shockwave or special attack
        this.velocityY = GAME_CONFIG.BOSS_JUMP_FORCE * 0.5;
        this.velocityX = this.direction * this.speed * 2;
    }

    checkCollision(platform) {
        // Special handling for bottom platform
        if (platform.y === 500) {
            return this.x < platform.x + platform.width &&
                   this.x + this.width > platform.x &&
                   this.y + this.height > platform.y &&
                   this.y < platform.y + platform.height;
        }
        
        // Normal collision detection for other platforms
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }

    checkPlatformAhead(platforms) {
        const lookAheadDistance = 50;
        const checkX = this.x + (this.direction * lookAheadDistance);
        const checkY = this.y + this.height + 5; // Check slightly below the enemy

        // Check if there's a platform ahead
        let platformAhead = false;
        let platformAbove = false;
        let platformBelow = false;

        for (const platform of platforms) {
            // Check for platform ahead
            if (checkX >= platform.x && checkX <= platform.x + platform.width &&
                Math.abs(checkY - platform.y) < 10) {
                platformAhead = true;
            }

            // Check for platform above
            if (this.x + this.width/2 >= platform.x && this.x + this.width/2 <= platform.x + platform.width &&
                this.y > platform.y && this.y < platform.y + 100) {
                platformAbove = true;
            }

            // Check for platform below
            if (this.x + this.width/2 >= platform.x && this.x + this.width/2 <= platform.x + platform.width &&
                this.y < platform.y && this.y > platform.y - 100) {
                platformBelow = true;
            }
        }

        // If no platform ahead but there's a platform above, try to jump
        if (!platformAhead && platformAbove && this.canJump && this.jumpCooldown === 0) {
            this.velocityY = GAME_CONFIG.ENEMY_JUMP_FORCE;
            this.canJump = false;
            this.jumpCooldown = 60;
        }

        // If no platform ahead and no platform above, change direction
        if (!platformAhead && !platformAbove) {
            this.direction *= -1;
        }
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = GAME_CONFIG.ENEMY_JUMP_FORCE;
            this.isJumping = true;
        }
    }

    snowballJump() {
        if (this.state === 'snowball') {
            this.velocityY = GAME_CONFIG.SNOWBALL_JUMP_FORCE;
            this.velocityX = this.direction * GAME_CONFIG.SNOWBALL_SPEED * 1.5;
        }
    }

    freeze() {
        if (this.state === 'normal') {
            this.state = 'frozen';
            this.freezeTimer = 180; // 3 seconds
            this.velocityX = 0;
            this.velocityY = 0;
        }
    }

    takeDamage(damage) {
        if (this.state === 'normal') {
            this.health -= damage;
            if (this.health <= 0) {
                if (this.isBoss) {
                    // Boss is immediately removed when HP reaches 0
                    this.game.enemies = this.game.enemies.filter(enemy => enemy !== this);
                } else {
                    // Regular enemies become snowballs
                    this.state = 'snowball';
                    this.snowballTimer = 300; // 5 seconds
                    this.velocityX = 0; // Stop the enemy
                }
            }
        }
    }

    draw(ctx) {
        if (this.isBoss) {
            if (this.bossImageLoaded) {
                // Draw the boss image
                if (this.direction === 1) {
                    ctx.drawImage(this.game.bossImage, this.x, this.y, this.width, this.height);
                } else {
                    ctx.save();
                    ctx.translate(this.x + this.width, this.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(this.game.bossImage, 0, 0, this.width, this.height);
                    ctx.restore();
                }
                
                // Add attack effect overlay
                if (this.isJumping) {
                    ctx.fillStyle = 'rgba(255, 69, 0, 0.3)'; // Orange overlay
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                } else if (this.isSlamming) {
                    ctx.fillStyle = 'rgba(139, 0, 0, 0.3)'; // Dark red overlay
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
                
                // State overlay
                if (this.state === 'frozen') {
                    ctx.fillStyle = 'rgba(52, 152, 219, 0.3)'; // Blue overlay
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            } else {
                // Fallback if image not loaded
                ctx.fillStyle = this.state === 'normal' ? '#ff0000' : 
                               this.state === 'frozen' ? '#00ff00' : '#0000ff';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            
            // Health bar
            const healthBarWidth = this.width;
            const healthBarHeight = 10;
            const healthPercentage = this.health / GAME_CONFIG.BOSS_HEALTH;
            
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x, this.y - 20, healthBarWidth, healthBarHeight);
            ctx.fillStyle = '#0f0';
            ctx.fillRect(this.x, this.y - 20, healthBarWidth * healthPercentage, healthBarHeight);
        } else {
            // Choose the appropriate enemy image based on level
            let enemyImage, enemyImageLoaded;
            if (this.level >= 21 && this.level <= 30) {
                enemyImage = this.game.enemyImage3;
                enemyImageLoaded = this.game.enemyImage3Loaded;
            } else if (this.level >= 11 && this.level <= 20) {
                enemyImage = this.game.enemyImage2;
                enemyImageLoaded = this.game.enemyImage2Loaded;
            } else {
                enemyImage = this.game.enemyImage;
                enemyImageLoaded = this.game.enemyImageLoaded;
            }

            if (enemyImageLoaded) {
                // Draw the image
                if (this.direction === 1) {
                    ctx.drawImage(enemyImage, this.x, this.y, this.width, this.height);
                } else {
                    ctx.save();
                    ctx.translate(this.x + this.width, this.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(enemyImage, 0, 0, this.width, this.height);
                    ctx.restore();
                }
                // Overlay color for frozen or snowball state
                if (this.state === 'frozen') {
                    ctx.fillStyle = 'rgba(52, 152, 219, 0.5)'; // blue overlay
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                } else if (this.state === 'snowball') {
                    ctx.fillStyle = 'rgba(46, 204, 113, 0.5)'; // green overlay
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            } else {
                // fallback if image not loaded
                ctx.fillStyle = this.state === 'normal' ? '#e74c3c' : 
                               this.state === 'frozen' ? '#3498db' : '#2ecc71';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    }
} 