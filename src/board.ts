export class Board {
    tiles: number[][];
    emptyTile: { row: number; col: number };
    size: number;

    constructor(size: number) {
        this.size = size;
        this.tiles = this.createBoard();
        this.emptyTile = { row: size - 1, col: size - 1 };
    }

    initialize(): void {
        this.tiles = this.createBoard();
        this.emptyTile = { row: this.size - 1, col: this.size - 1 };
        this.shuffle(200);
    }

    createBoard(): number[][] {
        const tiles: number[][] = [];
        let tileNumber = 1;

        for (let row = 0; row < this.size; row++) {
            const tileRow: number[] = [];
            for (let col = 0; col < this.size; col++) {
                if (tileNumber < this.size * this.size) {
                    tileRow.push(tileNumber++);
                } else {
                    tileRow.push(0);
                }
            }
            tiles.push(tileRow);
        }

        return tiles;
    }

    shuffle(moves: number): void {
        const directions = [
            { row: -1, col: 0 },
            { row: 1, col: 0 },
            { row: 0, col: -1 },
            { row: 0, col: 1 },
        ];
        let previousEmpty = { ...this.emptyTile };

        for (let i = 0; i < moves; i++) {
            const adjacent = directions
                .map((dir) => ({ row: this.emptyTile.row + dir.row, col: this.emptyTile.col + dir.col }))
                .filter((pos) => this.isInside(pos.row, pos.col));

            const choices = adjacent.filter((pos) => !(pos.row === previousEmpty.row && pos.col === previousEmpty.col));
            const next = (choices.length > 0 ? choices : adjacent)[Math.floor(Math.random() * (choices.length || adjacent.length))];

            previousEmpty = { ...this.emptyTile };
            this.moveTile(next.row, next.col);
        }
    }

    moveTile(row: number, col: number): boolean {
        if (!this.isAdjacent(row, col)) {
            return false;
        }

        this.tiles[this.emptyTile.row][this.emptyTile.col] = this.tiles[row][col];
        this.tiles[row][col] = 0;
        this.emptyTile = { row, col };
        return true;
    }

    getEmptyTile(): { row: number; col: number } {
        return { ...this.emptyTile };
    }

    isAdjacent(row: number, col: number): boolean {
        const { row: emptyRow, col: emptyCol } = this.emptyTile;
        return (
            (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
            (col === emptyCol && Math.abs(row - emptyRow) === 1)
        );
    }

    isInside(row: number, col: number): boolean {
        return row >= 0 && row < this.size && col >= 0 && col < this.size;
    }

    isSolved(): boolean {
        let tileNumber = 1;

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (row === this.size - 1 && col === this.size - 1) {
                    return this.tiles[row][col] === 0;
                }
                if (this.tiles[row][col] !== tileNumber++) {
                    return false;
                }
            }
        }

        return true;
    }

    getTiles(): number[][] {
        return this.tiles;
    }
}
