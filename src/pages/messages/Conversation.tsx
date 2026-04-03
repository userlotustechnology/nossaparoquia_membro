import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessagesSquare, ArrowLeft, Send } from 'lucide-react';
import api from '@/lib/api';

export default function Conversation() {
  const { id } = useParams();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get(`/parish-messages/${id}`)
      .then((res) => {
        const data = res.data.data ?? res.data;
        setConversation(data);
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    api.post(`/parish-messages/${id}/reply`, { body: reply })
      .then((res) => {
        const newMsg = res.data.data ?? res.data;
        setMessages((prev) => [...prev, newMsg]);
        setReply('');
      })
      .catch(() => {})
      .finally(() => {
        setSending(false);
      });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/mensagens" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <MessagesSquare className="h-6 w-6 text-primary-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{conversation?.subject ?? 'Conversa'}</h1>
          {conversation?.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 mt-1">
              {conversation.category}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[60vh]">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Nenhuma mensagem ainda.</p>
          ) : (
            messages.map((msg, idx) => {
              const isParishioner = msg.sender_type === 'parishioner';
              return (
                <div
                  key={msg.id ?? idx}
                  className={`flex ${isParishioner ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl px-4 py-3 ${
                      isParishioner
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isParishioner ? 'text-primary-200' : 'text-gray-400'
                      }`}
                    >
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {conversation?.status === 'open' && (
          <form onSubmit={handleReply} className="flex items-end gap-2 border-t border-gray-200 pt-4">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Escreva sua resposta..."
              rows={2}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
