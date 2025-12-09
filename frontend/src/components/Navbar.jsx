import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { token } = useContext(AuthContext);

  const getNavLinkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light nav-bg">
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="#">
            Authentication & Tasks
          </NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {token && (
                <>
                  <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/allusers">
                      Users
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/tasks">
                      Tasks
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/customers">
                      Customers
                    </NavLink>
                  </li>
                  {/* <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/profile">
                      Profile
                    </NavLink>
                  </li> */}
                </>
              )}

              {!token && (
                <>
                  <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/">
                      Sign In
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className={getNavLinkClass} to="/signup">
                      Sign Up
                    </NavLink>
                  </li>
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
