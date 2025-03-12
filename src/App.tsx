import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStar, FaRegStar, FaTrashAlt, FaPalette } from 'react-icons/fa';
import './App.scss';

interface Note {
  id: number;
  title: string;
  content: string;
  color: string;
  is_favorite: boolean;
}

const colorOptions: string[] = [
  '#E2FFFA', // Verde-água bem claro
  '#FEE3E3', // Rosado claro
  '#FFE2C3', // Laranja claro
  '#D1F1FF', // Azul claro
  '#E5D4FE', // Roxo claro
  '#F2F1B9', // Amarelo clarinho
  '#FFD1F1', // Rosa clarinho
  '#FFC0B3', // Coral
  '#F4F4F4', // Cinza bem claro
  '#EAEAEA', // Cinza claro
  '#BCBCBC', // Cinza médio
  '#E0C28B', // Bege/dourado
];

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Carrega as notas ao montar o componente
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get<Note[]>('http://localhost:3001/api/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
    }
  };

  const createNote = async () => {
    if (!title.trim()) return;
    try {
      const response = await axios.post<Note>('http://localhost:3001/api/notes', {
        title,
        content,
        color: selectedColor,
      });
      setNotes((prev) => [response.data, ...prev]);
      setTitle('');
      setContent('');
      setSelectedColor(colorOptions[0]);
    } catch (error) {
      console.error('Erro ao criar nota:', error);
    }
  };

  const updateNote = async (note: Note) => {
    try {
      await axios.put(`http://localhost:3001/api/notes/${note.id}`, note);
      // Atualiza a lista local
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
    }
  };

  const toggleFavorite = (note: Note) => {
    const updatedNote = { ...note, is_favorite: !note.is_favorite };
    updateNote(updatedNote);
  };

  // Filtra notas pelo termo de busca (no título ou conteúdo)
  const filteredNotes = notes.filter((note) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      note.title.toLowerCase().includes(lowerSearch) ||
      note.content.toLowerCase().includes(lowerSearch)
    );
  });

  // Separa favoritos e não-favoritos
  const favoriteNotes = filteredNotes.filter((note) => note.is_favorite);
  const otherNotes = filteredNotes.filter((note) => !note.is_favorite);

  return (
    <div className="app-container">
      <header>
        <h1>CoreNotes</h1>
        <input
          type="text"
          placeholder="Pesquisar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </header>

      <div className="new-note-container">
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Conteúdo"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="color-picker">
          <FaPalette />
          <div className="color-options">
            {colorOptions.map((color) => (
              <span
                key={color}
                className="color-circle"
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>
        <button onClick={createNote}>Adicionar Nota</button>
      </div>

      <div className="notes-section">
        {favoriteNotes.length > 0 && (
          <section>
            <h2>Favoritos</h2>
            <div className="notes-grid">
              {favoriteNotes.map((note) => (
                <div
                  key={note.id}
                  className="note-card"
                  style={{ backgroundColor: note.color }}
                >
                  <div className="note-header">
                    <input
                      type="text"
                      value={note.title}
                      onChange={(e) =>
                        updateNote({ ...note, title: e.target.value })
                      }
                    />
                    <button onClick={() => toggleFavorite(note)}>
                      {note.is_favorite ? <FaStar color="#ffc107" /> : <FaRegStar />}
                    </button>
                  </div>
                  <textarea
                    value={note.content}
                    onChange={(e) =>
                      updateNote({ ...note, content: e.target.value })
                    }
                  />
                  <div className="note-footer">
                    <div className="color-picker-inline">
                      <FaPalette />
                      <div className="color-options-inline">
                        {colorOptions.map((color) => (
                          <span
                            key={color}
                            className="color-circle"
                            style={{ backgroundColor: color }}
                            onClick={() =>
                              updateNote({ ...note, color: color })
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <button onClick={() => deleteNote(note.id)}>
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2>Outros</h2>
          <div className="notes-grid">
            {otherNotes.map((note) => (
              <div
                key={note.id}
                className="note-card"
                style={{ backgroundColor: note.color }}
              >
                <div className="note-header">
                  <input
                    type="text"
                    value={note.title}
                    onChange={(e) =>
                      updateNote({ ...note, title: e.target.value })
                    }
                  />
                  <button onClick={() => toggleFavorite(note)}>
                    {note.is_favorite ? <FaStar color="#ffc107" /> : <FaRegStar />}
                  </button>
                </div>
                <textarea
                  value={note.content}
                  onChange={(e) =>
                    updateNote({ ...note, content: e.target.value })
                  }
                />
                <div className="note-footer">
                  <div className="color-picker-inline">
                    <FaPalette />
                    <div className="color-options-inline">
                      {colorOptions.map((color) => (
                        <span
                          key={color}
                          className="color-circle"
                          style={{ backgroundColor: color }}
                          onClick={() =>
                            updateNote({ ...note, color: color })
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <button onClick={() => deleteNote(note.id)}>
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
