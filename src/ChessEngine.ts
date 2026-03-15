import { Chess, Move, Square, PieceSymbol, Color } from 'chess.js';

export type GameResult = 
  | 'active'
  | 'checkmate'
  | 'stalemate'
  | 'insufficient_material'
  | 'threefold_repetition'
  | 'draw';

export interface GameState {
  fen: string;
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  turn: Color;
  isGameOver: boolean;
  result: GameResult;
  winner: Color | null;
  inCheck: boolean;
  history: string[];
}

/**
 * ChessEngine encapsulates the robust chess.js logic to provide
 * a clean, self-contained API for managing a standard chess game.
 * It handles move validation, turn management, and game state updates.
 */
export class ChessEngine {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  public load(fen: string): boolean {
    try {
      this.chess.load(fen);
      return true;
    } catch (e) {
      return false;
    }
  }

  public reset(): void {
    this.chess.reset();
  }

  public getLegalMoves(square?: string): Move[] {
    if (square) {
      return this.chess.moves({ square: square as Square, verbose: true }) as Move[];
    }
    return this.chess.moves({ verbose: true }) as Move[];
  }

  public move(from: string, to: string, promotion: string = 'q'): Move | null {
    try {
      const move = this.chess.move({
        from,
        to,
        promotion,
      });
      return move;
    } catch (e) {
      return null;
    }
  }

  public undo(): Move | null {
    return this.chess.undo();
  }

  public getState(): GameState {
    let result: GameResult = 'active';
    let winner: Color | null = null;

    if (this.chess.isCheckmate()) {
      result = 'checkmate';
      winner = this.chess.turn() === 'w' ? 'b' : 'w';
    } else if (this.chess.isStalemate()) {
      result = 'stalemate';
    } else if (this.chess.isInsufficientMaterial()) {
      result = 'insufficient_material';
    } else if (this.chess.isThreefoldRepetition()) {
      result = 'threefold_repetition';
    } else if (this.chess.isDraw()) {
      result = 'draw';
    }

    return {
      fen: this.chess.fen(),
      board: this.chess.board(),
      turn: this.chess.turn(),
      isGameOver: result !== 'active',
      result,
      winner,
      inCheck: this.chess.isCheck(),
      history: this.chess.history(),
    };
  }
}
