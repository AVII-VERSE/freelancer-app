import { useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Send, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import Layout from '../components/layout/Layout';

export default function TestInstructions() {
  const [instructions, setInstructions] = useState('');
  const [wordCount, setWordCount] = useState('300');
  const [techStack, setTechStack] = useState('');
  const [proposal, setProposal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!instructions.trim()) {
      toast.error('Please enter instructions to test');
      return;
    }

    setIsGenerating(true);
    setProposal('');

    try {
      const res = await api.post('/ai/generate-test', {
        jobDescription: "Test job description for instruction testing",
        instructions,
        wordCount: parseInt(wordCount) || 300,
        techStack: techStack.split(',').map(s => s.trim()).filter(Boolean),
      });
      setProposal(res.data.proposal);
      toast.success('Proposal generated!');
    } catch (error) {
      toast.error('Failed to generate proposal');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="p-8 text-white">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles size={24} className="text-purple-400" /> Test Instructions
          </h1>
          <p className="text-gray-400 mt-1">
            Test your proposal instructions before adding them to templates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" /> 
                Proposal Instructions
              </h2>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-purple-500 h-48 resize-none"
                placeholder="Write instructions for generating the proposal...

Example:
- Start with a personalized greeting
- Mention client's specific project requirements
- Highlight relevant experience
- Include portfolio links
- End with call to action"
              />
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Word Count</label>
                  <input
                    type="number"
                    value={wordCount}
                    onChange={(e) => setWordCount(e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 border border-gray-700 focus:outline-none focus:border-purple-500"
                    placeholder="300"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 border border-gray-700 focus:outline-none focus:border-purple-500"
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !instructions.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              {isGenerating ? 'Generating...' : 'Generate Proposal'}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Copy size={18} className="text-green-400" /> 
                Generated Proposal
              </h2>
              {proposal && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            
            {proposal ? (
              <div className="bg-gray-800 rounded-xl p-4 h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-300 text-sm font-sans">
                  {proposal}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-8 h-[500px] flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  Your generated proposal will appear here.<br/>
                  Enter instructions and click Generate to test.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
