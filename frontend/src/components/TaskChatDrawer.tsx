'use client'

import { useEffect, useState, useRef } from 'react';
import { getTaskChatHistory, askTaskAssistant } from '../app/actions/projectActions';
import { X, Send, Sparkles, Clock, Award, Copy, Check } from 'lucide-react';

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

  useEffect(() => {
    if (isOpen && task) {
      loadHistory();
    }
  }, [isOpen, task]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const history = await getTaskChatHistory(task._id);
      setMessages(history);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !task) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Optimistic update
    setMessages((prev) => [...prev, { role: 'user', message: userMessage, createdAt: new Date() }]);

    try {
      const res = await askTaskAssistant(task._id, task.projectId?._id || task.projectId, userMessage);
      if (res && res.reply) {
        setMessages((prev) => [...prev, res.chat || { role: 'mentor', message: res.reply, createdAt: new Date() }]);
      }
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

  // Custom parser to format bold texts and extract code blocks with copy buttons
  const renderMessageContent = (text: string, msgIndex: number) => {
    if (!text) return null;

    // Detect code blocks marked by ```
    const parts = text.split(/```/);
    if (parts.length === 1) {
      return <p className="whitespace-pre-line leading-relaxed">{formatBoldText(text)}</p>;
    }

    return parts.map((part, index) => {
      // Even indexes are text, odd indexes are code blocks
      const isCode = index % 2 === 1;

      if (isCode) {
        // Extract language and actual code
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
          <div key={index} className="my-3 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden font-mono shadow-md text-[11px] text-zinc-100">
            <div className="flex justify-between items-center bg-zinc-850 px-4 py-2 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
              <span>{language}</span>
              <button
                onClick={() => handleCopyCode(codeContent, blockId)}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                {copiedIndex === blockId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-bold">Copied!</span>
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
      } else {
        return (
          <p key={index} className="whitespace-pre-line leading-relaxed">
            {formatBoldText(part)}
          </p>
        );
      }
    });
  };

  const formatBoldText = (text: string) => {
    const boldParts = text.split(/\*\*(.*?)\*\*/g);
    return boldParts.map((subPart, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-zinc-950">{subPart}</strong>;
      }
      return subPart;
    });
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/20 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer content panel */}
      <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-zinc-200 flex flex-col justify-between relative z-10 transition-transform duration-300 transform translate-x-0">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-150 flex justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
              Study Assistant
            </span>
            <h3 className="font-black text-base text-zinc-900 leading-snug">{task.title}</h3>
            
            {/* Meta attributes */}
            <div className="flex gap-2.5 pt-1.5 text-[10px]">
              <span className="text-zinc-550 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" /> {task.estimatedHours} hrs
              </span>
              <span className={`font-bold px-2 py-0.5 rounded uppercase border whitespace-nowrap ${
                task.difficultyLevel === 'easy' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                  : task.difficultyLevel === 'hard' 
                    ? 'bg-red-50 border-red-100 text-red-650'
                    : 'bg-amber-50 border-amber-100 text-amber-600'
              }`}>
                {task.difficultyLevel}
              </span>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-900 p-2 rounded-xl hover:bg-zinc-100 transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Details panel (collapsible notes/descr) */}
        {(task.description || task.notes) && (
          <div className="bg-zinc-50 border-b border-zinc-200 p-4 space-y-2 max-h-36 overflow-y-auto text-xs">
            {task.description && (
              <p className="text-zinc-650 leading-relaxed"><strong className="text-zinc-800">Mission Goal:</strong> {task.description}</p>
            )}
            {task.notes && (
              <div className="bg-white border border-zinc-200 p-2 rounded-xl text-[10px] text-zinc-550 leading-normal font-mono">
                <span className="font-bold text-zinc-400 block uppercase tracking-wider text-[8px] mb-0.5">Your Task Notes:</span>
                {task.notes}
              </div>
            )}
          </div>
        )}

        {/* Message history section */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs bg-zinc-50/40">
          
          {/* Initial Greeting */}
          <div className="flex flex-col max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-2xs bg-zinc-100 border border-zinc-200 text-zinc-800 self-start rounded-bl-none">
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              AI Study Assistant
            </span>
            <p className="leading-relaxed">
              Hello! I'm your AI Study Assistant for this mission.
              How can I help you complete this step? Feel free to ask for step-by-step instructions, code skeletons, or conceptual definitions!
            </p>
          </div>

          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-2xs ${
                msg.role === 'user' 
                  ? 'bg-violet-50 border border-violet-100 text-zinc-850 self-end rounded-br-none' 
                  : 'bg-zinc-100 border border-zinc-200 text-zinc-800 self-start rounded-bl-none'
              }`}
            >
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                {msg.role === 'user' ? 'You' : 'AI Study Assistant'}
              </span>
              {renderMessageContent(msg.message, index)}
            </div>
          ))}

          {loading && messages.length % 2 === 1 && (
            <div className="bg-zinc-100 border border-zinc-200 p-3 rounded-2xl text-zinc-400 self-start animate-pulse text-[10px]">
              Writing advice...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-150 bg-white flex gap-3.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this mission..."
            disabled={loading}
            className="flex-1 bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 p-3 rounded-xl focus:outline-none focus:border-violet-500 transition-all placeholder:text-zinc-400 shadow-2xs"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-violet-600 hover:bg-violet-550 text-white rounded-xl flex items-center justify-center transition-all disabled:bg-zinc-100 disabled:text-zinc-400 cursor-pointer shadow-md shadow-violet-600/10 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
