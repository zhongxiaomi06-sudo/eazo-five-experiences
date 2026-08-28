import { useEffect, useMemo, useRef, useState } from 'react';
import type { TimeBlock, Plan } from './domain';
import {
  DAY_MINUTES, categories, classifyLocally, comparisons, deleteAsOpenTime,
  formatTime, minutesOf, planFromDraft, resizeSharedBoundary, sanitizeForShare, splitBlock,
} from './domain';
import { listPlans, removePlan, savePlan } from './repository';
import { ProductionEazoAdapter } from './eazo';

type View = 'compose' | 'edit' | 'discover' | 'library';
const host = new ProductionEazoAdapter();
const inspirationDeck = [
  { id: 'slow', mark: '松', text: '睡到自然醒，做点奇怪又好玩的东西，出门散步，和朋友一起做饭' },
  { id: 'curious', mark: '奇', text: '读书，游泳，做一个小小的副业，给爸妈打电话，看天色变化' },
  { id: 'clear', mark: '净', text: '八小时睡眠，专注工作，一顿讲究的午饭，听音乐，完全不赶时间' },
  { id: 'outside', mark: '野', text: '在太阳升起前出门，坐一段没去过的公交，野餐，拍下五种蓝色' },
  { id: 'together', mark: '聚', text: '和喜欢的人吃早饭，一起做点东西，傍晚去市场，晚上围桌聊天' },
  { id: 'offline', mark: '静', text: '手机关机半天，慢慢写字，午睡，整理房间，听完整张专辑' },
];
const examples = inspirationDeck.slice(0, 3).map((item) => item.text);

const downloadJson = (name: string, value: unknown) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
};

function Logo() {
  return (
    <div className="brand" aria-label="Ideal Day Lab">
      <b>Ideal Day<span className="brand-dot" aria-hidden="true">.</span></b>
      <i>实验室</i>
    </div>
  );
}

function DayReel({ activeId, pickedIds, onPick }: { activeId: string | null; pickedIds: string[]; onPick: (id: string, prompt: string, label: string) => void }) {
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const moments = [
    { id: 'wake', src: './day-dawn.mp4', time: '06:40', label: '醒来', prompt: '晨光、慢咖啡、没有闹钟的醒来' },
    { id: 'make', src: './day-make.mp4', time: '11:20', label: '创作', prompt: '一段不被打断的创作时间' },
    { id: 'exhale', src: './day-focus.mp4', time: '20:10', label: '放松', prompt: '关掉通知，在夜色里慢慢收尾' },
  ];
  return (
    <figure className="day-reel" aria-label="从清晨仪式到专注创作的一日影像日记">
      <div className="day-reel-clips">
        {moments.map((moment, index) => (
          <button type="button" className={`day-clip${pickedIds.includes(moment.id) ? ' picked' : ''}${activeId === moment.id ? ' active' : ''}`} key={moment.src} aria-label={`加入“${moment.label}”灵感`} aria-pressed={pickedIds.includes(moment.id)} onClick={() => onPick(moment.id, moment.prompt, moment.label)}>
            {reduceMotion
              ? <img src="./day-parts.png" alt="" style={{ objectPosition: `${index * 50}% center` }} />
              : <video src={moment.src} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />}
            <b>{moment.time}</b><em>{moment.label}</em><i aria-hidden="true">{pickedIds.includes(moment.id) ? '✓' : '＋'}</i>
          </button>
        ))}
      </div>
      <figcaption><b>{pickedIds.length === moments.length ? '三幕已集齐，可以开场了' : '点选三幕，拍下你的一天'}</b><span>{String(pickedIds.length).padStart(2, '0')} / 03</span></figcaption>
    </figure>
  );
}

function Timeline({ blocks }: { blocks: TimeBlock[] }) {
  return (
    <div className="timeline-wrap">
      <div className="timeline" role="img" aria-label={blocks.map((block) => `${block.title}, ${minutesOf(block)} minutes`).join('. ')}>
        {blocks.map((block) => <div key={block.id} title={block.title} style={{ width: `${minutesOf(block) / 14.4}%`, background: categories[block.categoryId].color }} />)}
      </div>
      <div className="timeline-labels" aria-hidden="true"><span>12 AM</span><span>6</span><span>NOON</span><span>6</span><span>12 AM</span></div>
    </div>
  );
}

