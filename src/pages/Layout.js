import React, { useContext } from 'react'
import image from './images/website_logo.png';
import { Link, Outlet, useNavigate }  from 'react-router-dom';
import { AuthContext } from '../App';


function Layout() {

  const { authState, setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();

  const logout =  () => {
    localStorage.removeItem("accessToken");
    setAuthState({ username: "", id: 0, status: false, role: "customer" });
    navigate("/");
  }

  return (
    <>
      <div className="Navbar">
        { authState.status ? <h2>{`Welcome ${authState.username}`}</h2> : <img className="logo" src={image} alt="logo"/> }
        <nav>
          <ul className="nav_links">
          <li><Link to='/'> Home </Link></li>   
          <li><Link to='/store'> Store </Link></li> 

            { authState.status ? (
                <>
                  { authState.role === "customer" && <li><Link to='/history'> Order History </Link></li> }
                  { authState.role === "admin" && (
                  <>
                    <li><Link to='/fulfillment'>Order Fulfillment</Link></li>
                    <li><Link to='/Inventory'>Inventory</Link></li>
                  </>
                  )} 
                  <li><button onClick={logout}>Logout</button></li>
                </>
              ) :  (
                <>
                  <li><Link to='/register'> Register </Link></li>
                  <li><Link to='/login'> Login </Link></li>
                </>
              )}
          </ul>
        </nav>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </>
  )
}

export default Layout
