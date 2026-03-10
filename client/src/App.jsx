import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Producto from './pages/Producto';
import Concesionarias from './pages/Concesionarias';
import Precios from './pages/Precios';
import Recursos from './pages/Recursos';
import Blog from './pages/Blog';
import Footer from './components/Footer';

export default function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<><Home /><Footer /></>} />
        <Route path="/producto" element={<Producto />} />
        <Route path="/concesionarias" element={<Concesionarias />} />
        <Route path="/precios" element={<Precios />} />
        <Route path="/recursos" element={<Recursos />} />
        <Route path="/blog" element={<Blog />} />
      </Routes>
    </HashRouter>
  );
}