export function App() {
  const [view, setView] = useState<View>('compose');
  const [description, setDescription] = useState(examples[0]!);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [savedPlans, setSavedPlans] = useState<Plan[]>([]);
  const [snap, setSnap] = useState(5);
  const [notice, setNotice] = useState('准备就绪。你的文字只保存在本设备。');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<TimeBlock[][]>([]);
  const [future, setFuture] = useState<TimeBlock[][]>([]);
  const [lastDeleted, setLastDeleted] = useState<Plan | null>(null);
  const [sparkPage, setSparkPage] = useState(0);
  const [pickedMoments, setPickedMoments] = useState<string[]>([]);
  const [focusedMoment, setFocusedMoment] = useState<string | null>(null);
  const speechRequested = useRef(false);

  useEffect(() => { void listPlans().then(setSavedPlans).catch(() => setNotice('本地收藏暂时不可用，但你仍然可以设计并导出一天。')); }, []);
  useEffect(() => { host.requestResize(document.documentElement.scrollHeight); }, [view, plan]);

  const total = useMemo(() => plan?.blocks.reduce((sum, block) => sum + minutesOf(block), 0) ?? 0, [plan]);
  const openMinutes = useMemo(() => plan?.blocks.filter((block) => block.categoryId === 'unallocated').reduce((sum, block) => sum + minutesOf(block), 0) ?? 0, [plan]);
  const insights = useMemo(() => plan ? comparisons(plan).slice(0, 5) : [], [plan]);
  const visibleSparks = useMemo(() => [0, 1, 2].map((step) => inspirationDeck[(sparkPage + step) % inspirationDeck.length]!), [sparkPage]);

  const addIngredient = (ingredient: string, label: string, momentId?: string) => {
    setDescription((value) => value.includes(ingredient) ? value : `${value.trim()}${value.trim() ? '，' : ''}${ingredient}`);
    if (momentId) {
      setFocusedMoment(momentId);
      setPickedMoments((items) => {
        if (items.includes(momentId)) return items;
        const next = [...items, momentId];
        setNotice(next.length === 3 ? '三幕生活片段已集齐。现在，让这一天开场。' : `${label}已加入。还差 ${3 - next.length} 幕。`);
        return next;
      });
      return;
    }
    setNotice(`${label}已加入。再选一个，或直接生成你的 24 小时。`);
  };

  const generate = async () => {
    if (!description.trim()) { setNotice('至少写下你这一天想要的一个片段。'); return; }
    setBusy(true);
    const locale = await host.getLocale();
    const response = await Promise.race([
      host.classifyDay({ requestId: crypto.randomUUID(), locale, text: description.trim(), schemaVersion: 1 }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5_000)),
    ]);
    const next = response?.ok ? planFromDraft(response.value, description.trim(), locale) ?? classifyLocally(description.trim(), locale) : classifyLocally(description.trim(), locale);
    setPlan(next);
    setHistory([]);
    setFuture([]);
    setView('edit');
    setNotice(response?.ok && planFromDraft(response.value, description.trim(), locale) ? 'Eazo 已整理你的片段。保存前请逐段检查。' : '已在本地整理 —— 私密、可编辑，且刚好 1,440 分钟。');
    setBusy(false);
  };

  const commit = (blocks: TimeBlock[], message: string) => {
    if (!plan) return;
    setHistory((items) => [...items.slice(-49), plan.blocks]);
    setFuture([]);
    setPlan({ ...plan, blocks, updatedAt: new Date().toISOString() });
    setNotice(message);
  };

  const adjustBoundary = (index: number, delta: number) => {
    if (!plan) return;
    const result = resizeSharedBoundary(plan.blocks, index, plan.blocks[index]!.endMin + delta, snap);
    if (!result.ok) { setNotice('这样会和相邻的时间段重叠，没有做任何改动。'); return; }
    commit(result.blocks, `边界移动了 ${Math.abs(delta)} 分钟。这一天仍是 24 小时。`);
  };

  const updateBlock = (id: string, patch: Partial<TimeBlock>) => {
    if (!plan) return;
    commit(plan.blocks.map((block) => block.id === id ? { ...block, ...patch } : block), '时间段已更新。');
  };

  const split = (id: string) => {
    if (!plan) return;
    const result = splitBlock(plan.blocks, id, snap);
    if (!result.ok) {
      setNotice(result.code === 'TOO_MANY_BLOCKS'
        ? '这一天已达到时间段数量上限，请先合并一些。'
        : '这个时间段太短，无法拆分。先把它延长，再试一次。');
      return;
    }
    commit(result.blocks, '时间段已拆为两段。这一天仍是 24 小时。');
  };

  const undo = () => {
    if (!plan || !history.length) return;
    const previous = history.at(-1)!;
    setFuture((items) => [plan.blocks, ...items].slice(0, 50));
    setHistory((items) => items.slice(0, -1));
    setPlan({ ...plan, blocks: previous, updatedAt: new Date().toISOString() });
    setNotice('已撤销。');
  };

  const redo = () => {
    if (!plan || !future.length) return;
    const next = future[0]!;
    setHistory((items) => [...items, plan.blocks].slice(-50));
    setFuture((items) => items.slice(1));
    setPlan({ ...plan, blocks: next, updatedAt: new Date().toISOString() });
    setNotice('已重做。');
  };

  const save = async () => {
    if (!plan) return;
    const result = await savePlan(plan);
    if (!result.ok) { setNotice('收藏已满。请删除或替换 20 天中的某一天。'); setView('library'); return; }
    setSavedPlans(await listPlans());
    setNotice('已保存在本设备。');
  };

  const sharePlan = async () => {
    if (!plan) return;
    const publicData = sanitizeForShare(plan);
    const result = await host.share({ appId: 'ideal-day-lab', schemaVersion: 2, publicData: publicData as unknown as Record<string, unknown> });
    if (result.ok) setNotice('已在 Eazo 中打开。你的原话、标题和备注都不会被包含。');
    else {
      downloadJson('my-ideal-day.private-safe.json', publicData);
      setNotice('此处无法使用 Eazo，已下载一份隐私安全的改编文件。');
    }
  };

  const startVoice = () => {
    if (speechRequested.current) { setNotice('本次会话已请求过麦克风。继续手动输入，或刷新页面重试。'); return; }
    speechRequested.current = true;
    const Speech = (globalThis as typeof globalThis & { webkitSpeechRecognition?: new () => { lang: string; continuous: boolean; start(): void; onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void; onerror: () => void; onend: () => void } }).webkitSpeechRecognition;
    if (!Speech) { setNotice('当前浏览器不支持语音输入，但文字输入依然可用。'); return; }
    const recognition = new Speech();
    recognition.lang = navigator.language || 'zh-CN';
    recognition.continuous = false;
    recognition.onresult = (event) => setDescription((value) => `${value}${value ? ', ' : ''}${event.results[0]?.[0].transcript ?? ''}`);
    recognition.onerror = () => setNotice('麦克风被拒绝或中断，你的文字未受影响。');
    recognition.onend = () => setNotice('语音转写已加入，生成前请检查一下。');
    recognition.start();
    setNotice('正在聆听…… 音频永远不会写入磁盘。');
  };

  const duplicate = async (item: Plan) => {
    const copy = { ...item, planId: crypto.randomUUID(), title: `${item.title} — remix`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const result = await savePlan(copy);
    if (!result.ok) { setNotice('20 天的收藏已满，没有替换任何内容。'); return; }
    setSavedPlans(await listPlans());
    setNotice('改编已保存为新的一天。');
  };

  const goto = (target: View) => {
    if ((target === 'edit' || target === 'discover') && !plan) {
      setView('compose');
      setNotice(target === 'edit'
        ? '先描述你理想的一天 —— 然后就能在这里微调每一段。'
        : '先生成一天，再看它长达一年的规模。');
      return;
    }
    setView(target);
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">跳到主要内容</a>
      <header className="topbar">
        <Logo />
        <nav className="nav-pill" aria-label="主导航">
          <button aria-label="开始" className={view === 'compose' ? 'active' : ''} onClick={() => goto('compose')}><span className="nav-glyph" aria-hidden="true">✦</span><span className="nav-label">开始</span></button>
          <button aria-label="编辑一天" aria-disabled={!plan} className={view === 'edit' ? 'active' : ''} onClick={() => goto('edit')}><span className="nav-glyph" aria-hidden="true">◴</span><span className="nav-label">一天</span></button>
          <button aria-label="年度规模" aria-disabled={!plan} className={view === 'discover' ? 'active' : ''} onClick={() => goto('discover')}><span className="nav-glyph" aria-hidden="true">↗</span><span className="nav-label">规模</span></button>
          <button aria-label={`收藏，共 ${savedPlans.length} 个`} className={view === 'library' ? 'active' : ''} onClick={() => goto('library')}><span className="nav-glyph" aria-hidden="true">▣</span><span className="nav-label">收藏</span>{savedPlans.length > 0 && <span className="nav-count">{savedPlans.length}</span>}</button>
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
        <p className="live-region" role="status" aria-live="polite">{notice}</p>

        <div className="view" key={view}>
        {view === 'compose' && (
          <section className="compose-grid">
            <div className="intro">
              <p className="kicker">1,440 分钟</p>
              <h1>设计<em>属于你</em>的一天</h1>
              <p>写下几个片段，塑造成刚好 24 小时。</p>
              <div className="promise"><span>24</span><p><b>小时，完整守恒。</b><br />不评分，不评判。</p></div>
            </div>
            <div className="composer-card">
              <div className="card-label"><span>01</span><b>描述你的感受</b></div>
              <DayReel activeId={focusedMoment} pickedIds={pickedMoments} onPick={(id, prompt, label) => addIngredient(prompt, `“${label}”`, id)} />
              <label htmlFor="day-description">你理想的一天，应该有什么？</label>
              <textarea id="day-description" maxLength={2000} rows={7} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="睡到自然醒，做点有意思的事，随意走走……" />
              <div className="composer-meta"><span>{description.length} / 2,000</span><button type="button" className="voice" onClick={startVoice}>● 语音输入</button></div>
              <button className="build-button" disabled={busy || !description.trim()} onClick={() => void generate()}>{busy ? '正在塑造你的一天…' : '生成我的 24 小时'} <span>→</span></button>
              <p className="privacy">默认私密 · 原文永远不会进入分享</p>
              <div className="examples">
                <div className="examples-head"><span>抽三张生活签</span><button type="button" className="spark-shuffle" aria-label="换一组生活灵感" onClick={() => { setSparkPage((page) => (page + 3) % inspirationDeck.length); setNotice('换了一组生活签。'); }}>↻ 换一组</button></div>
                <div className="spark-track">{visibleSparks.map((item) => <button type="button" className="spark-card" aria-pressed={description.includes(item.text)} key={item.id} onClick={() => addIngredient(item.text, `“${item.mark}”签`)}><b aria-hidden="true">{item.mark}</b><span>{item.text}</span></button>)}</div>
              </div>
            </div>
          </section>
        )}

        {view === 'edit' && plan && (
          <section className="workspace">
            <div className="workspace-head">
              <div><p className="kicker">你的一天，全貌</p><input className="title-input" aria-label="计划标题" value={plan.title} maxLength={80} onChange={(event) => setPlan({ ...plan, title: event.target.value })} /></div>
              <div className="tools"><button onClick={undo} disabled={!history.length}>↶ 撤销</button><button onClick={redo} disabled={!future.length}>↷ 重做</button><button className="accent" onClick={() => void save()}>保存这一天</button></div>
            </div>
            <div className="conservation">
              <div><span>已安排</span><strong>{Math.floor(total / 60)} 时 {total % 60} 分</strong></div>
              <div><span>空闲</span><strong>{Math.floor(openMinutes / 60)} 时 {openMinutes % 60} 分</strong></div>
              <div><span>重叠</span><strong>0</strong></div>
              <div className="conserved"><span>状态</span><strong>{total === DAY_MINUTES ? '24 小时守恒 ✓' : '需要调整'}</strong></div>
            </div>
            <Timeline blocks={plan.blocks} />
            <div className="editor-toolbar"><h2>微调每一段</h2><label>吸附<select value={snap} onChange={(event) => setSnap(Number(event.target.value))}><option value="1">1 分钟</option><option value="5">5 分钟</option><option value="15">15 分钟</option><option value="30">30 分钟</option></select></label></div>
            <ol className="block-editor">
              {plan.blocks.map((block, index) => (
                <li key={block.id}>
                  <span className="color-dot" style={{ background: categories[block.categoryId].color }} />
                  <div className="block-copy"><input aria-label={`第 ${index + 1} 段的标题`} value={block.title} maxLength={80} onChange={(event) => updateBlock(block.id, { title: event.target.value })} /><select aria-label={`第 ${index + 1} 段 ${formatTime(block.startMin)}–${formatTime(block.endMin)} ${block.title} 的分类`} value={block.categoryId} onChange={(event) => updateBlock(block.id, { categoryId: event.target.value as TimeBlock['categoryId'] })}>{Object.entries(categories).map(([id, category]) => <option key={id} value={id}>{category.label}</option>)}</select></div>
                  <div className="time-copy"><strong>{formatTime(block.startMin)}–{formatTime(block.endMin)}</strong><span>{Math.floor(minutesOf(block) / 60)} 时 {minutesOf(block) % 60} 分</span></div>
                  <div className="boundary-actions">
                    <button aria-label={`将第 ${index + 1} 段 ${formatTime(block.startMin)}–${formatTime(block.endMin)} ${block.title} 缩短 ${snap} 分钟`} disabled={index === plan.blocks.length - 1} onClick={() => adjustBoundary(index, -snap)}>−</button>
                    <button aria-label={`将第 ${index + 1} 段 ${formatTime(block.startMin)}–${formatTime(block.endMin)} ${block.title} 延长 ${snap} 分钟`} disabled={index === plan.blocks.length - 1} onClick={() => adjustBoundary(index, snap)}>+</button>
                    <button aria-label={`把第 ${index + 1} 段 ${formatTime(block.startMin)}–${formatTime(block.endMin)} ${block.title} 拆成两段`} disabled={minutesOf(block) < 2 || plan.blocks.length >= 48} onClick={() => split(block.id)}>⇥</button>
                    <button aria-label={`把第 ${index + 1} 段 ${formatTime(block.startMin)}–${formatTime(block.endMin)} ${block.title} 变成空闲时间`} onClick={() => commit(deleteAsOpenTime(plan.blocks, block.id), `${block.title} 已变为空闲时间，可撤销。`)}>×</button>
                  </div>
                </li>
              ))}
            </ol>
            <div className="bottom-cta"><p><b>这里没有任何评分。</b><br />尽管改，直到它真的像你的一天。</p><button className="build-button" onClick={() => setView('discover')}>看看惊人的年度规模 <span>→</span></button></div>
          </section>
        )}

        {view === 'discover' && plan && (
          <section className="discover">
            <div className="discover-hero">
              <p className="kicker">把这一天重复过一年</p>
              <h1>微小的选择，累积成<em>惊人的规模。</em></h1>
              <p>下面每个数字都根据你当前的计划实时算出。点开一张卡片，就能看到单位、来源、公式和四舍五入方式。</p>
            </div>
            <div className="insight-grid">{insights.map((item, index) => <details key={item.id} open={index === 0}><summary><span>0{index + 1}</span><h2>{item.text}</h2><b>+</b></summary><p>{item.detail}</p></details>)}</div>
            <div className="share-panel"><div><p className="kicker">一份可以被别人改编的一天</p><h2>你的原话，始终私密。</h2><p>分享内容只包含分类、比例、颜色和对比项 ID。</p></div><div><button className="build-button" onClick={() => void sharePlan()}>通过 Eazo 分享 <span>↗</span></button><button onClick={() => downloadJson('my-ideal-day.json', sanitizeForShare(plan))}>导出安全 JSON</button></div></div>
          </section>
        )}

        {view === 'library' && (
          <section className="library">
            <div className="library-head"><div><p className="kicker">你的私密收藏</p><h1>值得一再回味的日子。</h1></div>{lastDeleted && <button onClick={() => void savePlan(lastDeleted).then(() => listPlans()).then(setSavedPlans).then(() => setLastDeleted(null))}>恢复上一次删除</button>}</div>
            {savedPlans.length === 0 ? <div className="empty"><span>00</span><h2>还没有保存任何一天。</h2><p>先生成一天，微调好，再保存到这里。最多可在本设备保留 20 天。</p><button className="accent" onClick={() => setView('compose')}>生成第一天</button></div> : <div className="plan-grid">{savedPlans.map((item) => <article key={item.planId}><p>{new Date(item.updatedAt).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</p><h2>{item.title}</h2><Timeline blocks={item.blocks} /><div><button onClick={() => { setPlan(item); setView('edit'); setNotice('已打开保存的一天。'); }}>打开</button><button onClick={() => void duplicate(item)}>改编</button><button onClick={() => void removePlan(item.planId).then(() => { setLastDeleted(item); return listPlans(); }).then(setSavedPlans)}>删除</button></div></article>)}</div>}
          </section>
        )}
        </div>
      </main>
      <footer><Logo /><p>为好奇而做，不为优化。<br />本地优先 · 离线可用 · 原生支持 Eazo 分享</p><button onClick={() => { setPlan(null); setView('compose'); }}>重新开始</button></footer>
    </div>
  );
}
