import { Routes, Route } from "react-router-dom";
import React from "react";
import UserLayout from "./components/layout/UserLayout";
import AdminLayout from "./components/layout/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
// import ProductUploadPage from "@/pages/ProductUploadPage_old";
import ProductCollect from "@/pages/ProductCollectPage";
import ProductUpload from "@/pages/ProductUploadPage";
import AdminRouter from "./pages/Admin/AdminRouter";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* 공개 라우트 - Layout 없이 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* 일반 사용자 라우트 - UserLayout 적용 */}
      <Route path="/" element={
        <ProtectedRoute>
          <UserLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="collect" element={<ProductCollect />} />
        <Route path="upload" element={<ProductUpload />} />
      </Route>
      
      {/* 관리자 라우트 - AdminLayout 적용 */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="*" element={<AdminRouter />} />
      </Route>
      
      {/* 기타 라우트 */}
    </Routes>
  );
}