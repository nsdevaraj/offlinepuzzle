import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { RefreshCw, Lightbulb, Play, Puzzle, RotateCcw, Undo2, Eye } from 'lucide-react';
import { ChessEngine, GameState } from './ChessEngine';

import puzzlesData from './puzzles.json';

const PUZZLES = puzzlesData.map((p: any) => ({
  id: p.PuzzleId,
  fen: p.FEN,
  moves: p.Moves.split(' '),
  rating: p.Rating,
  themes: p.Themes
}));

const PIECE_IMAGES: Record<string, string> = {
  'w-p': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  'w-n': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  'w-b': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  'w-r': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  'w-q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  'w-k': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  'b-p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  'b-n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  'b-b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  'b-r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  'b-q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  'b-k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
};

function LocalPlay() {
  const engine = useMemo(() => new ChessEngine(), []);
  const [gameState, setGameState] = useState<GameState>(engine.getState());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<any[]>([]);
  const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);

  const handleSquareClick = (square: string) => {
    if (gameState.isGameOver) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const piece = gameState.board.flat().find(p => p?.square === square);
    
    if (!selectedSquare) {
      if (piece && piece.color === gameState.turn) {
        setSelectedSquare(square);
        setLegalMoves(engine.getLegalMoves(square));
      }
    } else {
      const move = legalMoves.find(m => m.to === square);
      if (move) {
        const result = engine.move(move.from, move.to, 'q');
        if (result) {
          setGameState(engine.getState());
          setLastMove({ from: move.from, to: move.to });
        }
      } else if (piece && piece.color === gameState.turn) {
        setSelectedSquare(square);
        setLegalMoves(engine.getLegalMoves(square));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const handleUndo = () => {
    engine.undo();
    const newState = engine.getState();
    setGameState(newState);
    setSelectedSquare(null);
    setLegalMoves([]);
    
    if (newState.history.length > 0) {
      // Get the last move from the engine's internal history
      const history = engine.getHistory();
      if (history.length > 0) {
        const last = history[history.length - 1];
        setLastMove({ from: last.from, to: last.to });
      } else {
        setLastMove(null);
      }
    } else {
      setLastMove(null);
    }
  };

  const handleReset = () => {
    engine.reset();
    setGameState(engine.getState());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
  };

  const ranks = [7,6,5,4,3,2,1,0];
  const files = [0,1,2,3,4,5,6,7];

  let statusText = gameState.turn === 'w' ? "White's Turn" : "Black's Turn";
  if (gameState.isGameOver) {
    if (gameState.result === 'checkmate') {
      statusText = `Checkmate! ${gameState.winner === 'w' ? 'White' : 'Black'} wins!`;
    } else {
      statusText = `Draw (${gameState.result.replace('_', ' ')})`;
    }
  } else if (gameState.inCheck) {
    statusText += " - Check!";
  }

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <div className="w-full flex justify-between items-end px-1">
        <div className="flex items-center gap-2 text-sm">
          <span className={`font-bold ${gameState.isGameOver ? 'text-[#629924]' : gameState.inCheck ? 'text-red-400' : 'text-white'}`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="w-full aspect-square grid grid-cols-8 grid-rows-8 rounded shadow-2xl relative border-2 border-[#302e2b] overflow-hidden">
        {ranks.map((rank, rIdx) => 
          files.map((file, fIdx) => {
            const sq = String.fromCharCode(97 + file) + (rank + 1);
            const piece = gameState.board[7 - rank][file];
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
                  <img 
                    src={PIECE_IMAGES[`${piece.color}-${piece.type}`]}
                    alt={`${piece.color} ${piece.type}`}
                    className="w-[85%] h-[85%] z-20 select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] pointer-events-none"
                    draggable={false}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="w-full bg-[#262421] rounded-lg p-4 flex flex-col gap-4 mt-2 shadow-lg">
        <div className="text-lg font-medium text-center min-h-[28px] text-[#bababa] overflow-x-auto whitespace-nowrap">
          {gameState.history.length > 0 ? gameState.history.slice(-6).join(' ') : 'Make a move to start'}
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleUndo}
            disabled={gameState.history.length === 0 || gameState.isGameOver}
            className="flex-1 py-3 rounded bg-[#302e2b] hover:bg-[#383632] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Undo2 size={18} /> Undo
          </button>
          <button 
            onClick={handleReset}
            className="flex-1 py-3 rounded bg-[#c33] hover:bg-[#d44] text-white font-bold shadow-[0_3px_#922] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function Puzzles() {
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
  
  // Gamification state
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [hasUsedHint, setHasUsedHint] = useState(false);
  const [showXpPopup, setShowXpPopup] = useState<{xp: number, score: number} | null>(null);

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
    setHasUsedHint(false);
  }, []);

  useEffect(() => {
    // Shuffle puzzles on mount
    PUZZLES.sort(() => Math.random() - 0.5);
    loadPuzzle(0);
  }, [loadPuzzle]);

  const handleSquareClick = (square: string) => {
    if (isSolved || !puzzle || status === 'Computer thinking...') return;

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
            setMoveIndex(nextIdx);

            if (!hasUsedHint) {
              const newStreak = streak + 1;
              setStreak(newStreak);
              if (newStreak > highestStreak) setHighestStreak(newStreak);
              
              const gainedXp = 10 + newStreak * 2;
              const newXp = xp + gainedXp;
              const newScore = score + 100 + newStreak * 10;
              setScore(newScore);
              
              if (newXp >= level * 100) {
                setLevel(level + 1);
                setXp(newXp - level * 100);
              } else {
                setXp(newXp);
              }
              
              setShowXpPopup({ xp: gainedXp, score: 100 + newStreak * 10 });
              setTimeout(() => setShowXpPopup(null), 2000);
            }
          } else {
            setStatus('Computer thinking...');
            setSelectedSquare(null);
            setLegalMoves([]);
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

                if (!hasUsedHint) {
                  const newStreak = streak + 1;
                  setStreak(newStreak);
                  if (newStreak > highestStreak) setHighestStreak(newStreak);
                  
                  const gainedXp = 10 + newStreak * 2;
                  const newXp = xp + gainedXp;
                  const newScore = score + 100 + newStreak * 10;
                  setScore(newScore);
                  
                  if (newXp >= level * 100) {
                    setLevel(level + 1);
                    setXp(newXp - level * 100);
                  } else {
                    setXp(newXp);
                  }
                  
                  setShowXpPopup({ xp: gainedXp, score: 100 + newStreak * 10 });
                  setTimeout(() => setShowXpPopup(null), 2000);
                }
              } else {
                setStatus('Your turn');
              }
            }, 300);
          }
        } else {
          setStatus('Incorrect move. Try again.');
          setIsWrong(true);
          setStreak(0);
          setHasUsedHint(true);
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

  const handleShowMove = () => {
    if (isSolved || !puzzle || status === 'Computer thinking...') return;
    setStreak(0);
    setHasUsedHint(true);
    const expectedMove = puzzle.moves[moveIndex];
    if (expectedMove) {
      const from = expectedMove.slice(0,2);
      const to = expectedMove.slice(2,4);
      const promotion = expectedMove.length > 4 ? expectedMove[4] : 'q';
      
      const newGame = new Chess(game.fen());
      const moveObj = newGame.move({ from, to, promotion });
      setGame(newGame);
      setLastMove({ from, to });
      setMoveHistory(prev => [...prev, moveObj ? moveObj.san : expectedMove]);
      setIsWrong(false);
      
      let nextIdx = moveIndex + 1;
      
      if (nextIdx >= puzzle.moves.length) {
        setStatus('Puzzle Solved!');
        setIsSolved(true);
        setSelectedSquare(null);
        setLegalMoves([]);
        setMoveIndex(nextIdx);
      } else {
        setStatus('Computer thinking...');
        setSelectedSquare(null);
        setLegalMoves([]);
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
    }
  };

  const handlePreviousMove = () => {
    if (moveIndex <= 1 || !puzzle || status === 'Computer thinking...') return;
    
    // If it's solved, the last move was the player's. So undo 1 half-move.
    // If it's not solved, the last move was the computer's. So undo 2 half-moves.
    const undoCount = isSolved ? 1 : 2;
    const newMoveIndex = moveIndex - undoCount;
    
    // Reconstruct the game from the initial puzzle FEN up to the new move index
    const newGame = new Chess(puzzle.fen);
    for (let i = 0; i < newMoveIndex; i++) {
      const moveStr = puzzle.moves[i];
      newGame.move({ from: moveStr.slice(0,2), to: moveStr.slice(2,4), promotion: 'q' });
    }
    
    setGame(newGame);
    setMoveIndex(newMoveIndex);
    setMoveHistory(prev => prev.slice(0, -undoCount));
    
    if (newMoveIndex > 0) {
      const lastMoveStr = puzzle.moves[newMoveIndex - 1];
      setLastMove({ from: lastMoveStr.slice(0,2), to: lastMoveStr.slice(2,4) });
    } else {
      setLastMove(null);
    }
    
    setIsSolved(false);
    setStatus('Your turn');
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const handleNext = () => {
    const nextIdx = (puzzleIndex + 1) % PUZZLES.length;
    setPuzzleIndex(nextIdx);
    loadPuzzle(nextIdx);
  };

  const handleHint = () => {
    if (isSolved) return;
    setStreak(0);
    setHasUsedHint(true);
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
    <div className="flex flex-col items-center w-full gap-4">
      <div className="w-full flex justify-between items-center bg-[#262421] p-3 rounded-lg shadow-md relative">
        {showXpPopup && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 animate-bounce">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg whitespace-nowrap">
              +{showXpPopup.score} Score | +{showXpPopup.xp} XP
            </div>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Level {level}</span>
          <div className="w-24 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${(xp / (level * 100)) * 100}%` }}></div>
          </div>
        </div>
        
        <div className="flex gap-4 text-center">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Score</span>
            <span className="text-lg font-bold text-white">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Streak</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${streak > 0 ? 'text-orange-400' : 'text-white'}`}>
                {streak} {streak > 2 && '🔥'}
              </span>
              {highestStreak > 0 && (
                <span className="text-[10px] text-gray-500 font-medium" title="Highest Streak">
                  / {highestStreak}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-between items-end px-1">
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-3 h-3 rounded-sm border border-gray-600 ${boardFlipped ? 'bg-white' : 'bg-black'}`}></div>
          <span className="truncate max-w-[250px] text-xs text-gray-400 capitalize">
            {puzzle?.themes.split(' ').slice(0, 3).join(', ').replace(/([A-Z])/g, ' $1').trim()}
          </span>
        </div>
        <div className="text-sm font-medium px-3 py-1 bg-[#302e2b] rounded text-[#8b8987]">
          Rating: {puzzle?.rating}
        </div>
      </div>

      <div className={`w-full aspect-square grid grid-cols-8 grid-rows-8 rounded shadow-2xl relative border-2 border-[#302e2b] overflow-hidden transition-all duration-200 ${isWrong ? 'ring-4 ring-red-500/80' : ''}`}>
        {ranks.map((rank, rIdx) => 
          files.map((file, fIdx) => {
            const sq = String.fromCharCode(97 + file) + (rank + 1);
            const piece = board[7 - rank][file];
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
                  <img 
                    src={PIECE_IMAGES[`${piece.color}-${piece.type}`]}
                    alt={`${piece.color} ${piece.type}`}
                    className="w-[85%] h-[85%] z-20 select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] pointer-events-none"
                    draggable={false}
                  />
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
        <div className="text-lg font-medium text-center min-h-[28px] text-[#bababa] overflow-x-auto whitespace-nowrap">
          {moveHistory.length > 0 ? moveHistory.join(' ') : 'Find the best move'}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button 
            onClick={handlePreviousMove}
            disabled={moveIndex <= 1 || status === 'Computer thinking...'}
            className="py-2 rounded bg-[#302e2b] hover:bg-[#383632] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Undo2 size={16} /> Undo
          </button>
          <button 
            onClick={handleHint}
            disabled={isSolved || status === 'Computer thinking...'}
            className="py-2 rounded bg-[#302e2b] hover:bg-[#383632] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Lightbulb size={16} /> Hint
          </button>
          <button 
            onClick={handleShowMove}
            disabled={isSolved || status === 'Computer thinking...'}
            className="py-2 rounded bg-[#302e2b] hover:bg-[#383632] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Eye size={16} /> Show
          </button>
          <button 
            onClick={handleNext}
            className="py-2 rounded bg-[#629924] hover:bg-[#73b32a] text-white font-bold shadow-[0_3px_#4a731b] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw size={16} /> Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<'puzzles' | 'local'>('puzzles');

  return (
    <div className="min-h-screen bg-[#161512] text-[#bababa] flex flex-col font-sans selection:bg-transparent">
      <header className="p-4 flex justify-between items-center bg-[#262421] shadow-md">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          {mode === 'puzzles' ? <Puzzle size={20} /> : <Play size={20} />}
          {mode === 'puzzles' ? 'Chess Puzzles' : 'Local Play'}
        </h1>
        
        <div className="flex bg-[#161512] rounded-lg p-1">
          <button 
            onClick={() => setMode('puzzles')}
            className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${mode === 'puzzles' ? 'bg-[#302e2b] text-white' : 'text-[#8b8987] hover:text-white'}`}
          >
            Puzzles
          </button>
          <button 
            onClick={() => setMode('local')}
            className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${mode === 'local' ? 'bg-[#302e2b] text-white' : 'text-[#8b8987] hover:text-white'}`}
          >
            Local Play
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-[500px] mx-auto p-3 sm:p-4">
        {mode === 'puzzles' ? <Puzzles /> : <LocalPlay />}
      </main>
    </div>
  );
}
