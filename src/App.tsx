import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { RefreshCw, Lightbulb } from 'lucide-react';

const CSV_DATA = `PuzzleId,FEN,Moves,Rating,Themes
00008,r6k/pp2r2p/4Rp1Q/3p4/8/1N1P2R1/PqP2bPP/7K b - - 0 24,f2g3 e6e7 b2b1 b3c1 b1c1 h6c1,1925,crushing hangingPiece long middlegame
0000D,5rk1/1p3ppp/pq3b2/8/8/1P1Q1N2/P4PPP/3R2K1 w - - 2 27,d3d6 f8d8 d6d8 f6d8,1518,advantage endgame short
0009B,r2qr1k1/b1p2ppp/pp4n1/P1P1p3/4P1n1/B2P2Pb/3NBP1P/RN1QR1K1 b - - 1 16,b6c5 e2g4 h3g4 d1g4,1108,advantage middlegame short
000aY,r4rk1/pp3ppp/2n1b3/q1pp2B1/8/P1Q2NP1/1PP1PP1P/2KR3R w - - 0 15,c3a5 c6a5 g5e7 f8c8,1314,advantage endgame short
000c8,r1bq1rk1/pp2bppp/2n2n2/3p2B1/3N4/2N3P1/PP2PPBP/R2Q1RK1 b - - 0 11,h7h6 g5f6 e7f6 d4c6 b7c6,1102,advantage opening short
000h7,r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2PP1N2/PP1N1PPP/R1BQ1RK1 w - - 0 9,b2b4 b7b5 c4b5 a6b5 b4c5,1234,advantage opening short
000hf,r1bqk2r/pp2bppp/2n2n2/2pp2B1/8/2NP1N2/PPP1BPPP/R2QK2R w KQkq - 4 9,e1g1 d5d4 c3a4 b7b5 a4c5 e7c5,1473,advantage fork opening short
000n9,r1b2rk1/ppq1bppp/2n1pn2/3p4/3P4/1PN1PN2/PB2BPPP/R2Q1RK1 w - - 3 11,a1c1 a7a6 c3a4 b7b5,1415,advantage opening short
000zU,r2q1rk1/1p2bppp/p1n1b3/3pP3/8/1QN1BN2/PP3PPP/R2R2K1 b - - 4 14,c6a5 b3b6 d8b6 e3b6,1434,advantage middlegame short
0018S,r2q1rk1/ppp1bppp/2n2n2/3p4/3P2b1/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 5 10,f3e5 g4e2 c3e2 c6e5 d4e5,1347,advantage opening short
00197,r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 3 8,f1d3 b4c3 d2c3 f6e4,1200,advantage opening short
001Ym,r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 3 8,a2a3 b4c3 d2c3 f6e4,1200,advantage opening short
00206,r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 3 8,f1e2 b4c3 d2c3 f6e4,1200,advantage opening short
00212,r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 3 8,f1b5 b4c3 d2c3 f6e4,1200,advantage opening short
00213,r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 3 8,g2g3 b4c3 d2c3 f6e4,1200,advantage opening short
00214,r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 3 8,h2h3 b4c3 d2c3 f6e4,1200,advantage opening short
00215,r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 3 8,d1c2 b4c3 d2c3 f6e4,1200,advantage opening short
00216,r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 3 8,d1b3 b4c3 d2c3 f6e4,1200,advantage opening short
00217,r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 3 8,d1a4 b4c3 d2c3 f6e4,1200,advantage opening short
00218,r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 3 8,a1c1 b4c3 d2c3 f6e4,1200,advantage opening short
`;

function parsePuzzles(csv: string) {
  const lines = csv.trim().split('\n');
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const parts = line.split(',');
    return {
      id: parts[0],
      fen: parts[1],
      moves: parts[2].split(' '),
      rating: parts[3],
      themes: parts[4]
    };
  });
}

const PUZZLES = parsePuzzles(CSV_DATA);

