const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    GRAVITY: 0.5,
    PLAYER_SPEED: 5,
    JUMP_FORCE: -12,
    MAX_JUMP_HEIGHT: 100,
    SNOWBALL_SPEED: 8,
    ENEMY_SPEED: 2,
    ENEMY_JUMP_FORCE: -15,
    SNOWBALL_RADIUS: 20,
    PLAYER_WIDTH: 40,
    PLAYER_HEIGHT: 60,
    ENEMY_WIDTH: 40,
    ENEMY_HEIGHT: 40,
    PLATFORM_HEIGHT: 20,
    SCORE_PER_ENEMY: 100,
    ENEMY_DAMAGE: 1,
    SNOWBALL_JUMP_FORCE: -15,
    ENEMY_DETECTION_RANGE: 300,
    ENEMY_CHASE_RANGE: 200,
    ENEMY_RETREAT_RANGE: 100,
    ENEMY_JUMP_CHANCE: 0.02,
    ENEMY_DIRECTION_CHANGE_CHANCE: 0.01,
    MAX_LEVELS: 50,
    ENEMY_SPEED_INCREASE: 0.2,
    ENEMY_JUMP_CHANCE_INCREASE: 0.005,
    ENEMY_SPAWN_RATE: 3,
    MIN_PLATFORM_GAP: 80,
    MAX_PLATFORM_GAP: 150,
    MIN_PLAYER_ENEMY_DISTANCE: 300,
    PLATFORM_DROP_GAP: 60,
    BOSS_LEVEL_INTERVAL: 10,
    BOSS_HEALTH: 15,
    BOSS_SPEED: 3,
    BOSS_JUMP_FORCE: -20,
    BOSS_WIDTH: 80,
    BOSS_HEIGHT: 80,
    BOSS_DAMAGE: 2,
    BOSS_SCORE: 1000,
    BOSS_SUMMON_COOLDOWN: 300,
    BOSS_MINION_COUNT: 3,
    BOSS_ATTACK_COOLDOWN: 120,
    BOSS_JUMP_ATTACK_FORCE: -25,
    BOSS_GROUND_SLAM_FORCE: 15,
    ENEMY_COUNT_INCREASE: 1,
    MAX_ENEMIES_PER_LEVEL: 8,
    PLATFORM_HEIGHT_INCREASE: 15,
    VERTICAL_PLATFORM_GAP: 100
};

const LEVELS = [
    {
        background: 'images/city-background.webp',
        platforms: [
            { x: 0, y: 500, width: 800, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 100, y: 400, width: 200, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 400, y: 400, width: 200, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 200, y: 300, width: 200, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 500, y: 300, width: 200, height: GAME_CONFIG.PLATFORM_HEIGHT }
        ],
        enemies: [
            { x: 700, y: 300 },
            { x: 650, y: 200 },
            { x: 600, y: 200 }
        ]
    },
    {
        background: 'images/city-background.webp',
        platforms: [
            { x: 0, y: 500, width: 800, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 0, y: 400, width: 250, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 300, y: 400, width: 250, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 600, y: 400, width: 200, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 150, y: 300, width: 250, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 450, y: 300, width: 250, height: GAME_CONFIG.PLATFORM_HEIGHT }
        ],
        enemies: [
            { x: 700, y: 300 },
            { x: 750, y: 300 },
            { x: 650, y: 200 },
            { x: 600, y: 200 }
        ]
    },
    {
        background: 'images/city-background.webp',
        platforms: [
            { x: 0, y: 500, width: 800, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 0, y: 400, width: 200, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 250, y: 400, width: 200, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 500, y: 400, width: 200, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 125, y: 300, width: 200, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 375, y: 300, width: 200, height: GAME_CONFIG.PLATFORM_HEIGHT },
            { x: 625, y: 300, width: 200, height: GAME_CONFIG.PLATFORM_HEIGHT }
        ],
        enemies: [
            { x: 700, y: 300 },
            { x: 750, y: 300 },
            { x: 650, y: 200 },
            { x: 600, y: 200 },
            { x: 550, y: 200 }
        ]
    },
    // Levels 4-10 will also use the city background image
    // Generate remaining levels with increasing difficulty
];

