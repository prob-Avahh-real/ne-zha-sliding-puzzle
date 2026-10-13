import { Board } from './board';
import { Tile } from './types';

const MAX_SECONDS = 120;
const MAX_MOVES = 80;

const CHARACTER_TILES: Tile[] = [
    { id: 1, label: '哪吒', image: '/assets/images/ne-zha.svg', color: '#e53935' },
    { id: 2, label: '敖丙', image: '/assets/images/ao-bing.svg', color: '#1e88e5' },
    { id: 3, label: '姜子牙', image: '/assets/images/jiang-zi-ya.svg', color: '#6d4c41' },
    { id: 4, label: '太乙真人', image: '/assets/images/tai-yi.svg', color: '#fdd835' },
    { id: 5, label: '申公豹', image: '/assets/images/shen-gong-bao.svg', color: '#8e24aa' },
    { id: 6, label: '九尾', image: '/assets/images/jiu-wei.svg', color: '#d81b60' },
    { id: 7, label: '李靖', image: '/assets/images/li-jing.svg', color: '#fb8c00' },
    { id: 8, label: '殷夫人', image: '/assets/images/yin-fu-ren.svg', color: '#00897b' },
    { id: 9, label: '王夫人', image: '/assets/images/wang-fu-ren.svg', color: '#5e35b1' },
    { id: 10, label: '托塔天王', image: '/assets/images/tuo-ta-tian-wang.svg', color: '#fb8c00' },
    { id: 11, label: '金灵圣母', image: '/assets/images/jin-ling-sheng-mu.svg', color: '#3949ab' },
    { id: 12, label: '太子', image: '/assets/images/tai-zi.svg', color: '#f4511e' },
    { id: 13, label: '九头虫', image: '/assets/images/jiu-tou-chong.svg', color: '#757575' },
    { id: 14, label: '小哪吒', image: '/assets/images/xiao-ne-zha.svg', color: '#ff7043' },
    { id: 15, label: '敖长老', image: '/assets/images/ao-zhang-lao.svg', color: '#0288d1' },
];

export class Game {
    private board: Board;
    private moveCount = 0;
    private isGameOver = false;
    private lastMovedTile: { row: number; col: number } | null = null;
    private timerId: number | null = null;
    private secondsLeft = MAX_SECONDS;
    private movesLeft = MAX_MOVES;
    private boardElement: HTMLElement;
    private moveCountElement: HTMLElement;
    private timeLeftElement: HTMLElement;
    private movesLeftElement: HTMLElement;
    private messageElement: HTMLElement;
    private achievementElement: HTMLElement;
    private shuffleButton: HTMLButtonElement;
    private restartButton: HTMLButtonElement;
    private overlayElement: HTMLElement;

    constructor() {
        this.board = new Board(4);
        this.boardElement = document.getElementById('board') as HTMLElement;
        this.moveCountElement = document.getElementById('move-count') as HTMLElement;
        this.timeLeftElement = document.getElementById('time-left') as HTMLElement;
        this.movesLeftElement = document.getElementById('moves-left') as HTMLElement;
        this.messageElement = document.getElementById('win-message') as HTMLElement;
        this.achievementElement = document.getElementById('achievement') as HTMLElement;
        this.shuffleButton = document.getElementById('shuffle-button') as HTMLButtonElement;
        this.restartButton = document.getElementById('restart-button') as HTMLButtonElement;
        this.overlayElement = document.getElementById('shatter-overlay') as HTMLElement;

        this.shuffleButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.startGame());
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    public startGame(): void {
        this.board.initialize();
        this.moveCount = 0;
        this.movesLeft = MAX_MOVES;
        this.secondsLeft = MAX_SECONDS;
        this.isGameOver = false;
        this.lastMovedTile = null;
        this.messageElement.textContent = '';
        this.messageElement.classList.remove('win');
        this.achievementElement.textContent = '';
        this.overlayElement.innerHTML = '';
        this.updateCounters();
        this.render();
        this.startTimer();
    }

    private startTimer(): void {
        if (this.timerId !== null) {
            window.clearInterval(this.timerId);
        }

        this.timerId = window.setInterval(() => {
            if (this.isGameOver) {
                return;
            }

            this.secondsLeft -= 1;
            this.updateCounters();

            if (this.secondsLeft <= 0) {
                this.endGame(false, '时间耗尽，哪吒华容道挑战失败。');
            }
        }, 1000);
    }

