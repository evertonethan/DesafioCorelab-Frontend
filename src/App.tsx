import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaStar, FaRegStar, FaTrashAlt, FaPalette, FaPlus, FaSearch, FaTimes, FaPencilAlt } from 'react-icons/fa';
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
  const [isLoading, setIsLoading] = useState(true);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Carrega as notas ao montar o componente
  useEffect(() => {
    fetchNotes();
  }, []);

  // Efeito para fechar o formulário quando clicado fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node) && showNewNoteForm) {
        setShowNewNoteForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNewNoteForm]);

  // Limpa mensagens de erro/sucesso após 3 segundos
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Note[]>('http://localhost:3001/api/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      setErrorMessage('Não foi possível carregar as notas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async () => {
    if (!title.trim()) {
      setErrorMessage('O título não pode estar vazio');
      return;
    }

    try {
      const response = await axios.post<Note>('http://localhost:3001/api/notes', {
        title,
        content,
        color: selectedColor,
      });

      // Adiciona a nova nota com efeito de animação
      setNotes((prev) => [response.data, ...prev]);

      // Limpa o formulário
      setTitle('');
      setContent('');
      setSelectedColor(colorOptions[0]);
      setShowNewNoteForm(false);

      // Mensagem de sucesso
      setSuccessMessage('Nota criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar nota:', error);
      setErrorMessage('Não foi possível criar a nota. Tente novamente.');
    }
  };

  const updateNote = async (note: Note) => {
    try {
      await axios.put(`http://localhost:3001/api/notes/${note.id}`, note);
      // Atualiza a lista local
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      setErrorMessage('Não foi possível atualizar a nota. Tente novamente.');
    }
  };

  const deleteNote = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
      try {
        await axios.delete(`http://localhost:3001/api/notes/${id}`);
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setSuccessMessage('Nota excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar nota:', error);
        setErrorMessage('Não foi possível excluir a nota. Tente novamente.');
      }
    }
  };

  const toggleFavorite = (note: Note) => {
    const updatedNote = { ...note, is_favorite: !note.is_favorite };
    updateNote(updatedNote);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  const toggleEditMode = (noteId: number) => {
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
    } else {
      setEditingNoteId(noteId);
    }
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

  const renderNoteCard = (note: Note) => {
    const isEditing = editingNoteId === note.id;

    return (
      <div
        key={note.id}
        className="note-card fade-in"
        style={{ backgroundColor: note.color }}
      >
        <div className="note-header">
          <input
            type="text"
            value={note.title}
            onChange={(e) => updateNote({ ...note, title: e.target.value })}
            readOnly={!isEditing}
            style={{ cursor: isEditing ? 'text' : 'default' }}
          />
          <button
            onClick={() => toggleFavorite(note)}
            data-tooltip={note.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {note.is_favorite ? <FaStar color="#ffc107" /> : <FaRegStar />}
          </button>
        </div>
        <textarea
          value={note.content}
          onChange={(e) => updateNote({ ...note, content: e.target.value })}
          readOnly={!isEditing}
          style={{ cursor: isEditing ? 'text' : 'default' }}
        />
        <div className="note-footer">
          <div className="actions-group">
            <button
              className="edit-button"
              onClick={() => toggleEditMode(note.id)}
              data-tooltip={isEditing ? "Concluir edição" : "Editar nota"}
            >
              <FaPencilAlt />
            </button>
            <div className="color-picker-inline">
              <FaPalette />
              <div className="color-options-inline">
                {colorOptions.map((color) => (
                  <span
                    key={color}
                    className="color-circle"
                    style={{ backgroundColor: color }}
                    onClick={() => updateNote({ ...note, color: color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            className="delete-button"
            onClick={() => deleteNote(note.id)}
            data-tooltip="Excluir nota"
          >
            <FaTrashAlt />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Navbar com título e busca */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo-container">
            <img
              src="/1b27213540f22b3bda3ab0125bf1fd2f.png"
              alt="Logo"
              className="navbar-logo-image"
            />
            <h1 className="logo"><span>Core</span>Notes</h1>
          </div>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={handleSearchClear}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="main-content">
        {/* Botão para adicionar nova nota */}
        {!showNewNoteForm && (
          <button
            className="add-note-button"
            onClick={() => setShowNewNoteForm(true)}
          >
            <FaPlus /> Nova Nota
          </button>
        )}

        {/* Formulário para nova nota */}
        {showNewNoteForm && (
          <div className="new-note-container fade-in" ref={formRef}>
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
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
                    className={`color-circle ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button className="cancel-button" onClick={() => setShowNewNoteForm(false)}>
                Cancelar
              </button>
              <button className="create-button" onClick={createNote}>
                Adicionar Nota
              </button>
            </div>
          </div>
        )}

        {/* Mensagens de erro e sucesso */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Estado de carregamento */}
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="notes-section">
            {/* Notas favoritas */}
            {favoriteNotes.length > 0 && (
              <section>
                <h2>Favoritos</h2>
                <div className="notes-grid">
                  {favoriteNotes.map(renderNoteCard)}
                </div>
              </section>
            )}

            {/* Notas não-favoritas */}
            <section>
              <h2>{otherNotes.length === 0 && favoriteNotes.length === 0
                ? 'Nenhuma nota encontrada'
                : favoriteNotes.length > 0 ? 'Outros' : 'Notas'}</h2>
              <div className="notes-grid">
                {otherNotes.map(renderNoteCard)}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;