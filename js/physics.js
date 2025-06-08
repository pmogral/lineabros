class Physics {
    static checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    static checkCircleCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circle1.radius + circle2.radius;
    }

    static checkCircleRectCollision(circle, rect) {
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        return (distanceX * distanceX + distanceY * distanceY) < (circle.radius * circle.radius);
    }

    static applyGravity(entity) {
        entity.velocityY += GAME_CONFIG.GRAVITY;
        entity.y += entity.velocityY;
    }

    static handlePlatformCollision(entity, platform) {
        if (entity.velocityY > 0 && 
            entity.y + entity.height > platform.y && 
            entity.y + entity.height < platform.y + platform.height &&
            entity.x + entity.width > platform.x && 
            entity.x < platform.x + platform.width) {
            entity.y = platform.y - entity.height;
            entity.velocityY = 0;
            entity.isJumping = false;
            return true;
        }
        return false;
    }
} 