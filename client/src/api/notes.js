import api from './axios';

export async function getNotesApi() {
  const response = await api.get('/api/notes');
  return response.data.data;
}

export async function getNoteByIdApi(id) {
  const response = await api.get(`/api/notes/${id}`);
  return response.data.data;
}

export async function createNoteApi(title, content) {
  const response = await api.post('/api/notes', { title, content });
  return response.data.data;
}

export async function updateNoteApi(id, title, content) {
  const response = await api.put(`/api/notes/${id}`, { title, content });
  return response.data.data;
}

export async function deleteNoteApi(id) {
  const response = await api.delete(`/api/notes/${id}`);
  return response.data;
}

export async function searchNotesApi(query) {
  const response = await api.get('/api/notes/search', {
    params: { q: query },
  });
  return response.data.data;
}

export async function importNotesApi(notes) {
  const results = [];
  for (const note of notes) {
    const created = await createNoteApi(note.title, note.content);
    results.push(created);
  }
  return results;
}
