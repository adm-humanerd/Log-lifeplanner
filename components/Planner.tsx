import React, { useState, useEffect, useMemo } from 'react';
import {
  format, addDays, subDays, isSameDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday,
  addMonths, subMonths, getMonth, getYear, isSameMonth
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon,
  Settings as SettingsIcon, Menu, AlignJustify, Grid, Columns
} from 'lucide-react';
import { UserProfile, Task, DayAnalysis, ViewMode, Season } from '../types';
import { analyzeDay, getNudgeForTask } from '../services/energyEngine';

interface PlannerProps {
  user: UserProfile;
  openSettings: () => void;
}

export const Planner: React.FC<PlannerProps> = ({ user, openSettings }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonthCursor, setCurrentMonthCursor] = useState<Date>(new Date()); // For Mini Cal navigation
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [dayAnalysis, setDayAnalysis] = useState<DayAnalysis | null>(null);

  // Sync current month cursor with selected date when selected date changes significantly (optional, but good UX)
  useEffect(() => {
    setCurrentMonthCursor(selectedDate);
  }, [selectedDate]);

  // Analysis for the specific selected day
  useEffect(() => {
    const analysis = analyzeDay(selectedDate, user);
    setDayAnalysis(analysis);
  }, [selectedDate, user]);

  // Task Handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    const nudge = getNudgeForTask(newTaskInput, selectedDate);
    const newTask: Task = {
      id: Date.now().toString(),
      content: newTaskInput,
      date: format(selectedDate, 'yyyy-MM-dd'),
      completed: false,
      nudge,
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskInput('');
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Filter tasks for the visible range (Day view only needs selected day, others might need dots)
  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(t => t.date === dateStr);
  };

  // --- Components for Views ---

  // 1. Sidebar Mini Calendar
  const MiniCalendar = () => {
    const start = startOfWeek(startOfMonth(currentMonthCursor));
    const end = endOfWeek(endOfMonth(currentMonthCursor));
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <span className="font-serif font-bold text-ink ml-1">
            {format(currentMonthCursor, 'MMMM yyyy')}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentMonthCursor(subMonths(currentMonthCursor, 1))} className="p-1 hover:bg-stone-100 rounded">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setCurrentMonthCursor(addMonths(currentMonthCursor, 1))} className="p-1 hover:bg-stone-100 rounded">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-[10px] text-subtle mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {days.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = getMonth(day) === getMonth(currentMonthCursor);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`
                  w-6 h-6 mx-auto flex items-center justify-center rounded-full text-xs transition-colors
                  ${isSelected ? 'bg-ink text-paper' : ''}
                  ${!isSelected && isToday(day) ? 'bg-stone-200 text-ink' : ''}
                  ${!isSelected && !isToday(day) && 'hover:bg-stone-100'}
                  ${!isCurrentMonth ? 'text-stone-300' : 'text-ink'}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 2. Main Content Views
  const DayView = () => {
    const dayTasks = getTasksForDate(selectedDate);

    // DayView specific state
    const [reflection, setReflection] = useState('');
    const [energyLevel, setEnergyLevel] = useState<number | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Dynamic Prompt Logic
    const dailyPrompt = useMemo(() => {
      // Mockup: In reality, this could come from energyEngine
      const prompts = {
        'Spring': "What sparked a new beginning for you today?",
        'Summer': "Where did your passion flow most freely?",
        'Autumn': "What meaningful harvest did you gather?",
        'Winter': "What does your inner voice whisper?"
      };
      // Fallback or use season from dayAnalysis
      return dayAnalysis && dayAnalysis.energy && prompts[dayAnalysis.energy.season as keyof typeof prompts]
        ? prompts[dayAnalysis.energy.season as keyof typeof prompts]
        : "Record your daily journey.";
    }, [dayAnalysis]);

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Whisper Banner */}
        <div className="flex-shrink-0 mb-6 bg-highlight/30 border-l-4 border-stone-300 p-4 rounded-r-lg mx-6 mt-6">
          <p className="font-serif text-lg text-ink italic">"{dayAnalysis?.whisper}"</p>
          <div className="mt-2 flex gap-2">
            <span className="text-[10px] uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded text-subtle border border-stone-100">
              {dayAnalysis?.energy.keyword}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-subtle opacity-70 flex items-center">
              {dayAnalysis?.energy.season}
            </span>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-8">
          {/* Tasks Column */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="font-serif text-xl text-ink">Agenda</h3>
              <span className="text-xs text-subtle">{dayTasks.filter(t => t.completed).length}/{dayTasks.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2">
              {dayTasks.length === 0 && (
                <div className="h-20 flex items-center justify-center text-stone-300 italic font-serif text-sm">
                  No tasks logged for today.
                </div>
              )}
              {dayTasks.map(task => (
                <div key={task.id} className="group flex items-start gap-3 p-3 rounded bg-white border border-stone-100 hover:border-stone-300 transition-colors">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${task.completed ? 'bg-ink border-ink' : 'border-stone-300 hover:border-ink'
                      }`}
                  >
                    {task.completed && <Plus size={10} className="text-white rotate-45" />}
                  </button>
                  <div className="flex-grow min-w-0">
                    <p className={`text-sm font-serif truncate ${task.completed ? 'line-through text-subtle' : 'text-ink'}`}>
                      {task.content}
                    </p>
                    {!task.completed && task.nudge && (
                      <p className="mt-1 text-[10px] text-stone-500 bg-stone-50 inline-block px-1.5 py-0.5 rounded">
                        {task.nudge}
                      </p>
                    )}
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddTask} className="mt-4 relative flex-shrink-0">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Log task..."
                className="w-full bg-transparent border-b border-stone-300 py-2 pr-8 text-ink focus:outline-none focus:border-ink font-serif"
              />
              <button type="submit" disabled={!newTaskInput.trim()} className="absolute right-0 top-2 text-stone-400 hover:text-ink">
                <Plus size={20} />
              </button>
            </form>
          </div>

          {/* Notes Column (New Reflection UI) */}
          <div className="w-[40%] flex flex-col border-l border-stone-200 pl-8 hidden md:flex h-full">

            {/* Header */}
            <div className="flex items-baseline justify-between mb-6 flex-shrink-0">
              <h3 className="font-serif text-xl text-ink">Field Notes</h3>
              <span className="text-[10px] uppercase tracking-widest text-subtle">
                Daily Reflection
              </span>
            </div>

            {/* Dynamic Prompt */}
            <div className="mb-4 relative group">
              <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-stone-300 rounded opacity-50"></div>
              <p className="font-serif text-stone-500 italic text-sm leading-relaxed pl-2">
                Q. {dailyPrompt}
              </p>
            </div>

            {/* Main Editor */}
            <textarea
              className="w-full flex-1 bg-transparent resize-none focus:outline-none text-ink text-sm leading-7 font-serif placeholder:text-stone-200/50 scrollbar-hide"
              placeholder="Let your thoughts flow freely..."
              spellCheck={false}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            ></textarea>

            {/* Footer Tools */}
            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between flex-shrink-0">
              {/* Energy Tracker */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-widest text-stone-400">Energy</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setEnergyLevel(level)}
                      className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition-all border
                          ${energyLevel === level
                          ? 'bg-ink text-paper border-ink'
                          : 'bg-transparent text-stone-400 border-stone-200 hover:border-stone-400'
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2">
                {tags.map(tag => (
                  <span key={tag} className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="#Tag"
                  className="w-16 bg-transparent text-[10px] text-ink focus:w-24 transition-all focus:outline-none placeholder:text-stone-300 text-right"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        setTags([...tags, val]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MonthView = () => {
    const start = startOfWeek(startOfMonth(selectedDate));
    const end = endOfWeek(endOfMonth(selectedDate));
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="flex flex-col h-full bg-white">
        <div className="grid grid-cols-7 border-b border-stone-200">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-subtle tracking-widest">{d}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
          {days.map(day => {
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const isSelected = isSameDay(day, selectedDate);
            const dayTasks = getTasksForDate(day);
            const analysis = analyzeDay(day, user); // Get efficient analysis for color coding

            return (
              <div
                key={day.toISOString()}
                onClick={() => { setSelectedDate(day); setViewMode('day'); }}
                className={`
                  border-b border-r border-stone-100 p-2 relative cursor-pointer hover:bg-stone-50 transition-colors
                  ${!isCurrentMonth ? 'bg-stone-50/50' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`
                    text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday(day) ? 'bg-ink text-paper' : isCurrentMonth ? 'text-ink' : 'text-stone-300'}
                  `}>
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  {dayTasks.slice(0, 3).map(t => (
                    <div key={t.id} className="text-[9px] truncate text-stone-600 bg-stone-100/50 px-1 rounded-sm">
                      {t.content}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[8px] text-stone-400 pl-1">+{dayTasks.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const WeekView = () => {
    const start = startOfWeek(selectedDate);
    const end = endOfWeek(selectedDate);
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="grid grid-cols-7 border-b border-stone-200 flex-shrink-0">
          {days.map(day => (
            <div key={day.toISOString()} className={`py-3 text-center border-r border-stone-100 ${isToday(day) ? 'bg-stone-50' : ''}`}>
              <div className="text-xs text-subtle uppercase tracking-widest mb-1">{format(day, 'EEE')}</div>
              <div className={`text-xl font-serif ${isToday(day) ? 'text-ink font-bold' : 'text-stone-600'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 overflow-y-auto no-scrollbar">
          {days.map(day => {
            const dayTasks = getTasksForDate(day);
            return (
              <div
                key={day.toISOString()}
                onClick={() => { setSelectedDate(day); setViewMode('day'); }}
                className="border-r border-stone-100 min-h-[300px] p-2 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <div className="space-y-2 mt-2">
                  {dayTasks.map(t => (
                    <div key={t.id} className={`text-xs p-2 border rounded ${t.completed ? 'bg-stone-50 text-stone-400 line-through border-transparent' : 'bg-white border-stone-200 text-ink shadow-sm'}`}>
                      {t.content}
                    </div>
                  ))}
                  <div className="opacity-0 hover:opacity-100 text-center py-2 text-stone-300">
                    <Plus size={16} className="mx-auto" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="flex h-screen w-full bg-paper overflow-hidden text-ink">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-stone-200 bg-[#FDFCF8] hidden md:flex flex-col p-6 flex-shrink-0">
        <div className="mb-8 flex items-center gap-2">
          {/* Logo */}
          <span className="font-serif font-bold text-3xl tracking-tighter">Log.</span>
        </div>

        {/* Create Button (Generic) */}
        <button
          onClick={() => { setSelectedDate(new Date()); setViewMode('day'); }}
          className="mb-8 flex items-center gap-3 bg-white border border-stone-200 shadow-sm rounded-full px-4 py-3 hover:shadow-md transition-shadow"
        >
          <Plus className="text-red-500" />
          <span className="font-medium text-sm text-stone-600">Create Log</span>
        </button>

        {/* Mini Calendar */}
        <div className="mb-8">
          <MiniCalendar />
        </div>

        {/* Current Energy Status Widget */}
        <div className="mt-auto bg-stone-50 p-4 rounded-lg border border-stone-100">
          <h4 className="text-[10px] uppercase tracking-widest text-subtle mb-2">Current Rhythm</h4>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-serif text-ink">{dayAnalysis?.energy.season}</span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            {dayAnalysis?.energy.description}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-stone-200 flex items-center justify-between px-6 bg-paper flex-shrink-0">
          <div className="flex items-center gap-6">
            <button className="md:hidden text-ink">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1.5 border border-stone-200 rounded text-sm font-medium hover:bg-stone-50 text-stone-600"
              >
                Today
              </button>
              <div className="flex items-center gap-1 text-subtle">
                <button onClick={() => setSelectedDate(viewMode === 'month' ? subMonths(selectedDate, 1) : subDays(selectedDate, 1))} className="p-1 hover:bg-stone-100 rounded-full"><ChevronLeft size={18} /></button>
                <button onClick={() => setSelectedDate(viewMode === 'month' ? addMonths(selectedDate, 1) : addDays(selectedDate, 1))} className="p-1 hover:bg-stone-100 rounded-full"><ChevronRight size={18} /></button>
              </div>
              <h2 className="text-xl font-serif text-ink min-w-[140px]">
                {format(selectedDate, viewMode === 'month' ? 'MMMM yyyy' : 'MMMM yyyy')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex bg-stone-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('day')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'day' ? 'bg-white shadow-sm text-ink' : 'text-stone-400 hover:text-stone-600'}`}
                title="Day View"
              >
                <AlignJustify size={16} />
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-ink' : 'text-stone-400 hover:text-stone-600'}`}
                title="Week View"
              >
                <Columns size={16} />
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-ink' : 'text-stone-400 hover:text-stone-600'}`}
                title="Month View"
              >
                <Grid size={16} />
              </button>
            </div>

            <div className="h-6 w-px bg-stone-200 mx-2"></div>

            <button
              onClick={openSettings}
              className="p-2 hover:bg-stone-100 rounded-full text-subtle transition-colors"
            >
              <SettingsIcon size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center text-xs font-medium">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Calendar Grid Area */}
        <div className="flex-1 overflow-hidden relative">
          {viewMode === 'day' && <DayView />}
          {viewMode === 'week' && <WeekView />}
          {viewMode === 'month' && <MonthView />}
        </div>
      </main>
    </div>
  );
};