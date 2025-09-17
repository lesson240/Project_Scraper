// path: frontend/src/components/layout/UserLayout.tsx

import React from "react";
import { Outlet } from "react-router-dom";
import Layout from "./Layout";

/**
 * 일반 사용자용 Layout 컴포넌트
 * - 일반 사용자 권한이 필요한 페이지에 적용
 * - 사용자 친화적인 UI/UX 제공
 */
export default function UserLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
