import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { 
  Search, Loader, Save, ExternalLink, DollarSign, 
  CheckCircle, MapPin, Star, Briefcase, RefreshCw, Code, Sparkles, BadgeCheck, 
  CreditCard, Mail, User, Play, Settings
} from 'lucide-react';
import Layout from '../components/layout/Layout';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: string | null;
  skills: string[];
  clientName: string;
  clientLocation: string | null;
  isIdVerified: boolean;
  isPaymentVerified: boolean;
  isDepositMade: boolean;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  isPhoneVerified: boolean;
  memberSince: string | null;
  totalSpent: string | null;
  jobsPosted: number;
  hireRate: string | null;
  rating: number | null;
  reviews: number;
  projectUrl: string | null;
  isViewed: boolean;
  isSaved: boolean;
  createdAt: string;
}

export default function ProjectSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [automationSettings, setAutomationSettings] = useState<any>(null);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [showAutomationPanel, setShowAutomationPanel] = useState(false);

  const bg = '#25343F';
  const cardBg = '#25343F';
  const border = 'rgba(191, 201, 209, 0.24)';
  const textMain = '#EAEFEF';
  const textMuted = '#BFC9D1';

  useEffect(() => {
    api.get('/projects/technologies')
      .then(res => setTechnologies(res.data.technologies || []))
      .catch(() => {});
    loadSavedProjects();
    loadAutomationSettings();
  }, []);

  const loadSavedProjects = () => {
    api.get('/projects/saved')
      .then(res => setSavedProjects(res.data.projects || []))
      .catch(() => {});
  };

  const loadAutomationSettings = () => {
    api.get('/projects/automation')
      .then(res => setAutomationSettings(res.data.settings))
      .catch(() => {});
  };

  const handleSearch = async () => {
    const tech = selectedTechs[0] || searchTerm;
    if (!tech.trim()) {
      toast.error('Please select or enter a technology');
      return;
    }

    setIsSearching(true);
    setProjects([]);
    setSelectedProject(null);
    
    try {
      const res = await api.post('/projects/search', { technology: tech });
      setProjects(res.data.projects || []);
      if (res.data.projects?.length > 0) {
        toast.success(`Found ${res.data.projects.length} projects!`);
      } else {
        toast.error('No projects found. Try another technology.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to search');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveProject = async (project: Project) => {
    try {
      await api.post('/projects/save', { projectId: project.id });
      toast.success(project.isSaved ? 'Already saved!' : 'Project saved!');
      loadSavedProjects();
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleTechSelect = (tech: string) => {
    if (!selectedTechs.includes(tech)) {
      setSelectedTechs([tech]);
    }
    setSearchTerm('');
    setShowTechDropdown(false);
  };

  const removeTech = () => {
    setSelectedTechs([]);
  };

  const toggleAutomation = async () => {
    try {
      await api.post('/projects/automation', {
        isEnabled: !automationSettings?.isEnabled,
        selectedTechs: selectedTechs,
        intervalMinutes: 15
      });
      loadAutomationSettings();
      toast.success(automationSettings?.isEnabled ? 'Automation disabled' : 'Automation enabled');
    } catch {
      toast.error('Failed to update');
    }
  };

  const runAutomationNow = async () => {
    setIsAutomationRunning(true);
    try {
      const res = await api.post('/projects/automation/run');
      toast.success(`Found ${res.data.projectsFound} projects`);
      loadSavedProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Automation failed');
    } finally {
      setIsAutomationRunning(false);
    }
  };

  const filteredTechs = technologies.filter(t => 
    t.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedTechs.includes(t)
  );

  const displayedProjects = projects;

  return (
    <Layout>
      <div className="p-8 min-h-screen" style={{ backgroundColor: bg, color: textMain }}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Code size={24} style={{ color: '#FF9B51' }} /> Project Finder
            </h1>
            <p style={{ color: textMuted }}>Find verified freelancer projects</p>
          </div>
          
          <button
            onClick={() => setShowAutomationPanel(!showAutomationPanel)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition"
            style={{ 
              backgroundColor: automationSettings?.isEnabled ? '#FF9B51' : '#455965',
              color: 'white'
            }}
          >
            <Settings size={16} />
            {automationSettings?.isEnabled ? 'Automation On' : 'Automation Off'}
          </button>
        </div>

        {/* Automation Panel */}
        {showAutomationPanel && (
          <div className="mb-6 rounded-2xl p-6" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles size={18} /> Automation Settings
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Automation</p>
                  <p className="text-sm" style={{ color: textMuted }}>Automatically search for projects</p>
                </div>
                <button
                  onClick={toggleAutomation}
                  className="w-14 h-7 rounded-full transition relative"
                  style={{ backgroundColor: automationSettings?.isEnabled ? '#FF9B51' : '#516774' }}
                >
                  <div className="absolute top-1 w-5 h-5 rounded-full bg-white transition" 
                    style={{ left: automationSettings?.isEnabled ? '32px' : '4px' }} />
                </button>
              </div>

              {/* Add Tech to Automation */}
              <div>
                <p className="font-medium mb-2">Add Technology to Automation</p>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
                    <input
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowTechDropdown(true);
                      }}
                      onFocus={() => setShowTechDropdown(true)}
                      className="w-full rounded-xl pl-10 pr-4 py-2 border text-sm"
                      style={{ 
                        backgroundColor: bg, 
                        borderColor: border, 
                        color: textMain 
                      }}
                      placeholder="Type technology..."
                    />
                    {showTechDropdown && filteredTechs.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 rounded-xl max-h-40 overflow-y-auto border" 
                        style={{ backgroundColor: cardBg, borderColor: border }}>
                        {filteredTechs.slice(0, 8).map(tech => (
                          <button
                            key={tech}
                            onClick={() => handleTechSelect(tech)}
                            className="w-full text-left px-4 py-2 text-sm hover:opacity-80"
                            style={{ color: textMain }}
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (selectedTechs[0]) {
                        api.post('/projects/automation', {
                          isEnabled: automationSettings?.isEnabled || false,
                          selectedTechs: [...(automationSettings?.selectedTechs || []), selectedTechs[0]],
                          intervalMinutes: 15
                        }).then(() => {
                          toast.success(`Added ${selectedTechs[0]} to automation`);
                          loadAutomationSettings();
                          setSelectedTechs([]);
                          setSearchTerm('');
                        }).catch(() => {
                          toast.error('Failed to add');
                        });
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-white text-sm"
                    style={{ backgroundColor: '#FF9B51', color: '#25343F' }}
                    disabled={!selectedTechs[0]}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected Techs for Automation */}
              {automationSettings?.selectedTechs?.length > 0 && (
                <div>
                  <p className="text-sm mb-2" style={{ color: textMuted }}>Automation will search for:</p>
                  <div className="flex flex-wrap gap-2">
                    {automationSettings.selectedTechs.map((tech: string) => (
                      <span key={tech} className="px-3 py-1 rounded-full text-sm flex items-center gap-2" 
                        style={{ backgroundColor: '#FF9B51', color: '#25343F' }}>
                        {tech}
                        <button 
                          onClick={() => {
                            const newTechs = automationSettings.selectedTechs.filter((t: string) => t !== tech);
                            api.post('/projects/automation', {
                              isEnabled: automationSettings.isEnabled,
                              selectedTechs: newTechs,
                              intervalMinutes: 15
                            }).then(() => loadAutomationSettings());
                          }}
                          className="hover:text-red-200"
                        >×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={runAutomationNow}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition"
                style={{ backgroundColor: '#FF9B51', color: '#25343F' }}
                disabled={isAutomationRunning || !automationSettings?.selectedTechs?.length}
              >
                {isAutomationRunning ? <Loader size={16} className="animate-spin" /> : <Play size={16} />}
                {isAutomationRunning ? 'Searching...' : 'Search Now'}
              </button>

              {automationSettings?.lastRunAt && (
                <p className="text-sm text-center" style={{ color: textMuted }}>
                  Last search: {new Date(automationSettings.lastRunAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search Box */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Search size={18} /> Search Technology
              </h2>
              
              <div className="relative mb-4">
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowTechDropdown(true);
                  }}
                  onFocus={() => setShowTechDropdown(true)}
                  className="w-full rounded-xl px-4 py-3 border"
                  style={{ 
                    backgroundColor: bg, 
                    borderColor: border, 
                    color: textMain 
                  }}
                  placeholder="Search technology..."
                />
                
                {showTechDropdown && filteredTechs.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 rounded-xl max-h-60 overflow-y-auto border" 
                    style={{ backgroundColor: cardBg, borderColor: border }}>
                    {filteredTechs.slice(0, 10).map(tech => (
                      <button
                        key={tech}
                        onClick={() => handleTechSelect(tech)}
                        className="w-full text-left px-4 py-2 hover:opacity-80"
                        style={{ color: textMain }}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedTechs.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: textMuted }}>Selected:</span>
                    <button onClick={removeTech} className="text-red-400 text-sm">Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTechs.map(tech => (
                      <span key={tech} className="px-3 py-1 rounded-full text-sm" 
                        style={{ backgroundColor: '#FF9B51', color: '#25343F' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSearch}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                style={{ backgroundColor: '#FF9B51', color: '#25343F' }}
                disabled={isSearching}
              >
                {isSearching ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
                {isSearching ? 'Searching...' : 'Find Projects'}
              </button>
            </div>

            {/* Popular Technologies */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: textMuted }}>Popular</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'Node.js', 'Python', 'PHP', 'WordPress', 'AWS', 'Flutter', 'React Native'].map(tech => (
                  <button
                    key={tech}
                    onClick={() => handleTechSelect(tech)}
                    className="px-3 py-1.5 text-xs rounded-full transition"
                    style={{ 
                      backgroundColor: selectedTechs.includes(tech) ? '#FF9B51' : '#455965',
                      color: 'white'
                    }}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Projects */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Save size={18} /> Saved Projects
                </h2>
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#FF9B51', color: '#25343F' }}>
                  {savedProjects.length}
                </span>
              </div>
              
              {savedProjects.length === 0 ? (
                <p style={{ color: textMuted, fontSize: '14px' }}>No saved projects</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedProjects.slice(0, 5).map(project => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="w-full text-left p-3 rounded-lg transition"
                      style={{ backgroundColor: bg }}
                    >
                      <p className="font-medium truncate" style={{ color: textMain }}>{project.title}</p>
                      <p style={{ color: textMuted, fontSize: '12px' }}>{project.clientName}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Info */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles size={14} /> Verified Clients
              </h3>
              <ul className="space-y-2 text-xs" style={{ color: textMuted }}>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-blue-400" /> Identity Verified</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-blue-400" /> Payment Verified</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-blue-400" /> Deposit Made</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-blue-400" /> 1+ Reviews</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-3">
            {isSearching ? (
              <div className="rounded-2xl p-12 border flex flex-col items-center justify-center" 
                style={{ backgroundColor: cardBg, borderColor: border }}>
                <Loader size={48} className="animate-spin mb-4" style={{ color: '#FF9B51' }} />
                <p style={{ color: textMuted }}>Searching for projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-2xl p-12 border flex flex-col items-center justify-center" 
                style={{ backgroundColor: cardBg, borderColor: border, color: textMuted }}>
                <Search size={48} className="mb-3 opacity-30" />
                <p>Search for projects by selecting a technology</p>
                <p className="text-sm mt-2">Projects will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p style={{ color: textMuted }}>{displayedProjects.length} projects found</p>
                  <button onClick={handleSearch} className="flex items-center gap-1 text-sm" style={{ color: '#FF9B51' }}>
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>

                {displayedProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="rounded-2xl p-6 border transition cursor-pointer"
                    style={{ 
                      backgroundColor: cardBg, 
                      borderColor: selectedProject?.id === project.id ? '#FF9B51' : border 
                    }}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1" style={{ color: textMain }}>{project.title}</h3>
                        <div className="flex items-center gap-3 text-sm" style={{ color: textMuted }}>
                          <span className="flex items-center gap-1"><User size={14} /> {project.clientName}</span>
                          {project.clientLocation && <span className="flex items-center gap-1"><MapPin size={14} /> {project.clientLocation}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {project.projectUrl && (
                          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg transition flex items-center gap-1"
                            style={{ backgroundColor: '#FF9B51', color: '#25343F' }}
                          >
                            <ExternalLink size={16} /> View
                          </a>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSaveProject(project); }}
                          className="p-2 rounded-lg transition"
                          style={{ 
                            backgroundColor: project.isSaved ? '#FF9B51' : '#455965',
                            color: 'white'
                          }}
                        >
                          <Save size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm mb-4 line-clamp-2" style={{ color: textMuted }}>{project.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.slice(0, 6).map((skill, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded-full" 
                          style={{ backgroundColor: '#455965', color: '#EAEFEF' }}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t" style={{ borderColor: border }}>
                      {project.budget && (
                        <div className="flex items-center gap-1" style={{ color: '#FF9B51' }}>
                          <DollarSign size={14} />
                          <span className="text-sm font-medium">{project.budget}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs" style={{ color: textMuted }}>
                        <span className="flex items-center gap-1">
                          <BadgeCheck size={14} className={project.isIdVerified ? 'text-blue-400' : 'text-gray-600'} /> ID
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard size={14} className={project.isPaymentVerified ? 'text-blue-400' : 'text-gray-600'} /> Payment
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail size={14} className={project.isEmailVerified ? 'text-blue-400' : 'text-gray-600'} /> Email
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs ml-auto" style={{ color: textMuted }}>
                        {project.rating && <span className="flex items-center gap-1 text-blue-400"><Star size={14} /> {project.rating}</span>}
                        <span className="flex items-center gap-1"><Briefcase size={14} /> {project.jobsPosted} jobs</span>
                        {project.totalSpent && <span className="text-blue-400">{project.totalSpent}+</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
