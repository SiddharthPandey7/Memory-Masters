class MemoryGame {
            constructor() {
                this.initializeElements();
                this.initializeGameState();
                this.initializeEventListeners();
                this.hideGameStats();
            }

            initializeElements() {
                this.difficultySelect = document.getElementById('difficulty-select');
                this.gameBoard = document.getElementById('game-board');
                this.scoreElement = document.getElementById('score');
                this.movesElement = document.getElementById('moves');
                this.timerElement = document.getElementById('timer');
                this.restartBtn = document.getElementById('restart-btn');
                this.exitBtn = document.getElementById('exit-btn');
                this.winPopup = document.getElementById('win-popup');
                this.exitPopup = document.getElementById('exit-popup');
                this.finalScore = document.getElementById('final-score');
                this.finalTime = document.getElementById('final-time');
                this.finalMoves = document.getElementById('final-moves');
                this.playAgainBtn = document.getElementById('play-again');
                this.confirmExitBtn = document.getElementById('confirm-exit');
                this.cancelExitBtn = document.getElementById('cancel-exit');
                this.shareScoreBtn = document.getElementById('share-score');
                this.gameStats = document.getElementById('game-stats');
            }

            initializeGameState() {
                this.cards = [];
                this.flippedCards = [];
                this.matchedPairs = 0;
                this.score = 0;
                this.moves = 0;
                this.timeElapsed = 0;
                this.timerInterval = null;
                this.isPlaying = false;
                this.currentDifficulty = null;
            }

            initializeEventListeners() {
                this.difficultySelect.addEventListener('click', (e) => {
                    const button = e.target.closest('button');
                    if (button) {
                        const difficulty = button.dataset.difficulty;
                        this.startGame(difficulty);
                    }
                });

                this.restartBtn.addEventListener('click', () => this.restartGame());
                this.exitBtn.addEventListener('click', () => this.showExitPopup());
                this.playAgainBtn.addEventListener('click', () => this.restartGame());
                this.confirmExitBtn.addEventListener('click', () => this.exitGame());
                this.cancelExitBtn.addEventListener('click', () => this.hideExitPopup());
                this.shareScoreBtn.addEventListener('click', () => this.shareScore());
            }

            hideGameStats() {
                this.gameStats.style.display = 'none';
            }

            showGameStats() {
                this.gameStats.style.display = 'flex';
            }

            startGame(difficulty) {
                // Validate difficulty
                const validDifficulties = ['easy', 'medium', 'hard'];
                if (!validDifficulties.includes(difficulty)) {
                    console.error(`Invalid difficulty: ${difficulty}. Expected one of: ${validDifficulties.join(', ')}`);
                    return;
                }

                this.currentDifficulty = difficulty;
                this.resetGame();
                this.setupGameBoard(difficulty);
                this.startTimer();
                this.isPlaying = true;
                this.difficultySelect.style.display = 'none';
                this.showGameStats();
            }

            setupGameBoard(difficulty) {
                const gridSizes = {
                    easy: { size: 4, pairs: 8 },
                    medium: { size: 6, pairs: 18 },
                    hard: { size: 8, pairs: 32 }
                };

                const { size, pairs } = gridSizes[difficulty];
                this.gameBoard.style.cssText = '';
                this.gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

                const maxWidth = {
                    easy: '480px',
                    medium: '450px',
                    hard: '400px'
                };

                if (window.innerWidth <= 768) {
                    maxWidth.easy = '400px';
                    maxWidth.medium = '360px';
                    maxWidth.hard = '320px';
                }
                if (window.innerWidth <= 480) {
                    maxWidth.easy = '320px';
                    maxWidth.medium = '300px';
                    maxWidth.hard = '280px';
                }

                this.gameBoard.style.maxWidth = maxWidth[difficulty];
                const emojis = this.generateEmojis(pairs);
                this.createCards(emojis);
            }

            generateEmojis(pairs) {
                const emojis = ['😺', '🐶', '🦊', '🐻', '🐼', '🦁', '🐯', '🐨', '🐵', '🐘',
                                '🦒', '🦓', '🐮', '🐷', '🐸', '🐦', '🦜', '🐧', '🦋', '🐞',
                                '🍎', '🍐', '🍊', '🍋', '🍉', '🍇', '🍓', '🍒', '🍍', '🥭',
                                '🌸', '🌼'];
                const selectedEmojis = emojis.slice(0, pairs);
                return [...selectedEmojis, ...selectedEmojis].sort(() => Math.random() - 0.5);
            }

            createCards(emojis) {
                this.gameBoard.innerHTML = '';
                emojis.forEach((emoji, index) => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <div class="card-front"></div>
                        <div class="card-back">${emoji}</div>
                    `;
                    card.dataset.value = emoji;
                    card.addEventListener('click', () => this.flipCard(card));
                    this.gameBoard.appendChild(card);
                });
            }

            flipCard(card) {
                if (!this.isPlaying || this.flippedCards.length >= 2 ||
                    this.flippedCards.includes(card) || card.classList.contains('matched')) {
                    return;
                }

                card.classList.add('flipped');
                this.flippedCards.push(card);

                if (this.flippedCards.length === 2) {
                    this.moves++;
                    this.movesElement.textContent = this.moves;
                    this.checkMatch();
                }
            }

            checkMatch() {
                const [card1, card2] = this.flippedCards;
                const match = card1.dataset.value === card2.dataset.value;

                if (match) {
                    this.handleMatch(card1, card2);
                } else {
                    this.handleMismatch(card1, card2);
                }
            }

            handleMatch(card1, card2) {
                card1.classList.add('matched');
                card2.classList.add('matched');
                this.score += 10;
                this.scoreElement.textContent = this.score;
                this.matchedPairs++;
                this.flippedCards = [];

                if (this.isGameComplete()) {
                    this.endGame();
                }
            }

            handleMismatch(card1, card2) {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    this.flippedCards = [];
                }, 1000);
            }

            startTimer() {
                this.timerInterval = setInterval(() => {
                    this.timeElapsed++;
                    const minutes = Math.floor(this.timeElapsed / 60);
                    const seconds = this.timeElapsed % 60;
                    this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }, 1000);
            }

            isGameComplete() {
                const totalPairs = this.gameBoard.children.length / 2;
                return this.matchedPairs === totalPairs;
            }

            endGame() {
                clearInterval(this.timerInterval);
                this.isPlaying = false;
                this.finalScore.textContent = this.score;
                this.finalTime.textContent = this.timerElement.textContent;
                this.finalMoves.textContent = this.moves;
                setTimeout(() => {
                    this.winPopup.style.display = 'flex';
                }, 500);
            }

            restartGame() {
                this.hidePopups();
                this.hideGameStats();
                this.difficultySelect.style.display = 'block';
                this.resetGame();
            }

            resetGame() {
                this.gameBoard.innerHTML = '';
                this.initializeGameState();
                this.updateDisplay();
            }

            updateDisplay() {
                this.scoreElement.textContent = '0';
                this.movesElement.textContent = '0';
                this.timerElement.textContent = '0:00';
            }

            showExitPopup() {
                this.exitPopup.style.display = 'flex';
            }

            hideExitPopup() {
                this.exitPopup.style.display = 'none';
            }

            hidePopups() {
                this.winPopup.style.display = 'none';
                this.exitPopup.style.display = 'none';
            }

            exitGame() {
                window.location.reload();
            }
              
            
        }

        document.addEventListener('DOMContentLoaded', () => {
            new MemoryGame();
        });