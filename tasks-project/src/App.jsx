import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Users from './components/Users';
import SignIn from './components/Signin';
import Logout from './components/Logout';
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Task from './components/Tasks';
import Category from './components/Category';
import CustomerManager from './components/CustomerManager';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import { AuthProvider } from './context/AuthContext';
import './App.css'


function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Navigation */}
        <Navbar></Navbar>
        <div  className="container d-flex justify-content-center align-items-center" >
          <h1>Welcome to  Authentication & Tasks</h1>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/allusers" element={<Users />} />
          <Route path="/tasks" element={<Task />} />
          <Route path="/customers" element={<CustomerManager />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
