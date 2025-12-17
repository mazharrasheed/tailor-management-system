import React, { useEffect, useState,useContext } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { token , setToken} = useContext(AuthContext);
    

    // Change password modal state
    const [showModal, setShowModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // const token = localStorage.getItem('access_token');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(
                    'https://anmoltailor.pythonanywhere.com/api/profile/',
                    { headers: { Authorization: `Token ${token}` } }
                );
                setUsers(response.data);
                console.log('Profile data:', response.data);
            } catch (err) {
                setError('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token]);

    // -----------------------------
    // Change password handler
    // -----------------------------

    console.log('Token in Profile component:', token);

const handleChangePassword = async () => {
    // Reset UI state
    setPasswordError('');
    setPasswordSuccess('');

    // Basic client-side validation
    if (!oldPassword || !newPassword1 || !newPassword2) {
        setPasswordError('All fields are required');
        return;
    }

    if (newPassword1 !== newPassword2) {
        setPasswordError('New passwords do not match');
        return;
    }

    try {
        // Make token-authenticated request (NO CSRF)
        console.log('Change pasword Profile component:', token);
        const response = await axios.post(
            'https://anmoltailor.pythonanywhere.com/api/change-password/',
            {
                old_password: oldPassword,
                new_password1: newPassword1,
                new_password2: newPassword2,
            },
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );

        // Explicit success handling
        if (response.status === 200) {
            setPasswordSuccess('Password changed successfully. Please log in again.');

            // Clear sensitive state
            setOldPassword('');
            setNewPassword1('');
            setNewPassword2('');

            // Force logout after password change (security best practice)
            setTimeout(() => {
                localStorage.removeItem('access_token');
                setToken(null);
                window.location.href = '/';
            }, 500);
        } else {
            // Defensive fallback (should not normally happen)
            setPasswordError('Unexpected response from server');
        }

    } catch (err) {
    const data = err.response?.data;

    if (!data) {
        setPasswordError('Failed to change password');
        return;
    }

    // Collect ALL validation errors from backend
    let messages = [];

    Object.values(data).forEach(value => {
        if (Array.isArray(value)) {
            messages = messages.concat(value);
        } else if (typeof value === 'string') {
            messages.push(value);
        }
    });

    setPasswordError(messages.join(' '));
}
};




    return (
        <div className="container p-4">
            <h2>User Profile</h2>

            {error && <p className="text-danger">{error}</p>}

            {loading ? (
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            ) : (
                users.map((user) => (
                    <div key={user.id} className="mb-3">
                        <h5>User Name: {user.username}</h5>
                        <h5>Email: {user.email}</h5>
                    </div>
                ))
            )}

            <Button variant="warning" onClick={() => setShowModal(true)}>
                Change Password
            </Button>

            {/* Change Password Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {passwordError && <p className="text-danger">{passwordError}</p>}
                    {passwordSuccess && <p className="text-success">{passwordSuccess}</p>}

                    <div className="mb-3">
                        <label className="form-label">Current Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword1}
                            onChange={(e) => setNewPassword1(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword2}
                            onChange={(e) => setNewPassword2(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleChangePassword}>
                        Change Password
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Profile;