    private render(): void {
        this.boardElement.innerHTML = '';
        const tiles = this.board.getTiles();

        for (let row = 0; row < tiles.length; row++) {
            for (let col = 0; col < tiles[row].length; col++) {
                const value = tiles[row][col];
                const tileElement = document.createElement('button');
                tileElement.className = value === 0 ? 'tile empty' : 'tile';
                tileElement.type = 'button';
                tileElement.dataset.row = String(row);
                tileElement.dataset.col = String(col);

                if (value === 0) {
                    tileElement.setAttribute('aria-label', '空白格');
                } else {
                    const tileData = this.getTileById(value);
                    tileElement.style.backgroundColor = tileData.color;
                    tileElement.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18)), url(${tileData.image})`;
                    tileElement.style.backgroundSize = 'cover';
                    tileElement.style.backgroundPosition = 'center';
                    tileElement.setAttribute('aria-label', `${tileData.label} 角色`);

                    const labelElement = document.createElement('span');
                    labelElement.className = 'tile-label';
                    labelElement.textContent = tileData.label;
                    tileElement.appendChild(labelElement);

                    tileElement.addEventListener('click', () => this.handleTileClick(row, col));
                }

                if (this.lastMovedTile && this.lastMovedTile.row === row && this.lastMovedTile.col === col) {
                    tileElement.classList.add('animate');
                }

                this.boardElement.appendChild(tileElement);
            }
        }

        this.lastMovedTile = null;
    }

    private handleTileClick(row: number, col: number): void {
        if (this.isGameOver) {
            return;
        }

        if (this.board.moveTile(row, col)) {
            this.moveCount += 1;
            this.movesLeft -= 1;
            this.lastMovedTile = { row, col };
            this.updateCounters();
            this.render();

            if (this.board.isSolved()) {
                this.endGame(true, '恭喜你，哪吒华容道已完成！');
            } else if (this.movesLeft <= 0) {
                this.endGame(false, '步数已用尽，挑战失败。');
            }
        }
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (this.isGameOver) {
            return;
        }

        const empty = this.board.getEmptyTile();
        let targetRow = empty.row;
        let targetCol = empty.col;

        switch (event.key) {
            case 'ArrowUp':
                targetRow = empty.row + 1;
                break;
            case 'ArrowDown':
                targetRow = empty.row - 1;
                break;
            case 'ArrowLeft':
                targetCol = empty.col + 1;
                break;
            case 'ArrowRight':
                targetCol = empty.col - 1;
                break;
            default:
                return;
        }

        if (this.board.isInside(targetRow, targetCol) && this.board.moveTile(targetRow, targetCol)) {
            this.moveCount += 1;
            this.movesLeft -= 1;
            this.lastMovedTile = { row: targetRow, col: targetCol };
            this.updateCounters();
            this.render();

            if (this.board.isSolved()) {
                this.endGame(true, '恭喜你，哪吒华容道已完成！');
            } else if (this.movesLeft <= 0) {
                this.endGame(false, '步数已用尽，挑战失败。');
            }
        }
    }

    private updateCounters(): void {
        this.moveCountElement.textContent = String(this.moveCount);
        this.timeLeftElement.textContent = String(this.secondsLeft);
        this.movesLeftElement.textContent = String(this.movesLeft);
    }

    private endGame(success: boolean, message: string): void {
        this.isGameOver = true;
        if (this.timerId !== null) {
            window.clearInterval(this.timerId);
            this.timerId = null;
        }

        this.messageElement.textContent = message;
        if (success) {
            this.messageElement.classList.add('win');
            this.showAchievement();
            this.playVictorySound();
            this.explodeFragments();
        } else {
            this.messageElement.classList.remove('win');
            this.achievementElement.textContent = '';
        }
    }

    private showAchievement(): void {
        const awards: string[] = [];
        if (this.secondsLeft >= 90) {
            awards.push('神速如风');
        }
        if (this.movesLeft >= 35) {
            awards.push('妙手回春');
        }
        if (this.moveCount <= 40) {
            awards.push('玲珑步伐');
        }

        if (awards.length === 0) {
            this.achievementElement.textContent = '成就：哪吒小勇士';
        } else {
            this.achievementElement.textContent = `成就：${awards.join('，')}`;
        }
    }

    private playVictorySound(): void {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) {
            return;
        }

        const context = new AudioCtx();
        const now = context.currentTime;
        const gain = context.createGain();
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        gain.connect(context.destination);

        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, index) => {
            const osc = context.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + index * 0.12);
            osc.connect(gain);
            osc.start(now + index * 0.12);
            osc.stop(now + index * 0.12 + 0.24);
        });
    }

    private explodeFragments(): void {
        this.overlayElement.innerHTML = '';
        const boardRect = this.boardElement.getBoundingClientRect();
        const particleCount = 24;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'shatter-fragment';
            const size = 8 + Math.random() * 16;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            const startX = boardRect.width * 0.5;
            const startY = boardRect.height * 0.5;
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            particle.style.backgroundColor = `rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})`;
            this.overlayElement.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const distance = 80 + Math.random() * 140;
            const rotate = Math.random() * 360;
            const delay = Math.random() * 0.08;

            requestAnimationFrame(() => {
                particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(${rotate}deg)`;
                particle.style.opacity = '0';
                particle.style.transition = `transform 0.9s ease-out ${delay}s, opacity 0.9s ease-out ${delay}s`;
            });
        }

        window.setTimeout(() => {
            this.overlayElement.innerHTML = '';
        }, 1200);
    }

    private getTileById(id: number): Tile {
        const tile = CHARACTER_TILES.find((item) => item.id === id);
        if (!tile) {
            return { id, label: String(id), image: '', color: '#90a4ae' };
        }
        return tile;
    }
}
