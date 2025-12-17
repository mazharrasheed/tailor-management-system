import { BrowserRouter as Router, Routes, Route, Link ,Navigate} from 'react-router-dom';
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
import ShalwarQameez from './components/ShalwarQameez';
import CustomerDetails from './components/CustomerDetails';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './App.css'
import { AuthContext } from './context/AuthContext';



function App() {

  const { token } = useContext(AuthContext);
  console.log('app.jsx',token)
  return (
    <Router>
        {/* Navigation */}
        <Navbar></Navbar>
        <div  className="container d-flex justify-content-center align-items-center mt-3" >
          <h1>Welcome to Anmol Tailors</h1>
        </div>
        {/* Routes */}
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/users" element={token ? <CreateUser /> : <Navigate to="/" />} />
          <Route path="/tasks" element={token ?<Task />: <Navigate to="/" />}/>
          <Route path="/customers" element={ token ? <CustomerManager /> : <Navigate to="/" /> } />
          <Route path="/customer-details/:id" element={ token ? <CustomerDetails /> : <Navigate to="/" /> } />
          <Route path="/profile" element={token ? <Profile /> :<Navigate to="/" />} />
      
        </Routes>
    
    </Router>
  );
}

export default App;
