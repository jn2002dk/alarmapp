import React, { useState } from 'react';
import './App.css';

function Admin({ isOpen, onClose }) {
  const [pass, setPass] = useState('');
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/listUsers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass }),
      });
      if (!res.ok) {
        setError(`Failed to list users: ${res.status}`);
        setLoading(false);
        return;
      }
      const body = await res.json();
      setUsers(body.users || []);
    } catch (err) {
      setError('Network error fetching users');
    }
    setLoading(false);
  };

  const revoke = async (userId) => {
    try {
      const res = await fetch('/api/admin/revokeDevice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass, userId }),
      });
      if (!res.ok) {
        setError(`Failed to revoke: ${res.status}`);
        return;
      }
      // Refresh list
      await fetchUsers();
    } catch (err) {
      setError('Network error revoking device');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content admin-content">
        <h3>Admin Panel</h3>
        <p>Provide admin passcode to list and manage user devices.</p>
        <input value={pass} onChange={(e) => setPass(e.target.value)} placeholder="admin pass" className="modal-input" />
        <div className="modal-actions">
          <button onClick={fetchUsers} className="modal-button">List Users</button>
          <button onClick={onClose} className="modal-button cancel">Close</button>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="modal-error">{error}</p>}
        {users && (
          <div className="admin-list">
            {users.map(u => (
              <div key={u.userId} className="admin-user-row">
                <div>
                  <strong>{u.userName || u.userId}</strong>
                  <div>ID: {u.userId}</div>
                  <div>First: {u.firstSeen}</div>
                  <div>Last: {u.lastActive}</div>
                  <div>Verified: {u.verifiedAt || 'no'}</div>
                </div>
                <div>
                  <button onClick={() => revoke(u.userId)} className="modal-button cancel">Revoke Device</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
