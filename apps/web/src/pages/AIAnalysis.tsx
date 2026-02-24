import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Bot, Loader2, Copy, Save, Zap, AlertTriangle, Target, Clock, DollarSign, Layers } from 'lucide-react';
import Layout from '../components/layout/Layout';

interface Template {
  id: string;
  name: string;
  instructions: string;
  example: string;
  purpose: string;
}

export default function AIAnalysis() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientCountry, setClientCountry] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [proposal, setProposal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get('/templates')
      .then(res => setTemplates(res.data.templates))
      .catch(() => {});
  }, []);

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysis(null);
    setProposal('');
    try {
      const res = await api.post('/ai/analyze', { title, description, clientCountry });
      setAnalysis(res.data.analysis);
      toast.success('Analysis complete!');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const templateData = templates.find(t => t.id === selectedTemplate);
      const res = await api.post('/ai/generate', { 
        projectDescription: description,
        templateInstructions: templateData?.instructions || '',
        templateExample: templateData?.example || '',
      });
      setProposal(res.data.proposal);
      toast.success('Proposal generated!');
    } catch {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProposal = async () => {
    if (!proposal) return;
    setIsSaving(true);
    try {
      await api.post('/proposals', {
        title: title || 'AI Generated Proposal',
        content: proposal,
        bidAmount: analysis?.bid_range?.min || 0,
      });
      toast.success('Proposal saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(proposal);
    toast.success('Copied to clipboard!');
  };

  const effortColor: Record<string, string> = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  };

  return (
    <Layout>
      <div className="p-8 text-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot size={24} className="text-green-400" /> AI Analysis
          </h1>
          <p className="text-gray-400 mt-1">Analyze projects and generate winning proposals with AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Input Form */}
          <div className="space-y-4">
            <form onSubmit={handleAnalyze} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap size={18} className="text-green-400" /> Project Details
              </h2>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Project Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-green-500"
                  placeholder="React Dashboard Project"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Project Description <span className="text-red-400">*</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-green-500 h-40 resize-none"
                  placeholder="Paste the full project description here..."
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Client Country</label>
                <input
                  value={clientCountry}
                  onChange={(e) => setClientCountry(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-green-500"
                  placeholder="USA, UK, Canada..."
                />
              </div>

              {templates.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
                    <Layers size={14} /> Use Template for Proposal
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-green-500"
                  >
                    <option value="">No template - Generate freely</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} {template.purpose ? `(${template.purpose})` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedTemplateData && selectedTemplateData.instructions && (
                    <p className="text-xs text-green-400 mt-1">✓ Will use template instructions</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAnalyzing
                  ? <><Loader2 size={16} className="animate-spin" /> Analyzing with AI...</>
                  : <><Zap size={16} /> Analyze Project</>
                }
              </button>
            </form>

            {/* Generate Proposal Button */}
            {analysis && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating
                  ? <><Loader2 size={16} className="animate-spin" /> Generating Proposal...</>
                  : <><Bot size={16} /> Generate Winning Proposal</>
                }
              </button>
            )}
          </div>

          {/* Right - Results */}
          <div className="space-y-4">
            {!analysis && !isAnalyzing && (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 h-64 flex flex-col items-center justify-center text-gray-600">
                <Bot size={48} className="mb-3 opacity-20" />
                <p>Analysis results will appear here</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 h-64 flex flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin text-green-400 mb-3" />
                <p className="text-gray-400">AI is analyzing your project...</p>
              </div>
            )}

            {analysis && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-5">
                <h2 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                  <Target size={18} /> Analysis Results
                </h2>

                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-gray-400" />
                      <p className="text-gray-400 text-xs">Effort Level</p>
                    </div>
                    <p className={`font-bold capitalize text-lg ${effortColor[analysis.effort_level] || 'text-white'}`}>
                      {analysis.effort_level}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-gray-400" />
                      <p className="text-gray-400 text-xs">Hours Estimate</p>
                    </div>
                    <p className="font-bold text-lg text-white">{analysis.hours_estimate}hrs</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Target size={14} className="text-gray-400" />
                      <p className="text-gray-400 text-xs">Tech Fit Score</p>
                    </div>
                    <p className="font-bold text-lg text-blue-400">{analysis.tech_fit_score}/10</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={14} className="text-gray-400" />
                      <p className="text-gray-400 text-xs">Bid Range</p>
                    </div>
                    <p className="font-bold text-lg text-green-400">${analysis.bid_range?.min} - ${analysis.bid_range?.max}</p>
                  </div>
                </div>

                {/* Tech Fit Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Tech Fit Score</span>
                    <span className="text-blue-400">{analysis.tech_fit_score}/10</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${(analysis.tech_fit_score / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Matched Skills */}
                {analysis.matched_skills?.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Matched Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matched_skills.map((skill: string) => (
                        <span key={skill} className="text-xs px-2 py-1 rounded-lg bg-blue-400/10 text-blue-400 border border-blue-400/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Winning Angle */}
                <div className="bg-green-900/20 border border-green-800/40 rounded-xl p-3">
                  <p className="text-green-400 text-xs uppercase tracking-wide mb-1">Winning Angle</p>
                  <p className="text-gray-300 text-sm">{analysis.winning_angle}</p>
                </div>

                {/* Red Flags */}
                {analysis.red_flags?.length > 0 && (
                  <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-red-400" />
                      <p className="text-red-400 text-xs uppercase tracking-wide">Red Flags</p>
                    </div>
                    {analysis.red_flags.map((flag: string, i: number) => (
                      <p key={i} className="text-red-300 text-sm">• {flag}</p>
                    ))}
                  </div>
                )}

                {/* Strategy */}
                <div className="flex items-center justify-between bg-gray-800 rounded-xl p-3">
                  <span className="text-gray-400 text-sm">Recommended Strategy</span>
                  <span className="text-white font-semibold capitalize">{analysis.bidding_strategy}</span>
                </div>
              </div>
            )}

            {/* Generated Proposal */}
            {proposal && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                    <Bot size={18} /> Generated Proposal
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-gray-800"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={handleSaveProposal}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Save size={14} />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto">
                  {proposal}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}