import React, { useState,useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SignIn = () => {

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
         try {
        const response = await axios.post('http://authsandtasks.pythonanywhere.com/api-token-auth/', {
            username,
            password,
        });

        const authToken = response.data.token;
        setToken(authToken);
        localStorage.setItem('access_token', authToken);
        login(authToken);  // after successful login
        console.log('Login successful! Token:', authToken);
        navigate('/profile');

    } catch (err) {
        if (err.response) {
            // Server responded with status code but it's an error
            if (err.response.status === 400 || err.response.status === 401) {
                setError('Invalid username or password');
            } else {
                setError('Server error. Please try again later.');
            }
        } else if (err.request) {
            // Request was made but no response received
            setError('Server is not responding. Please check your internet or try again later.');
        } else {
            // Something else happened
            setError('An unexpected error occurred. Please try again.');
        }
        console.error('Login error:', err);
    }
    };
    return (
        <div  className='container p-5 '>
            <div className="row">
                <div className="col-md-4 offset-md-4 card p-5">
            <h2>Sign In</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label className='form-label'>Username:</label><br />
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
                    <label className='form-label' >Password:</label><br />
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <br />
                <button className="btn btn-primary" type="submit">Login</button>
            </form>
            <Link className='mt-3' to="/signup">Dont have accout ? SingUp</Link>
            {token && <p style={{ color: 'green' }}>Logged in! Token saved.</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default SignIn;
