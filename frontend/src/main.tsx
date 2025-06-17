import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import App from './App';
import ProductManagePage from './pages/ProductManagePage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/product-manage" element={<ProductManagePage />} />
        {/* 필요하면 다른 페이지도 추가 */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
