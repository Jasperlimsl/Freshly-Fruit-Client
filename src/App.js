import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useEffect, useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Store from './pages/Store';
import Layout from './pages/Layout';
import History from './pages/History';
import Fulfillment from './pages/Fulfillment';
import Inventory from './pages/Inventory';
import ProtectedRoute from './pages/ProtectedRoute';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_URL;

export const AuthContext = createContext("");

function App() {

  const [authState, setAuthState] = useState({
    username: "",
    id: 0,
    status: false,
    role: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
  
    if (accessToken) {
      axios.get(`${apiUrl}/users/authenticate`, {
        headers: {
          accessToken: accessToken
        }
      }).then((response) => {
        setAuthState({
          username: response.data.username,
          id: response.data.id,
          status: true,
          role: response.data.role
        });
      })
      .catch((error) => {
        if (error.response) {
          setAuthState(prevState => ({ ...prevState, status: false }));
          localStorage.removeItem("accessToken");
        } else {
          console.error("An error occurred. Please check your connection and try again.");
          alert("An error occurred. Please check your connection and try again.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setAuthState(prevState => ({ ...prevState, status: false }));
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while checking auth state
  }

  return (
    <div className="App">
      <AuthContext.Provider value={{authState, setAuthState}}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Layout/>}>
              <Route path='/register' element={<Register />} />
              <Route path='/login' element={<Login />} />
              <Route path='/' element={<Home />} />
              <Route path='/home' element={<Home />} />
              <Route path='/store' element={<Store />} />

              <Route path='/history' element={
                <ProtectedRoute roles={['customer']}>
                  <History />
                </ProtectedRoute>
              } />

              <Route path='/fulfillment' element={
                <ProtectedRoute roles={['admin']}>
                  <Fulfillment />
                </ProtectedRoute>                
              } />

              <Route path="/inventory" element={
                <ProtectedRoute roles={['admin']}>
                  <Inventory />
                </ProtectedRoute>
              } />

              <Route path='*' element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
