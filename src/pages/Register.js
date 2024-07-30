import React from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
const apiUrl = process.env.REACT_APP_API_URL;

function Register() {

  const navigate = useNavigate();

  const schema = yup.object().shape({
    username: yup.string().min(5).max(25).required("Please enter Username"),
    password: yup.string().min(8).max(25).required("Please enter Password"),
    confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords do not match!").required("please confirm Password")
  });

  const { register, handleSubmit, formState: {errors}, setError } = useForm({
    resolver: yupResolver(schema)
  });



  const submitForm = (data) => {
    const enhancedData = {
      ...data,
      // Users who register are allocated the role "customers"
      role: "customer"
    };

    axios.post(`${apiUrl}/users/register`, enhancedData)
    .then((response) => {
        alert(response.data);
        navigate("/login");
      }
    )
    .catch((error) => {
      if (error.response) {
        if (error.response.status === 400 && error.response.data.message) {
          // display error at username input that username already in use
          setError('username', { type: 'manual', message: error.response.data.message });
        } else {
          // Set error message from the server's response
          alert(error.response.data.message);
        }
      } else {
        // Handle other errors, i.e. network error
        alert('A network error occurred. Please check your connection.');
      }
    });
  }

  return (
    <div>
        <form className="registerForm" onSubmit={handleSubmit(submitForm)}>
            <label>
              Username:
              <input type="text" {...register("username")}/>
              <p className="errors">{errors.username?.message}</p>
            </label>
            <br />
            <label>
              Password:
              <input type="password" {...register("password")} />
              <p className="errors">{errors.password?.message}</p>
            </label>
            <br />
            <label>
              Confirm Password:
              <input type="password" {...register("confirmPassword")} />
              <p className="errors">{errors.confirmPassword?.message}</p>
            </label>
            <br />
            <button type="submit">Register</button>
        </form>
    </div>
  )
}

export default Register
