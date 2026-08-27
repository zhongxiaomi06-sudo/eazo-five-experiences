import { useMemo, useState } from 'react';
import { ExperienceShell, ResultCard } from '@eazo/ui';

type Block = { title: string; minutes: number; color: string };
const colors = ['#d8ff4f', '#ff6ca8', '#62d9ff', '#ad8cff', '#ffb84a'];

const makePlan = (value: string): Block[] => {
  const titles = value.split(/[,，]/).map((part) => part.trim()).filter(Boolean).slice(0, 5);
  const safeTitles = titles.length ? titles : ['Deep sleep', 'Make something', 'Wander outside', 'Eat slowly'];
  const base = Math.floor(1440 / safeTitles.length);
  return safeTitles.map((title, index) => ({ title, minutes: index === safeTitles.length - 1 ? 1440 - base * index : base, color: colors[index] ?? colors[0]! }));
};

export function App() {
  const [description, setDescription] = useState('Sleep deeply, make strange things, walk without a destination, eat with friends');
  const [plan, setPlan] = useState<Block[] | null>(null);
  const total = useMemo(() => plan?.reduce((sum, block) => sum + block.minutes, 0) ?? 0, [plan]);
  return (
    <ExperienceShell eyebrow="One planet. One day." title="Build a day you would actually steal." description="Describe the ingredients. We turn exactly 1,440 minutes into a day—and reveal its ridiculous scale." accent="#d8ff4f" status="D2-entry fixture">
      {!plan ? (
        <form className="panel stack" onSubmit={(event) => { event.preventDefault(); setPlan(makePlan(description)); }}>
          <label>What belongs in your ideal day?<textarea rows={4} maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          <button className="primary" type="submit">Build my 24 hours</button>
          <p className="hint">Separate ideas with commas. Nothing leaves this device.</p>
        </form>
      ) : (
        <ResultCard title="Your day has no spare atoms." kicker={`Exactly ${total.toLocaleString()} minutes. Repeated for a year, that is 525,600 minutes of being you.`} onAgain={() => setPlan(null)}>
          <div className="day-ring" role="img" aria-label={plan.map((block) => `${block.title}: ${block.minutes} minutes`).join(', ')} style={{ background: `conic-gradient(${plan.map((block, index) => `${block.color} ${plan.slice(0, index).reduce((sum, item) => sum + item.minutes, 0) / 14.4}% ${(plan.slice(0, index + 1).reduce((sum, item) => sum + item.minutes, 0)) / 14.4}%`).join(',')})` }} />
          <ol className="block-list">{plan.map((block) => <li key={block.title}><span style={{ background: block.color }} /><strong>{block.title}</strong><small>{block.minutes} min</small></li>)}</ol>
        </ResultCard>
      )}
    </ExperienceShell>
  );
}
