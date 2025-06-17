import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import ProductManagePage from "./pages/ProductManagePage";
// ...etc

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/manage" element={<ProductManagePage />} />
        {/* 기타 라우트 */}
      </Routes>
    </Layout>
  );
}