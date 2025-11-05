import { useEffect, useState } from 'react'
import './App.css'

// Prefer env; fallback to /api so we can use Vite proxy
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

function App() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved) return saved
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    } catch {}
    return 'light'
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => { fetchNotes() }, [])

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  async function fetchNotes() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/notes`, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`Failed to fetch notes: ${res.status}`)
      const data = await res.json()
      setNotes(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    const payload = { title: title.trim(), description: description.trim() }
    if (!payload.title && !payload.description) {
      setError('Please enter a title or description')
      setFormLoading(false)
      return
    }

    try {
      let res
      if (editingId) {
        // PATCH /notes/:id
        res = await fetch(`${API_BASE}/notes/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        // POST /notes
        res = await fetch(`${API_BASE}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      await fetchNotes()
      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this note?')) return
    try {
      // DELETE /notes/:id  (no body)
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      setNotes((prev) => prev.filter((n) => (n.id ?? n._id ?? n._doc?.id) !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  function handleEdit(note) {
    const id = note.id ?? note._id ?? note._doc?.id ?? null
    setEditingId(id)
    setTitle(note.title ?? '')
    setDescription(note.description ?? '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-container">
      <header>
        <div className="header-top">
          <h1>Notes App</h1>
          <div className="header-controls">
            <button
              className="theme-toggle"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
        <p className="subtitle">Create, update and delete notes (UI only). Uses backend for storage.</p>
      </header>

      <main>
        <section className="note-form">
          <h2>{editingId ? 'Edit Note' : 'Create Note'}</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short title"
              />
            </label>

            <label>
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the note"
                rows={4}
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="primary" disabled={formLoading}>
                {formLoading ? (editingId ? 'Updating...' : 'Creating...') : editingId ? 'Update Note' : 'Create Note'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
          {error && <div className="error">{error}</div>}
        </section>

        <section className="notes-list">
          <h2>All Notes</h2>
          {loading ? (
            <div>Loading notes…</div>
          ) : notes && notes.length ? (
            <div className="notes-grid">
              {notes.map((n) => {
                const id = n.id ?? n._id ?? n._doc?.id
                return (
                  <article className="note-card" key={id}>
                    <h3 className="note-title">{n.title || <em>(No title)</em>}</h3>
                    <p className="note-desc">{n.description}</p>
                    <div className="note-actions">
                      <button onClick={() => handleEdit(n)}>Update</button>
                      <button className="danger" onClick={() => handleDelete(id)}>Delete</button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty">No notes yet. Create one above.</div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