const PIECES: Record<string, string> = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚'
};

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [puzzle, setPuzzle] = useState(PUZZLES[0]);
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState('Your turn');
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<any[]>([]);
  const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isWrong, setIsWrong] = useState(false);

  const loadPuzzle = useCallback((index: number) => {
    const p = PUZZLES[index];
    const newGame = new Chess(p.fen);
    
    // Make the first move (opponent's move)
    const firstMove = p.moves[0];
    const moveObj = newGame.move({ from: firstMove.slice(0,2), to: firstMove.slice(2,4), promotion: 'q' });
    
    setGame(newGame);
    setPuzzle(p);
    setMoveIndex(1);
    setLastMove({ from: firstMove.slice(0,2), to: firstMove.slice(2,4) });
    setBoardFlipped(newGame.turn() === 'b');
    setStatus('Your turn');
    setSelectedSquare(null);
    setLegalMoves([]);
    setIsSolved(false);
    setMoveHistory([moveObj ? moveObj.san : firstMove]);
    setIsWrong(false);
  }, []);

  useEffect(() => {
    // Shuffle puzzles on mount
    PUZZLES.sort(() => Math.random() - 0.5);
    loadPuzzle(0);
  }, [loadPuzzle]);

  const handleSquareClick = (square: string) => {
    if (isSolved) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const piece = game.get(square);
    
    if (!selectedSquare) {
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        setLegalMoves(game.moves({ square, verbose: true }));
      }
    } else {
      const move = legalMoves.find(m => m.to === square);
      if (move) {
        // Attempt move
        const expectedMove = puzzle.moves[moveIndex];
        const playerMoveUci = move.from + move.to + (move.promotion ? 'q' : '');
        
        if (playerMoveUci === expectedMove || playerMoveUci === expectedMove + 'q') {
          // Correct move
          const newGame = new Chess(game.fen());
          const moveObj = newGame.move({ from: move.from, to: move.to, promotion: 'q' });
          setGame(newGame);
          setLastMove({ from: move.from, to: move.to });
          setMoveHistory(prev => [...prev, moveObj ? moveObj.san : playerMoveUci]);
          setIsWrong(false);
          
          let nextIdx = moveIndex + 1;
          
          if (nextIdx >= puzzle.moves.length) {
            setStatus('Puzzle Solved!');
            setIsSolved(true);
            setSelectedSquare(null);
            setLegalMoves([]);
          } else {
            // Computer response
            setTimeout(() => {
              const compMove = puzzle.moves[nextIdx];
              const compGame = new Chess(newGame.fen());
              const compMoveObj = compGame.move({ from: compMove.slice(0,2), to: compMove.slice(2,4), promotion: 'q' });
              setGame(compGame);
              setLastMove({ from: compMove.slice(0,2), to: compMove.slice(2,4) });
              setMoveIndex(nextIdx + 1);
              setMoveHistory(prev => [...prev, compMoveObj ? compMoveObj.san : compMove]);
              
              if (nextIdx + 1 >= puzzle.moves.length) {
                setStatus('Puzzle Solved!');
                setIsSolved(true);
              } else {
                setStatus('Your turn');
              }
            }, 300);
          }
        } else {
          setStatus('Incorrect move. Try again.');
          setIsWrong(true);
          setTimeout(() => setIsWrong(false), 500);
        }
      } else if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        setLegalMoves(game.moves({ square, verbose: true }));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const handleNext = () => {
    const nextIdx = (puzzleIndex + 1) % PUZZLES.length;
    setPuzzleIndex(nextIdx);
    loadPuzzle(nextIdx);
  };

  const handleHint = () => {
    if (isSolved) return;
    const expectedMove = puzzle.moves[moveIndex];
    if (expectedMove) {
      const from = expectedMove.slice(0,2);
      setSelectedSquare(from);
      setLegalMoves(game.moves({ square: from, verbose: true }));
      setStatus('Hint: Move this piece');
    }
  };

  const board = game.board();
  const ranks = boardFlipped ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
  const files = boardFlipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];

  return (
    <div className="min-h-screen bg-[#161512] text-[#bababa] flex flex-col font-sans selection:bg-transparent">
      <header className="p-4 flex justify-between items-center bg-[#262421] shadow-md">
        <h1 className="text-xl font-bold text-white">Chess Puzzles</h1>
        <div className="text-sm font-medium px-3 py-1 bg-[#302e2b] rounded text-[#8b8987]">
          Rating: {puzzle?.rating}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-[500px] mx-auto p-3 sm:p-4 gap-4">
        
        <div className="w-full flex justify-between items-end px-1">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-sm border border-gray-600 ${boardFlipped ? 'bg-white' : 'bg-black'}`}></div>
            <span className="truncate max-w-[250px] text-xs text-gray-400 capitalize">
              {puzzle?.themes.split(' ').slice(0, 3).join(', ').replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>
        </div>

        <div className={`w-full aspect-square grid grid-cols-8 grid-rows-8 rounded shadow-2xl relative border-2 border-[#302e2b] overflow-hidden transition-all duration-200 ${isWrong ? 'ring-4 ring-red-500/80' : ''}`}>
          {ranks.map((rank, rIdx) => 
            files.map((file, fIdx) => {
              const sq = String.fromCharCode(97 + file) + (rank + 1);
              const piece = board[rank][file];
              const isDark = (rank + file) % 2 === 0;
              
              const isSelected = selectedSquare === sq;
              const isLastMove = lastMove?.from === sq || lastMove?.to === sq;
              const isLegal = legalMoves.some(m => m.to === sq);

              return (
                <div 
                  key={sq}
                  onClick={() => handleSquareClick(sq)}
                  className={`relative flex items-center justify-center cursor-pointer
                    ${isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]'}
                  `}
                >
                  {isLastMove && <div className="absolute inset-0 bg-[#9bc700] opacity-40 pointer-events-none"></div>}
                  {isSelected && <div className="absolute inset-0 bg-[#14551e] opacity-50 pointer-events-none"></div>}
                  {isLegal && (
                    <div className="absolute w-1/3 h-1/3 rounded-full bg-black/20 pointer-events-none z-10"></div>
                  )}

                  {fIdx === 0 && (
                    <span className={`absolute top-0.5 left-1 text-[10px] font-bold ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>
                      {rank + 1}
                    </span>
                  )}
                  {rIdx === 7 && (
                    <span className={`absolute bottom-0.5 right-1 text-[10px] font-bold ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>
                      {String.fromCharCode(97 + file)}
                    </span>
                  )}

                  {piece && (
                    <div 
                      className={`text-[11vw] sm:text-[55px] leading-none z-20 select-none
                        ${piece.color === 'w' 
                          ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] [-webkit-text-stroke:1.5px_#222]' 
                          : 'text-[#222] drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] [-webkit-text-stroke:1.5px_#ddd]'
                        }
                      `}
                    >
                      {PIECES[piece.type]}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="w-full flex justify-between items-start px-1">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-sm border border-gray-600 ${boardFlipped ? 'bg-black' : 'bg-white'}`}></div>
            <span className={`font-bold ${status.includes('Incorrect') ? 'text-red-400' : isSolved ? 'text-[#629924]' : 'text-white'}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="w-full bg-[#262421] rounded-lg p-4 flex flex-col gap-4 mt-2 shadow-lg">
          <div className="text-lg font-medium text-center min-h-[28px] text-[#bababa]">
            {moveHistory.length > 0 ? moveHistory.join(' ') : 'Find the best move'}
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleHint}
              className="flex-1 py-3 rounded bg-[#302e2b] hover:bg-[#383632] text-white font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Lightbulb size={18} /> Hint
            </button>
            <button 
              onClick={handleNext}
              className="flex-1 py-3 rounded bg-[#629924] hover:bg-[#73b32a] text-white font-bold shadow-[0_3px_#4a731b] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> Next
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
