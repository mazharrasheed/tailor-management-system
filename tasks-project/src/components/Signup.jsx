import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password === password2) {
            try {
                const response = await axios.post('http://127.0.0.1:8000/api/signup/', {
                    username,
                    password,
                });

                if (response.data.token) {
                    setToken(response.data.token);
                    localStorage.setItem('access_token', response.data.token);
                    login(response.data.token);
                    setShowModal(true); // Show modal
                } else {
                    navigate('/signin');
                }
            } catch (err) {
                setError(
                    err.response?.data?.username?.[0] ||
                    err.response?.data?.password?.[0] ||
                    'Signup failed'
                );
                console.error('Signup error:', err.response?.data || err);
            }
        } else {
            setError('Signup failed! Passwords do not match');
        }
    };

    const handleModalOk = () => {
        setShowModal(false);
        navigate('/profile');
    };

    return (
        <div className="container p-5">
            <div className="row">
                <div className="col-md-4 offset-md-4 card p-5">
                    <h2>Sign Up</h2>
                    <form onSubmit={handleSignup}>
                        <div>
                            <label className="form-label">Username:</label>
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <br />
                        <div>
                            <label className="form-label">Password:</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <br />
                        <div>
                            <label className="form-label">Confirm Password:</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                required
                            />
                        </div>
                        <br />
                        <button className="btn btn-primary" type="submit">
                            Sign Up
                        </button>
                    </form>
                    <Link className="mt-3 d-block" to="/signin">
                        Already have an account? Sign In
                    </Link>
                    {token && <p style={{ color: 'green' }}>Token saved successfully!</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            </div>

            {/* Bootstrap Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Signup Successful</h5>
                            </div>
                            <div className="modal-body">
                                <p>You have successfully signed up! Redirecting to User Profile</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={handleModalOk}>
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Signup;
