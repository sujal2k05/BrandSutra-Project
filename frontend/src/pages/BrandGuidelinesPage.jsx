import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Plus, 
  FileUp, 
  CheckCircle2, 
  Eye, 
  Sparkles, 
  AlertCircle,
  FileCode,
  FileCheck2,
  Loader2
} from 'lucide-react';
import { brandDnaService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';

const BrandGuidelinesPage = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const orgId = user?.organizationId || 1;
  const isAdmin = user?.role === 'ADMIN';

  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuideline, setSelectedGuideline] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddTextModalOpen, setIsAddTextModalOpen] = useState(false);
  const [isUploadPdfModalOpen, setIsUploadPdfModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Add text form
  const [textForm, setTextForm] = useState({
    title: '',
    contentText: '',
    version: 'v1.0'
  });

  // Upload PDF form
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    fetchGuidelines();
  }, [orgId]);

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const res = await brandDnaService.getGuidelines(orgId);
      setGuidelines(res.data || []);
    } catch (err) {
      console.error(err);
      toastError('Failed to load brand guidelines.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTextGuideline = async (e) => {
    e.preventDefault();
    try {
      const res = await brandDnaService.addGuideline(orgId, textForm);
      setGuidelines([res.data, ...guidelines]);
      setIsAddTextModalOpen(false);
      setTextForm({ title: '', contentText: '', version: 'v1.0' });
      success('Guideline document added successfully!');
    } catch (err) {
      console.error(err);
      toastError('Failed to add guideline.');
    }
  };

  const handleUploadPdf = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      toastError("Please select a PDF file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('file', pdfFile);
    if (pdfTitle) formData.append('title', pdfTitle);

    try {
      setUploading(true);
      const res = await brandDnaService.uploadPdfGuideline(orgId, formData);
      setGuidelines([res.data, ...guidelines]);
      setIsUploadPdfModalOpen(false);
      setPdfTitle('');
      setPdfFile(null);
      success('PDF guideline uploaded and parsed with PyMuPDF successfully!');
    } catch (err) {
      console.error(err);
      toastError('Failed to extract PDF text.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-9 h-9 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Retrieving guideline documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Document Ingestion</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Brand Guidelines Intelligence</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authoritative brand guideline manuals and policy PDFs indexed for AI semantic verification.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddTextModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Text Policy</span>
            </button>
            <button
              onClick={() => setIsUploadPdfModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <FileUp className="w-4 h-4" />
              <span>Upload PDF Guideline</span>
            </button>
          </div>
        )}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guidelines.length > 0 ? (
          guidelines.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    {doc.fileType?.includes('pdf') ? <FileCode className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Approved Evidence
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1">{doc.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  {doc.originalFilename || 'Manual Policy'} • {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : 'Text format'}
                </p>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono line-clamp-4 leading-relaxed mb-4">
                  {doc.contentText}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Version: {doc.version || 'v1.0'}</span>
                <button
                  onClick={() => {
                    setSelectedGuideline(doc);
                    setIsViewModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full Text</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No brand guidelines uploaded yet. Upload a PDF or add text policy instructions to enhance AI verification.
          </div>
        )}
      </div>

      {/* MODAL: VIEW GUIDELINE DETAILS */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        title={selectedGuideline?.title || 'Brand Guideline Content'}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span><strong>File:</strong> {selectedGuideline?.originalFilename || 'Direct Text Input'}</span>
            <span><strong>Version:</strong> {selectedGuideline?.version || 'v1.0'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active Authoritative Guideline</span>
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Extracted Policy Text (PyMuPDF Clean Representation)
            </label>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap selection:bg-indigo-500 border border-slate-800">
              {selectedGuideline?.contentText}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: ADD TEXT GUIDELINE */}
      <Modal isOpen={isAddTextModalOpen} onClose={() => setIsAddTextModalOpen(false)} title="Add Text Brand Guideline">
        <form onSubmit={handleAddTextGuideline} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Document Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Social Media Warranty Disclaimers 2026"
              value={textForm.title}
              onChange={(e) => setTextForm({ ...textForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Version Tag</label>
            <input
              type="text"
              placeholder="v1.0"
              value={textForm.version}
              onChange={(e) => setTextForm({ ...textForm, version: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Guideline Text & Policy Rules</label>
            <textarea
              rows={6}
              required
              placeholder="Write or paste official brand guidelines here..."
              value={textForm.contentText}
              onChange={(e) => setTextForm({ ...textForm, contentText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddTextModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
            >
              Save Guideline
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: UPLOAD PDF GUIDELINE */}
      <Modal isOpen={isUploadPdfModalOpen} onClose={() => setIsUploadPdfModalOpen(false)} title="Upload PDF Brand Guideline">
        <form onSubmit={handleUploadPdf} className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>PyMuPDF Extraction Engine:</strong> Uploaded PDF guidelines will be parsed, stripped of binary structures, and indexed into textual evidence for AI verification with zero external fees (₹0).
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Guideline Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Q4 Master Brand Advertising Manual"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Select PDF Document</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              required
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="w-full p-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              disabled={uploading}
              onClick={() => setIsUploadPdfModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing with PyMuPDF...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Extract & Index PDF</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BrandGuidelinesPage;
