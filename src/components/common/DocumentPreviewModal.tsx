import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Printer,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export interface PreviewDocument {
  title: string;
  fileName?: string;
  subjectName?: string;
  type?: string;
  uploadedBy?: string;
  fileSize?: string;
  description?: string;
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  fileName?: string;
  subjectName?: string;
  type?: string;
  uploadedBy?: string;
  fileSize?: string;
  description?: string;
  doc?: PreviewDocument | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title: propTitle,
  fileName: propFileName,
  subjectName: propSubjectName,
  type: propType,
  uploadedBy: propUploadedBy,
  fileSize: propFileSize,
  description: propDescription,
  doc,
}) => {
  const title = doc?.title || propTitle || 'Document Preview';
  const fileName = doc?.fileName || propFileName || 'Document_Preview.pdf';
  const subjectName = doc?.subjectName || propSubjectName || 'Academic Course';
  const type = doc?.type || propType || 'Academic Material';
  const uploadedBy = doc?.uploadedBy || propUploadedBy || 'Department Faculty';
  const fileSize = doc?.fileSize || propFileSize || '2.4 MB';
  const description =
    doc?.description ||
    propDescription ||
    'Official verified academic material issued by the college department for current academic year coursework.';
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const totalPages = 4;

  const handleDownload = () => {
    setDownloadSuccess(true);
    // Create a mock download trigger
    const element = document.createElement('a');
    const file = new Blob(
      [
        `ACADEMIC CENTRAL - OFFICIAL COLLEGE DOCUMENT\n\nTitle: ${title}\nSubject: ${subjectName}\nType: ${type}\nFaculty: ${uploadedBy}\nSize: ${fileSize}\n\nSummary:\n${description}\n\n---\nVerified College Project Resource`,
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = fileName.endsWith('.pdf') ? fileName.replace('.pdf', '.txt') : `${fileName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  return (
    <div
      id="doc-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        id="doc-preview-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-white truncate leading-tight">{title}</h3>
              <p className="text-xs text-slate-300 truncate">
                {subjectName} &bull; {fileName} &bull; {fileSize}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="doc-preview-download-btn"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </>
              )}
            </button>

            <button
              id="doc-preview-close-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close document"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(75, z - 15))}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-mono">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 15))}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1" />
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Body Viewport */}
        <div className="flex-1 bg-slate-200/80 overflow-y-auto p-4 sm:p-8 flex justify-center">
          <div
            className="bg-white shadow-lg border border-slate-300 rounded-sm p-8 sm:p-12 w-full max-w-2xl min-h-[680px] text-slate-800 transition-transform origin-top"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {/* College Document Letterhead */}
            <div className="border-b-2 border-indigo-900 pb-4 mb-6 flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-indigo-700 font-bold">
                  Department of Computer Science & Engineering
                </p>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  ACADEMIC CENTRAL COLLEGE OF ENGINEERING
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Affiliated to State Technological University &bull; Approved by AICTE
                </p>
              </div>
              <div className="w-12 h-12 rounded-full border border-indigo-200 bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-700 font-black text-sm">
                AC
              </div>
            </div>

            {/* Document Meta Table */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 mb-6 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 font-medium">Subject:</span>{' '}
                <span className="font-semibold text-slate-900">{subjectName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Doc Type:</span>{' '}
                <span className="font-semibold text-slate-900">{type}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Instructor:</span>{' '}
                <span className="font-semibold text-slate-900">{uploadedBy}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Semester:</span>{' '}
                <span className="font-semibold text-slate-900">Semester IV (2026)</span>
              </div>
            </div>

            {/* Dynamic Page Content */}
            {currentPage === 1 && (
              <div className="space-y-4 text-xs leading-relaxed">
                <h2 className="text-base font-bold text-indigo-950 border-b border-slate-200 pb-1.5 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  {title}
                </h2>
                <p className="text-slate-700">{description}</p>

                <div className="mt-4">
                  <h3 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wider text-slate-500">
                    Course Outcomes & Guidelines
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Understand problem specifications and identify edge cases.</li>
                    <li>Follow standard naming conventions, code indentation, and modular logic.</li>
                    <li>Document time and space complexities (Big-O analysis) for each solution.</li>
                    <li>Verify test executions with border constraints before submission.</li>
                  </ul>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
                  <strong>Submission Policy:</strong> Please ensure submissions are submitted on or
                  before the posted deadline. Late submissions are subject to a 10% penalty per day.
                </div>
              </div>
            )}

            {currentPage === 2 && (
              <div className="space-y-4 text-xs leading-relaxed">
                <h2 className="text-base font-bold text-indigo-950 border-b border-slate-200 pb-1.5">
                  Section II: Problem Specifications & Execution
                </h2>
                <div className="space-y-3">
                  <div className="p-3 border border-slate-200 rounded-md">
                    <p className="font-bold text-slate-900 mb-1">Part A: Core Implementation</p>
                    <p className="text-slate-600 text-[11px]">
                      Design and develop the specified data structure or algorithm using robust error
                      handling for overflow and underflow scenarios.
                    </p>
                    <pre className="mt-2 bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[10px] overflow-x-auto">
{`// Sample Signature for Experiment
template <typename T>
class AcademicNode {
    T data;
    AcademicNode* next;
    AcademicNode(T val) : data(val), next(nullptr) {}
};`}
                    </pre>
                  </div>

                  <div className="p-3 border border-slate-200 rounded-md">
                    <p className="font-bold text-slate-900 mb-1">Part B: Test Cases & Validation</p>
                    <p className="text-slate-600 text-[11px]">
                      Include unit tests verifying empty list initialization, single element handling,
                      and reverse operations with zero memory leaks.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 3 && (
              <div className="space-y-4 text-xs leading-relaxed">
                <h2 className="text-base font-bold text-indigo-950 border-b border-slate-200 pb-1.5">
                  Section III: Laboratory Experiments Schedule
                </h2>
                <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="p-2 border border-slate-200">Exp #</th>
                      <th className="p-2 border border-slate-200">Experiment Topic</th>
                      <th className="p-2 border border-slate-200">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-200 font-mono">01</td>
                      <td className="p-2 border border-slate-200">Singly & Doubly Linked List Operations</td>
                      <td className="p-2 border border-slate-200 font-semibold">10</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200 font-mono">02</td>
                      <td className="p-2 border border-slate-200">Stack Evaluation & Infix to Postfix Conversion</td>
                      <td className="p-2 border border-slate-200 font-semibold">10</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200 font-mono">03</td>
                      <td className="p-2 border border-slate-200">Binary Search Tree Traversals & Depth Analysis</td>
                      <td className="p-2 border border-slate-200 font-semibold">10</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200 font-mono">04</td>
                      <td className="p-2 border border-slate-200">Graph BFS & DFS with Adjacency Lists</td>
                      <td className="p-2 border border-slate-200 font-semibold">10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {currentPage === 4 && (
              <div className="space-y-4 text-xs leading-relaxed">
                <h2 className="text-base font-bold text-indigo-950 border-b border-slate-200 pb-1.5">
                  Section IV: Faculty Sign-Off & Verification
                </h2>
                <p className="text-slate-600">
                  This academic material is approved for instruction during the academic term. Students
                  must retain their submitted lab records and verified assignment sheets for the final
                  end-semester practical and viva examinations.
                </p>

                <div className="pt-16 flex justify-between items-end">
                  <div className="text-center">
                    <div className="h-0.5 w-32 bg-slate-400 mb-1 mx-auto" />
                    <p className="font-semibold text-slate-800">{uploadedBy}</p>
                    <p className="text-[10px] text-slate-500">Course Coordinator</p>
                  </div>
                  <div className="text-center">
                    <div className="h-0.5 w-32 bg-slate-400 mb-1 mx-auto" />
                    <p className="font-semibold text-slate-800">Dr. K. Venkatesh</p>
                    <p className="text-[10px] text-slate-500">Head of Department / Dean</p>
                  </div>
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="mt-12 pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
              <span>Academic Central Portal &bull; Generated Document</span>
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
