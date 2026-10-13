export interface Tile {
    id: number;
    label: string; // Character name from Ne Zha
    image: string; // Local tile image path
    color: string; // Fallback tile background color
}

export interface GameState {
    tiles: Tile[];
    emptyTileIndex: number; // Index of the empty tile
    moves: number; // Number of moves made by the player
    isGameOver: boolean; // Indicates if the game has been won
}
