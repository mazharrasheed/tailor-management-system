import React, { useEffect, useState } from 'react';
import axios from 'axios';

const User = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/allusers/', {
                    // Uncomment and update the line below if authentication is required
                    headers: { Authorization: `Token ${localStorage.getItem('access_token')}` }
                });
                setUsers(response.data);
            } catch (err) {
                setError('Failed to fetch users ! not authorized');
                console.error(err);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className=" container p-4">
            <h2>Users</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <ul>
                    {users.map(user => (
                        <li key={user.id}>
                            {user.username} ({user.email})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default User;
