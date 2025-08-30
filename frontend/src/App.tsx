import React, { useState } from 'react'
import './App.css'
import './index.css'
import { Hero } from './components/main/Hero'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Hero/>
      <h1>Hello World</h1>
    </>
  )
}

export default App
