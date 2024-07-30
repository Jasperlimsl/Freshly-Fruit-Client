import axios from 'axios';
import React, { useEffect, useState, useMemo, useContext } from 'react';
import {AuthContext} from '../App';
const apiUrl = process.env.REACT_APP_API_URL;

function Store() {

  const {authState} = useContext(AuthContext);
  const [listOfFruits, setListOfFruits] = useState([]);
  const [orderQuantity, setOrderQuantity] = useState({});
  const [errorMessages, setErrorMessages] = useState({});

  useEffect(() => {
    axios.get(`${apiUrl}/store`).then((response) => {
      setListOfFruits(response.data);
    }).catch((error) =>{
      if (error.response) {
        // Set error message from the server's response
        alert(error.response.data.message);
      } else {
        // Handle other types of errors (e.g., network errors)
        alert("An error occurred. Please check your connection and try again.");
      }
    })
  }, []);

  // Handle change in purchase quantity input
  const handleOrderQuantityChange = (fruitId, event) => {
    const value = Math.max(0, parseInt(event.target.value) || 0); // Prevent negative numbers
    const fruit = listOfFruits.find(f => f.id === fruitId);

    if (value > fruit.stock) {
      setErrorMessages(prevState => ({
        ...prevState,
        [fruitId]: `Insufficient Stock`
      }));
    } else {
      setErrorMessages(prevState => ({
        ...prevState,
        [fruitId]: null
      }));
    }
    setOrderQuantity(prevState => ({
        ...prevState,
        [fruitId]: value
    }));
  };

  // calculate total order price based on list of fruits indicated on UI
  const totalOrderPrice = useMemo(() => {
    return listOfFruits.reduce((total, fruit) => {
      const quantity = parseInt(orderQuantity[fruit.id]) || 0;
      return total + (fruit.price_cents * quantity);
    }, 0);
  }, [listOfFruits, orderQuantity]);

  // Handles the submit of order of fruits
  const handleSubmitOrder = () => {
    // Filter out fruits with quantity 0 and improper values 
    const filteredOrderQuantity = Object.keys(orderQuantity).reduce((acc, fruitId) => {
      if (orderQuantity[fruitId] > 0) {
        acc[fruitId] = orderQuantity[fruitId];
      }
      return acc;
    }, {});

    console.log(orderQuantity);

    if (Object.keys(filteredOrderQuantity).length === 0) {
      alert("You are submitting an Empty Order!");
    } else {
      const userConfirmed = window.confirm("Confirm Submit?");

      if (userConfirmed) {
        axios.post(`${apiUrl}/orders/submitOrder`, {
          usersId: authState.id,
          fruitsOrdered: filteredOrderQuantity,
          total_price_cents: totalOrderPrice,
        }, { 
          headers: { accessToken: localStorage.getItem("accessToken") } 
        }).then((response) => {
          setListOfFruits(prevFruits => prevFruits.map(fruit => {
            const orderedQuantity = parseInt(filteredOrderQuantity[fruit.id]) || 0;
            if (orderedQuantity > 0) {
              return {
                ...fruit,
                stock: fruit.stock - orderedQuantity
              };
            }
            return fruit;
          }));
          setOrderQuantity({});
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
    };
  };

  return (
    <div className="store-layout">
      <div className="products-grid">
        {listOfFruits.map((fruit) => (
          <div className="fruit-catalog" key={`fruit_${fruit.id}`}>
            <div className="fruit-name">{fruit.name}</div>
            <div className="fruit-price">Price: ${(Math.round(fruit.price_cents) / 100).toFixed(2)}</div>
            <div className="fruit-stock">Stock: {fruit.stock}</div>
            <input
              className="quantity-input"
              type="number"
              min="0"
              step="1"
              value={orderQuantity[fruit.id] || ""}
              onChange={(event) => handleOrderQuantityChange(fruit.id, event)}
            />
            {errorMessages[fruit.id] && <div className="errors">{errorMessages[fruit.id]}</div>}
          </div>
        ))}
      </div>
      <div className="products-checkout">
        <h2>Order Summary</h2>
        <ol className="order-details-list">
          {Object.keys(orderQuantity).map((fruitId) => {
            const fruit = listOfFruits.find(f => f.id === parseInt(fruitId));
            if (fruit && orderQuantity[fruitId] > 0) {
              return (
                <li key={fruitId}>
                  {fruit.name}: {orderQuantity[fruitId]} at ${(fruit.price_cents / 100).toFixed(2)} each
                </li>
              );
            }
            return null;
          })}
        </ol>
        <div>Total Price: ${(Math.round(totalOrderPrice) / 100).toFixed(2)}</div>
        {authState.status ? <button className="submit-button" onClick={handleSubmitOrder}>Submit Order</button> : <span className="errors">Please Login to Order</span>}
      </div>
    </div>
  )
}

export default Store
