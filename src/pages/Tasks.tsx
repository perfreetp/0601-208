import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { TaskType } from '@/types';
import { cn, getTaskTypeIcon, getTaskTypeName, getDifficultyStars, formatTime } from '@/lib/utils';

const TABS: { type: TaskType; icon: string; name: string; color: string }[] = [
  { type: 'puzzle', icon: '🧩', name: '拼图挑战', color: 'from-neon-cyan to-neon-cyan-dim' },
  { type: 'findItem', icon: '🔍', name: '寻物游戏', color: 'from-aurora-green to-teal-400' },
  { type: 'vote', icon: '🗳️', name: '投票决策', color: 'from-gold-yellow to-orange-400' },
  { type: 'quiz', icon: '❓', name: '限时问答', color: 'from-coral-orange to-coral-light' },
];

function PuzzleTab() {
  const { puzzlePieces, placePuzzlePiece, tasks, completeTask, updateTaskStatus, isPaused } = useGameStore();
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [animatingCell, setAnimatingCell] = useState<string | null>(null);
  const placedCount = puzzlePieces.filter(p => p.isPlaced).length;
  const puzzleTask = tasks.find(t => t.type === 'puzzle');
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (placedCount === 9 && puzzleTask && !hasCompleted.current) {
      hasCompleted.current = true;
      completeTask(puzzleTask.id);
    }
  }, [placedCount, puzzleTask, completeTask]);

  const handleCellClick = (x: number, y: number) => {
    if (isPaused || selectedPieceId === null) return;
    const cellIndex = y * 3 + x;
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
    if (isPaused) return;
    setSelectedPieceId(prev => prev === pieceId ? null : pieceId);
  };

  const getPlacedPiece = (x: number, y: number) => {
    return puzzlePieces.find(p => p.isPlaced && p.currentX === x && p.currentY === y);
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
                <h4 className="text-white font-semibold text-lg">{topic.question}</h4>
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  topic.isAnonymous ? 'bg-starlight-purple/30 text-starlight-light' : 'bg-neon-cyan/20 text-neon-cyan'
                )}>
                  {topic.isAnonymous ? '匿名投票' : '实名投票'}
                </span>
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
    <div className="h-full flex flex-col gap-6 p-6">
      <div>
        <h1 className="section-title">任务区</h1>
        <p className="text-white/60 ml-4">参与各种趣味任务，为团队赢取积分</p>
      </div>

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

      <div className="glass-panel p-6 flex-1 overflow-y-auto scrollbar-thin">
        {renderTabContent()}
      </div>
    </div>
  );
}
