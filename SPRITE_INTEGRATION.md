# Linea Kang Sprite Sheet Integration

## Overview
The Linea Kang character now supports sprite sheet animation with 4 distinct frames for different character states.

## Sprite Sheet Layout
The sprite sheet should be arranged horizontally with 4 frames:

```
[Frame 1] [Frame 2] [Frame 3] [Frame 4]
  Idle     Jump     Run 1     Run 2
```

### Frame Specifications
- **Frame 1 (Index 0)**: Idle position - Default standing pose
- **Frame 2 (Index 1)**: Jumping - Character in mid-air pose  
- **Frame 3 (Index 2)**: Running 1 - First running animation frame
- **Frame 4 (Index 3)**: Running 2 - Second running animation frame

## File Requirements
- **File Name**: `linea-kang-spritesheet.webp`
- **Location**: `images/` directory
- **Format**: WebP (recommended) or PNG
- **Layout**: Horizontal strip with 4 equally-sized frames
- **Dimensions**: Each frame should be square or rectangular (consistent aspect ratio)

## Animation Behavior

### Idle State
- Shows Frame 1 when the character is not moving or jumping
- Static display, no animation cycling

### Jumping State  
- Shows Frame 2 when `player.isJumping` is true
- Remains on this frame for the entire jump duration

### Running State
- Alternates between Frame 3 and Frame 4 when `player.isWalking` is true
- Frame change occurs every 200ms for smooth running animation
- Automatically resets to idle when movement stops

### Direction Handling
- All frames support horizontal flipping for left/right movement
- Sprite rendering automatically handles direction changes

## Technical Implementation

### Key Methods Added
1. **`calculateSpriteFrameDimensions()`**: Calculates individual frame dimensions
2. **`updateSpriteAnimation()`**: Manages frame selection based on player state
3. **`drawLineaKangSprite(ctx)`**: Renders the appropriate sprite frame

### Animation Properties
```javascript
this.spriteFrameWidth = 0;      // Calculated frame width
this.spriteFrameHeight = 0;     // Calculated frame height  
this.totalFrames = 4;           // Total frames in sprite sheet
this.currentSpriteFrame = 0;    // Current frame index (0-3)
this.runningFrameCounter = 0;   // Counter for running animation
```

### Frame Selection Logic
```javascript
if (this.isJumping) {
    this.currentSpriteFrame = 1;  // Jump frame
} else if (this.isWalking) {
    // Alternate between frames 2 and 3 for running
    this.currentSpriteFrame = 2 + (this.runningFrameCounter % 2);
} else {
    this.currentSpriteFrame = 0;  // Idle frame
}
```

## Testing
Use the included `sprite-test.html` file to:
- Preview sprite sheet animation
- Test frame transitions
- Verify direction flipping
- Validate timing and smoothness

## Integration Steps

1. **Create Sprite Sheet**: Design your 4-frame sprite sheet following the layout above
2. **Save File**: Save as `images/linea-kang-spritesheet.webp`
3. **Test**: Open `sprite-test.html` to preview (update the image source in the test file)
4. **Play Game**: The character will automatically use sprite animation when selected

## Fallback Behavior
- If sprite sheet fails to load, falls back to full image rendering
- If frame dimensions can't be calculated, uses original single-image display
- Maintains compatibility with existing character selection system

## Performance Notes
- Sprite sheet rendering is optimized for smooth 60fps gameplay
- Frame calculations are cached to avoid repeated computation
- Animation timing is frame-rate independent using `Date.now()`

## Customization
To modify animation timing, adjust these values in `player.js`:
- **Running animation speed**: Change `200` in `updateSpriteAnimation()` 
- **Frame count**: Modify `this.totalFrames` if using different sprite sheet layout
- **Animation logic**: Customize frame selection in `updateSpriteAnimation()` 