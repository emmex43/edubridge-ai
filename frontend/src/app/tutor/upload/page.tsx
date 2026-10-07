'use client';

import { useState } from 'react';
import { Upload, BookOpen, FileText, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'tech', label: 'Tech & AI Skills', color: 'bg-emerald-500' },
  { id: 'science', label: 'Sciences & Earth', color: 'bg-sky-500' },
  { id: 'humanities', label: 'History & Society', color: 'bg-amber-400' },
];

export default function TutorUploadPage() {
  // --- Auth State ---
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passcode, setPasscode] = useState('');

  // --- Form State ---
  const [formData, setFormData] = useState({
    title: '', gradeLevel: 'grade_6_8', category: 'tech', summary: '', notes: '',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- Handle Admin Unlock ---
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, use an environment variable. For the pitch, this hardcoded check works perfectly.
    if (passcode === 'admin2026' || passcode === process.env.NEXT_PUBLIC_TUTOR_PIN) {
      setIsAuthorized(true);
    } else {
      alert('Unauthorized. Invalid tutor passcode.');
      setPasscode('');
    }
  };

  // --- Handle Module Upload ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('grade_level', formData.gradeLevel);
    payload.append('category', formData.category);
    payload.append('summary', formData.summary);
    payload.append('notes_markdown', formData.notes);
    if (coverImage) payload.append('cover_image', coverImage);
    if (pdfFile) payload.append('attachment_pdf', pdfFile);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/modules`, {
        method: 'POST',
        body: payload,
      });
      if (!res.ok) throw new Error('Upload failed');
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Error uploading module. Verify backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // VIEW: UNATHORIZED (LOCK SCREEN)
  // ==========================================
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-6 text-[#1E293B]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border-4 border-[#1E293B] shadow-[6px_6px_0px_#1E293B] text-center">
          <div className="w-20 h-20 bg-[#FB7185] rounded-full border-4 border-[#1E293B] flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_#1E293B]">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-[#1E293B] mb-2">Tutor Studio</h1>
          <p className="text-slate-500 font-medium mb-8">Restricted access. Please enter the master admin passcode to publish modules.</p>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              required
              placeholder="Enter Passcode..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border-2 border-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-center font-black tracking-widest"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#1E293B] text-white font-black text-lg hover:bg-slate-800 transition-colors"
            >
              Unlock Studio <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: AUTHORIZED (UPLOAD FORM)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#FFFDF8] py-12 px-4 sm:px-6 lg:px-8 text-[#1E293B]">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border-4 border-[#1E293B] shadow-[6px_6px_0px_#1E293B]">
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-[#1E293B]/10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#14B8A6] rounded-2xl border-2 border-[#1E293B] text-white shadow-[2px_2px_0px_#1E293B]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1E293B]">Tutor Studio</h1>
              <p className="text-sm font-bold text-slate-500">Publish modules for Grades 6–12</p>
            </div>
          </div>
          <button onClick={() => setIsAuthorized(false)} className="text-sm font-bold text-slate-400 hover:text-[#FB7185]">
            Lock & Exit
          </button>
        </div>

        {success ? (
          <div className="p-8 bg-[#34D399]/20 border-4 border-[#34D399] rounded-3xl text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-[#059669] mx-auto" />
            <h2 className="text-2xl font-black text-[#1E293B]">Module Published!</h2>
            <p className="text-slate-600 font-medium">The lesson and vector embeddings are now live for students.</p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-6 px-8 py-3 rounded-full bg-[#1E293B] text-white font-black text-sm hover:bg-slate-800"
            >
              Upload Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-[#1E293B] mb-2 uppercase tracking-wider">Module Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Plate Tectonics Basics"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-[#1E293B] mb-2 uppercase tracking-wider">Target Grade</label>
                <select
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#1E293B] bg-white font-medium"
                >
                  <option value="grade_6_8">Grades 6–8 (JSS 1–3)</option>
                  <option value="grade_9_12">Grades 9–12 (SSS 1–3)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-[#1E293B] mb-2 uppercase tracking-wider">Track</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#1E293B] bg-white font-medium"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-[#1E293B] mb-2 uppercase tracking-wider">Short Summary</label>
              <textarea
                rows={2}
                required
                placeholder="Brief 1-2 sentence overview..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-[#1E293B] mb-2 uppercase tracking-wider">Lesson Notes (Markdown)</label>
              <textarea
                rows={6}
                placeholder="Write or paste your short lecture notes here..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 font-mono text-sm rounded-xl border-2 border-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-[#1E293B] p-6 rounded-2xl text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer relative">
                <Upload className="w-8 h-8 mx-auto text-[#14B8A6] mb-3" />
                <span className="block text-sm font-black text-[#1E293B]">Cover Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {coverImage && <span className="block mt-2 text-xs text-[#14B8A6] font-bold">{coverImage.name}</span>}
              </div>

              <div className="border-2 border-dashed border-[#1E293B] p-6 rounded-2xl text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer relative">
                <FileText className="w-8 h-8 mx-auto text-[#FBBF24] mb-3" />
                <span className="block text-sm font-black text-[#1E293B]">PDF Attachment</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {pdfFile && <span className="block mt-2 text-xs text-[#FBBF24] font-bold">{pdfFile.name}</span>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-4 rounded-full bg-[#14B8A6] hover:bg-[#0D9488] text-white font-black text-lg border-2 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Module to Students'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}