import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/DashboardPage";
// import ProductUploadPage from "@/pages/ProductUploadPage_old";
import ProductCollect from "@/pages/ProductCollectPage";
// ...etc

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        {/* <Route path="/upload_old" element={<ProductUploadPage />} /> */}
        <Route path="/collect" element={<ProductCollect />} />
        {/* 기타 라우트 */}
      </Routes>
    </Layout>
  );
}