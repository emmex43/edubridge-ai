'use client';

import { useCourseStore } from '@/store/courseStore';
import { Plus, GripVertical, FileText, Image as ImageIcon, Video, Settings } from 'lucide-react';
import Link from 'next/link';

export default function TutorStudio() {
  const { 
    courseTitle, setCourseTitle, 
    modules, addModule, addLesson, 
    activeLessonId, setActiveLesson, 
    updateLessonTitle, updateLessonContent 
  } = useCourseStore();

  // Find the currently active lesson based on the state
  const activeModule = modules.find(m => m.lessons.some(l => l.id === activeLessonId));
  const activeLesson = activeModule?.lessons.find(l => l.id === activeLessonId);

  return (
    <div className="flex h-screen bg-[#FFFDF8] text-[#1E293B] font-sans overflow-hidden selection:bg-[#FBBF24] selection:text-[#1E293B]">
      
      {/* Left Sidebar - Curriculum Builder */}
      <div className="w-80 bg-white border-r-4 border-[#1E293B] flex flex-col h-full shadow-[4px_0px_0px_#1E293B] z-10 relative">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b-2 border-[#1E293B]/10">
          <Link href="/dashboard" className="text-xs font-black text-slate-500 hover:text-[#14B8A6] mb-4 inline-block uppercase tracking-wider">
            ← Back to Dashboard
          </Link>
          <input 
            type="text" 
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="w-full text-xl font-black bg-transparent border-none outline-none focus:ring-2 focus:ring-[#14B8A6] rounded px-2 py-1 -ml-2"
            placeholder="Course Title"
          />
        </div>

        {/* Modules & Lessons List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {modules.map((module) => (
            <div key={module.id} className="space-y-2">
              <div className="flex items-center justify-between group">
                <h3 className="font-bold text-sm text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                  <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab" />
                  {module.title}
                </h3>
                <button 
                  onClick={() => addLesson(module.id)}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-[#1E293B] transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-1 pl-6 border-l-2 border-slate-100 ml-2">
                {module.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                      activeLessonId === lesson.id 
                        ? 'bg-[#1E293B] text-white shadow-[2px_2px_0px_#14B8A6]' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FileText size={14} className={activeLessonId === lesson.id ? 'text-[#14B8A6]' : 'text-slate-400'} />
                    <span className="truncate">{lesson.title || 'Untitled Lesson'}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button 
            onClick={addModule}
            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold text-sm hover:border-[#1E293B] hover:text-[#1E293B] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Module
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t-2 border-[#1E293B]/10">
           <button className="w-full flex items-center justify-center gap-2 bg-[#14B8A6] text-white font-black py-3 rounded-xl border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1E293B] transition-all">
             Publish Course
           </button>
        </div>
      </div>

      {/* Main Canvas - Notion Style Editor */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-[#FFFDF8]">
        
        {/* Top Navbar */}
        <div className="h-16 border-b-2 border-[#1E293B]/5 flex items-center justify-end px-8 sticky top-0 bg-[#FFFDF8]/90 backdrop-blur-sm z-10">
           <div className="flex items-center gap-4">
             <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Draft Saved</span>
             <button className="p-2 text-slate-400 hover:text-[#1E293B] transition-colors"><Settings size={20}/></button>
           </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 w-full max-w-3xl mx-auto px-8 py-16">
          {activeLesson ? (
            <div className="space-y-6">
              
              {/* Interactive Lesson Title */}
              <input 
                type="text"
                value={activeLesson.title}
                onChange={(e) => updateLessonTitle(activeLesson.id, e.target.value)}
                placeholder="Lesson Title"
                className="w-full text-5xl font-black text-[#1E293B] bg-transparent border-none outline-none placeholder:text-slate-300 leading-tight resize-none"
              />

              {/* Media Toolbar Placeholder */}
              <div className="flex items-center gap-2 py-4 border-b-2 border-slate-100 mb-8">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-[#1E293B] transition-colors">
                  <ImageIcon size={16} /> Add Cover
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-[#1E293B] transition-colors">
                  <Video size={16} /> Add Video
                </button>
              </div>

              {/* 
                NOTE: This textarea is a temporary placeholder. 
                In the next step, we will replace this specific block with the BlockNote / TipTap 
                rich text editor so tutors can highlight, bold, and format HTML visually. 
              */}
              <textarea 
                value={activeLesson.content}
                onChange={(e) => updateLessonContent(activeLesson.id, e.target.value)}
                placeholder="Start writing, or type '/' for commands..."
                className="w-full h-96 text-lg font-medium text-slate-600 bg-transparent border-none outline-none placeholder:text-slate-300 resize-none leading-relaxed"
              />

            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 font-bold">
              Select a lesson from the sidebar to start editing.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}