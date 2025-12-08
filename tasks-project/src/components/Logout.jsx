import { useEffect,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    // Clear the auth token
    localStorage.removeItem('access_token');
    logout()
    // Redirect to SignIn page
    navigate('/signin');
  }, [navigate]);

  return (
    <div style={{ padding: '2rem' }}>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;
