import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Sparkles } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { ChatMessage } from '@/types';

interface ChatBoxProps {
  messages: ChatMessage[];
  currentPlayerId?: string;
  onSendMessage: (content: string) => void;
  className?: string;
}

export default function ChatBox({
  messages,
  currentPlayerId,
  onSendMessage,
  className,
}: ChatBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onSendMessage(trimmed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl overflow-hidden',
        'bg-glass backdrop-blur-xl border border-neon-cyan/20',
        className
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neon-cyan/20 bg-ocean-dark/50">
        <div className="p-1.5 rounded-lg bg-neon-cyan/20">
          <MessageCircle className="w-4 h-4 text-neon-cyan" />
        </div>
        <span className="font-medium text-white">聊天室</span>
        <span className="text-xs text-gray-400 ml-auto">{messages.length} 条消息</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Sparkles className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">暂无消息，发送第一条消息吧！</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.playerId === currentPlayerId;
            const isSystem = msg.system;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="px-4 py-1.5 rounded-full bg-starlight-purple/20 border border-starlight-light/30">
                    <p className="text-xs text-starlight-light">
                      <Sparkles className="w-3 h-3 inline mr-1 -mt-0.5" />
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={cn('flex flex-col gap-1', isCurrentUser ? 'items-end' : 'items-start')}
              >
                <div className="flex items-center gap-2 px-1">
                  <span className={cn('text-xs font-medium', isCurrentUser ? 'text-neon-cyan' : 'text-coral-orange')}>
                    {msg.playerName}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(msg.timestamp)}</span>
                </div>
                <div
                  className={cn(
                    'max-w-[80%] px-4 py-2.5 rounded-2xl',
                    isCurrentUser
                      ? 'bg-gradient-to-br from-neon-cyan/30 to-neon-cyan/10 border border-neon-cyan/40 rounded-br-md'
                      : 'bg-gradient-to-br from-ocean-light/60 to-ocean-mid/60 border border-ocean-light/40 rounded-bl-md'
                  )}
                >
                  <p className="text-sm text-white leading-relaxed break-words">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-neon-cyan/20 bg-ocean-dark/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl outline-none transition-all duration-300',
              'bg-ocean-mid/50 border border-ocean-light/40 text-white placeholder-gray-500',
              'focus:border-neon-cyan/60 focus:bg-ocean-mid/80 focus:shadow-[0_0_10px_rgba(0,240,255,0.1)]'
            )}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300',
              'bg-gradient-to-br from-neon-cyan to-neon-cyan-dim',
              'hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
            )}
          >
            <Send className="w-5 h-5 text-deep-ocean" />
          </button>
        </div>
      </div>
    </div>
  );
}
