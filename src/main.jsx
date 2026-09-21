import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays, Check, Circle, ListFilter, Plus, Sparkles, Trash2 } from 'lucide-react';
import './styles.css';

const dayMs = 86400000;
const offsetDate = days => new Date(Date.now() + days * dayMs).toISOString().slice(0, 10);
const seed = [
  { id: 1, text: 'Ship something delightfully small', done: false, tag: 'Build', due: offsetDate(1) },
  { id: 2, text: 'Take a proper chai break', done: true, tag: 'Life', due: null },
  { id: 3, text: 'Write down one wild idea', done: false, tag: 'Ideas', due: offsetDate(4) }
];
const filters = ['All', 'Active', 'Done'];

function dueInfo(due) {
  if (!due) return null;
  const date = new Date(due + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((date - today) / dayMs);
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diff < 0) return { text: `Overdue · ${label}`, tone: 'overdue' };
  if (diff === 0) return { text: 'Due today', tone: 'today' };
  if (diff === 1) return { text: 'Due tomorrow', tone: 'upcoming' };
  return { text: `Due ${label}`, tone: 'upcoming' };
}

function App() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('pocket-todos') || 'null') || seed);
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [filter, setFilter] = useState('All');
  useEffect(() => localStorage.setItem('pocket-todos', JSON.stringify(tasks)), [tasks]);
  const visible = useMemo(() => tasks.filter(t => filter === 'All' || (filter === 'Done' ? t.done : !t.done)), [tasks, filter]);
  const done = tasks.filter(t => t.done).length;
  const add = e => {
    e.preventDefault();
    if (!text.trim()) return;
    setTasks([{ id: Date.now(), text: text.trim(), done: false, tag: 'New', due: due || null }, ...tasks]);
    setText('');
    setDue('');
  };
  const toggle = id => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = id => setTasks(tasks.filter(t => t.id !== id));
  const clearDone = () => setTasks(tasks.filter(t => !t.done));

  return <main className="shell">
    <section className="app-card">
      <header>
        <div className="eyebrow"><Sparkles size={15}/> Tiny wins, big mood</div>
        <h1>Pocket Todos</h1>
        <p>Keep today light. Capture a task, tap it done, carry on.</p>
      </header>

      <form onSubmit={add} className="add-form">
        <input aria-label="New task" value={text} onChange={e => setText(e.target.value)} placeholder="What needs doing?" maxLength={100}/>
        <input aria-label="Due date (optional)" className="due-input" type="date" value={due} onChange={e => setDue(e.target.value)}/>
        <button aria-label="Add task"><Plus size={21}/><span>Add</span></button>
      </form>

      <div className="toolbar">
        <div className="filters" aria-label="Filter tasks">
          <ListFilter size={16}/>
          {filters.map(f => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>)}
        </div>
        <span className="count">{done}/{tasks.length} done</span>
      </div>

      <div className="progress"><span style={{width: tasks.length ? `${done/tasks.length*100}%` : '0%'}}/></div>

      <ul className="task-list">
        {visible.map(task => { const info = dueInfo(task.due); return <li key={task.id} className={task.done ? 'done' : ''}>
          <button className="check" aria-label={task.done ? 'Mark active' : 'Mark done'} onClick={() => toggle(task.id)}>
            {task.done ? <Check size={17}/> : <Circle size={19}/>} 
          </button>
          <button className="task-copy" onClick={() => toggle(task.id)}>
            <span>{task.text}</span>
            <small>{task.tag}{info && <em className={`due due-${info.tone}`}><CalendarDays size={11}/>{info.text}</em>}</small>
          </button>
          <button className="delete" aria-label="Delete task" onClick={() => remove(task.id)}><Trash2 size={17}/></button>
        </li>; })}
        {!visible.length && <li className="empty"><Sparkles size={24}/><strong>Nothing here.</strong><span>Your list has room to breathe.</span></li>}
      </ul>

      <footer>
        <span>{tasks.length - done} left for later</span>
        <button onClick={clearDone} disabled={!done}>Clear completed</button>
      </footer>
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
