import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function UserManagement() {
  const { token } = useContext(AuthContext);

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

  // Load Allowed Permissions of Logged-in User
  useEffect(() => {
    axios
      .get(
        "https://anmoltailor.pythonanywhere.com/api/users/me/permissions/",
        {
          headers: { Authorization: `Token ${token}` }
        }
      )
      .then((res) => {
        console.log("RAW PERMISSIONS:", res.data);

        const perms = res.data.permissions || [];
        setPermissions(perms); // Already a flat list
      })
      .catch((err) => console.error("Failed to load permissions:", err));
  }, []);

  // Load Users
  const fetchUsers = () => {
    setLoading(true);
    axios
      .get("https://anmoltailor.pythonanywhere.com/api/users/", {
        headers: { Authorization: `Token ${token}` }
      })
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle input fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Toggle Permission Checkbox
  const handlePermissionToggle = (perm) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  // Save User
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (form.id) {
        const payload = {
          username: form.username,
          password: form.password || undefined,
          permissions: form.permissions.map(codename => {
            const permObj = permissions.find(p => p.codename === codename);
            return permObj ? permObj : { codename };
          })
        };
        await axios.put(
          `https://anmoltailor.pythonanywhere.com/api/users/${form.id}/`,
          payload,
          { headers: { Authorization: `Token ${token}` } }
        );

      } else {
        await axios.post(
          "https://anmoltailor.pythonanywhere.com/api/users/",
          form,
          { headers: { Authorization: `Token ${token}` } }
        );
        alert("User created successfully");
      }

      resetForm();
      fetchUsers();
    } catch (err) {
      alert("Failed to save user");
    }
  };

  // Load User for Editing
  const handleEdit = (user) => {
    setIsEditing(true);
    setForm({
      id: user.id,
      username: user.username,
      password: "",
      permissions: user.permissions?.map(p => p.codename) || []
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

  // Delete User
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(
        `https://anmoltailor.pythonanywhere.com/api/users/${id}/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  return (
    <div className="container mt-4">
      <h2>User Management</h2>

      {/* Form */}
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

        {/* Permissions */}
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
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </form>

      {/* User List */}
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
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>
                    {user.permissions?.length > 0 ? (
                      user.permissions.map((p, i) => (
                        <span key={i} className="badge bg-secondary me-1">
                          {p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">No permissions</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
