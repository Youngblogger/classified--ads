'use client';

import { useState, useEffect, useRef } from 'react';
import { adminApi } from '@/lib/api';
import { Upload, Trash2, Check, FileText, X } from 'lucide-react';

interface Font {
  id: number;
  name: string;
  filename: string;
  format: 'ttf' | 'otf';
  is_active: boolean;
  created_at: string;
}

export default function FontsPage() {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchFonts();
  }, []);

  const fetchFonts = async () => {
    try {
      const response = await adminApi.getFonts();
      setFonts(response.data);
    } catch (error) {
      console.error('Error fetching fonts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.ttf', '.otf'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      setMessage({ type: 'error', text: 'Invalid file format. Please upload .ttf or .otf files.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size exceeds 5MB limit.' });
      return;
    }

    setSelectedFile(file);
    if (!uploadName) {
      const fontName = file.name.replace(/\.(ttf|otf)$/i, '');
      setUploadName(fontName);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadName.trim()) {
      setMessage({ type: 'error', text: 'Please select a file and enter a font name.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      await adminApi.uploadFont(selectedFile, uploadName.trim());
      setMessage({ type: 'success', text: 'Font uploaded successfully!' });
      setSelectedFile(null);
      setUploadName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchFonts();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload font. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this font?')) return;

    try {
      await adminApi.deleteFont(id);
      setMessage({ type: 'success', text: 'Font deleted successfully!' });
      fetchFonts();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete font.' });
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await adminApi.setDefaultFont(id);
      setMessage({ type: 'success', text: 'Default font updated!' });
      fetchFonts();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update default font.' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="h-12 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom Fonts</h1>
            <p className="text-gray-500">Upload and manage custom fonts for watermark text</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Font</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.otf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <span className="text-primary-600 font-medium">{selectedFile.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Click to select font file</p>
                  <p className="text-sm text-gray-400 mt-1">.ttf or .otf (max 5MB)</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Name</label>
              <input
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="Enter font name"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !uploadName.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Font</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Uploaded Fonts ({fonts.length})</h2>
        </div>

        {fonts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No custom fonts uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {fonts.map((font) => (
              <div key={font.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{font.name}</p>
                      {font.is_active && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {font.filename} • {font.format.toUpperCase()} • Uploaded {new Date(font.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!font.is_active && (
                    <button
                      onClick={() => handleSetDefault(font.id)}
                      className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(font.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Supported Font Formats</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li><strong>TTF (TrueType Font)</strong> - Most common format, works in all browsers</li>
          <li><strong>OTF (OpenType Font)</strong> - Advanced typographic features</li>
        </ul>
        <p className="text-sm text-blue-600 mt-2">
          Custom fonts uploaded here will appear in the watermark settings font dropdown.
        </p>
      </div>
    </div>
  );
}
