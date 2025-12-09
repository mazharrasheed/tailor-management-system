import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {  useContext } from 'react';
import Users from './components/Users';
import SignIn from './components/Signin';
import Logout from './components/Logout';
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Task from './components/Tasks';
import CustomerManager from './components/CustomerManager';
import CreateUser from './components/CreateUser';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import { AuthProvider } from './context/AuthContext';
import './App.css'
import { AuthContext } from './context/AuthContext';



function App() {

  const { token } = useContext(AuthContext);
  return (
    <Router>
      <AuthProvider>
        {/* Navigation */}
        <Navbar></Navbar>
        <div  className="container d-flex justify-content-center align-items-center mt-3" >
          <h1>Welcome to  Anmol Tailors</h1>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/allusers" element={token ? <CreateUser /> : <Navigate to="/login" />} />
          <Route path="/tasks" element={token ?<Task />: <Navigate to="/login" />}/>
          <Route path="/customers" element={ token ? <CustomerManager /> : <Navigate to="/login" /> } />
          <Route path="/profile" element={token ? <Profile /> :<Navigate to="/login" />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
