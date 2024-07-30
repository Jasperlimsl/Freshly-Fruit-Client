import React, { useEffect, useContext, useState } from 'react'; 
import axios from 'axios';
import { AuthContext } from '../App';
import dayjs from 'dayjs';
const apiUrl = process.env.REACT_APP_API_URL;

function Fulfillment() {

  const { authState } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  // Populates the list of orders, fulfillment status and other relevant info
  useEffect(() => {
    if (authState.status && authState.role === "admin") {
      axios.get(`${apiUrl}/orders/orderFulfillmentList`, {
        headers: {
          accessToken: localStorage.getItem('accessToken')
        }
      })
      .then((response) => {
        setOrders(response.data);
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
  }, [authState])

  const handleFulfilOrder = (orderId) => {
    axios.post(`${apiUrl}/orders/fulfilOrder`, {
      ordersId: orderId
    }, { 
      headers: { accessToken: localStorage.getItem("accessToken") } 
    }).then((response) => {
      //Update of the UI
      setOrders(prevState =>
        prevState.map(order =>
          order.id === orderId ? { ...order, fulfilled: true } : order
        )
      );
    })
    .catch((error) => {
      if (error.response) {
        // Set error message from the server's response
        alert(error.response.data.message);
      } else {
        // Handle other errors, i.e. network error
        alert("An error occurred. Please check your connection and try again.");
      }
    });
  }

  const undoFulfilOrder = (orderId) => {
    axios.post(`${apiUrl}/orders/undoFulfilOrder`, {
      ordersId: orderId
    }, { 
      headers: { accessToken: localStorage.getItem("accessToken") } 
    }).then((response) => {
      // Update of the UI
      setOrders(prevState =>
        prevState.map(order =>
          order.id === orderId ? { ...order, fulfilled: false } : order
        )
      );
    })
    .catch((error) => {
      if (error.response) {
        // Set error message from the server's response
        alert(error.response.data.message);
      } else {
        // Handle other errors, i.e. network error
        alert("An error occurred. Please check your connection and try again.");
      }
    });
  }

  return (
    <div className="order-fulfillment-container">
      <h2>Order Fulfillment</h2>
      <table className="order-fulfillment-table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Order Date</th>
            <th>Order Details</th>
            <th>User #</th>
            <th>Username</th>
            <th>Total Price</th>
            <th>Fulfilled?</th>
            <th>Fulfillment Button</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            return (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{dayjs(order.createdAt).format('DD MMM YY (HH:mm:ss)')}</td>
                <td>
                  <ol>
                    {order.orderDetails.map((detail) => {
                      return(
                        <li key={detail.id}>
                        {detail.fruits.name} x {detail.quantity} at ${(detail.fruits.price_cents/100).toFixed(2)} each
                      </li>
                      )
                    })}
                  </ol>
                </td>
                <td>{order.usersId}</td>
                <td>{order.users.username}</td>
                <td>${(order.total_price_cents/100).toFixed(2)}</td>
                <td>{order.fulfilled ? "Yes" : "No"}</td>
                <td>
                  {order.fulfilled ? (
                    <button onClick={() => undoFulfilOrder(order.id)}>Undo</button>
                  ) : (
                    <button onClick={() => handleFulfilOrder(order.id)}>Fulfil Order</button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Fulfillment
