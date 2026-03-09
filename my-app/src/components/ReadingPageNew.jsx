import { useState, useEffect } from "react";
import { getClips, addClip, updateClip, deleteClip } from "../db.js";

// Icons (需要从 App.jsx 导入或复制)
const Icons = {
  Book: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  Database: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>,
};

export default function ReadingPageNew(){
  const [pdfName, setPdfName] = useState('');
  const [clipText, setClipText] = useState('');
  const [msg, setMsg] = useState('');
  const [clips, setClips] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClip, setSelectedClip] = useState(null);
  const [editingClip, setEditingClip] = useState(null);
  const [newClip, setNewClip] = useState({ title: '', content: '', source: '', tags: '' });

  useEffect(() => {
    loadClips();
  }, []);

  const loadClips = async () => {
    const savedClips = await getClips();
    if (savedClips?.length) {
      setClips(savedClips);
    }
  };

  const importPdf = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfName(file.name);
    setMsg('已加载 PDF 文件（当前版本提供手动摘录，自动结构化提取后续接入）。');
    setTimeout(() => setMsg(''), 3000);
  };

  // 原有的快速摘录功能
  const addManualClip = async () => {
    if (!clipText.trim()) return;
    const clip = {
      title: '手动摘录',
      content: clipText.trim(),
      source: pdfName || '手动输入',
      tags: [],
      createdAt: Date.now(),
      type: 'manual'
    };
    const id = await addClip(clip);
    setClips(prev => [{...clip, id}, ...prev]);
    setClipText('');
    setMsg('素材已加入素材库');
    setTimeout(() => setMsg(''), 3000);
  };

  // 新增的完整表单添加功能
  const handleAddClip = async () => {
    if (!newClip.title.trim() || !newClip.content.trim()) {
      setMsg('请填写标题和内容');
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    const clip = {
      title: newClip.title.trim(),
      content: newClip.content.trim(),
      source: newClip.source.trim() || '手动添加',
      tags: newClip.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: Date.now(),
      type: 'manual'
    };
    const id = await addClip(clip);
    setClips(prev => [{ ...clip, id }, ...prev]);
    setNewClip({ title: '', content: '', source: '', tags: '' });
    setShowAddForm(false);
    setMsg('素材已添加成功');
    setTimeout(() => setMsg(''), 3000);
  };

  // 编辑素材
  const handleEditClip = async () => {
    if (!editingClip.title.trim() || !editingClip.content.trim()) {
      setMsg('请填写标题和内容');
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    const updatedClip = {
      ...editingClip,
      title: editingClip.title.trim(),
      content: editingClip.content.trim(),
      source: editingClip.source.trim() || '手动添加',
      tags: typeof editingClip.tags === 'string' 
        ? editingClip.tags.split(',').map(t => t.trim()).filter(Boolean)
        : editingClip.tags,
      updatedAt: Date.now()
    };
    await updateClip(updatedClip);
    setClips(prev => prev.map(c => c.id === updatedClip.id ? updatedClip : c));
    if (selectedClip?.id === updatedClip.id) {
      setSelectedClip(updatedClip);
    }
    setEditingClip(null);
    setMsg('素材已更新');
    setTimeout(() => setMsg(''), 3000);
  };

  // 开始编辑
  const startEdit = (clip) => {
    setEditingClip({
      ...clip,
      tags: Array.isArray(clip.tags) ? clip.tags.join(', ') : ''
    });
  };

  // 删除素材
  const handleDeleteClip = async (id) => {
    if (!confirm('确定要删除这条素材吗？')) return;
    await deleteClip(id);
    setClips(prev => prev.filter(c => c.id !== id));
    if (selectedClip?.id === id) setSelectedClip(null);
    if (editingClip?.id === id) setEditingClip(null);
    setMsg('素材已删除');
    setTimeout(() => setMsg(''), 3000);
  };

  // 预留接口：后端自动添加素材
  const addAutoClip = async (clipData) => {
    const clip = {
      ...clipData,
      type: 'auto',
      createdAt: Date.now()
    };
    const id = await addClip(clip);
    setClips(prev => [{ ...clip, id }, ...prev]);
    return id;
  };

  return(
    <div>
      {/* 原有的 PDF 阅读器和快速摘录区域 */}
      <div className="panel fade-in" style={{marginBottom:16}}>
        <div className="panel-header"><Icons.Book/>PDF 阅读器 & 快速摘录</div>
        <div className="panel-body">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {/* PDF 上传区域 */}
            <div style={{background:'var(--bg-deep)',borderRadius:'var(--radius-sm)',border:'1px solid var(--border)',padding:24,minHeight:200,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}>
              <div style={{fontSize:48,opacity:.3}}>📄</div>
              <div style={{color:'var(--text-muted)',fontSize:14,textAlign:'center'}}>
                {pdfName?`已选择: ${pdfName}`:'拖入 PDF 开始阅读'}
              </div>
              <label className="btn btn-secondary" style={{marginTop:6,cursor:'pointer'}}>
                选择文件
                <input type="file" accept="application/pdf" style={{display:'none'}} onChange={importPdf}/>
              </label>
            </div>
            
            {/* 快速摘录区域 */}
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)'}}>快速摘录</div>
              <textarea 
                className="input-field" 
                rows={6} 
                placeholder="粘贴从 PDF 中摘录的素材..." 
                value={clipText} 
                onChange={e=>setClipText(e.target.value)} 
                style={{resize:'vertical',fontFamily:'var(--font-serif)',lineHeight:1.6}}
              />
              <button className="btn btn-primary btn-sm" onClick={addManualClip} disabled={!clipText.trim()}>
                <Icons.Plus/>提取到素材库
              </button>
              {msg && <div style={{fontSize:12,color:'var(--accent-green)',textAlign:'center'}}>{msg}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* 素材库展示区域 */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 400px',gap:16,minHeight:500}}>
        {/* 左侧：素材列表 */}
        <div className="panel fade-in delay-1">
          <div className="panel-header">
            <Icons.Database/>素材库
            <span style={{marginLeft:'auto',fontSize:12,color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>
              共 {clips.length} 条
            </span>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowAddForm(true)} style={{marginLeft:8}}>
              <Icons.Plus/>添加素材
            </button>
          </div>
          <div className="panel-body" style={{maxHeight:600,overflowY:'auto'}}>
            {/* 添加表单 */}
            {showAddForm && (
              <div style={{marginBottom:16,padding:16,background:'var(--bg-elevated)',border:'1px solid var(--accent-amber)',borderRadius:'var(--radius-md)'}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:12,color:'var(--accent-amber)'}}>添加新素材</div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  <input 
                    className="input-field" 
                    placeholder="素材标题..." 
                    value={newClip.title} 
                    onChange={e=>setNewClip(p=>({...p,title:e.target.value}))}
                  />
                  <textarea 
                    className="input-field" 
                    rows={6} 
                    placeholder="素材内容..." 
                    value={newClip.content} 
                    onChange={e=>setNewClip(p=>({...p,content:e.target.value}))}
                    style={{resize:'vertical',fontFamily:'var(--font-serif)',lineHeight:1.6}}
                  />
                  <input 
                    className="input-field" 
                    placeholder="来源（可选）..." 
                    value={newClip.source} 
                    onChange={e=>setNewClip(p=>({...p,source:e.target.value}))}
                  />
                  <input 
                    className="input-field" 
                    placeholder="标签（逗号分隔，可选）..." 
                    value={newClip.tags} 
                    onChange={e=>setNewClip(p=>({...p,tags:e.target.value}))}
                  />
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-primary btn-sm" onClick={handleAddClip}>保存</button>
                    <button className="btn btn-secondary btn-sm" onClick={()=>{setShowAddForm(false);setNewClip({title:'',content:'',source:'',tags:''});}}>取消</button>
                  </div>
                </div>
              </div>
            )}

            {/* 编辑表单 */}
            {editingClip && (
              <div style={{marginBottom:16,padding:16,background:'var(--bg-elevated)',border:'1px solid var(--accent-blue)',borderRadius:'var(--radius-md)'}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:12,color:'var(--accent-blue)'}}>编辑素材</div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  <input 
                    className="input-field" 
                    placeholder="素材标题..." 
                    value={editingClip.title} 
                    onChange={e=>setEditingClip(p=>({...p,title:e.target.value}))}
                  />
                  <textarea 
                    className="input-field" 
                    rows={6} 
                    placeholder="素材内容..." 
                    value={editingClip.content} 
                    onChange={e=>setEditingClip(p=>({...p,content:e.target.value}))}
                    style={{resize:'vertical',fontFamily:'var(--font-serif)',lineHeight:1.6}}
                  />
                  <input 
                    className="input-field" 
                    placeholder="来源（可选）..." 
                    value={editingClip.source} 
                    onChange={e=>setEditingClip(p=>({...p,source:e.target.value}))}
                  />
                  <input 
                    className="input-field" 
                    placeholder="标签（逗号分隔，可选）..." 
                    value={editingClip.tags} 
                    onChange={e=>setEditingClip(p=>({...p,tags:e.target.value}))}
                  />
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-primary btn-sm" onClick={handleEditClip}>保存</button>
                    <button className="btn btn-secondary btn-sm" onClick={()=>setEditingClip(null)}>取消</button>
                  </div>
                </div>
              </div>
            )}

            {clips.length === 0 && !showAddForm && (
              <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>
                <div style={{fontSize:48,marginBottom:12,opacity:.3}}>📚</div>
                <div style={{fontSize:14}}>暂无素材，使用上方快速摘录或点击"添加素材"开始收集</div>
              </div>
            )}

            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {clips.map((clip,i)=>(
                <div 
                  key={clip.id} 
                  className="paper-card"
                  style={{
                    cursor:'pointer',
                    border: selectedClip?.id===clip.id ? '1px solid var(--accent-amber)' : editingClip?.id===clip.id ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                    background: selectedClip?.id===clip.id || editingClip?.id===clip.id ? 'var(--bg-elevated)' : 'var(--bg-surface)'
                  }}
                  onClick={()=>{if(!editingClip) setSelectedClip(clip);}}
                >
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                        <span style={{fontSize:16}}>{clip.type==='auto'?'🤖':'✂️'}</span>
                        <div className="paper-title" style={{fontSize:14}}>{clip.title}</div>
                      </div>
                      <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:6}}>
                        {clip.source && <span>来源: {clip.source}</span>}
                        {clip.createdAt && <span style={{marginLeft:10}}>{new Date(clip.createdAt).toLocaleDateString()}</span>}
                      </div>
                      <div style={{
                        fontSize:13,
                        color:'var(--text-secondary)',
                        lineHeight:1.5,
                        overflow:'hidden',
                        textOverflow:'ellipsis',
                        display:'-webkit-box',
                        WebkitLineClamp:2,
                        WebkitBoxOrient:'vertical'
                      }}>
                        {clip.content}
                      </div>
                      {clip.tags?.length > 0 && (
                        <div className="paper-tags" style={{marginTop:6}}>
                          {clip.tags.map(t=><span key={t} className="paper-tag">{t}</span>)}
                        </div>
                      )}
                    </div>
                    <div style={{display:'flex',gap:6,flexShrink:0}}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={(e)=>{e.stopPropagation();startEdit(clip);}}
                        style={{color:'var(--accent-blue)'}}
                      >
                        编辑
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={(e)=>{e.stopPropagation();handleDeleteClip(clip.id);}}
                        style={{color:'var(--accent-pink)'}}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：素材详情 */}
        <div className="panel fade-in delay-2">
          <div className="panel-header"><Icons.Book/>素材详情</div>
          <div className="panel-body" style={{maxHeight:600,overflowY:'auto'}}>
            {selectedClip ? (
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                  <span style={{fontSize:24}}>{selectedClip.type==='auto'?'🤖':'✂️'}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:16,fontWeight:600,marginBottom:2}}>{selectedClip.title}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)'}}>
                      {selectedClip.type==='auto'?'自动提取':'手动添加'} · {new Date(selectedClip.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={()=>startEdit(selectedClip)}
                    style={{color:'var(--accent-blue)'}}
                  >
                    <Icons.Edit/>
                  </button>
                </div>
                
                {selectedClip.source && (
                  <div style={{marginBottom:12,padding:'8px 12px',background:'var(--bg-deep)',borderRadius:8,fontSize:12}}>
                    <span style={{color:'var(--text-muted)'}}>来源：</span>
                    <span style={{color:'var(--text-secondary)'}}>{selectedClip.source}</span>
                  </div>
                )}

                {selectedClip.tags?.length > 0 && (
                  <div className="paper-tags" style={{marginBottom:12}}>
                    {selectedClip.tags.map(t=><span key={t} className="paper-tag">{t}</span>)}
                  </div>
                )}

                <div style={{
                  padding:16,
                  background:'var(--bg-deep)',
                  borderRadius:'var(--radius-sm)',
                  border:'1px solid var(--border)',
                  fontSize:14,
                  lineHeight:1.8,
                  color:'var(--text-secondary)',
                  fontFamily:'var(--font-serif)',
                  whiteSpace:'pre-wrap',
                  wordBreak:'break-word'
                }}>
                  {selectedClip.content}
                </div>

                <div style={{marginTop:16,padding:12,background:'rgba(167,139,250,.06)',border:'1px solid rgba(167,139,250,.15)',borderRadius:8,fontSize:11,color:'var(--text-muted)'}}>
                  <div style={{marginBottom:4}}>💡 提示：</div>
                  <div>• 可以复制此素材用于论文写作</div>
                  <div>• 点击右上角编辑按钮可修改素材</div>
                  <div>• 后续版本将支持 AI 自动提取和分类</div>
                </div>
              </div>
            ) : (
              <div style={{textAlign:'center',padding:60,color:'var(--text-muted)'}}>
                <div style={{fontSize:48,marginBottom:12,opacity:.3}}>👈</div>
                <div style={{fontSize:14}}>点击左侧素材查看详情</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
