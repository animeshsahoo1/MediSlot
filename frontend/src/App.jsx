import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom'

const App = () => {
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path='/' element={<div className='flex items-center w-1/1 justify-center'><Home/></div>}/>
        <Route path='/patients' />
        <Route path='/doctors' />
        <Route path='/hospitals' />
      </Routes>
      
    </div>
  )
}

export default App
