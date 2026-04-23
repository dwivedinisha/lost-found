import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    itemName: '', description: '', type: 'Lost',
    location: '', date: '', contactInfo: ''
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    setUser(JSON.parse(localStorage.getItem('user')));
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await axios.get(`${API}/items`, { headers });
      setItems(data);
    } catch {
      localStorage.clear();
      navigate('/login');
    }
  };

  const addItem = async () => {
    try {
      await axios.post(`${API}/items`, form, { headers });
      setMsg('Item reported successfully!');
      setForm({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' });
      fetchItems();
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error adding item');
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API}/items/${id}`, { headers });
      setMsg('Item deleted!');
      fetchItems();
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error deleting item');
    }
  };

  const startEdit = (item) => {
    setEditItem(item._id);
    setForm({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      location: item.location,
      date: item.date?.slice(0, 10),
      contactInfo: item.contactInfo
    });
  };

  const updateItem = async () => {
    try {
      await axios.put(`${API}/items/${editItem}`, form, { headers });
      setMsg('Item updated!');
      setEditItem(null);
      setForm({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' });
      fetchItems();
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error updating item');
    }
  };

  const searchItems = async () => {
    try {
      if (!search.trim()) { fetchItems(); return; }
      const { data } = await axios.get(`${API}/items/search?name=${search}`, { headers });
      setItems(data);
    } catch {
      setMsg('Search failed');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>🔍 Lost & Found System</h2>
          <div>
            <span style={styles.welcome}>👋 {user?.name}</span>
            <button style={styles.logoutBtn} onClick={logout}>Logout</button>
          </div>
        </div>

        {/* Add / Edit Item Form */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>
            {editItem ? '✏️ Update Item' : '➕ Report Item'}
          </h3>
          <div style={styles.formGrid}>
            <input placeholder="Item Name" style={styles.input}
              value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} />
            <input placeholder="Description" style={styles.input}
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <select style={styles.input} value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
            <input placeholder="Location" style={styles.input}
              value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <input type="date" style={styles.input}
              value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <input placeholder="Contact Info" style={styles.input}
              value={form.contactInfo} onChange={e => setForm({ ...form, contactInfo: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button style={styles.btn} onClick={editItem ? updateItem : addItem}>
              {editItem ? 'Update Item' : 'Report Item'}
            </button>
            {editItem && (
              <button style={styles.cancelBtn} onClick={() => { setEditItem(null); setForm({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' }); }}>
                Cancel
              </button>
            )}
          </div>
          {msg && <p style={styles.success}>{msg}</p>}
        </div>

        {/* Search */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>🔎 Search Items</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input placeholder="Search by item name..." style={{ ...styles.input, flex: 1 }}
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchItems()} />
            <button style={styles.btn} onClick={searchItems}>Search</button>
            <button style={styles.cancelBtn} onClick={() => { setSearch(''); fetchItems(); }}>Clear</button>
          </div>
        </div>

        {/* Items List */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>📋 All Reported Items ({items.length})</h3>
          {items.length === 0 ? (
            <p style={styles.empty}>No items found</p>
          ) : (
            items.map(item => (
              <div key={item._id} style={styles.itemCard}>
                <div style={styles.itemLeft}>
                  <span style={item.type === 'Lost' ? styles.badgeLost : styles.badgeFound}>
                    {item.type}
                  </span>
                  <div style={{ marginLeft: '12px' }}>
                    <p style={styles.itemName}>{item.itemName}</p>
                    <p style={styles.itemMeta}>📍 {item.location} • 📞 {item.contactInfo}</p>
                    <p style={styles.itemMeta}>📅 {new Date(item.date).toLocaleDateString()}</p>
                    {item.description && <p style={styles.itemDesc}>{item.description}</p>}
                  </div>
                </div>
                <div style={styles.itemActions}>
                  <button style={styles.editBtn} onClick={() => startEdit(item)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => deleteItem(item._id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '1rem' },
  wrapper: { maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  title: { color: '#f59e0b' },
  welcome: { marginRight: '1rem', color: '#374151' },
  logoutBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  card: { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  sectionTitle: { color: '#374151', marginBottom: '1rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', width: '100%' },
  btn: { padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  cancelBtn: { padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  success: { color: 'green', marginTop: '8px' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: '1rem' },
  itemCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem', borderBottom: '1px solid #f3f4f6', gap: '10px' },
  itemLeft: { display: 'flex', alignItems: 'flex-start', flex: 1 },
  itemName: { fontWeight: '600', color: '#111827', fontSize: '16px' },
  itemMeta: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  itemDesc: { fontSize: '13px', color: '#9ca3af', marginTop: '4px', fontStyle: 'italic' },
  itemActions: { display: 'flex', gap: '8px', flexShrink: 0 },
  editBtn: { padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  deleteBtn: { padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  badgeLost: { background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' },
  badgeFound: { background: '#d1fae5', color: '#059669', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }
};