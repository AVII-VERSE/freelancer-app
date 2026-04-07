import { useState, useRef } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Download, Upload, Database, Check, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';

interface ExportData {
  templates: any[];
  quickTemplates: any[];
  proposals: any[];
  records: any[];
  timezoneAlerts: any[];
  profile: any;
  exportedAt: string;
}

export default function ExportImport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<{success: number; failed: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const [templatesRes, quickTemplatesRes, proposalsRes, recordsRes, alertsRes, profileRes] = await Promise.all([
        api.get('/templates'),
        api.get('/quick-templates'),
        api.get('/proposals'),
        api.get('/records'),
        api.get('/timezone/alerts'),
        api.get('/profile'),
      ]);

      const exportData: ExportData = {
        templates: templatesRes.data.templates || [],
        quickTemplates: quickTemplatesRes.data.templates || [],
        proposals: proposalsRes.data.proposals || [],
        records: recordsRes.data.records || [],
        timezoneAlerts: alertsRes.data.alerts || [],
        profile: profileRes.data.profile || null,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `freelancer-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStats(null);

    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);

      let success = 0;
      let failed = 0;

      if (data.templates?.length > 0) {
        for (const t of data.templates) {
          try {
            await api.post('/templates', {
              name: t.name,
              wordCount: t.wordCount,
              instructions: t.instructions,
              techStack: t.techStack,
              instructionPriority: t.instructionPriority,
            });
            success++;
          } catch { failed++; }
        }
      }

      if (data.quickTemplates?.length > 0) {
        for (const t of data.quickTemplates) {
          try {
            await api.post('/quick-templates', {
              name: t.name,
              content: t.content,
              category: t.category,
            });
            success++;
          } catch { failed++; }
        }
      }

      if (data.timezoneAlerts?.length > 0) {
        for (const a of data.timezoneAlerts) {
          try {
            await api.post('/timezone/alerts', {
              name: a.name,
              timezone: a.timezone,
              alertTime: a.alertTime,
              enabled: a.enabled,
            });
            success++;
          } catch { failed++; }
        }
      }

      setImportStats({ success, failed });
      toast.success(`Imported ${success} items!`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import. Invalid file format.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Layout>
      <div className="p-8 text-white">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database size={24} className="text-blue-400" /> Export / Import Data
          </h1>
          <p className="text-gray-400 mt-1">Backup and restore your FreelanceOS data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Download size={24} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Export Data</h2>
                <p className="text-sm text-gray-400">Download all your data as JSON</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-400 mb-2">This will export:</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Templates ({'{'}templates{'}'} count)</li>
                <li>• Quick Templates</li>
                <li>• Proposals</li>
                <li>• Project Records</li>
                <li>• Timezone Alerts</li>
                <li>• Profile</li>
              </ul>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {isExporting ? 'Exporting...' : 'Download Backup'}
            </button>
          </div>

          {/* Import */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Upload size={24} className="text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Import Data</h2>
                <p className="text-sm text-gray-400">Restore from a backup file</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-400 mb-2">Supported:</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Templates</li>
                <li>• Quick Templates</li>
                <li>• Timezone Alerts</li>
              </ul>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {isImporting ? 'Importing...' : 'Select Backup File'}
            </label>

            {importStats && (
              <div className="mt-4 bg-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check size={16} className="text-green-400" />
                  <span className="text-green-400 font-medium">Import Complete</span>
                </div>
                <p className="text-sm text-gray-300">
                  Successfully imported: {importStats.success} items
                  {importStats.failed > 0 && `, Failed: ${importStats.failed} items`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
