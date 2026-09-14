'use client';

import { useState, useRef, useEffect } from 'react';
import { useTutorStore, type Message } from '@/store/useTutorStore';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import * as api from '@/lib/api';
import FormattedMessage from './FormattedMessage';
import AudioPlayer from './AudioPlayer';
import { Sparkles, X, Send, Mic, Square, Trash2, Globe, Loader2 } from 'lucide-react';

/** How many prior turns to send as context. The whole transcript would grow
 *  the request without bound; the last few carry the thread. */
const HISTORY_LIMIT = 10;

export default function PauseAndAskOverlay() {
    const {
        isTutorOpen,
        toggleTutor,
        messages,
        addMessage,
        isTyping,
        setIsTyping,
        language,
        setLanguage,
        moduleId,
        setHighlight,
        noteQuestion,
    } = useTutorStore();

    const [inputText, setInputText] = useState('');
    const { isRecording, recordingDuration, startRecording, stopRecording, cancelRecording } =
        useAudioRecorder();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    if (!isTutorOpen) return null;

    /** Prior turns in the backend's shape. Failed turns are left out so a
     *  network error doesn't get replayed to the model as conversation. */
    const buildHistory = (): { role: 'ai' | 'user'; content: string }[] =>
        messages
            .filter((m) => !m.error && m.text.trim())
            .slice(-HISTORY_LIMIT)
            .map((m) => ({ role: m.sender, content: m.text }));

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const question = inputText.trim();
        if (!question || isTyping) return;

        const history = buildHistory();
        addMessage({ sender: 'user', text: question });
        setInputText('');
        setIsTyping(true);

        try {
            const res = await api.sendText(moduleId, language, question, history);
            addMessage({ sender: 'ai', text: res.response_text });
            // null is the common case and simply means "nothing to highlight".
            setHighlight(res.trigger_3d_animation);
            noteQuestion();
        } catch (err) {
            addMessage({ sender: 'ai', text: api.describeError(err), error: true });
        } finally {
            setIsTyping(false);
        }
    };

    const handleStopAndSendVoice = async () => {
        const audioBlob = await stopRecording();
        if (!audioBlob) return;

        // The blob URL is local to this tab and plays back the student's own
        // recording — it is not a backend asset, so it is not prefixed.
        const localUrl = URL.createObjectURL(audioBlob);
        addMessage({ sender: 'user', text: '🎤 Voice message', audioUrl: localUrl });
        setIsTyping(true);

        try {
            const res = await api.sendVoice(moduleId, language, audioBlob);
            addMessage({
                sender: 'ai',
                text: res.response_text,
                // Relative "/static/audio/x.wav"; AudioPlayer resolves it
                // against the API host. Null when synthesis failed, in which
                // case the text answer still stands on its own.
                audioUrl: res.tts_audio_url ?? undefined,
            });
            setHighlight(res.trigger_3d_animation);
            noteQuestion();
        } catch (err) {
            addMessage({ sender: 'ai', text: api.describeError(err), error: true });
        } finally {
            setIsTyping(false);
        }
    };

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <aside className="fixed bottom-6 right-6 z-50 flex h-[620px] w-[380px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl transition-all">
            {/* Header with Language Toggle */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <span>EduBridge Tutor</span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Language Selector */}
                    <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1">
                        <Globe size={14} className="text-gray-500" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as api.Language)}
                            className="bg-transparent text-xs font-medium text-gray-700 outline-none cursor-pointer"
                        >
                            <option value="English">English</option>
                            <option value="Pidgin">Pidgin</option>
                        </select>
                    </div>

                    <button onClick={toggleTutor} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/50 p-4">
                {messages.length === 0 && !isTyping && (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 px-4 py-6 text-center">
                        <p className="text-sm font-medium text-gray-700">Ask about this module</p>
                        <p className="mt-1 text-xs text-gray-500">
                            Type a question or use the microphone. Answers are grounded in the
                            course material and follow your language choice.
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex max-w-[85%] items-center gap-1.5 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '0ms' }}></span>
                            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '150ms' }}></span>
                            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 p-4 bg-white">
                {isRecording ? (
                    <div className="flex items-center justify-between gap-3 rounded-full bg-red-50 px-4 py-2 border border-red-100">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 animate-ping rounded-full bg-red-500" />
                            <span className="text-xs font-semibold text-red-600">Recording {formatTimer(recordingDuration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={cancelRecording} className="rounded-full p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors">
                                <Trash2 size={16} />
                            </button>
                            <button type="button" onClick={handleStopAndSendVoice} className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 transition-colors">
                                <Square size={12} fill="currentColor" /> Send
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={startRecording}
                            disabled={isTyping}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-40"
                        >
                            <Mic size={18} />
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={isTyping}
                            placeholder={isTyping ? 'Thinking…' : 'Ask a question...'}
                            className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isTyping}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
                        >
                            {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </form>
                )}
            </div>
        </aside>
    );
}

function MessageBubble({ msg }: { msg: Message }) {
    if (msg.error) {
        return (
            <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 shadow-sm">
                    {msg.text}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.sender === 'user' ? 'rounded-br-sm bg-blue-600 text-white' : 'rounded-bl-sm border border-gray-100 bg-white text-gray-800'}`}>
                <FormattedMessage content={msg.text} />
                {msg.audioUrl && <AudioPlayer audioUrl={msg.audioUrl} />}
            </div>
        </div>
    );
}