for (let i = 3; i < GAME_CONFIG.MAX_LEVELS; i++) {
    const isBossLevel = (i + 1) % GAME_CONFIG.BOSS_LEVEL_INTERVAL === 0;
    const level = {
        background: i < 10 ? 'images/city-background.webp' : 
                   i < 20 ? 'images/backgr2.webp' :
                   i < 30 ? 'images/backgr3.webp' :
                   (isBossLevel ? '#8B0000' : `hsl(${i * 7}, 70%, 20%)`),
        platforms: [],
        enemies: [],
        isBossLevel: isBossLevel
    };

    // Calculate level-specific values
    const enemyCount = isBossLevel ? 0 : Math.min(
        GAME_CONFIG.ENEMY_SPAWN_RATE + (i * GAME_CONFIG.ENEMY_COUNT_INCREASE),
        GAME_CONFIG.MAX_ENEMIES_PER_LEVEL
    );
    const platformCount = isBossLevel ? 8 : (5 + Math.floor(i / 2));
    const platformWidth = isBossLevel ? 200 : (200 - (i * 1.5));
    
    // Calculate platform gap based on level
    let platformGap;
    if (isBossLevel) {
        platformGap = 150;
    } else if (i >= 20) {
        // For levels 20+, ensure larger gaps and more consistent spacing
        const minGap = GAME_CONFIG.MIN_PLATFORM_GAP * 2.5; // Increased minimum gap
        const maxGap = GAME_CONFIG.MAX_PLATFORM_GAP * 1.5; // Increased maximum gap
        platformGap = Math.max(minGap, Math.min(maxGap, GAME_CONFIG.CANVAS_WIDTH / (platformCount + 1)));
    } else {
        platformGap = GAME_CONFIG.MIN_PLATFORM_GAP;
    }

    // Bottom platform
    level.platforms.push({ x: 0, y: 500, width: 800, height: GAME_CONFIG.PLATFORM_HEIGHT });

    if (isBossLevel) {
        // Create a better boss arena with multiple platforms
        // Left side platforms
        level.platforms.push({ x: 50, y: 400, width: 150, height: GAME_CONFIG.PLATFORM_HEIGHT });
        level.platforms.push({ x: 250, y: 350, width: 150, height: GAME_CONFIG.PLATFORM_HEIGHT });
        level.platforms.push({ x: 450, y: 300, width: 150, height: GAME_CONFIG.PLATFORM_HEIGHT });
        
        // Right side platforms
        level.platforms.push({ x: 600, y: 400, width: 150, height: GAME_CONFIG.PLATFORM_HEIGHT });
        level.platforms.push({ x: 400, y: 350, width: 150, height: GAME_CONFIG.PLATFORM_HEIGHT });
        level.platforms.push({ x: 200, y: 300, width: 150, height: GAME_CONFIG.PLATFORM_HEIGHT });
        
        // Center platform
        level.platforms.push({ x: 350, y: 250, width: 100, height: GAME_CONFIG.PLATFORM_HEIGHT });

        // Add boss at the center platform
        level.enemies.push({
            x: 350 + (100 / 2) - (GAME_CONFIG.BOSS_WIDTH / 2),
            y: 250 - GAME_CONFIG.BOSS_HEIGHT,
            isBoss: true
        });
    } else {
        // Generate platforms with fixed vertical spacing from the ground
        let lastPlatformEnd = 0;
        const maxFloors = 4; // Maximum number of floors above ground
        const platformsPerFloor = Math.ceil(platformCount / maxFloors); // Distribute platforms across floors
        const firstRowY = 500 - GAME_CONFIG.MAX_JUMP_HEIGHT;

        for (let floor = 0; floor < maxFloors; floor++) {
            lastPlatformEnd = 0; // Reset for each floor
            const y = firstRowY - (floor * GAME_CONFIG.MAX_JUMP_HEIGHT);
            
            // Calculate how many platforms for this floor
            const platformsThisFloor = Math.min(platformsPerFloor, platformCount - (floor * platformsPerFloor));
            
            // Calculate even spacing for platforms on this floor
            const totalGap = GAME_CONFIG.CANVAS_WIDTH - (platformsThisFloor * platformWidth);
            const evenGap = totalGap / (platformsThisFloor + 1);
            
            for (let j = 0; j < platformsThisFloor; j++) {
                // Calculate base position with even spacing
                const baseX = evenGap + (j * (platformWidth + evenGap));
                
                // Add some randomness to platform positions, but ensure minimum gap
                const randomOffset = Math.random() * (evenGap * 0.3) - (evenGap * 0.15);
                const adjustedX = Math.max(
                    lastPlatformEnd + (i >= 20 ? platformGap * 0.8 : platformGap), // Ensure minimum gap
                    Math.min(baseX + randomOffset, GAME_CONFIG.CANVAS_WIDTH - platformWidth)
                );

                if (adjustedX + platformWidth <= GAME_CONFIG.CANVAS_WIDTH) {
                    level.platforms.push({
                        x: adjustedX,
                        y: y,
                        width: platformWidth,
                        height: GAME_CONFIG.PLATFORM_HEIGHT
                    });
                    lastPlatformEnd = adjustedX + platformWidth;
                }
            }
        }

        // Generate regular enemies
        const playerSpawnX = 100;
        const usedPlatforms = new Set();

        for (let j = 0; j < enemyCount; j++) {
            let validSpawn = false;
            let spawnX, spawnY;
            let attempts = 0;
            
            while (!validSpawn && attempts < 10) {
                // Choose a random platform, excluding the bottom one
                const platformIndex = Math.floor(Math.random() * (level.platforms.length - 1)) + 1;
                const platform = level.platforms[platformIndex];
                
                // Only use each platform once to spread enemies out
                if (!usedPlatforms.has(platformIndex)) {
                    spawnX = platform.x + (platform.width / 2);
                    spawnY = platform.y - GAME_CONFIG.ENEMY_HEIGHT;
                    
                    // Check distance from player spawn and other enemies
                    if (Math.abs(spawnX - playerSpawnX) >= GAME_CONFIG.MIN_PLAYER_ENEMY_DISTANCE) {
                        validSpawn = true;
                        usedPlatforms.add(platformIndex);
                    }
                }
                attempts++;
            }
            
            if (validSpawn) {
                level.enemies.push({
                    x: spawnX,
                    y: spawnY
                });
            }
        }
    }

    LEVELS.push(level);
}

