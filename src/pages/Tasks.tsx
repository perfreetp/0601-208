import { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import type { TaskType, TaskStatus } from '@/types';
import { cn, getTaskTypeIcon, getTaskTypeName, getDifficultyStars, formatTime, formatRelativeTime, formatDate } from '@/lib/utils';

const TABS: { type: TaskType; icon: string; name: string; color: string }[] = [
  { type: 'puzzle', icon: '🧩', name: '拼图挑战', color: 'from-neon-cyan to-neon-cyan-dim' },
  { type: 'findItem', icon: '🔍', name: '寻物游戏', color: 'from-aurora-green to-teal-400' },
  { type: 'vote', icon: '🗳️', name: '投票决策', color: 'from-gold-yellow to-orange-400' },
  { type: 'quiz', icon: '❓', name: '限时问答', color: 'from-coral-orange to-coral-light' },
];

const statusBorderColors: Record<TaskStatus, string> = {
  completed: 'border-aurora-green/30',
  inProgress: 'border-gold-yellow/30',
  available: 'border-neon-cyan/30',
  locked: 'border-gray-500/30 opacity-60',
};

const statusText: Record<TaskStatus, string> = {
  locked: '未解锁',
  available: '可挑战',
  inProgress: '进行中',
  completed: '已完成',
};

const statusBadgeColors: Record<TaskStatus, string> = {
  locked: 'bg-gray-500/30 text-gray-400 border-gray-500/30',
  available: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40',
  inProgress: 'bg-gold-yellow/20 text-gold-yellow border-gold-yellow/40',
  completed: 'bg-aurora-green/20 text-aurora-green border-aurora-green/40',
};

function PuzzleTab() {
  const { puzzlePieces, placePuzzlePiece, tasks, completeTask, updateTaskStatus, isPaused } = useGameStore();
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [animatingCell, setAnimatingCell] = useState<string | null>(null);
  const placedCount = puzzlePieces.filter(p => p.isPlaced).length;
  const puzzleTask = tasks.find(t => t.type === 'puzzle');
  const completedTasks = tasks.filter(t => t.status === 'completed').map(t => t.id);
  const isPuzzleCompleted = puzzleTask?.status === 'completed' || completedTasks.includes(puzzleTask?.id || '');
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (isPuzzleCompleted && placedCount < 9 && !hasCompleted.current) {
      hasCompleted.current = true;
      puzzlePieces.forEach(piece => {
        if (!piece.isPlaced) {
          const gridX = Math.round(((piece.targetX - 16.66) / 33.33)) + 1;
          const gridY = Math.floor((piece.targetY - 16.66) / 33.33) + 1;
          useGameStore.getState().placePuzzlePiece(piece.id, gridX, gridY);
        }
      });
    }
    if (placedCount >= 9 && puzzleTask && puzzleTask.status !== 'completed') {
      useGameStore.getState().completeTask(puzzleTask.id);
    }
  }, [isPuzzleCompleted, placedCount, puzzleTask, puzzlePieces]);

  const handleCellClick = (x: number, y: number) => {
    if (isPaused || selectedPieceId === null || isPuzzleCompleted) return;
    const existingPiece = puzzlePieces.find(p => p.isPlaced && p.currentX === x && p.currentY === y);
    if (existingPiece) return;

    placePuzzlePiece(selectedPieceId, x, y);
    setAnimatingCell(`${x}-${y}`);
    setTimeout(() => setAnimatingCell(null), 500);
    setSelectedPieceId(null);

    if (puzzleTask) {
      const newProgress = Math.round(((placedCount + 1) / 9) * 100);
      updateTaskStatus(puzzleTask.id, 'inProgress', newProgress);
    }
  };

  const handlePieceClick = (pieceId: number) => {
    if (isPaused || isPuzzleCompleted) return;
    setSelectedPieceId(prev => prev === pieceId ? null : pieceId);
  };

  const getPlacedPiece = (x: number, y: number) => {
    return puzzlePieces.find(p => p.isPlaced && p.currentX === x && p.currentY === y);
  };

  if (isPuzzleCompleted) {
    return (
      <div className="space-y-6 relative">
        {isPaused && (
          <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center rounded-xl">
            <div className="text-center">
              <div className="text-5xl mb-4">⏸️</div>
              <p className="text-2xl text-white font-bold">游戏已暂停</p>
            </div>
          </div>
        )}

        <div className="text-center py-6">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="title-font text-2xl text-white">恭喜！拼图挑战已完成</h3>
          <p className="text-aurora-green font-bold text-xl mt-2">团队获得 +100 分</p>
          <p className="text-white/60 text-sm mt-1">9/9 块已全部放置</p>
        </div>

        <div className="glass-panel p-6">
          <div className="grid grid-cols-3 gap-2 aspect-square max-w-md mx-auto">
            {Array.from({ length: 9 }).map((_, idx) => {
              const x = idx % 3;
              const y = Math.floor(idx / 3);
              const placedPiece = getPlacedPiece(x, y);
              const showPlaced = isPuzzleCompleted || placedPiece;
              return (
                <div
                  key={idx}
                  className={cn(
                    'aspect-square rounded-lg flex items-center justify-center text-4xl transition-all duration-300',
                    showPlaced
                      ? 'bg-gradient-to-br from-neon-cyan/30 to-starlight-purple/30 border-2 border-neon-cyan/50 shadow-lg shadow-neon-cyan/20'
                      : 'bg-white/5 border-2 border-dashed border-white/20'
                  )}
                >
                  {showPlaced ? (
                    <span className="text-3xl">✨</span>
                  ) : (
                    <span className="text-white/30 text-2xl">?</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="text-5xl mb-4">⏸️</div>
            <p className="text-2xl text-white font-bold">游戏已暂停</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="title-font text-xl text-white">星辰拼图</h3>
          <p className="text-white/60 text-sm mt-1">拼出完整星座图案，解锁隐藏奖励</p>
        </div>
        <div className="glass-panel px-4 py-2">
          <span className="text-neon-cyan font-orbitron font-bold">{placedCount}</span>
          <span className="text-white/60"> / 9 块</span>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="grid grid-cols-3 gap-2 aspect-square max-w-md mx-auto">
          {Array.from({ length: 9 }).map((_, idx) => {
            const x = idx % 3;
            const y = Math.floor(idx / 3);
            const placedPiece = getPlacedPiece(x, y);
            const isAnimating = animatingCell === `${x}-${y}`;
            const isSelectable = selectedPieceId !== null && !placedPiece && !isPaused;
            return (
              <div
                key={idx}
                onClick={() => handleCellClick(x, y)}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center text-4xl transition-all duration-300',
                  placedPiece
                    ? 'bg-gradient-to-br from-neon-cyan/30 to-starlight-purple/30 border-2 border-neon-cyan/50 shadow-lg shadow-neon-cyan/20'
                    : isSelectable
                      ? 'bg-white/10 border-2 border-dashed border-neon-cyan/50 cursor-pointer hover:bg-neon-cyan/10'
                      : 'bg-white/5 border-2 border-dashed border-white/20',
                  isAnimating && 'animate-pulse scale-105'
                )}
              >
                {placedPiece ? (
                  <span className={cn('text-3xl', isAnimating && 'animate-bounce')}>✨</span>
                ) : (
                  <span className="text-white/30 text-2xl">?</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-4">
        <h4 className="text-white font-semibold mb-3">
          未放置的拼图块
          {selectedPieceId !== null && <span className="text-neon-cyan ml-2 text-sm">（点击上方空位放置）</span>}
        </h4>
        <div className="flex flex-wrap gap-2">
          {puzzlePieces.filter(p => !p.isPlaced).map(piece => (
            <div
              key={piece.id}
              onClick={() => handlePieceClick(piece.id)}
              className={cn(
                'w-14 h-14 rounded-lg flex items-center justify-center text-2xl transition-all cursor-pointer',
                selectedPieceId === piece.id
                  ? 'bg-neon-cyan/30 border-2 border-neon-cyan shadow-lg shadow-neon-cyan/30 scale-110'
                  : 'bg-ocean-mid border border-white/20 hover:border-neon-cyan/50 hover:bg-ocean-light',
                isPaused && 'opacity-50 cursor-not-allowed pointer-events-none'
              )}
            >
              🧩
            </div>
          ))}
          {puzzlePieces.filter(p => !p.isPlaced).length === 0 && (
            <p className="text-white/50 text-sm py-2">所有拼图块已放置完成！</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FindItemTab() {
  const { hiddenItems, findHiddenItem, tasks, completeTask, isPaused } = useGameStore();
  const foundCount = hiddenItems.filter(i => i.found).length;
  const totalCount = hiddenItems.length;
  const findItemTask = tasks.find(t => t.type === 'findItem');
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (foundCount === totalCount && findItemTask && !hasCompleted.current) {
      hasCompleted.current = true;
      completeTask(findItemTask.id);
    }
  }, [foundCount, totalCount, findItemTask, completeTask]);

  const handleItemClick = (itemId: string) => {
    if (isPaused) return;
    findHiddenItem(itemId, 'p1');
  };

  return (
    <div className="space-y-6 relative">
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="text-5xl mb-4">⏸️</div>
            <p className="text-2xl text-white font-bold">游戏已暂停</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="title-font text-xl text-white">神秘宝藏</h3>
          <p className="text-white/60 text-sm mt-1">在场景中找到所有隐藏的宝物</p>
        </div>
        <div className="glass-panel px-4 py-2">
          <span className="text-aurora-green font-orbitron font-bold">{foundCount}</span>
          <span className="text-white/60"> / {hiddenItems.length} 件</span>
        </div>
      </div>

      <div className="glass-panel p-4 relative aspect-video overflow-hidden bg-gradient-to-br from-ocean-dark via-ocean-mid to-deep-ocean">
        <div className="absolute inset-0 bg-stars opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-ocean/60 to-transparent" />
        
        {hiddenItems.map(item => (
          <div
            key={item.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            <div
              onClick={() => !item.found && handleItemClick(item.id)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all',
                item.found
                  ? 'bg-aurora-green/30 border-2 border-aurora-green shadow-lg shadow-aurora-green/30'
                  : isPaused
                    ? 'bg-white/5 border-2 border-white/20 opacity-40 cursor-not-allowed'
                    : 'bg-white/5 border-2 border-white/20 opacity-40 hover:opacity-100 hover:border-aurora-green/50 hover:scale-110 cursor-pointer'
              )}
            >
              {item.found ? item.emoji : '❓'}
            </div>
            {item.found && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-aurora-green whitespace-nowrap">
                {item.name}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {hiddenItems.map(item => (
          <div
            key={item.id}
            className={cn(
              'glass-panel p-3 text-center transition-all',
              item.found ? 'border-aurora-green/30' : 'opacity-60'
            )}
          >
            <div className="text-3xl mb-1">{item.found ? item.emoji : '❓'}</div>
            <div className="text-sm text-white/80">{item.found ? item.name : '???'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VoteTab() {
  const { voteTopics, castVote, isPaused } = useGameStore();
  const [votedTopics, setVotedTopics] = useState<Set<string>>(new Set());

  const handleVote = (topicId: string, optionId: string) => {
    if (votedTopics.has(topicId) || isPaused) return;
    castVote(topicId, optionId);
    setVotedTopics(prev => new Set(prev).add(topicId));
  };

  return (
    <div className="space-y-6 relative">
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="text-5xl mb-4">⏸️</div>
            <p className="text-2xl text-white font-bold">游戏已暂停</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="title-font text-xl text-white">团队决策</h3>
          <p className="text-white/60 text-sm mt-1">投票决定团队下一步行动方向</p>
        </div>
        <div className="glass-panel px-4 py-2">
          <span className="text-gold-yellow font-orbitron font-bold">{voteTopics.length}</span>
          <span className="text-white/60"> 个议题</span>
        </div>
      </div>

      <div className="space-y-4">
        {voteTopics.map(topic => {
          const hasVoted = votedTopics.has(topic.id);
          const maxVotes = Math.max(...topic.options.map(o => o.votes), 1);

          return (
            <div key={topic.id} className="glass-panel p-5">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-white font-semibold text-lg">{topic.title}</h4>
              </div>

              <div className="space-y-3">
                {topic.options.map(option => {
                  const percentage = topic.totalVotes > 0 ? (option.votes / topic.totalVotes) * 100 : 0;
                  const isLeading = option.votes === maxVotes && option.votes > 0;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleVote(topic.id, option.id)}
                      disabled={hasVoted || isPaused}
                      className={cn(
                        'w-full text-left p-4 rounded-xl relative overflow-hidden transition-all',
                        'border border-white/10 bg-white/5',
                        (hasVoted || isPaused) ? 'cursor-default' : 'hover:border-gold-yellow/50 hover:bg-white/10',
                        !hasVoted && !isPaused && 'active:scale-[0.98]',
                        isPaused && 'opacity-50'
                      )}
                    >
                      {hasVoted && (
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-yellow/20 to-coral-orange/20 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      )}
                      <div className="relative flex items-center justify-between">
                        <span className="text-white">{option.text}</span>
                        {hasVoted && (
                          <div className="flex items-center gap-2">
                            <span className="text-gold-yellow font-orbitron font-bold">{option.votes}</span>
                            <span className={cn('text-sm', isLeading ? 'text-gold-yellow' : 'text-white/50')}>
                              {percentage.toFixed(0)}%
                            </span>
                            {isLeading && <span>👑</span>}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 text-sm text-white/50">
                已有 {topic.totalVotes} 人参与投票
                {hasVoted && <span className="text-gold-yellow ml-2">✓ 你已投票</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuizTab() {
  const { quizQuestions, currentQuizIndex, answerQuiz, goToNextQuiz, teamScore, isPaused } = useGameStore();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultPoints, setResultPoints] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timer, setTimer] = useState(quizQuestions[currentQuizIndex]?.timeLimit || 20);
  const timerRef = useRef(timer);
  timerRef.current = timer;

  const currentQuestion = quizQuestions[currentQuizIndex];
  const progress = ((currentQuizIndex + 1) / quizQuestions.length) * 100;

  useEffect(() => {
    setTimer(currentQuestion?.timeLimit || 20);
    setSelectedAnswer(null);
    setShowResult(false);
    setResultPoints(0);
    setIsCorrect(false);
  }, [currentQuizIndex, currentQuestion]);

  useEffect(() => {
    if (isPaused || showResult || !currentQuestion) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowResult(true);
          setIsCorrect(false);
          setResultPoints(0);
          answerQuiz(currentQuizIndex, -1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, showResult, currentQuestion, currentQuizIndex, answerQuiz]);

  const handleAnswer = (idx: number) => {
    if (showResult || !currentQuestion || isPaused) return;
    setSelectedAnswer(idx);
    const result = answerQuiz(currentQuizIndex, idx);
    setIsCorrect(result.correct);
    setResultPoints(result.points);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    goToNextQuiz();
  };

  return (
    <div className="space-y-6 relative">
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="text-5xl mb-4">⏸️</div>
            <p className="text-2xl text-white font-bold">游戏已暂停</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="title-font text-xl text-white">知识风暴</h3>
          <p className="text-white/60 text-sm mt-1">快速答题，看看谁是团队智多星</p>
        </div>
        <div className="flex gap-3">
          <div className={cn(
            'glass-panel px-4 py-2',
            timer <= 5 && !showResult && 'animate-pulse border-coral-orange border-2'
          )}>
            <span className={cn(
              'font-orbitron font-bold',
              timer <= 5 ? 'text-coral-orange' : 'text-coral-orange'
            )}>⏱ {timer}s</span>
          </div>
          <div className="glass-panel px-4 py-2">
            <span className="text-gold-yellow font-orbitron font-bold">{teamScore}</span>
            <span className="text-white/60"> 分</span>
          </div>
        </div>
      </div>

      <div className="glass-panel p-2">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-coral-orange to-gold-yellow transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-white/60 px-2">
          <span>第 {currentQuizIndex + 1} 题</span>
          <span>共 {quizQuestions.length} 题</span>
        </div>
      </div>

      {currentQuestion && (
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs px-3 py-1 rounded-full bg-coral-orange/20 text-coral-orange">
              {currentQuestion.category}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-gold-yellow/20 text-gold-yellow">
              +{currentQuestion.points} 分
            </span>
          </div>

          <h4 className="text-xl text-white font-semibold mb-6">{currentQuestion.question}</h4>

          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrectOption = showResult && idx === currentQuestion.correctAnswer;
              const isWrongOption = showResult && isSelected && idx !== currentQuestion.correctAnswer;
              const isTimeoutWrong = showResult && selectedAnswer === null && idx === currentQuestion.correctAnswer;

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showResult || isPaused}
                  className={cn(
                    'p-4 rounded-xl text-left transition-all border-2',
                    isCorrectOption && 'border-aurora-green bg-aurora-green/20 text-white',
                    isTimeoutWrong && 'border-aurora-green bg-aurora-green/20 text-white',
                    isWrongOption && 'border-coral-orange bg-coral-orange/20 text-white',
                    !showResult && isSelected && 'border-neon-cyan bg-neon-cyan/10',
                    !showResult && !isSelected && !isPaused && 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10',
                    !showResult && !isSelected && isPaused && 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed',
                    showResult && !isCorrectOption && !isWrongOption && !isTimeoutWrong && 'border-white/10 bg-white/5 text-white/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                      isCorrectOption ? 'bg-aurora-green text-deep-ocean' :
                      isTimeoutWrong ? 'bg-aurora-green text-deep-ocean' :
                      isWrongOption ? 'bg-coral-orange text-white' :
                      'bg-white/10 text-white/80'
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-6 text-center animate-fade-in">
              <p className={cn(
                'text-lg font-semibold mb-3',
                isCorrect ? 'text-aurora-green' : 'text-coral-orange'
              )}>
                {isCorrect 
                  ? `🎉 回答正确！+${resultPoints} 分` 
                  : selectedAnswer === null 
                    ? '⏰ 时间到！回答错误'
                    : '😢 回答错误，继续加油！'}
              </p>
              <button
                onClick={handleNextQuestion}
                disabled={isPaused}
                className={cn(
                  'neon-button',
                  isPaused && 'opacity-50 cursor-not-allowed'
                )}
              >
                下一题 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TeamBoard() {
  const { tasks, hiddenItems, puzzlePieces, teamScore, voteTopics, quizQuestions, currentQuizIndex, teams } = useGameStore();
  const { players } = usePlayerStore();

  const getTaskProgress = (task: typeof tasks[number]) => {
    switch (task.type) {
      case 'puzzle': {
        const placedCount = puzzlePieces.filter(p => p.isPlaced).length;
        return { current: placedCount, total: 9, percent: Math.round((placedCount / 9) * 100) };
      }
      case 'findItem': {
        const foundCount = hiddenItems.filter(i => i.found).length;
        return { current: foundCount, total: hiddenItems.length, percent: Math.round((foundCount / hiddenItems.length) * 100) };
      }
      case 'vote': {
        const topic = voteTopics[0];
        const totalVotes = topic?.totalVotes ?? 0;
        return { current: totalVotes, total: 6, percent: Math.round((totalVotes / 6) * 100) };
      }
      case 'quiz': {
        return { current: currentQuizIndex + 1, total: quizQuestions.length, percent: Math.round(((currentQuizIndex + 1) / quizQuestions.length) * 100) };
      }
      default:
        return { current: 0, total: 0, percent: task.progress ?? 0 };
    }
  };

  const getRemainingTarget = (task: typeof tasks[number]) => {
    if (task.type === 'quiz' && task.status === 'completed') {
      return '已完成';
    }
    if (typeof task.remainingTarget === 'number') {
      const unit = task.type === 'quiz' ? ' 题' : '';
      return `剩余 ${task.remainingTarget}${unit}`;
    }
    const progress = getTaskProgress(task);
    const remaining = Math.max(0, progress.total - progress.current);
    switch (task.type) {
      case 'puzzle': return `剩余 ${remaining} 块未放置`;
      case 'findItem': return `剩余 ${remaining} 件宝物`;
      case 'vote': return `剩余 ${remaining} 人未投`;
      case 'quiz': return `剩余 ${remaining} 题`;
      default: return '';
    }
  };

  const getTaskParticipants = (task: typeof tasks[number]) => {
    const ids = task.participants || [];
    return ids.map(id => players.find(p => p.id === id)).filter(Boolean) as typeof players;
  };

  return (
    <div className="glass-panel p-4 w-full lg:w-64 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="title-font text-lg text-white flex items-center gap-2">
          <span>👥</span>
          团队协作看板
        </h3>
        <div className="text-xs text-gold-yellow font-orbitron">{teamScore}分</div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin pr-1">
        {tasks.map(task => {
          const baseProgress = getTaskProgress(task);
          const isCompleted = task.status === 'completed';
          const progress = isCompleted
            ? { current: baseProgress.total, total: baseProgress.total, percent: 100 }
            : baseProgress;
          const participants = getTaskParticipants(task);
          const lastScoreRecord = task.lastScoreRecord;
          const lastScorePlayer = lastScoreRecord ? players.find(p => p.id === lastScoreRecord.playerId) : null;

          return (
            <div
              key={task.id}
              className={cn(
                'rounded-xl p-3 border transition-all bg-white/5',
                statusBorderColors[task.status]
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-1.5 flex-1 min-w-0">
                  <span className="text-base flex-shrink-0">{getTaskTypeIcon(task.type)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {getTaskTypeName(task.type)} · {getDifficultyStars(task.difficulty)}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full border flex-shrink-0',
                  statusBadgeColors[task.status]
                )}>
                  {statusText[task.status]}
                </span>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>{isCompleted ? '已完成' : '进度'}</span>
                  <span>{progress.current}/{progress.total}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-aurora-green transition-all"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="flex -space-x-1.5">
                  {participants.slice(0, 3).map((player) => {
                    const team = teams.find(t => t.id === player.teamId);
                    const borderColor = team?.color || player.color;
                    return (
                      <div
                        key={player.id}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2"
                        style={{
                          backgroundColor: player.color,
                          borderColor,
                        }}
                        title={player.name}
                      >
                        {player.avatarEmoji}
                      </div>
                    );
                  })}
                  {participants.length > 3 && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-white/20 text-white/70 border-2 border-deep-ocean">
                      +{participants.length - 3}
                    </div>
                  )}
                  {participants.length === 0 && (
                    <span className="text-xs text-white/40">暂无参与</span>
                  )}
                </div>
              </div>

              <div className="text-xs text-white/50 space-y-0.5">
                {lastScoreRecord && lastScorePlayer ? (
                  <p className="flex items-center gap-1">
                    <span className="text-aurora-green">+{lastScoreRecord.points}分</span>
                    <span>·</span>
                    <span>{lastScorePlayer.name}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(lastScoreRecord.timestamp)}</span>
                  </p>
                ) : (
                  <p>暂无得分</p>
                )}
                <p className="text-white/40">{getRemainingTarget(task)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MessagePanel() {
  const { messages } = useGameStore();
  const { players } = usePlayerStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isHostHint = (content: string) => content.startsWith('💡 主持人提示：');

  const getSenderAvatar = (playerId: string, isSystem: boolean, content: string) => {
    if (isSystem || isHostHint(content)) return null;
    const player = players.find(p => p.id === playerId);
    return player?.avatarEmoji;
  };

  const getSenderColor = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.color || '#ffffff';
  };

  return (
    <div className="glass-panel p-4 w-full lg:w-72 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="title-font text-lg text-white flex items-center gap-2">
          <span>📢</span>
          公共消息
        </h3>
        <span className="text-xs text-white/50">{messages.length} 条</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-2">
        {messages.map(msg => {
          const systemMsg = msg.system || isHostHint(msg.content);
          const hintMsg = isHostHint(msg.content);
          const avatar = getSenderAvatar(msg.playerId, !!msg.system, msg.content);

          return (
            <div
              key={msg.id}
              className={cn(
                'rounded-lg p-2.5 text-sm border-l-2',
                systemMsg && hintMsg && 'border-gold-yellow bg-gold-yellow/5',
                systemMsg && !hintMsg && 'border-neon-cyan bg-neon-cyan/5',
                !systemMsg && 'border-white/20 bg-white/5'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {hintMsg ? (
                  <span className="text-base">💡</span>
                ) : systemMsg ? (
                  <span className="text-base">🔔</span>
                ) : avatar ? (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: getSenderColor(msg.playerId) }}
                  >
                    {avatar}
                  </div>
                ) : null}
                <span className={cn(
                  'font-medium text-xs',
                  systemMsg && hintMsg && 'text-gold-yellow',
                  systemMsg && !hintMsg && 'text-neon-cyan',
                  !systemMsg && 'text-white/80'
                )}>
                  {msg.playerName}
                </span>
                <span className="text-xs text-white/40 ml-auto">
                  {formatDate(msg.timestamp)}
                </span>
              </div>
              <p className={cn(
                'text-xs leading-relaxed',
                systemMsg && hintMsg && 'text-gold-yellow/90',
                systemMsg && !hintMsg && 'text-neon-cyan/90',
                !systemMsg && 'text-white/70'
              )}>
                {msg.content}
              </p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default function Tasks() {
  const [activeTab, setActiveTab] = useState<TaskType>('puzzle');
  const { tasks } = useGameStore();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'puzzle': return <PuzzleTab />;
      case 'findItem': return <FindItemTab />;
      case 'vote': return <VoteTab />;
      case 'quiz': return <QuizTab />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="section-title">🎯 任务区</h1>
        <p className="text-white/60 ml-4">参与各种趣味任务，为团队赢取积分</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        <div className="lg:col-span-3 order-2 lg:order-1 max-h-[40vh] lg:max-h-none">
          <TeamBoard />
        </div>

        <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col min-h-0 gap-4">
          <div className="flex flex-wrap gap-3">
            {TABS.map(tab => {
              const isActive = activeTab === tab.type;
              const typeTasks = tasks.filter(t => t.type === tab.type);
              const completedCount = typeTasks.filter(t => t.status === 'completed').length;

              return (
                <button
                  key={tab.type}
                  onClick={() => setActiveTab(tab.type)}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all duration-300',
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                      : 'glass-panel-hover text-white/70'
                  )}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.name}</span>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    isActive ? 'bg-white/20' : 'bg-white/10'
                  )}>
                    {completedCount}/{typeTasks.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="glass-panel p-6 flex-1 overflow-y-auto scrollbar-thin min-h-0">
            {renderTabContent()}
          </div>
        </div>

        <div className="lg:col-span-3 order-3 max-h-[40vh] lg:max-h-none">
          <MessagePanel />
        </div>
      </div>
    </div>
  );
}
