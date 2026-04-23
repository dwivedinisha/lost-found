import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API = 'https://lost-found-cvwr.onrender.com/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await axios.post(`${API}/register`, form);
      setSuccess(true);
      setMsg('Registered successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setSuccess(false);
      setMsg(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔍 Lost & Found</h2>
        <h3 style={styles.subtitle}>Create Account</h3>
        <input placeholder="Full Name" style={styles.input}
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" style={styles.input}
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" style={styles.input}
          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button style={styles.btn} onClick={handleSubmit}>Register</button>
        {msg && <p style={success ? styles.success : styles.error}>{msg}</p>}
        <p style={styles.link}>
          Already have an account? <Link to="/login" style={styles.anchor}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f4f8' },
  card: { background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '360px', display: 'flex', flexDirection: 'column', gap: '12px' },
  title: { textAlign: 'center', color: '#f59e0b' },
  subtitle: { textAlign: 'center', color: '#374151' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px' },
  btn: { padding: '10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
  error: { color: 'red', textAlign: 'center' },
  success: { color: 'green', textAlign: 'center' },
  link: { textAlign: 'center' },
  anchor: { color: '#f59e0b', fontWeight: 'bold' }
};