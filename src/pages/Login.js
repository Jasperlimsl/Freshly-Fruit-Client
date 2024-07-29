import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App'
const apiUrl = process.env.REACT_APP_API_URL;

function Login() {

  const { setAuthState } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    setUsernameError("");
    setPasswordError("");

    if (username.trim() === "") {
      setUsernameError("Please input a username.");
      isValid = false;
    }

    if (password.trim() === "") {
      setPasswordError("Please input a password.");
      isValid = false;
    }

    return isValid;
  };

  const submitForm = (event) => {
    event.preventDefault();

    // Only proceed if form inputs are validated.
    if (!validateForm()) {
      return;
    }

    axios.post(`${apiUrl}/users/login`, {
      username: username,
      password: password,
    }).then((response) => {
        alert(response.data.message);
        localStorage.setItem("accessToken", response.data.token);
        setAuthState({ username: response.data.username, id: response.data.id, status: true, role: response.data.role });
        if (response.data.role === "customer") {
          navigate("/store");
        } else if (response.data.role === "admin") {
          navigate("/fulfillment");
        };
    })
    .catch((error) => {
      if (error.response) {
        // Set error message from the server's response
        alert(error.response.data.message);
      } else {
        // Handle other types of errors (e.g., network errors)
        alert("An error occurred. Please check your connection and try again.");
      }
    })
  }

  return (
    <div>
      <form className="registerForm" onSubmit={ submitForm }>
        <label>
          Username:
          <input type="text" value={username} onChange={(event) => {setUsername(event.target.value)}}/>
          {usernameError && <p className="errors">{usernameError}</p>}
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(event) => {setPassword(event.target.value)}} />
          {passwordError && <p className="errors">{passwordError}</p>}
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login
