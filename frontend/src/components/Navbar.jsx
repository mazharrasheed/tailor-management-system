import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import image from '../assets/anmol_tailor.png';

export default function Navbar() {
  const { token, userPerms } = useContext(AuthContext);

  const getNavLinkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light nav-bg">
        <div className="container-fluid">
          <div className='p-1 bg-dark d-flex align-items-center  rounded-circle' style={{ width: 40, height: 40 }}>
            <img className=' rounded-circle' width={35} src={image} alt="logo image" />
          </div>
          <NavLink className="ps-2 navbar-brand" to="#">
            Anmol Tailors
          </NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {token && (
                <>
                  <li className="nav-item">
                    
                      {Array.isArray(userPerms) && userPerms.includes("view_user") && (
                      <NavLink className={getNavLinkClass} to="/users">
                      Users
                    </NavLink>
                    )}
                  </li>
                  <li className="nav-item">
                    {Array.isArray(userPerms) && userPerms.includes("view_task") && (
                      <NavLink className={getNavLinkClass} to="/tasks">
                        Tasks
                      </NavLink>
                    )}

                  </li>
                  <li className="nav-item">
                    {Array.isArray(userPerms) && userPerms.includes("view_customer") && (
                      <NavLink className={getNavLinkClass} to="/customers">
                        Customers
                      </NavLink>
                    )}

                  </li>
                  <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/profile">
                      Profile
                    </NavLink>
                  </li>
                </>
              )}

              {!token && (
                <>
                  <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/">
                      Sign In
                    </NavLink>
                  </li>
                  {/* <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/signup">
                      Sign Up
                    </NavLink>
                  </li> */}
                </>
              )}

              {token && (
                <li className="nav-item">
                  <NavLink className={getNavLinkClass} to="/logout">
                    Logout
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}
