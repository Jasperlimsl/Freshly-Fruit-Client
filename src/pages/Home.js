import React from 'react'
import image from './images/website_logo.png';

function Home() {

  return (
    <div>
      <img className="logoMain" src={image} alt="logo"/>
      <h1>Welcome to Freshly Fruit!</h1>
      <h2>Bringing You the Best of Nature's Freshness</h2>

    </div>
  )
}

export default Home