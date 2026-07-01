'use client';

import { useEffect, useState, useRef } from 'react';
import { usePlannerStore } from '@/store/usePlannerStore';
import { X, Send, Sparkles, Clock, Copy, Check } from 'lucide-react';

interface TaskChatDrawerProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskChatDrawer({ task, isOpen, onClose }: TaskChatDrawerProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getTaskChatHistory = usePlannerStore((s) => s.getTaskChatHistory);
  const addTaskChatMessage = usePlannerStore((s) => s.addTaskChatMessage);
  const getProject = usePlannerStore((s) => s.getProject);

  useEffect(() => {
    if (isOpen && task) {
      const history = getTaskChatHistory(task.id);
      setMessages(history);
    }
  }, [isOpen, task]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !task) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      message: userMessage,
      createdAt: new Date().toISOString(),
      taskId: task.id,
    };
    addTaskChatMessage(task.id, userMsg);
    setMessages((prev) => [...prev, userMsg]);

    try {
      const project = getProject(task.projectId);
      const res = await fetch(`/api/tasks/${task.id}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          task,
          project,
          chatHistory: [...messages, userMsg],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const mentorMsg = {
        id: crypto.randomUUID(),
        role: 'mentor' as const,
        message: data.reply,
        createdAt: new Date().toISOString(),
        taskId: task.id,
      };
      addTaskChatMessage(task.id, mentorMsg);
      setMessages((prev) => [...prev, mentorMsg]);
    } catch (err) {
      console.error('Error asking assistant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderMessageContent = (text: string, msgIndex: number) => {
    if (!text) return null;

    const parts = text.split(/```/);
    if (parts.length === 1) {
      return <p className="whitespace-pre-line leading-relaxed">{formatBoldText(text)}</p>;
    }

    return parts.map((part, index) => {
      const isCode = index % 2 === 1;

      if (isCode) {
        const firstNewLine = part.indexOf('\n');
        let language = 'code';
        let codeContent = part;

        if (firstNewLine !== -1) {
          const possibleLang = part.substring(0, firstNewLine).trim();
          if (possibleLang.length > 0 && possibleLang.length < 15) {
            language = possibleLang;
            codeContent = part.substring(firstNewLine + 1);
          }
        }

        const blockId = msgIndex * 100 + index;

        return (
          <div
            key={index}
            className="my-3 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden font-mono shadow-lg text-[11px] text-zinc-100"
          >
            <div className="flex justify-between items-center bg-zinc-800 px-4 py-2 border-b border-zinc-700 text-[10px] uppercase font-bold text-zinc-400">
              <span>{language}</span>
              <button
                onClick={() => handleCopyCode(codeContent, blockId)}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                {copiedIndex === blockId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      return (
        <p key={index} className="whitespace-pre-line leading-relaxed">
          {formatBoldText(part)}
        </p>
      );
    });
  };

  const formatBoldText = (text: string) => {
    const boldParts = text.split(/\*\*(.*?)\*\*/g);
    return boldParts.map((subPart, i) => {
      if (i % 2 === 1) {
        return (
          <strong key={i} className="font-bold text-zinc-900">
            {subPart}
          </strong>
        );
      }
      return subPart;
    });
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer */}
      <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-zinc-100 flex flex-col relative z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex justify-between items-start gap-4 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-violet-600 bg-white border border-violet-100 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
              Study Assistant
            </span>
            <h3 className="font-black text-base text-zinc-900 leading-snug">
              {task.title}
            </h3>
            <div className="flex gap-2.5 text-[10px]">
              <span className="text-zinc-500 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" /> {task.estimatedHours}h
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded uppercase border ${
                  task.difficultyLevel === 'easy'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    : task.difficultyLevel === 'hard'
                    ? 'bg-red-50 border-red-100 text-red-500'
                    : 'bg-amber-50 border-amber-100 text-amber-600'
                }`}
              >
                {task.difficultyLevel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-2 rounded-xl hover:bg-white transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task details */}
        {(task.description || task.notes) && (
          <div className="bg-zinc-50 border-b border-zinc-100 p-4 space-y-2 max-h-36 overflow-y-auto text-xs">
            {task.description && (
              <p className="text-zinc-600 leading-relaxed">
                <strong className="text-zinc-800">Goal:</strong> {task.description}
              </p>
            )}
            {task.notes && (
              <div className="bg-white border border-zinc-100 p-2 rounded-lg text-[10px] text-zinc-500 font-mono">
                <span className="font-bold text-zinc-400 text-[8px] uppercase tracking-wider block mb-0.5">
                  Your Notes
                </span>
                {task.notes}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Welcome message */}
          <div className="flex flex-col max-w-[85%] rounded-2xl p-3.5 leading-relaxed bg-zinc-50 border border-zinc-100 text-zinc-700 self-start rounded-bl-md">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              AI Study Assistant
            </span>
            <p className="leading-relaxed">
              Hello! I'm your AI Study Assistant. Ask me for step-by-step instructions,
              code snippets, or help understanding concepts for this task!
            </p>
          </div>

          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 text-zinc-800 self-end rounded-br-md'
                  : 'bg-zinc-50 border border-zinc-100 text-zinc-700 self-start rounded-bl-md'
              }`}
            >
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </span>
              {renderMessageContent(msg.message, index)}
            </div>
          ))}

          {loading && messages.length % 2 === 1 && (
            <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-2xl text-zinc-400 self-start animate-pulse text-[10px]">
              Writing advice...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-zinc-100 bg-white flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this task..."
            disabled={loading}
            className="flex-1 bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 p-3 rounded-xl focus:outline-none focus:border-violet-400 transition-all placeholder:text-zinc-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-violet-500/20 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
