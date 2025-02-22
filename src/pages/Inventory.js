import React, { useEffect, useState } from 'react';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_URL;

function Inventory() {

  const [listOfFruits, setListOfFruits] = useState([]);
  const [stockQuantity, setStockQuantity] = useState({});
  const [fruitName, setFruitName] = useState("")
  const [fruitPrice, setFruitPrice] = useState("")
  const [fruitQuantity, setFruitQuantity] = useState("")
  const [addFruitError, setAddFruitError] = useState('');

  // Populates the Fruit Inventory data
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

  const handleOrderQuantityChange = (fruitId, event) => {
    const quantity = parseInt(event.target.value, 10);
    setStockQuantity(prevState => ({
      ...prevState,
      [fruitId]: quantity
    }));
  }

  // handles amendment of fruit's stock
  const handleAmendStock = (fruitId, stockQuantity) => {
    axios.post(`${apiUrl}/store/updateQuantity`, {
      fruitId: fruitId,
      stockQuantity: stockQuantity
    }, { 
      headers: { accessToken: localStorage.getItem("accessToken") } 
    }).then((response) => {
      setListOfFruits(prevFruits => {
        return prevFruits.map(fruit => {
          if (fruit.id === fruitId) {
            return { ...fruit, stock: stockQuantity };
          }
          return fruit;
        });
      });
      setStockQuantity({});
    })
    .catch((error) => {
      if (error.response) {
        // Set error message from the server's response
        alert(error.response.data.message);
      } else {
        // Handle other types of errors (e.g., network errors)
        alert("An error occurred. Please check your connection and try again.");
      }
    });
  };

  const handleDelete = (fruitId, fruitName) => {
    const userConfirmed = window.confirm(`Confirm Delete ${fruitName}, Fruit #${fruitId}?`);

    if (userConfirmed) {
      axios.post(`${apiUrl}/store/deleteFruit`, {
        fruitId: fruitId,
      }, { 
        headers: { accessToken: localStorage.getItem("accessToken") } 
      }).then((response) => {
        setListOfFruits(prevFruits => {
          return prevFruits.filter(fruit => fruit.id !== fruitId);
        });
      })
      .catch((error) => {
        if (error.response) {
        // Set error message from the server's response
          alert(error.response.data.message);
        } else {
          // Handle other types of errors (e.g., network errors)
          alert("An error occurred. Please check your connection and try again.");
        }
      });
    };
  };

  // handles adding of new fruit to database
  const handleAddFruit = () => {
    const fruitExists = listOfFruits.some(fruit => fruit.name.toLowerCase() === fruitName.toLowerCase());

    if (fruitExists) {
      setAddFruitError(`${fruitName} already exists.`);
    } else {
      setAddFruitError('');
    }

    axios.post(`${apiUrl}/store/addFruit`, [{
      "name": fruitName,
      "price_cents": fruitPrice,
      "stock": fruitQuantity
    }], { 
      headers: { accessToken: localStorage.getItem("accessToken") } 
    }).then((response) => {
      // optimistic UI update
      setListOfFruits(prevState => {
        return [...prevState,
          {
            'id': response.data[0].id,
            'name': fruitName,
            'price_cents': fruitPrice, 
            'stock': fruitQuantity
          }
        ]
      })
      setFruitName("");
      setFruitPrice("");
      setFruitQuantity("");
    })
    .catch((error) => {
      if (error.response) {
        // Set errorMessage from the server's response
        alert(error.response.data.message);
      } else {
        // Handle other types of errors (e.g., network errors)
        alert("An error occurred. Please check your connection and try again.");
      }
    });
  }

  return (
    <div className="inventory-container">
      <h2>Fruit Inventory</h2>
      <table className="add-fruit-table">
        <thead>
          <tr>
            <th>Add Fruit: </th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="text" placeholder='Name' value={fruitName} onChange={(event) => {setFruitName(event.target.value)}}/>
            </td>
            <td>
              <input type="number" placeholder='Price in cents' value={fruitPrice} onChange={(event) => {setFruitPrice(event.target.value)}} />
            </td>
            <td>
              <input type="number" placeholder='Stock' value={fruitQuantity} onChange={(event) => {setFruitQuantity(event.target.value)}} />
            </td>
            <td>
            <button onClick={handleAddFruit}>Add Fruit</button>
            </td>
          </tr>
          {addFruitError && <span className="errors">{addFruitError}</span>}

        </tbody>

      </table>

      <table className="inventory-table">
      <thead>
        <tr>
          <th>Fruit #</th>
          <th>Fruit Name</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Amend Stock</th>
          <th>Delete Fruit</th>
        </tr>
      </thead>
      <tbody>
        {listOfFruits.map((fruit)=> {
          return (
            <tr key={fruit.id}>
              <td>{fruit.id}</td>
              <td>{fruit.name}</td>
              <td>${(Math.round(fruit.price_cents) / 100).toFixed(2)} </td>
              <td>{fruit.stock}</td>
              <td className="inline-block" >
                <input
                  className="amend-quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={stockQuantity[fruit.id] || ""}
                  onChange={(event) => handleOrderQuantityChange(fruit.id, event)}
                />
                <button onClick={() => handleAmendStock(fruit.id, stockQuantity[fruit.id])}>Amend Stock</button>
              </td>
              <td><button onClick={() => handleDelete(fruit.id, fruit.name)}>Delete</button></td>
            </tr>
          )
        })}
      </tbody>
      </table>
    </div>
  )
}

export default Inventory
