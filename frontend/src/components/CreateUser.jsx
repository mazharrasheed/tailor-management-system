import { useState, useEffect } from "react";

import axios from 'axios';
export default function UserManagement() {

  const api= axios
  const [form, setForm] = useState({
    id: null,
    username: "",
    password: "",
    permissions: []
  });

  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch all permissions from Django


  useEffect(() => {
  api.get("https://anmoltailor.pythonanywhere.com/me/permissions/")
    .then(res => {
      // flatten all app permissions into one array
      const permsObj = res.data.permissions; // adjust if response shape differs
      const flatPermissions = Object.values(permsObj).flat();
      setPermissions(flatPermissions);
    })
    .catch(err => console.error("Failed to fetch permissions", err));
}, []);

  // Fetch all users
  const fetchUsers = () => {
    setLoading(true);
    api.get("https://anmoltailor.pythonanywhere.com/api/users/")
      .then(res => {
        setUsers(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePermissionToggle = (perm) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/users/${form.id}/`, form);
        alert("✅ User updated successfully");
      } else {
        await api.post("/users/", form);
        alert("✅ User created successfully");
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "❌ Failed to save user");
    }
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setForm({
      id: user.id,
      username: user.username,
      password: "",
      permissions: user.permissions || []
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setForm({
      id: null,
      username: "",
      password: "",
      permissions: []
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}/`);
      alert("✅ User deleted successfully");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "❌ Failed to delete user");
    }
  };

  return (
    <div className="container mt-4">
      <h2>User Management</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row">
          <div className="col-md-4 mb-3">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          {!form.id && (
            <div className="col-md-4 mb-3">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          )}
        </div>

        <div className="mb-3">
          <label>Permissions</label>
          <div className="border rounded p-3 d-flex flex-wrap">
            {permissions.map((perm) => (
              <div key={perm.codename} className="form-check me-3 mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={perm.codename}
                  checked={form.permissions.includes(perm.codename)}
                  onChange={() => handlePermissionToggle(perm.codename)}
                />
                <label className="form-check-label" htmlFor={perm.codename}>
                  {perm.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary me-2">
          {form.id ? "Update User" : "Create User"}
        </button>
        {form.id && (
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <h3>User List</h3>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Username</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>
                  {user.permissions.map((p, i) => (
                    <span key={i} className="badge bg-secondary me-1">{p}</span>
                  ))}
                </td>
                <td className="d-flex justify-content-end">
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(user)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="text-center">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