// Update background for levels 31-50 to use backgr4.webp
for (let i = 30; i < 50; i++) {
    LEVELS[i].background = 'images/backgr4.webp';
}

// Update platform layouts for levels 21-50 with more varied patterns
for (let i = 20; i < 50; i++) {
    const level = LEVELS[i];
    // Skip if this is a boss level
    if (level.isBossLevel) continue;
    
    const difficulty = Math.floor((i - 20) / 10) + 1; // 1 for 21-30, 2 for 31-40, 3 for 41-50
    
    // Base platform width and height
    const platformWidth = 100;
    const platformHeight = 20;
    
    // Always include the ground platform
    level.platforms = [
        { x: 0, y: 500, width: 800, height: platformHeight }
    ];

    // Generate unique platform layouts based on level number
    const levelPattern = i % 10; // 0-9 pattern for each difficulty tier
    
    switch(difficulty) {
        case 1: // Levels 21-30: Basic patterns with increasing complexity
            switch(levelPattern) {
                case 0: // Staircase pattern with more platforms
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 250, y: 400, width: platformWidth, height: platformHeight },
                        { x: 400, y: 350, width: platformWidth, height: platformHeight },
                        { x: 550, y: 300, width: platformWidth, height: platformHeight },
                        { x: 200, y: 350, width: platformWidth, height: platformHeight },
                        { x: 350, y: 300, width: platformWidth, height: platformHeight },
                        { x: 500, y: 250, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 1: // Double staircase with more platforms
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 400, width: platformWidth, height: platformHeight },
                        { x: 500, y: 350, width: platformWidth, height: platformHeight },
                        { x: 200, y: 350, width: platformWidth, height: platformHeight },
                        { x: 400, y: 300, width: platformWidth, height: platformHeight },
                        { x: 600, y: 300, width: platformWidth, height: platformHeight },
                        { x: 300, y: 250, width: platformWidth, height: platformHeight },
                        { x: 500, y: 200, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 2: // Pyramid pattern with more platforms
                    level.platforms.push(
                        { x: 350, y: 400, width: platformWidth, height: platformHeight },
                        { x: 250, y: 400, width: platformWidth, height: platformHeight },
                        { x: 450, y: 400, width: platformWidth, height: platformHeight },
                        { x: 150, y: 350, width: platformWidth, height: platformHeight },
                        { x: 550, y: 350, width: platformWidth, height: platformHeight },
                        { x: 200, y: 300, width: platformWidth, height: platformHeight },
                        { x: 500, y: 300, width: platformWidth, height: platformHeight },
                        { x: 350, y: 250, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 3: // Zigzag pattern with more platforms
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 400, width: platformWidth, height: platformHeight },
                        { x: 500, y: 400, width: platformWidth, height: platformHeight },
                        { x: 700, y: 400, width: platformWidth, height: platformHeight },
                        { x: 200, y: 350, width: platformWidth, height: platformHeight },
                        { x: 400, y: 350, width: platformWidth, height: platformHeight },
                        { x: 600, y: 350, width: platformWidth, height: platformHeight },
                        { x: 300, y: 300, width: platformWidth, height: platformHeight },
                        { x: 500, y: 300, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 4: // Floating islands with more platforms
                    level.platforms.push(
                        { x: 150, y: 400, width: platformWidth, height: platformHeight },
                        { x: 400, y: 400, width: platformWidth, height: platformHeight },
                        { x: 650, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 350, width: platformWidth, height: platformHeight },
                        { x: 550, y: 300, width: platformWidth, height: platformHeight },
                        { x: 200, y: 300, width: platformWidth, height: platformHeight },
                        { x: 450, y: 250, width: platformWidth, height: platformHeight },
                        { x: 700, y: 250, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 5: // Double columns with more platforms
                    level.platforms.push(
                        { x: 200, y: 400, width: platformWidth, height: platformHeight },
                        { x: 200, y: 350, width: platformWidth, height: platformHeight },
                        { x: 200, y: 300, width: platformWidth, height: platformHeight },
                        { x: 500, y: 400, width: platformWidth, height: platformHeight },
                        { x: 500, y: 350, width: platformWidth, height: platformHeight },
                        { x: 500, y: 300, width: platformWidth, height: platformHeight },
                        { x: 350, y: 250, width: platformWidth, height: platformHeight },
                        { x: 350, y: 200, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 6: // Triple steps with more platforms
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 350, y: 400, width: platformWidth, height: platformHeight },
                        { x: 600, y: 400, width: platformWidth, height: platformHeight },
                        { x: 200, y: 350, width: platformWidth, height: platformHeight },
                        { x: 450, y: 350, width: platformWidth, height: platformHeight },
                        { x: 300, y: 300, width: platformWidth, height: platformHeight },
                        { x: 550, y: 300, width: platformWidth, height: platformHeight },
                        { x: 400, y: 250, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 7: // Cross pattern with more platforms
                    level.platforms.push(
                        { x: 350, y: 400, width: platformWidth, height: platformHeight },
                        { x: 350, y: 350, width: platformWidth, height: platformHeight },
                        { x: 250, y: 400, width: platformWidth, height: platformHeight },
                        { x: 450, y: 400, width: platformWidth, height: platformHeight },
                        { x: 150, y: 350, width: platformWidth, height: platformHeight },
                        { x: 550, y: 350, width: platformWidth, height: platformHeight },
                        { x: 250, y: 300, width: platformWidth, height: platformHeight },
                        { x: 450, y: 300, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 8: // Spiral pattern with more platforms
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 100, y: 350, width: platformWidth, height: platformHeight },
                        { x: 300, y: 350, width: platformWidth, height: platformHeight },
                        { x: 300, y: 250, width: platformWidth, height: platformHeight },
                        { x: 500, y: 250, width: platformWidth, height: platformHeight },
                        { x: 500, y: 200, width: platformWidth, height: platformHeight },
                        { x: 700, y: 200, width: platformWidth, height: platformHeight },
                        { x: 700, y: 150, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 9: // Diamond pattern with more platforms
                    level.platforms.push(
                        { x: 350, y: 400, width: platformWidth, height: platformHeight },
                        { x: 250, y: 400, width: platformWidth, height: platformHeight },
                        { x: 450, y: 400, width: platformWidth, height: platformHeight },
                        { x: 350, y: 350, width: platformWidth, height: platformHeight },
                        { x: 200, y: 350, width: platformWidth, height: platformHeight },
                        { x: 500, y: 350, width: platformWidth, height: platformHeight },
                        { x: 300, y: 300, width: platformWidth, height: platformHeight },
                        { x: 400, y: 300, width: platformWidth, height: platformHeight }
                    );
                    break;
            }
            break;
            
        case 2: // Levels 31-40: More complex patterns with floating platforms
            switch(levelPattern) {
                case 0: // Advanced staircase
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 250, y: 400, width: platformWidth, height: platformHeight },
                        { x: 400, y: 350, width: platformWidth, height: platformHeight },
                        { x: 550, y: 300, width: platformWidth, height: platformHeight },
                        { x: 700, y: 250, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 1: // Double helix
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 100, y: 350, width: platformWidth, height: platformHeight },
                        { x: 300, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 300, width: platformWidth, height: platformHeight },
                        { x: 500, y: 350, width: platformWidth, height: platformHeight },
                        { x: 500, y: 250, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 2: // Floating towers
                    level.platforms.push(
                        { x: 150, y: 400, width: platformWidth, height: platformHeight },
                        { x: 150, y: 350, width: platformWidth, height: platformHeight },
                        { x: 150, y: 250, width: platformWidth, height: platformHeight },
                        { x: 450, y: 400, width: platformWidth, height: platformHeight },
                        { x: 450, y: 350, width: platformWidth, height: platformHeight },
                        { x: 450, y: 250, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 3: // Zigzag towers
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 400, width: platformWidth, height: platformHeight },
                        { x: 500, y: 350, width: platformWidth, height: platformHeight },
                        { x: 700, y: 300, width: platformWidth, height: platformHeight },
                        { x: 200, y: 300, width: platformWidth, height: platformHeight },
                        { x: 400, y: 250, width: platformWidth, height: platformHeight },
                        { x: 600, y: 200, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 4: // Floating maze
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 400, width: platformWidth, height: platformHeight },
                        { x: 500, y: 400, width: platformWidth, height: platformHeight },
                        { x: 200, y: 350, width: platformWidth, height: platformHeight },
                        { x: 400, y: 350, width: platformWidth, height: platformHeight },
                        { x: 300, y: 250, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 5: // Double cross
                    level.platforms.push(
                        { x: 350, y: 400, width: platformWidth, height: platformHeight },
                        { x: 350, y: 350, width: platformWidth, height: platformHeight },
                        { x: 250, y: 400, width: platformWidth, height: platformHeight },
                        { x: 450, y: 400, width: platformWidth, height: platformHeight },
                        { x: 150, y: 300, width: platformWidth, height: platformHeight },
                        { x: 550, y: 300, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 6: // Triple helix
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 100, y: 350, width: platformWidth, height: platformHeight },
                        { x: 100, y: 250, width: platformWidth, height: platformHeight },
                        { x: 400, y: 400, width: platformWidth, height: platformHeight },
                        { x: 400, y: 300, width: platformWidth, height: platformHeight },
                        { x: 400, y: 200, width: platformWidth, height: platformHeight },
                        { x: 700, y: 350, width: platformWidth, height: platformHeight },
                        { x: 700, y: 250, width: platformWidth, height: platformHeight },
                        { x: 700, y: 150, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 7: // Floating islands with bridges
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 400, width: platformWidth, height: platformHeight },
                        { x: 500, y: 400, width: platformWidth, height: platformHeight },
                        { x: 200, y: 350, width: platformWidth, height: platformHeight },
                        { x: 400, y: 350, width: platformWidth, height: platformHeight },
                        { x: 300, y: 250, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 8: // Spiral tower
                    level.platforms.push(
                        { x: 350, y: 400, width: platformWidth, height: platformHeight },
                        { x: 250, y: 400, width: platformWidth, height: platformHeight },
                        { x: 450, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 350, width: platformWidth, height: platformHeight },
                        { x: 400, y: 350, width: platformWidth, height: platformHeight },
                        { x: 350, y: 300, width: platformWidth, height: platformHeight },
                        { x: 350, y: 250, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 9: // Floating maze 2
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 400, width: platformWidth, height: platformHeight },
                        { x: 500, y: 400, width: platformWidth, height: platformHeight },
                        { x: 200, y: 350, width: platformWidth, height: platformHeight },
                        { x: 400, y: 350, width: platformWidth, height: platformHeight },
                        { x: 300, y: 250, width: platformWidth, height: platformHeight },
                        { x: 500, y: 250, width: platformWidth, height: platformHeight }
                    );
                    break;
            }
            break;
            
        case 3: // Levels 41-50: Most complex patterns with multiple layers
            switch(levelPattern) {
                case 0: // Ultimate staircase
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 250, y: 400, width: platformWidth, height: platformHeight },
                        { x: 400, y: 350, width: platformWidth, height: platformHeight },
                        { x: 550, y: 300, width: platformWidth, height: platformHeight },
                        { x: 700, y: 250, width: platformWidth, height: platformHeight },
                        { x: 200, y: 300, width: platformWidth, height: platformHeight },
                        { x: 350, y: 250, width: platformWidth, height: platformHeight },
                        { x: 500, y: 200, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 1: // Triple helix tower
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 100, y: 350, width: platformWidth, height: platformHeight },
                        { x: 100, y: 250, width: platformWidth, height: platformHeight },
                        { x: 100, y: 150, width: platformWidth, height: platformHeight },
                        { x: 400, y: 400, width: platformWidth, height: platformHeight },
                        { x: 400, y: 300, width: platformWidth, height: platformHeight },
                        { x: 400, y: 200, width: platformWidth, height: platformHeight },
                        { x: 400, y: 100, width: platformWidth, height: platformHeight },
                        { x: 700, y: 350, width: platformWidth, height: platformHeight },
                        { x: 700, y: 250, width: platformWidth, height: platformHeight },
                        { x: 700, y: 150, width: platformWidth, height: platformHeight },
                        { x: 700, y: 50, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 2: // Floating castle
                    level.platforms.push(
                        { x: 150, y: 400, width: platformWidth, height: platformHeight },
                        { x: 350, y: 400, width: platformWidth, height: platformHeight },
                        { x: 550, y: 400, width: platformWidth, height: platformHeight },
                        { x: 250, y: 350, width: platformWidth, height: platformHeight },
                        { x: 450, y: 350, width: platformWidth, height: platformHeight },
                        { x: 350, y: 250, width: platformWidth, height: platformHeight },
                        { x: 150, y: 150, width: platformWidth, height: platformHeight },
                        { x: 550, y: 150, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 3: // Ultimate zigzag
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 400, width: platformWidth, height: platformHeight },
                        { x: 500, y: 350, width: platformWidth, height: platformHeight },
                        { x: 700, y: 300, width: platformWidth, height: platformHeight },
                        { x: 200, y: 300, width: platformWidth, height: platformHeight },
                        { x: 400, y: 250, width: platformWidth, height: platformHeight },
                        { x: 600, y: 200, width: platformWidth, height: platformHeight },
                        { x: 300, y: 150, width: platformWidth, height: platformHeight },
                        { x: 500, y: 100, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 4: // Floating maze 3
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 400, width: platformWidth, height: platformHeight },
                        { x: 500, y: 400, width: platformWidth, height: platformHeight },
                        { x: 700, y: 400, width: platformWidth, height: platformHeight },
                        { x: 200, y: 350, width: platformWidth, height: platformHeight },
                        { x: 400, y: 350, width: platformWidth, height: platformHeight },
                        { x: 600, y: 350, width: platformWidth, height: platformHeight },
                        { x: 300, y: 250, width: platformWidth, height: platformHeight },
                        { x: 500, y: 250, width: platformWidth, height: platformHeight },
                        { x: 400, y: 150, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 5: // Triple cross
                    level.platforms.push(
                        { x: 350, y: 400, width: platformWidth, height: platformHeight },
                        { x: 350, y: 350, width: platformWidth, height: platformHeight },
                        { x: 350, y: 250, width: platformWidth, height: platformHeight },
                        { x: 250, y: 400, width: platformWidth, height: platformHeight },
                        { x: 450, y: 400, width: platformWidth, height: platformHeight },
                        { x: 150, y: 300, width: platformWidth, height: platformHeight },
                        { x: 550, y: 300, width: platformWidth, height: platformHeight },
                        { x: 250, y: 200, width: platformWidth, height: platformHeight },
                        { x: 450, y: 200, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 6: // Ultimate spiral
                    level.platforms.push(
                        { x: 350, y: 400, width: platformWidth, height: platformHeight },
                        { x: 250, y: 400, width: platformWidth, height: platformHeight },
                        { x: 450, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 350, width: platformWidth, height: platformHeight },
                        { x: 400, y: 350, width: platformWidth, height: platformHeight },
                        { x: 350, y: 300, width: platformWidth, height: platformHeight },
                        { x: 250, y: 250, width: platformWidth, height: platformHeight },
                        { x: 450, y: 250, width: platformWidth, height: platformHeight },
                        { x: 350, y: 200, width: platformWidth, height: platformHeight },
                        { x: 350, y: 150, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 7: // Floating islands 2
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 400, width: platformWidth, height: platformHeight },
                        { x: 500, y: 400, width: platformWidth, height: platformHeight },
                        { x: 700, y: 400, width: platformWidth, height: platformHeight },
                        { x: 200, y: 350, width: platformWidth, height: platformHeight },
                        { x: 400, y: 350, width: platformWidth, height: platformHeight },
                        { x: 600, y: 350, width: platformWidth, height: platformHeight },
                        { x: 300, y: 250, width: platformWidth, height: platformHeight },
                        { x: 500, y: 250, width: platformWidth, height: platformHeight },
                        { x: 400, y: 150, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 8: // Ultimate tower
                    level.platforms.push(
                        { x: 350, y: 400, width: platformWidth, height: platformHeight },
                        { x: 350, y: 350, width: platformWidth, height: platformHeight },
                        { x: 350, y: 250, width: platformWidth, height: platformHeight },
                        { x: 350, y: 150, width: platformWidth, height: platformHeight },
                        { x: 350, y: 50, width: platformWidth, height: platformHeight },
                        { x: 250, y: 400, width: platformWidth, height: platformHeight },
                        { x: 450, y: 400, width: platformWidth, height: platformHeight },
                        { x: 150, y: 300, width: platformWidth, height: platformHeight },
                        { x: 550, y: 300, width: platformWidth, height: platformHeight },
                        { x: 250, y: 200, width: platformWidth, height: platformHeight },
                        { x: 450, y: 200, width: platformWidth, height: platformHeight }
                    );
                    break;
                case 9: // Ultimate maze
                    level.platforms.push(
                        { x: 100, y: 400, width: platformWidth, height: platformHeight },
                        { x: 300, y: 400, width: platformWidth, height: platformHeight },
                        { x: 500, y: 400, width: platformWidth, height: platformHeight },
                        { x: 700, y: 400, width: platformWidth, height: platformHeight },
                        { x: 200, y: 350, width: platformWidth, height: platformHeight },
                        { x: 400, y: 350, width: platformWidth, height: platformHeight },
                        { x: 600, y: 350, width: platformWidth, height: platformHeight },
                        { x: 300, y: 250, width: platformWidth, height: platformHeight },
                        { x: 500, y: 250, width: platformWidth, height: platformHeight },
                        { x: 400, y: 150, width: platformWidth, height: platformHeight },
                        { x: 200, y: 150, width: platformWidth, height: platformHeight },
                        { x: 600, y: 150, width: platformWidth, height: platformHeight }
                    );
                    break;
            }
            break;
    }
    
    // Add more enemies based on difficulty
    const baseEnemies = level.enemies;
    const additionalEnemies = [];
    const playerSpawnX = 100; // Player spawn point
    
    // Filter base enemies to ensure they're far enough from player spawn
    const filteredBaseEnemies = baseEnemies.filter(enemy => 
        Math.abs(enemy.x - playerSpawnX) >= GAME_CONFIG.MIN_PLAYER_ENEMY_DISTANCE
    );
    
    if (difficulty >= 2) {
        // Add flying enemies for higher difficulties, ensuring minimum distance from player
        const potentialEnemies = [
            { x: 200, y: 200, isBoss: false },
            { x: 600, y: 250, isBoss: false }
        ];
        
        // Only add enemies that are far enough from player spawn
        potentialEnemies.forEach(enemy => {
            if (Math.abs(enemy.x - playerSpawnX) >= GAME_CONFIG.MIN_PLAYER_ENEMY_DISTANCE) {
                additionalEnemies.push(enemy);
            }
        });
    }
    
    if (difficulty === 3) {
        // Add more challenging enemy patterns for highest difficulty
        const potentialEnemies = [
            { x: 400, y: 150, isBoss: false },
            { x: 800, y: 150, isBoss: false }
        ];
        
        // Only add enemies that are far enough from player spawn
        potentialEnemies.forEach(enemy => {
            if (Math.abs(enemy.x - playerSpawnX) >= GAME_CONFIG.MIN_PLAYER_ENEMY_DISTANCE) {
                additionalEnemies.push(enemy);
            }
        });
    }
    
    // Combine filtered base enemies with additional enemies
    level.enemies = [...filteredBaseEnemies, ...additionalEnemies];
}

const KEYS = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    SPACE: ' '
};

window.GAME_CONFIG = GAME_CONFIG;
window.LEVELS = LEVELS; 