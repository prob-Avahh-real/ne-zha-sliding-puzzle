import './styles.css';
import { Game } from './game';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.startGame();
});
