import React, { useState } from 'react';
import {
  UploadCloud,
  BookText,
  FileText,
  CheckCircle2,
  Trash2,
  Eye,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { storage } from '../../services/storageService';
import { MaterialType } from '../../types';

interface TeacherUploadMaterialsProps {
  onOpenPdf: (doc: any) => void;
}

export const TeacherUploadMaterials: React.FC<TeacherUploadMaterialsProps> = ({
  onOpenPdf,
}) => {
  const { subjects, labMaterials, teachers } = useAcademicData();
  const currentTeacher = teachers[0] || {
    id: 'teach-1',
    name: 'Dr. Priya Kumar',
  };

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [type, setType] = useState<MaterialType>('Lab Manual');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [experimentsCount, setExperimentsCount] = useState(12);
  const [fileName, setFileName] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === subjectId) || subjects[0];

    const generatedFileName =
      fileName || `${subj.code}_${type.replace(/\s+/g, '_')}_2026.pdf`;

    storage.addLabMaterial({
      title,
      subjectId: subj.id,
      subjectName: subj.name,
      type,
      uploadedBy: currentTeacher.name,
      fileName: generatedFileName,
      fileSize: '3.2 MB',
      description,
      experimentsCount: type === 'Lab Manual' ? Number(experimentsCount) : undefined,
    });

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setTitle('');
      setDescription('');
      setFileName('');
    }, 1500);
  };

  const handleDeleteMaterial = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}" from the institutional repository?`)) {
      storage.deleteLabMaterial(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Materials Repository
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish verified lab manuals, lecture notes, and syllabus guides for student access
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Upload Academic Material</h3>
          </div>

          {uploadSuccess ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">
                Resource Uploaded Successfully!
              </h4>
              <p className="text-xs text-slate-500">
                Available to students in the Lab Manuals portal immediately.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
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
                  Material Classification
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as MaterialType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="Lab Manual">Lab Manual</option>
                  <option value="Notes">Lecture Notes</option>
                  <option value="Study Material">Study Material</option>
                  <option value="Assignment PDF">Assignment PDF</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Data Structures Lab Manual"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {type === 'Lab Manual' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Number of Experiments
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={experimentsCount}
                    onChange={(e) => setExperimentsCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Curriculum Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize the covered units, experiment instructions, or references..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Document Filename
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS401_DS_Lab_Manual_Rev2.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                id="btn-submit-material"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Publish Material</span>
              </button>
            </form>
          )}
        </div>

        {/* Uploaded Materials Inventory */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Course Materials</h3>
              <p className="text-xs text-slate-500">
                Institutional documents live across all student dashboards
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
              {labMaterials.length} Documents
            </span>
          </div>

          <div className="space-y-3">
            {labMaterials.map((mat) => (
              <div
                key={mat.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold">
                      {mat.subjectName}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold">
                      {mat.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{mat.fileSize}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{mat.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{mat.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Uploaded by {mat.uploadedBy} on {new Date(mat.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <button
                    onClick={() =>
                      onOpenPdf({
                        title: mat.title,
                        fileName: mat.fileName,
                        subjectName: mat.subjectName,
                        type: mat.type,
                        uploadedBy: mat.uploadedBy,
                        fileSize: mat.fileSize,
                        description: mat.description,
                      })
                    }
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
