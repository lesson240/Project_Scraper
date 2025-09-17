// path: frontend/src/components/layout/AdminLayout.tsx

import React from "react";
import { Outlet } from "react-router-dom";
import Layout from "./Layout";

/**
 * 관리자 전용 Layout 컴포넌트
 * - 관리자 권한이 필요한 페이지에 적용
 * - 향후 관리자 전용 기능 추가 가능 (관리자 전용 사이드바, 헤더 등)
 */
export default function AdminLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
