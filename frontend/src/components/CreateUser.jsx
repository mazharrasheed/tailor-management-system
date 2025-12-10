// UserManagement.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function UserManagement() {
  const { token } = useContext(AuthContext);
  const apiBase = "https://anmoltailor.pythonanywhere.com/api";

  const [users, setUsers] = useState([]);
  const [availablePerms, setAvailablePerms] = useState([]); // [{codename, name}]
  const [groups, setGroups] = useState([]); // [{id, name}]
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: null,
    username: "",
    email: "",
    password: "",
    permissions: [], // array of codenames
    groups: [] // array of group ids
  });
  const [message, setMessage] = useState("");

  // helpers for headers
  const getAuthHeaders = () => ({ Authorization: `Token ${token}` });

  // Initial loads
  useEffect(() => {
    loadAssignablePermissions();
    loadGroups();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAssignablePermissions = async () => {
    try {
      const res = await axios.get(`${apiBase}/users/me/permissions/`, { headers: getAuthHeaders() });
      // Expected: { username: "...", permissions: [{codename, name, app_label}, ...] }
      setAvailablePerms(res.data.permissions || []);
    } catch (err) {
      console.error("Failed to load permissions", err);
    }
  };

  const loadGroups = async () => {
    try {
      const res = await axios.get(`${apiBase}/groups/`, { headers: getAuthHeaders() });
      setGroups(res.data || []);
      console.log("Groups loaded:", res.data);
    } catch (err) {
      console.error("Failed to load groups", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/users/`, { headers: getAuthHeaders() });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  // form input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    setForm((f) => ({ ...f, password: e.target.value }));
  };

  const togglePermission = (codename) => {
    setForm((f) => {
      const exists = f.permissions.includes(codename);
      return { ...f, permissions: exists ? f.permissions.filter(p => p !== codename) : [...f.permissions, codename] };
    });
  };

  const handleGroupsChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value, 10));
    setForm((f) => ({ ...f, groups: selected }));
  };

  const resetForm = () => {
    setForm({
      id: null,
      username: "",
      email: "",
      password: "",
      permissions: [],
      groups: []
    });
    setMessage("");
  };

  const handleEdit = (user) => {
    setForm({
      id: user.id,
      username: user.username || "",
      email: user.email || "",
      password: "",
      permissions: (user.permission_details || []).map(p => p.codename),
      groups: (user.group_details || []).map(g => g.id)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const payload = {
      username: form.username,
      email: form.email,
      permissions: form.permissions,
      groups: form.groups
    };
    if (form.password) payload.password = form.password;

    try {
      if (form.id) {
        await axios.put(`${apiBase}/users/${form.id}/`, payload, { headers: getAuthHeaders() });
        setMessage("User updated successfully.");
      } else {
        await axios.post(`${apiBase}/users/`, payload, { headers: getAuthHeaders() });
        setMessage("User created successfully.");
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      const errText = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      console.error("Save error:", err);
      setMessage(`Save failed: ${errText}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${apiBase}/users/${id}/`, { headers: getAuthHeaders() });
      setMessage("User deleted.");
      fetchUsers();
    } catch (err) {
      console.error("Delete failed", err);
      setMessage("Delete failed.");
    }
  };

  return (
    <div className="container mt-3">
      <h2>User Management</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Username</label>
            <input name="username" value={form.username} onChange={handleChange} className="form-control" required />
          </div>

          <div className="col-md-4">
            <label className="form-label">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-4">
            <label className="form-label">
              {form.id ? "Password (optional – leave empty to keep current)" : "Password"}
            </label>
            <input
              name="password"
              type="password"
              placeholder={form.id ? "Leave empty to keep existing password" : ""}
              value={form.password}
              onChange={handlePasswordChange}
              className="form-control"
              {...(!form.id && { required: true })}
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-6">
            <label className="form-label">Permissions (assignable)</label>
            <div className="border rounded p-2" style={{ maxHeight: 180, overflowY: "auto" }}>
              {availablePerms.length === 0 && <div className="text-muted">No permissions available</div>}
              {availablePerms.map(perm => (
                <div className="form-check" key={perm.codename}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`perm_${perm.codename}`}
                    checked={form.permissions.includes(perm.codename)}
                    onChange={() => togglePermission(perm.codename)}
                  />
                  <label className="form-check-label" htmlFor={`perm_${perm.codename}`}>
                    {perm.name} <small className="text-muted">({perm.codename})</small>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Groups</label>
            <select
              multiple
              className="form-select"
              value={form.groups}
              onChange={handleGroupsChange}
              size={6}
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <small className="form-text text-muted">Hold Ctrl / Cmd to select multiple.</small>
          </div>
        </div>

        <div className="mt-3">
          <button type="submit" className="btn btn-primary me-2">
            {form.id ? "Update User" : "Create User"}
          </button>
          {form.id && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      <hr />

      <h4>Users</h4>
      {loading ? <p>Loading...</p> : (
        <table className="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Groups</th>
              <th>Permissions</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan="5" className="text-center text-muted">No users</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.username}{u.is_superuser && <span className="badge bg-success ms-2">super</span>}</td>
                <td>{u.email || <span className="text-muted">-</span>}</td>
                <td>
                  {u.group_details && u.group_details.length > 0
                    ? u.group_details.map(g => <span key={g.id} className="badge bg-secondary me-1">{g.name}</span>)
                    : <span className="text-muted">No groups</span>
                  }
                </td>
                <td style={{ maxWidth: 300 }}>
                  {u.permission_details && u.permission_details.length > 0
                    ? u.permission_details.map(p => <span key={p.codename} className="badge bg-info text-dark me-1">{p.codename}</span>)
                    : <span className="text-muted">No permissions</span>
                  }
                </td>
                <td>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(u)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
