import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Printer,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export interface PreviewDocument {
  title: string;
  fileName?: string;
  subjectName?: string;
  type?: string;
  uploadedBy?: string;
  fileSize?: string;
  description?: string;
  fileUrl?: string;
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
  fileUrl?: string;
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
  fileUrl: propFileUrl,
  doc,
}) => {
  const title = doc?.title || propTitle || 'Assignment Document';
  const fileName = doc?.fileName || propFileName || 'Assignment.pdf';
  const subjectName = doc?.subjectName || propSubjectName || 'Coursework';
  const type = doc?.type || propType || 'Assignment PDF';
  const uploadedBy = doc?.uploadedBy || propUploadedBy || 'Course Instructor';
  const fileSize = doc?.fileSize || propFileSize || 'PDF Document';
  const fileUrl = doc?.fileUrl || propFileUrl;
  const description = doc?.description || propDescription || '';

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  if (!isOpen) return null;

  // Resolve authentic server-side PDF storage URL
  let effectiveFileUrl = fileUrl;
  if (!effectiveFileUrl || effectiveFileUrl.startsWith('#')) {
    const category = type?.toLowerCase().includes('submission') ? 'submissions' : 'assignments';
    effectiveFileUrl = `/api/files/${category}/${fileName}`;
  }

  const downloadUrl = `${effectiveFileUrl}${effectiveFileUrl.includes('?') ? '&' : '?'}download=1`;

  const handleDownload = () => {
    setDownloadSuccess(true);
    const element = document.createElement('a');
    element.href = downloadUrl;
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  const handleOpenExternal = () => {
    window.open(effectiveFileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="doc-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        id="doc-preview-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-white truncate leading-tight">{title}</h3>
              <p className="text-xs text-slate-300 truncate">
                {subjectName} &bull; <span className="font-mono text-indigo-200">{fileName}</span> &bull; {fileSize}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="doc-preview-open-tab-btn"
              onClick={handleOpenExternal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              title="Open PDF in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </button>

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
                  <span className="hidden sm:inline">Download PDF</span>
                </>
              )}
            </button>

            <button
              id="doc-preview-close-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
              aria-label="Close document"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata sub-strip */}
        <div className="bg-slate-100 px-5 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {type}
            </span>
            <span>Uploaded By: <strong className="text-slate-800">{uploadedBy}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenExternal}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <span className="text-slate-300">|</span>
            <a
              href={downloadUrl}
              download={fileName}
              className="text-xs text-slate-600 hover:text-slate-800 font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Direct Link</span>
            </a>
          </div>
        </div>

        {description && (
          <div className="bg-indigo-50/70 border-b border-indigo-100 px-5 py-2 text-xs text-indigo-950 shrink-0 flex items-start gap-2">
            <span className="font-bold shrink-0 text-indigo-800">Objectives:</span>
            <p className="line-clamp-2 text-indigo-900">{description}</p>
          </div>
        )}

        {/* Actual PDF Viewer Viewport */}
        <div className="flex-1 bg-slate-200 relative overflow-hidden flex flex-col">
          {!iframeError ? (
            <iframe
              id="pdf-document-viewer-frame"
              src={`${effectiveFileUrl}#toolbar=1&navpanes=0`}
              title={title}
              onError={() => setIframeError(true)}
              className="w-full h-full flex-1 border-0 bg-white"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">{fileName}</h4>
              <p className="text-xs text-slate-500 max-w-md mb-4">
                This document is ready to view. If your browser restricts embedded PDF rendering,
                you can open the PDF directly or download it to your device.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenExternal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open PDF in New Window</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Serving authentic repository file: <code className="text-slate-700 font-mono">{fileName}</code>
          </span>
          <span className="hidden sm:inline">
            Academic Central Document Viewer &bull; Verified Repository
          </span>
        </div>
      </div>
    </div>
  );
};
