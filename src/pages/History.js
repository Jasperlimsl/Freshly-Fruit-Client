import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import dayjs from 'dayjs';
const apiUrl = process.env.REACT_APP_API_URL;

function History() {

  const [orders, setOrders] = useState([]);
  const { authState } = useContext(AuthContext);

  useEffect(() => {
    if (authState.status) {
      axios.get(`${apiUrl}/orders/orderHistory`, {
        headers: {
          accessToken: localStorage.getItem('accessToken'),
        },
      }).then((response) => {
        console.log(response);
        setOrders(response.data);
      })
      .catch((error) => {
        if (error.response) {
          // Set errorMessage from the server's response
          console.error('An error occurred:', error.response.data.message);
          alert(error.response.data.message);
        } else {
          // Handle other types of errors (e.g., network errors)
          console.error("An error occurred. Please check your connection and try again.")
          alert("An error occurred. Please check your connection and try again.");
        }
      })
    }
  }, [authState]);

  return (
    <div className="order-history-container">
      <h2>Order History</h2>
      <table className="order-history-table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Order Date</th>
            <th>Order Details</th>
            <th>Total Price</th>
            <th>Fulfilment Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{dayjs(order.createdAt).format('DD MMMM YY (HH:mm:ss)')}</td>
              <td>
                <ol>
                  {order.orderDetails.map((detail) => (
                    <li key={detail.id}>
                      {detail.fruits.name} x {detail.quantity}  at ${(detail.fruits.price_cents / 100).toFixed(2)} each
                    </li>
                  ))}
                </ol>
              </td>
              <td>${(order.total_price_cents / 100).toFixed(2)}</td>
              <td>{order.fulfilled ? "Completed" : "Ongoing"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default History
