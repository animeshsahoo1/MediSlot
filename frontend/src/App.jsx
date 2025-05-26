import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'

const App = () => {
  return (
    <div>
      <Navbar/>
      <div className='flex items-center w-1/1 justify-center'><Home/></div>
      
    </div>
  )
}

export default App
