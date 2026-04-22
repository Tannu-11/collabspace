import { useState, useRef, useEffect } from 'react';
import API from '../api/axios';

export default function AISidebar({ project, tasks, onClose }) {
  const [tab, setTab] = useState('assistant'); // 'assistant' | 'generate' | 'report'
  const [msgs, setMsgs] = useState([
    {
      role: 'ai',
      text: `Hi! I'm your AI assistant for **${project?.name}**. Ask me anything about your project.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiGenLoading, setAiGenLoading] = useState(false);
  const [aiGenDone, setAiGenDone] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const bottomRef = useRef();
  const inputRef = useRef();
  const [generatedTasks, setGeneratedTasks] = useState([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMsgs(p => [...p, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const todo = tasks.filter(t => t.status === 'todo').length;
      const inProgress = tasks.filter(t => t.status === 'inprogress').length;
      const done = tasks.filter(t => t.status === 'done').length;
      const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length;

      const { data } = await API.post('/ai/assistant', {
        message: userMsg,
        context: {
          projectName: project.name,
          totalTasks: tasks.length,
          done, inProgress, todo,
          memberCount: project.members?.length || 0,
          overdue,
        },
      });
      setMsgs(p => [...p, { role: 'ai', text: data.reply }]);
    } catch {
      setMsgs(p => [...p, { role: 'ai', text: 'Sorry, I had trouble connecting. Please try again.' }]);
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (aiGenLoading) return;
    setAiGenLoading(true);
    setGeneratedTasks([]);
    try {
      const { data } = await API.post('/ai/generate-tasks', {
        projectName: project.name,
        projectDescription: project.description || project.name,
      });
      const bulk = await API.post('/tasks/bulk', { tasks: data.tasks, projectId: project._id });
      setGeneratedTasks(bulk.data);
      setAiGenDone(true);
    } catch (err) {
      console.error(err);
    }
    setAiGenLoading(false);
  };

  const handleSummarize = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setSummary('');
    try {
      const { data } = await API.post('/ai/summarize', {
        projectName: project.name,
        tasks,
        memberCount: project.members?.length || 0,
      });
      setSummary(data.summary);
    } catch {
      setSummary('Failed to generate summary. Please try again.');
    }
    setAiLoading(false);
  };

  const suggestions = [
    'What should I prioritize?',
    'How is the team doing?',
    'What are overdue tasks?',
    'Suggest next steps',
  ];

  const tabs = [
    { id: 'assistant', label: 'Chat', icon: '💬' },
    { id: 'generate',  label: 'Generate', icon: '🤖' },
    { id: 'report',    label: 'Report', icon: '📊' },
  ];

  return (
    <>
      <div className="ai-sidebar-overlay" onClick={onClose} />
      <div className="ai-sidebar">
        {/* Header */}
        <div style={s.head}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={s.aiIcon}>✦</div>
            <div>
              <div style={s.title}>AI Tools</div>
              <div style={s.sub}>{project?.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border2)' }}>✕</button>
        </div>

        {/* Tab switcher */}
        <div style={s.tabRow}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                ...s.tabBtn,
                background: tab === t.id ? 'var(--bg2)' : 'transparent',
                color: tab === t.id ? 'var(--text)' : 'var(--text2)',
                fontWeight: tab === t.id ? '600' : '500',
                boxShadow: tab === t.id ? 'var(--shadow)' : 'none',
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* ── ASSISTANT TAB ── */}
        {tab === 'assistant' && (
          <>
            <div style={s.msgs}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                  {m.role === 'ai' && <div style={s.aiAvatar}>✦</div>}
                  <div style={{
                    maxWidth: '85%',
                    background: m.role === 'user' ? 'var(--blue)' : 'var(--bg3)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border2)',
                    borderRadius: m.role === 'user' ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                    padding: '10px 14px',
                  }}>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: m.role === 'user' ? '#fff' : 'var(--text)', whiteSpace: 'pre-wrap' }}>
                      {m.text}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <div style={s.aiAvatar}>✦</div>
                  <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '2px 12px 12px 12px', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--purple)', animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {msgs.length <= 1 && (
              <div style={s.suggestions}>
                {suggestions.map((s2, i) => (
                  <button key={i} onClick={() => setInput(s2)}
                    style={s.suggBtn}>
                    {s2}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={sendMessage} style={s.inputRow}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything..."
                style={{ flex: 1, fontSize: '13px', borderRadius: '8px' }}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!input.trim() || loading}
                style={{ padding: '8px 14px', borderRadius: '8px' }}
              >
                ↑
              </button>
            </form>
          </>
        )}

        {/* ── GENERATE TAB ── */}
        {tab === 'generate' && (
          <div style={s.tabContent}>
            <div style={s.infoBox}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>
                AI Task Generator
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.7', marginBottom: '20px' }}>
                Automatically generate a comprehensive set of tasks based on your project name and description using AI.
              </p>
              <div style={s.projectInfo}>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Project</div>
                <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '14px' }}>{project?.name}</div>
                {project?.description && (
                  <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>{project.description}</div>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={aiGenLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--purple)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: aiGenLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
                  opacity: aiGenLoading ? 0.7 : 1,
                  transition: 'all 0.15s',
                }}
              >
                {aiGenLoading
                  ? <><span className="spinner" style={{ color: 'white' }} /> Generating tasks...</>
                  : '✨ Generate Tasks with AI'
                }
              </button>

              {aiGenDone && generatedTasks.length > 0 && (
                <div style={{ marginTop: '16px', padding: '14px', background: 'var(--green-dim)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>✅</div>
                  <div style={{ fontWeight: '600', color: 'var(--green)', fontSize: '14px' }}>
                    {generatedTasks.length} tasks added to board!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REPORT TAB ── */}
        {tab === 'report' && (
          <div style={s.tabContent}>
            {/* Stats overview */}
            <div style={s.statsGrid}>
              {[
                { label: 'Total', value: tasks.length, color: 'var(--blue)' },
                { label: 'Done', value: tasks.filter(t => t.status === 'done').length, color: 'var(--green)' },
                { label: 'In Progress', value: tasks.filter(t => t.status === 'inprogress').length, color: 'var(--amber)' },
                { label: 'Overdue', value: tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length, color: 'var(--red)' },
              ].map((st, i) => (
                <div key={i} style={{ ...s.statCard, borderTop: `3px solid ${st.color}` }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: st.color }}>{st.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>{st.label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            {tasks.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>Completion</span>
                  <span style={{ fontSize: '12px', color: 'var(--text2)' }}>
                    {Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg4)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)}%`,
                    background: 'linear-gradient(90deg, var(--blue), var(--purple))',
                    borderRadius: '99px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            )}

            <button
              onClick={handleSummarize}
              disabled={aiLoading}
              style={{
                width: '100%',
                padding: '11px',
                background: aiLoading ? 'var(--bg4)' : 'var(--blue)',
                color: aiLoading ? 'var(--text2)' : '#fff',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: aiLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: '600',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '16px',
                transition: 'all 0.15s',
              }}
            >
              {aiLoading
                ? <><span className="spinner" /> Analyzing project...</>
                : '📊 Generate AI Report'
              }
            </button>

            {summary && (
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '16px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>AI Progress Report</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(summary); }}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '3px 8px', fontSize: '10px' }}
                  >
                    Copy
                  </button>
                </div>
                <p style={{ fontSize: '12px', lineHeight: '1.8', color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>{summary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

const s = {
  head: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--bg2)',
  },
  aiIcon: {
    width: '34px', height: '34px', borderRadius: '9px',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', color: '#fff', fontWeight: '700', flexShrink: 0,
    boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
  },
  title: { fontSize: '15px', fontWeight: '700', color: 'var(--text)' },
  sub:   { fontSize: '11px', color: 'var(--text3)', marginTop: '1px' },

  tabRow: {
    display: 'flex', gap: '4px',
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg3)',
  },
  tabBtn: {
    flex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
    padding: '7px 8px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'all 0.15s',
  },

  msgs: {
    flex: 1, overflowY: 'auto',
    padding: '14px 16px',
    display: 'flex', flexDirection: 'column',
  },
  aiAvatar: {
    width: '24px', height: '24px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', color: '#fff', flexShrink: 0,
    marginRight: '8px', alignSelf: 'flex-start', marginTop: '2px',
  },

  suggestions: {
    display: 'flex', flexWrap: 'wrap', gap: '6px',
    padding: '0 16px 12px',
  },
  suggBtn: {
    padding: '5px 10px',
    background: 'var(--blue-dim)',
    color: 'var(--blue)',
    border: '1px solid var(--blue-border)',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'all 0.12s',
  },

  inputRow: {
    display: 'flex', gap: '8px',
    padding: '12px 16px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg2)',
  },

  tabContent: {
    flex: 1, overflowY: 'auto',
    padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  infoBox: {
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    textAlign: 'center',
  },
  projectInfo: {
    background: 'var(--bg2)',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius)',
    padding: '12px 14px',
    textAlign: 'left',
    marginBottom: '16px',
  },

  statsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '8px', marginBottom: '16px',
  },
  statCard: {
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px',
    textAlign: 'center',
  },
};