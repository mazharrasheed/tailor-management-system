import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/profile/', {
                    // Uncomment and update the line below if authentication is required
                    headers: { Authorization: `Token ${localStorage.getItem('access_token')}` }
                });
                setUsers(response.data);
            } catch (err) {
                setError('Failed to fetch users');
                console.error(err);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className=" container p-4">
            <h2>User Profile</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <ul>
                    {users.map((user , index) => (
                        <span  key={user.id || index}>
                            <h1 >User Name: {user.username}</h1>
                            <h2 > Email: ({user.email})</h2>
                        </span>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Profile;
