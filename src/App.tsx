import { useState, useRef } from "react";

// ===== 型定義 =====
type Priority = "高" | "中" | "低";
type Filter = "すべて" | "未完了" | "完了";

interface Todo {
  id: number;
  text: string;
  done: boolean;
  priority: Priority;
  createdAt: number;
}

// ===== 定数 =====
const FILTERS: Filter[] = ["すべて", "未完了", "完了"];
const PRIORITIES: Priority[] = ["高", "中", "低"];
const PRIORITY_COLOR: Record<Priority, string> = {
  高: "#ef4444",
  中: "#f59e0b",
  低: "#6ee7b7",
};

let nextId = 1;
function generateId() {
  return nextId++;
}

const INITIAL_TODOS: Todo[] = [
  { id: generateId(), text: "Reactの基礎を復習する", done: false, priority: "高", createdAt: Date.now() - 3600000 },
  { id: generateId(), text: "TypeScriptの型を理解する", done: false, priority: "中", createdAt: Date.now() - 7200000 },
  { id: generateId(), text: "ポートフォリオを更新する", done: true, priority: "低", createdAt: Date.now() - 86400000 },
];

// ===== メインコンポーネント =====
export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS);
  const [input, setInput] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("中");
  const [filter, setFilter] = useState<Filter>("すべて");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [shake, setShake] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = todos.filter(t => {
    if (filter === "未完了") return !t.done;
    if (filter === "完了") return t.done;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const order: Record<Priority, number> = { 高: 0, 中: 1, 低: 2 };
    if (a.done !== b.done) return a.done ? 1 : -1;
    return order[a.priority] - order[b.priority];
  });

  const addTodo = () => {
    if (!input.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setTodos(prev => [
      { id: generateId(), text: input.trim(), done: false, priority, createdAt: Date.now() },
      ...prev,
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const commitEdit = (id: number) => {
    if (!editText.trim()) return;
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: editText.trim() } : t));
    setEditingId(null);
  };

  const doneCount = todos.filter(t => t.done).length;
  const progress = todos.length === 0 ? 0 : Math.round((doneCount / todos.length) * 100);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f13",
      fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 16px 80px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-6px); }
          40%,80% { transform: translateX(6px); }
        }
        @keyframes progressFill {
          from { width: 0%; }
        }

        .todo-item {
          animation: fadeIn 0.25s ease both;
          transition: opacity 0.2s;
        }
        .todo-item:hover .delete-btn { opacity: 1 !important; }
        .todo-item:hover { background: #1e1e28 !important; }

        .add-btn:hover { background: #f97316 !important; transform: scale(1.04); }
        .add-btn:active { transform: scale(0.97); }
        .add-btn { transition: all 0.15s; }

        .filter-btn { transition: all 0.15s; }
        .filter-btn:hover { opacity: 1 !important; }

        .shake { animation: shake 0.4s ease; }

        .checkbox { transition: all 0.2s; cursor: pointer; }
        .checkbox:hover { border-color: #f97316 !important; }

        .delete-btn { transition: opacity 0.15s, transform 0.15s; }
        .delete-btn:hover { transform: scale(1.2) !important; }

        input:focus { outline: none; }
      `}</style>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 600, marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#f97316", letterSpacing: "0.15em", textTransform: "uppercase" }}>Task Manager</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#f5f5f0", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
          やること<span style={{ color: "#f97316" }}>.</span>
        </h1>

        {/* Progress bar */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#666", fontFamily: "'Space Mono', monospace" }}>進捗</span>
            <span style={{ fontSize: 12, color: "#f97316", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>
              {doneCount}/{todos.length} ({progress}%)
            </span>
          </div>
          <div style={{ height: 4, background: "#1e1e28", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #f97316, #ef4444)",
              borderRadius: 2,
              transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div style={{ width: "100%", maxWidth: 600, marginBottom: 28 }}>
        <div
          className={shake ? "shake" : ""}
          style={{
            display: "flex",
            background: "#16161f",
            border: "1.5px solid #2a2a38",
            borderRadius: 12,
            overflow: "hidden",
            transition: "border-color 0.2s",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
          onBlur={e => (e.currentTarget.style.borderColor = "#2a2a38")}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
            placeholder="新しいタスクを入力..."
            style={{
              flex: 1,
              padding: "14px 16px",
              background: "transparent",
              border: "none",
              color: "#f5f5f0",
              fontSize: 15,
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          />
          {/* Priority selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 10px", borderLeft: "1px solid #2a2a38" }}>
            {PRIORITIES.map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: "1.5px solid",
                  borderColor: priority === p ? PRIORITY_COLOR[p] : "#2a2a38",
                  background: priority === p ? PRIORITY_COLOR[p] + "22" : "transparent",
                  color: priority === p ? PRIORITY_COLOR[p] : "#555",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className="add-btn"
            onClick={addTodo}
            style={{
              padding: "0 20px",
              background: "#f97316",
              border: "none",
              color: "#fff",
              fontSize: 20,
              fontWeight: 700,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ width: "100%", maxWidth: 600, display: "flex", gap: 4, marginBottom: 20 }}>
        {FILTERS.map(f => (
          <button
            key={f}
            className="filter-btn"
            onClick={() => setFilter(f)}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "1.5px solid",
              borderColor: filter === f ? "#f97316" : "#2a2a38",
              background: filter === f ? "#f9731611" : "transparent",
              color: filter === f ? "#f97316" : "#666",
              fontSize: 13,
              fontWeight: filter === f ? 700 : 400,
              cursor: "pointer",
              opacity: filter === f ? 1 : 0.7,
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            {f}
            <span style={{
              marginLeft: 6,
              fontSize: 11,
              fontFamily: "'Space Mono', monospace",
              color: filter === f ? "#f97316" : "#444",
            }}>
              {f === "すべて" ? todos.length : f === "未完了" ? todos.filter(t => !t.done).length : todos.filter(t => t.done).length}
            </span>
          </button>
        ))}
      </div>

      {/* Todo list */}
      <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#444",
            fontSize: 14,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "0.05em",
          }}>
            {filter === "完了" ? "完了したタスクなし" : "タスクなし 🎉"}
          </div>
        )}
        {sorted.map((todo, i) => (
          <div
            key={todo.id}
            className="todo-item"
            style={{
              background: "#13131a",
              border: "1.5px solid",
              borderColor: todo.done ? "#1e1e28" : "#22222f",
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: todo.done ? 0.55 : 1,
              animationDelay: `${i * 0.04}s`,
              position: "relative",
            }}
          >
            {/* Priority dot */}
            <div style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: PRIORITY_COLOR[todo.priority],
              flexShrink: 0,
              boxShadow: `0 0 6px ${PRIORITY_COLOR[todo.priority]}99`,
            }} />

            {/* Checkbox */}
            <div
              className="checkbox"
              onClick={() => toggleTodo(todo.id)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                border: "1.5px solid",
                borderColor: todo.done ? "#f97316" : "#3a3a50",
                background: todo.done ? "#f97316" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {todo.done && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            {/* Text / Edit */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingId === todo.id ? (
                <input
                  autoFocus
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onBlur={() => commitEdit(todo.id)}
                  onKeyDown={e => {
                    if (e.key === "Enter") commitEdit(todo.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  style={{
                    width: "100%",
                    background: "#1e1e28",
                    border: "1px solid #f97316",
                    borderRadius: 6,
                    padding: "4px 8px",
                    color: "#f5f5f0",
                    fontSize: 14,
                    fontFamily: "'Noto Sans JP', sans-serif",
                  }}
                />
              ) : (
                <span
                  onDoubleClick={() => !todo.done && startEdit(todo)}
                  style={{
                    fontSize: 14,
                    color: todo.done ? "#555" : "#d5d5cc",
                    textDecoration: todo.done ? "line-through" : "none",
                    cursor: todo.done ? "default" : "text",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                  }}
                >
                  {todo.text}
                </span>
              )}
            </div>

            {/* Priority badge */}
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'Space Mono', monospace",
              color: PRIORITY_COLOR[todo.priority],
              background: PRIORITY_COLOR[todo.priority] + "18",
              border: `1px solid ${PRIORITY_COLOR[todo.priority]}44`,
              borderRadius: 4,
              padding: "2px 6px",
              flexShrink: 0,
            }}>
              {todo.priority}
            </span>

            {/* Delete */}
            <button
              className="delete-btn"
              onClick={() => deleteTodo(todo.id)}
              style={{
                opacity: 0,
                background: "none",
                border: "none",
                color: "#ef4444",
                cursor: "pointer",
                fontSize: 16,
                padding: "2px 4px",
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      {todos.length > 0 && (
        <div style={{
          marginTop: 32,
          fontSize: 11,
          color: "#333",
          fontFamily: "'Space Mono', monospace",
          letterSpacing: "0.05em",
          textAlign: "center",
        }}>
          ダブルクリックで編集 · チェックで完了 · ×で削除
        </div>
      )}
    </div>
  );
}
