class WalletManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.userAddress = null;
        this.isConnected = false;
        this.transactionCount = 0;
        
        // Linea Mainnet configuration
        this.lineaMainnet = {
            chainId: '0xE708', // 59144 in hex
            chainName: 'Linea',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://rpc.linea.build'],
            blockExplorerUrls: ['https://lineascan.build']
        };
        
        this.requiredTransactions = 30;
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Connect wallet button
        const connectBtn = document.getElementById('connectWalletBtn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                console.log('Connect wallet button clicked');
                this.connectWallet();
            });
        } else {
            console.error('Connect wallet button not found');
        }
        
        // Switch network button
        const switchBtn = document.getElementById('switchNetworkBtn');
        if (switchBtn) {
            switchBtn.addEventListener('click', () => {
                console.log('Switch network button clicked');
                this.switchToLineaMainnet();
            });
        }
        
        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.handleDisconnect();
                } else {
                    this.handleAccountChange(accounts[0]);
                }
            });
            
            window.ethereum.on('chainChanged', (chainId) => {
                this.handleNetworkChange(chainId);
            });
        }
    }
    
    async connectWallet() {
        try {
            if (!window.ethereum) {
                this.showError('MetaMask is not installed. Please install MetaMask to play.');
                return;
            }
            
            this.updateStatus('Connecting to MetaMask...');
            
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length === 0) {
                this.showError('No accounts found. Please unlock MetaMask.');
                return;
            }
            
            this.userAddress = accounts[0];
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.isConnected = true;
            
            this.updateStatus('Wallet connected! Checking network...');
            
            // Check if on correct network
            try {
                const network = await this.provider.getNetwork();
                if (network.chainId !== 59144) {
                    console.log('Wrong network detected:', network.chainId);
                    this.showNetworkWarning();
                    return;
                }
                
                // Check transaction count
                await this.checkTransactionCount();
            } catch (networkError) {
                console.error('Network detection error:', networkError);
                // If we can't detect the network, assume it's wrong and show network warning
                this.showNetworkWarning();
            }
            
        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.showError('Failed to connect wallet: ' + error.message);
        }
    }
    
    async switchToLineaMainnet() {
        try {
            this.updateStatus('Switching to Linea Mainnet...');
            
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.lineaMainnet.chainId }],
            });
            
            // Network switch successful, the handleNetworkChange will be called automatically
            this.updateStatus('Network switched successfully! Checking connection...');
            
        } catch (switchError) {
            console.error('Switch network error:', switchError);
            
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    this.updateStatus('Adding Linea Mainnet to MetaMask...');
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [this.lineaMainnet],
                    });
                    this.updateStatus('Linea Mainnet added successfully! Checking connection...');
                } catch (addError) {
                    console.error('Error adding Linea network:', addError);
                    this.showError('Failed to add Linea network. Please add it manually.');
                }
            } else if (switchError.code === 4001) {
                // User rejected the request
                this.updateStatus('Network switch cancelled by user');
            } else {
                console.error('Error switching network:', switchError);
                this.showError('Failed to switch network. Please try again.');
            }
        }
    }
    
    async checkTransactionCount() {
        try {
            this.updateStatus('Checking transaction history...');
            
            // Get transaction count (nonce) which represents number of transactions sent
            this.transactionCount = await this.provider.getTransactionCount(this.userAddress);
            
            document.getElementById('txCount').textContent = this.transactionCount;
            
            if (this.transactionCount >= this.requiredTransactions) {
                this.showSuccess();
            } else {
                this.showTransactionWarning();
            }
            
        } catch (error) {
            console.error('Error checking transaction count:', error);
            
            // Check if this is a network error (wrong network)
            if (error.message && error.message.includes('underlying network changed') || 
                error.message.includes('NETWORK_ERROR') ||
                error.code === 'NETWORK_ERROR') {
                console.log('Network error detected, showing network warning');
                this.showNetworkWarning();
            } else {
                this.showError('Failed to check transaction history: ' + error.message);
            }
        }
    }
    
    showNetworkWarning() {
        document.getElementById('networkWarning').style.display = 'block';
        document.getElementById('transactionWarning').style.display = 'none';
        
        // Hide the connect button since wallet is already connected
        const connectBtn = document.getElementById('connectWalletBtn');
        if (connectBtn) {
            connectBtn.style.display = 'none';
        }
        
        this.updateStatus('Please switch to Linea Mainnet');
    }
    
    showTransactionWarning() {
        document.getElementById('networkWarning').style.display = 'none';
        document.getElementById('transactionWarning').style.display = 'block';
        
        // Hide the connect button since wallet is already connected
        const connectBtn = document.getElementById('connectWalletBtn');
        if (connectBtn) {
            connectBtn.style.display = 'none';
        }
        
        this.updateStatus(`Insufficient transactions: ${this.transactionCount}/${this.requiredTransactions}`);
    }
    
    showSuccess() {
        document.getElementById('networkWarning').style.display = 'none';
        document.getElementById('transactionWarning').style.display = 'none';
        
        // Hide the connect button since wallet is now connected
        const connectBtn = document.getElementById('connectWalletBtn');
        if (connectBtn) {
            connectBtn.style.display = 'none';
        }
        
        const walletStatus = document.getElementById('walletStatus');
        walletStatus.innerHTML = `
            <div class="success-message">
                ✅ Wallet Connected Successfully!
            </div>
            <div class="wallet-info">
                <p><strong>Address:</strong> ${this.formatAddress(this.userAddress)}</p>
                <p><strong>Network:</strong> Linea Mainnet</p>
                <p><strong>Transactions:</strong> ${this.transactionCount}</p>
            </div>
            <button id="continueToGame" class="continue-button">Continue to Game</button>
        `;
        
        // Add event listener for continue button
        document.getElementById('continueToGame').addEventListener('click', () => {
            console.log('Continue to Game button clicked');
            
            // Immediately hide the wallet screen with all possible methods
            const walletScreen = document.getElementById('walletScreen');
            if (walletScreen) {
                console.log('Hiding wallet screen immediately');
                walletScreen.style.display = 'none';
                walletScreen.style.visibility = 'hidden';
                walletScreen.style.opacity = '0';
                walletScreen.style.zIndex = '-1';
                walletScreen.style.position = 'absolute';
                walletScreen.style.left = '-9999px';
                walletScreen.classList.add('hidden');
                walletScreen.remove(); // Completely remove from DOM
                console.log('Wallet screen completely removed from DOM');
            }
            
            // Ensure game canvas is visible
            const gameCanvas = document.getElementById('gameCanvas');
            const gameContainer = document.querySelector('.game-container');
            if (gameCanvas) {
                gameCanvas.style.display = 'block';
                gameCanvas.style.visibility = 'visible';
                gameCanvas.style.opacity = '1';
                gameCanvas.style.zIndex = '1';
                console.log('Game canvas made visible');
            }
            if (gameContainer) {
                gameContainer.style.display = 'block';
                gameContainer.style.visibility = 'visible';
                console.log('Game container made visible');
            }
            
            // Start the game
            this.startGame();
            
            // Force immediate transition with multiple attempts
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    if (window.game) {
                        console.log(`Attempt ${i + 1}: Setting game state to characterSelect`);
                        window.game.gameState = 'characterSelect';
                        window.game.walletConnected = true;
                        window.game.userAddress = this.userAddress;
                        window.game.transactionCount = this.transactionCount;
                        
                        // Force redraw
                        if (typeof window.game.drawCharacterSelect === 'function') {
                            window.game.drawCharacterSelect();
                        }
                    }
                    if (window.gameInstance) {
                        console.log(`Attempt ${i + 1}: Setting gameInstance state to characterSelect`);
                        window.gameInstance.gameState = 'characterSelect';
                        window.gameInstance.walletConnected = true;
                        window.gameInstance.userAddress = this.userAddress;
                        window.gameInstance.transactionCount = this.transactionCount;
                        
                        // Force redraw
                        if (typeof window.gameInstance.drawCharacterSelect === 'function') {
                            window.gameInstance.drawCharacterSelect();
                        }
                    }
                                 }, i * 100); // Stagger attempts every 100ms
             }
        });
    }
    
    showError(message) {
        const walletStatus = document.getElementById('walletStatus');
        walletStatus.innerHTML = `<div class="error-message">${message}</div>`;
    }
    
    updateStatus(message) {
        const walletStatus = document.getElementById('walletStatus');
        walletStatus.innerHTML = `<p>${message}</p>`;
    }
    
    formatAddress(address) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    handleDisconnect() {
        this.isConnected = false;
        this.userAddress = null;
        this.provider = null;
        this.signer = null;
        this.transactionCount = 0;
        
        // Show wallet screen again and reset UI
        const walletScreen = document.getElementById('walletScreen');
        if (walletScreen) {
            walletScreen.style.display = 'flex';
            walletScreen.style.visibility = 'visible';
            walletScreen.style.opacity = '1';
            walletScreen.style.zIndex = '1000';
            walletScreen.classList.remove('hidden');
        }
        
        // Show connect button again
        const connectBtn = document.getElementById('connectWalletBtn');
        if (connectBtn) {
            connectBtn.style.display = 'block';
        }
        
        // Hide warning sections
        document.getElementById('networkWarning').style.display = 'none';
        document.getElementById('transactionWarning').style.display = 'none';
        
        this.updateStatus('Wallet disconnected');
    }
    
    async handleAccountChange(newAccount) {
        this.userAddress = newAccount;
        if (this.isConnected) {
            await this.checkTransactionCount();
        }
    }
    
    async handleNetworkChange(chainId) {
        console.log('Network changed to:', chainId);
        const chainIdDecimal = parseInt(chainId, 16);
        
        if (chainIdDecimal === 59144) {
            // On Linea Mainnet
            console.log('Switched to Linea Mainnet');
            
            // Hide network warning if it was showing
            document.getElementById('networkWarning').style.display = 'none';
            
            if (this.isConnected) {
                // Recreate provider after network change
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                this.signer = this.provider.getSigner();
                
                this.updateStatus('Connected to Linea Mainnet! Checking transactions...');
                
                // Wait a bit for the network to stabilize
                setTimeout(async () => {
                    await this.checkTransactionCount();
                }, 1500); // Increased delay slightly
            }
        } else {
            // Not on Linea Mainnet
            console.log('Not on Linea Mainnet, showing network warning');
            this.showNetworkWarning();
        }
    }
    
    startGame() {
        console.log('WalletManager.startGame called');
        
        // Ensure body and document are ready for game display
        document.body.style.overflow = 'visible';
        document.body.style.background = '#2c3e50';
        
        // Set game properties immediately if game exists
        if (window.game) {
            console.log('Setting game properties immediately');
            window.game.walletConnected = true;
            window.game.userAddress = this.userAddress;
            window.game.transactionCount = this.transactionCount;
            window.game.gameState = 'characterSelect';
            console.log('Game state set to characterSelect');
            
            // Force immediate redraw
            if (typeof window.game.drawCharacterSelect === 'function') {
                window.game.drawCharacterSelect();
                console.log('Character select screen drawn');
            }
        }
        
        if (window.gameInstance) {
            console.log('Setting gameInstance properties');
            window.gameInstance.walletConnected = true;
            window.gameInstance.userAddress = this.userAddress;
            window.gameInstance.transactionCount = this.transactionCount;
            window.gameInstance.gameState = 'characterSelect';
            
            // Force immediate redraw
            if (typeof window.gameInstance.drawCharacterSelect === 'function') {
                window.gameInstance.drawCharacterSelect();
                console.log('Character select screen drawn on gameInstance');
            }
        }
        
        // Dispatch custom event for game to listen to
        console.log('Dispatching walletConnected event');
        window.dispatchEvent(new CustomEvent('walletConnected', {
            detail: {
                address: this.userAddress,
                transactionCount: this.transactionCount
            }
        }));
        
        console.log('Wallet connection complete, game should transition to character select');
    }
    
    // Utility method to check if wallet is properly connected
    isWalletReady() {
        return this.isConnected && 
               this.userAddress && 
               this.transactionCount >= this.requiredTransactions;
    }
    
    // Get user's ETH balance
    async getBalance() {
        if (!this.provider || !this.userAddress) return '0';
        
        try {
            const balance = await this.provider.getBalance(this.userAddress);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }
}

// Initialize wallet manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing wallet manager');
    window.walletManager = new WalletManager();
    console.log('Wallet manager initialized');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WalletManager;
} 