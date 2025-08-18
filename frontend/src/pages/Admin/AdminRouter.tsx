// path: frontend/src/pages/Admin/AdminRouter.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Admin from './Admin';

export default function AdminRouter() {
    return (
        <Routes>
            <Route path="/" element={<Admin />} />
            {/* 향후 추가될 admin 하위 페이지들 */}
            {/* <Route path="/users" element={<UserManagement />} /> */}
            {/* <Route path="/system" element={<SystemMonitoring />} /> */}
            {/* <Route path="/database" element={<DatabaseManagement />} /> */}
            {/* <Route path="/security" element={<SecuritySettings />} /> */}
        </Routes>
    );
}
