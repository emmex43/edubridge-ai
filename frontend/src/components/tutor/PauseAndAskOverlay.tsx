'use client';

import { useState, useRef, useEffect } from 'react';
import { useTutorStore } from '@/store/useTutorStore';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import FormattedMessage from './FormattedMessage';
import AudioPlayer from './AudioPlayer';
import { Sparkles, X, Send, Mic, Square, Trash2, Globe } from 'lucide-react';

export default function PauseAndAskOverlay() {
    const { isTutorOpen, toggleTutor, messages, addMessage, isTyping, setIsTyping, language, setLanguage } = useTutorStore();
    const [inputText, setInputText] = useState('');
    const { isRecording, recordingDuration, startRecording, stopRecording, cancelRecording } = useAudioRecorder();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    if (!isTutorOpen) return null;

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim()) return;

        addMessage({ sender: 'user', text: inputText });
        const userQuery = inputText;
        setInputText('');
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);

            // Dynamic response based on selected language
            const aiResponse = language === 'Pidgin'
                ? `I don hear your question: "${userQuery}". Make we check the equation wey dey control this dynamic state.`
                : `I received your question: "${userQuery}". Let's analyze the governing equations for this dynamic state.`;

            addMessage({
                sender: 'ai',
                text: aiResponse,
            });
        }, 1500);
    };

    const handleStopAndSendVoice = async () => {
        const audioBlob = await stopRecording();
        if (!audioBlob) return;

        const audioUrl = URL.createObjectURL(audioBlob);
        addMessage({ sender: 'user', text: '🎤 Voice message', audioUrl: audioUrl });
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);

            const aiResponse = language === 'Pidgin'
                ? 'I don analyze wetin you talk. Here na the response to your question about the 3D model state.'
                : 'I analyzed your spoken query. Here is the response to your question regarding the 3D model state.';

            addMessage({
                sender: 'ai',
                text: aiResponse,
            });
        }, 2000);
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
                            onChange={(e) => setLanguage(e.target.value as 'English' | 'Pidgin')}
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
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.sender === 'user' ? 'rounded-br-sm bg-blue-600 text-white' : 'rounded-bl-sm border border-gray-100 bg-white text-gray-800'}`}>
                            <FormattedMessage content={msg.text} />
                            {msg.audioUrl && <AudioPlayer audioUrl={msg.audioUrl} />}
                        </div>
                    </div>
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
                        <button type="button" onClick={startRecording} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <Mic size={18} />
                        </button>
                        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Ask a question..." className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                        <button type="submit" disabled={!inputText.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 transition-colors">
                            <Send size={16} />
                        </button>
                    </form>
                )}
            </div>
        </aside>
    );
}