import { useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Loader2, Copy, Check, FileText, Briefcase, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';

export default function CoverLetter() {
  const [form, setForm] = useState({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    yourSkills: '',
    yourExperience: '',
    achievements: '',
    tone: 'professional',
  });
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!form.jobTitle || !form.companyName) {
      toast.error('Job title and company name are required');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.post('/ai/generate-cover-letter', form);
      setCoverLetter(res.data.coverLetter);
      toast.success('Cover letter generated!');
    } catch (error) {
      toast.error('Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="p-8 text-white">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText size={24} className="text-green-400" /> Cover Letter Generator
          </h1>
          <p className="text-gray-400 mt-1">Generate personalized cover letters for job applications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-400" /> Job Details
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Job Title *</label>
                    <input
                      value={form.jobTitle}
                      onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                      placeholder="Software Developer"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Company Name *</label>
                    <input
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                      placeholder="Tech Corp"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Job Description (optional)</label>
                  <textarea
                    value={form.jobDescription}
                    onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 h-24"
                    placeholder="Paste the job requirements..."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Your Skills</label>
                  <input
                    value={form.yourSkills}
                    onChange={(e) => setForm({ ...form, yourSkills: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="React, Node.js, Python, AWS..."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Years of Experience</label>
                  <input
                    value={form.yourExperience}
                    onChange={(e) => setForm({ ...form, yourExperience: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="5 years in web development"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Key Achievements</label>
                  <textarea
                    value={form.achievements}
                    onChange={(e) => setForm({ ...form, achievements: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 h-20"
                    placeholder="Led team of 5 developers, increased sales by 30%..."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Tone</label>
                  <select
                    value={form.tone}
                    onChange={(e) => setForm({ ...form, tone: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !form.jobTitle || !form.companyName}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Copy size={18} className="text-purple-400" /> Generated Cover Letter
              </h2>
              {coverLetter && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            
            {coverLetter ? (
              <div className="bg-gray-800 rounded-xl p-4 h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-300 text-sm font-sans">
                  {coverLetter}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-8 h-[600px] flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  Your cover letter will appear here.<br/>
                  Fill in the details and click Generate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
