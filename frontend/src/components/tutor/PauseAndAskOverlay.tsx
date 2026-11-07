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
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth';
        messagesEndRef.current?.scrollIntoView({ behavior });
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
        addMessage({ sender: 'user', text: 'Voice message', audioUrl: localUrl });
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
        <aside
            id="tutor-panel"
            aria-label="EduBridge AI tutor"
            className="fixed inset-x-3 bottom-3 z-50 flex h-[min(620px,calc(100dvh_-_1.5rem))] flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[min(420px,calc(100vw_-_3rem))]"
        >
            {/* Header with Language Toggle */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-center gap-2 font-bold text-foreground">
                    <Sparkles aria-hidden="true" className="h-5 w-5 text-brand" />
                    <span>EduBridge Tutor</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <div className="flex min-h-11 items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                        <Globe aria-hidden="true" size={14} className="text-muted" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as api.Language)}
                            aria-label="Tutor response language"
                            className="min-h-10 max-w-24 cursor-pointer bg-transparent text-xs font-medium text-foreground outline-none"
                        >
                            <option value="English">English</option>
                            <option value="Pidgin">Pidgin</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={toggleTutor}
                        aria-label="Close AI tutor"
                        className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground"
                    >
                        <X aria-hidden="true" size={18} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div
                role="log"
                aria-label="Tutor conversation"
                aria-relevant="additions"
                className="flex-1 space-y-4 overflow-y-auto bg-background/70 p-4"
            >
                {messages.length === 0 && !isTyping && (
                    <div className="rounded-2xl border border-dashed border-border bg-white px-4 py-6 text-center">
                        <p className="text-sm font-semibold text-foreground">Ask about this module</p>
                        <p className="mt-1 text-xs leading-5 text-muted">
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
                        <div role="status" className="flex max-w-[85%] items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-white px-4 py-3.5 shadow-sm">
                            <span className="sr-only">Tutor is thinking</span>
                            <span aria-hidden="true" className="h-2 w-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: '0ms' }}></span>
                            <span aria-hidden="true" className="h-2 w-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: '150ms' }}></span>
                            <span aria-hidden="true" className="h-2 w-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-white p-3 sm:p-4">
                {isRecording ? (
                    <div className="flex items-center justify-between gap-3 rounded-full border border-red-200 bg-red-50 px-4 py-2">
                        <div className="flex items-center gap-2">
                            <span aria-hidden="true" className="h-3 w-3 animate-ping rounded-full bg-red-600" />
                            <span role="status" className="text-xs font-semibold text-red-800">Recording {formatTimer(recordingDuration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={cancelRecording} aria-label="Cancel recording" className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-100 hover:text-red-800">
                                <Trash2 aria-hidden="true" size={16} />
                            </button>
                            <button type="button" onClick={handleStopAndSendVoice} className="flex min-h-11 items-center gap-1 rounded-full bg-red-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-800">
                                <Square aria-hidden="true" size={12} fill="currentColor" /> Send recording
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={startRecording}
                            disabled={isTyping}
                            aria-label="Record a voice message"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-foreground transition-colors hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Mic aria-hidden="true" size={18} />
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={isTyping}
                            placeholder={isTyping ? 'Thinking…' : 'Ask a question...'}
                            aria-label="Ask the AI tutor"
                            className="min-h-11 min-w-0 flex-1 rounded-full border border-border px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-background"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isTyping}
                            aria-label="Send message"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isTyping ? <Loader2 aria-hidden="true" size={16} className="animate-spin" /> : <Send aria-hidden="true" size={16} />}
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
                <div role="alert" className="max-w-[85%] rounded-2xl rounded-bl-sm border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-950 shadow-sm">
                    {msg.text}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.sender === 'user' ? 'rounded-br-sm bg-brand text-white' : 'rounded-bl-sm border border-border bg-white text-foreground'}`}>
                <FormattedMessage content={msg.text} />
                {msg.audioUrl && <AudioPlayer audioUrl={msg.audioUrl} />}
            </div>
        </div>
    );
}
