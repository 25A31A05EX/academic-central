import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  Award,
  X,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { storage } from '../../services/storageService';

export const TeacherAssessments: React.FC = () => {
  const { assessments, subjects, teachers } = useAcademicData();
  const currentTeacher = teachers[0] || {
    name: 'Dr. Priya Kumar',
  };

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM - 11:30 AM');
  const [venue, setVenue] = useState('Academic Hall 302');
  const [maxMarks, setMaxMarks] = useState(30);
  const [description, setDescription] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

    storage.addAssessment({
      title,
      subjectId: subj.id,
      subjectName: subj.name,
      date: date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      time,
      venue,
      maxMarks: Number(maxMarks) || 30,
      status: 'Upcoming',
      description,
      createdBy: currentTeacher.name,
    });

    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      setShowScheduleModal(false);
      setTitle('');
      setDate('');
      setDescription('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Examination & Assessment Scheduler
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate mid-term examination slots, class tests, and laboratory practical assessments
          </p>
        </div>

        <button
          id="btn-schedule-assessment"
          onClick={() => setShowScheduleModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Assessment</span>
        </button>
      </div>

      {/* Existing Assessments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessments.map((ass) => (
          <div
            key={ass.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100 font-mono">
                {ass.subjectName}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  ass.status === 'Upcoming'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {ass.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">{ass.title}</h3>
            <p className="text-xs text-slate-600 mt-2 line-clamp-2">{ass.description}</p>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold text-slate-800">
                  {new Date(ass.date).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Max: {ass.maxMarks} Marks</span>
              </div>

              {ass.venue && (
                <div className="flex items-center gap-1.5 col-span-2 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Venue: {ass.venue} &bull; Time: {ass.time}</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Scheduled by {ass.createdBy}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Assessment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Schedule Examination Assessment
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {publishSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Assessment Scheduled!</h4>
                <p className="text-xs text-slate-500">
                  Published to all student timetables and recorded in college audit trail.
                </p>
              </div>
            ) : (
              <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Subject
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assessment Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mid Examination 2 - Algorithms & Data Structures"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Exam Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Max Marks
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={100}
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Time Slot
                    </label>
                    <input
                      type="text"
                      placeholder="10:00 AM - 11:30 AM"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Seating Venue
                    </label>
                    <input
                      type="text"
                      placeholder="Hall 302, Academic Block"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Syllabus / Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Units 3 & 4: Trees, Graphs, Shortest Path algorithms..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                  >
                    Publish Assessment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
