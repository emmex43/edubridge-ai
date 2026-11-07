import { create } from 'zustand';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseState {
  courseTitle: string;
  modules: Module[];
  activeLessonId: string | null;
  setCourseTitle: (title: string) => void;
  addModule: () => void;
  addLesson: (moduleId: string) => void;
  setActiveLesson: (lessonId: string) => void;
  updateLessonTitle: (lessonId: string, title: string) => void;
  updateLessonContent: (lessonId: string, content: string) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  courseTitle: 'Untitled Course',
  activeLessonId: 'lesson-1',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1: Introduction',
      lessons: [{ id: 'lesson-1', title: 'Welcome to the Course', content: '' }],
    },
  ],
  
  setCourseTitle: (title) => set({ courseTitle: title }),
  
  addModule: () => set((state) => ({
    modules: [
      ...state.modules,
      {
        id: `module-${Date.now()}`,
        title: `Module ${state.modules.length + 1}: New Module`,
        lessons: [],
      }
    ]
  })),

  addLesson: (moduleId) => set((state) => ({
    modules: state.modules.map((mod) => {
      if (mod.id === moduleId) {
        const newLesson = { id: `lesson-${Date.now()}`, title: 'Untitled Lesson', content: '' };
        return { ...mod, lessons: [...mod.lessons, newLesson] };
      }
      return mod;
    })
  })),

  setActiveLesson: (lessonId) => set({ activeLessonId: lessonId }),

  updateLessonTitle: (lessonId, title) => set((state) => ({
    modules: state.modules.map(mod => ({
      ...mod,
      lessons: mod.lessons.map(lesson => 
        lesson.id === lessonId ? { ...lesson, title } : lesson
      )
    }))
  })),

  updateLessonContent: (lessonId, content) => set((state) => ({
    modules: state.modules.map(mod => ({
      ...mod,
      lessons: mod.lessons.map(lesson => 
        lesson.id === lessonId ? { ...lesson, content } : lesson
      )
    }))
  })),
}));