import React, { useState } from 'react';
import {
  BookText,
  Download,
  Eye,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { useAcademicData } from '../../hooks/useAcademicData';
import { LabMaterial } from '../../types';

interface StudentLabManualsProps {
  onOpenPdf: (doc: any) => void;
}

export const StudentLabManuals: React.FC<StudentLabManualsProps> = ({ onOpenPdf }) => {
  const { labMaterials } = useAcademicData();
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // Filter lab manuals and materials
  const manuals = labMaterials.filter((m) => m.type === 'Lab Manual' || m.type === 'Notes');

  const filtered = manuals.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (manual: LabMaterial) => {
    setDownloadSuccessId(manual.id);
    const element = document.createElement('a');
    const file = new Blob(
      [
        `ACADEMIC CENTRAL COLLEGE OF ENGINEERING\nDEPARTMENT OF COMPUTER SCIENCE\n\n${manual.title}\nSubject: ${manual.subjectName}\nExperiments: ${manual.experimentsCount || 'Multiple'}\nInstructor: ${manual.uploadedBy}\n\nDescription:\n${manual.description}\n\n--- Verified Academic Laboratory Manual ---`,
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = manual.fileName.endsWith('.pdf')
      ? manual.fileName.replace('.pdf', '.txt')
      : `${manual.fileName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => {
      setDownloadSuccessId(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Laboratory Manuals & Practicals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified step-by-step practical guides, algorithms, and experiment templates
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search lab manuals by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Lab Manuals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((manual) => {
          const isDownloaded = downloadSuccessId === manual.id;

          return (
            <div
              key={manual.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs border border-purple-100 flex items-center gap-1.5">
                    <BookText className="w-3.5 h-3.5" />
                    {manual.subjectName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {manual.fileSize}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{manual.title}</h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {manual.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  {manual.experimentsCount ? (
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        Practical Content:{' '}
                        <strong className="text-slate-800 font-bold">
                          {manual.experimentsCount} Experiments
                        </strong>
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Updated:{' '}
                      <span className="text-slate-700">
                        {new Date(manual.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Instructor:</span>
                    <span className="text-slate-700 font-medium text-[11px]">
                      {manual.uploadedBy}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  id={`open-manual-${manual.id}`}
                  onClick={() =>
                    onOpenPdf({
                      title: manual.title,
                      fileName: manual.fileName,
                      subjectName: manual.subjectName,
                      type: manual.type,
                      uploadedBy: manual.uploadedBy,
                      fileSize: manual.fileSize,
                      description: manual.description,
                    })
                  }
                  className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Manual</span>
                </button>

                <button
                  id={`download-manual-${manual.id}`}
                  onClick={() => handleDownload(manual)}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {isDownloaded ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
