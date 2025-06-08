# Lineabros - Web3 Gaming on Linea Mainnet

A retro-style 2D platformer game integrated with Linea Mainnet blockchain. Players must connect their MetaMask wallet and have at least 30 transactions on Linea Mainnet to play.

## 🎮 Game Features

- **Retro 2D Platformer**: Classic pixel art style gameplay
- **Web3 Integration**: MetaMask wallet connection required
- **Linea Mainnet**: Built specifically for Linea blockchain network
- **Transaction Verification**: Minimum 30 transactions required to play
- **Multiple Characters**: Choose from Linea Kang, MetaFox, E-Frogs, or Foxy
- **Progressive Levels**: 50+ levels with increasing difficulty
- **Boss Battles**: Epic boss fights with special mechanics

## 🔗 Linea Mainnet Integration

### Network Details
- **Network Name**: Linea
- **RPC URL**: https://rpc.linea.build
- **Chain ID**: 59144
- **Currency Symbol**: ETH
- **Block Explorer**: https://lineascan.build

### Requirements
- MetaMask wallet installed
- Connected to Linea Mainnet network
- Minimum 30 transactions on Linea Mainnet
- ETH for gas fees (if needed)

## 🚀 How to Play

### 1. Setup
1. Install MetaMask browser extension
2. Add Linea Mainnet to your MetaMask (the game will help you do this)
3. Ensure you have at least 30 transactions on Linea Mainnet

### 2. Starting the Game
1. Run the local server: `python server.py`
2. Open http://localhost:8000 in your browser
3. Click "Connect MetaMask" when prompted
4. If not on Linea Mainnet, click "Switch Network"
5. Wait for transaction verification
6. Choose your character and start playing!

### 3. Game Controls
- **← →**: Move left/right
- **↑**: Jump
- **↓**: Drop through platforms
- **SPACE**: Shoot Ethballs
- **M**: Toggle music
- **F**: Toggle fullscreen
- **ENTER**: Confirm selections

### 4. Gameplay
- Defeat all enemies to clear each level
- Freeze enemies with Ethballs, then push them to eliminate
- Collect hearts dropped by bosses to gain extra lives
- Maximum 5 lives per game
- Progress through 50+ challenging levels

## 🎯 Special Features

### Wallet Status Display
- Real-time wallet information in the game HUD
- Transaction count display
- Network verification indicator

### Achievement System
- **Linea Explorer** (50+ transactions): Special recognition
- **Linea Veteran** (100+ transactions): Elite status display

### Security Features
- Automatic network detection and switching
- Transaction count verification
- Secure wallet connection handling
- No private key access required

## 🛠 Technical Details

### File Structure
```
lineabros/
├── index.html          # Main game page
├── styles.css          # Game styling and wallet UI
├── server.py           # Local development server
├── js/
│   ├── game.js         # Main game logic
│   ├── wallet.js       # Wallet integration
│   ├── player.js       # Player mechanics
│   ├── enemy.js        # Enemy AI
│   ├── constants.js    # Game constants
│   ├── audio.js        # Audio management
│   └── lib/
│       └── ethers.umd.min.js  # Ethereum library
├── images/             # Game assets
├── audio/              # Sound effects and music
└── assets/             # Additional game assets
```

### Wallet Integration
- **ethers.js**: Ethereum library for blockchain interaction
- **MetaMask Provider**: Web3 wallet connection
- **Network Switching**: Automatic Linea Mainnet setup
- **Transaction Verification**: Real-time blockchain queries

## 🔧 Development

### Prerequisites
- Python 3.x
- Modern web browser with MetaMask
- Linea Mainnet access

### Running Locally
```bash
# Clone the repository
git clone [repository-url]
cd lineabros

# Start the development server
python server.py

# Open in browser
# Navigate to http://localhost:8000
```

### Customization
- Modify `js/wallet.js` to change transaction requirements
- Update `styles.css` for UI customization
- Edit `js/constants.js` for game balance changes

## 🌐 Network Information

### Adding Linea Mainnet to MetaMask
The game will automatically prompt you to add Linea Mainnet, but you can also add it manually:

1. Open MetaMask
2. Click "Add Network"
3. Enter the following details:
   - **Network Name**: Linea
   - **RPC URL**: https://rpc.linea.build
   - **Chain ID**: 59144
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://lineascan.build

## 🎵 Audio
- Background music with retro chiptune style
- Character-specific music tracks:
  - **Linea Kang**: Custom theme music (`lineakangmusic.mp3`)
  - **E-Frogs**: Custom theme music (`audioaudio-efrogs.mp3`)
  - **MetaFox & Foxy**: Default background music (`audiobackground.mp3`)
- Sound effects for actions and events
- Music toggle functionality (M key)
- Automatic audio initialization on user interaction

## 📱 Browser Compatibility
- Chrome/Chromium (Recommended)
- Firefox
- Safari (with MetaMask extension)
- Edge

## 🔒 Security Notes
- The game only reads wallet address and transaction count
- No private keys or sensitive data are accessed
- All blockchain interactions are read-only
- MetaMask handles all security aspects

## 🎨 Art Style
- Retro pixel art graphics
- Classic 8-bit inspired design
- Smooth animations and effects
- Nostalgic gaming aesthetic

## 📈 Future Updates
- Additional characters and abilities
- More levels and worlds
- Leaderboard system
- NFT integration possibilities
- Multiplayer features

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues
1. **MetaMask not detected**: Ensure MetaMask extension is installed and enabled
2. **Wrong network**: Use the "Switch Network" button to connect to Linea Mainnet
3. **Insufficient transactions**: You need at least 30 transactions on Linea Mainnet
4. **Game not loading**: Check browser console for errors and ensure server is running

### Support
- Check browser console for error messages
- Ensure MetaMask is unlocked and connected
- Verify you're on Linea Mainnet (Chain ID: 59144)
- Refresh the page if wallet connection fails

---

**Enjoy playing Lineabros on Linea Mainnet! 🎮🦊** 