import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// path: frontend/src/pages/Admin/components/ImageHosting/ImageHostingSection.tsx
import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Table, Modal } from 'react-bootstrap';
import { FaCog, FaTrash, FaArchive, FaEye, FaUsers, FaChartLine } from 'react-icons/fa';
import { generateImageFilename } from '@/config/imageNaming';
import '@/styles/admin/imageHosting.css';
// 임시 컴포넌트들 (실제로는 별도 파일로 분리)
const StoragePoliciesTab = ({ policies, onEdit, onDelete, onAdd }) => (_jsxs("div", { className: "p-4", children: [_jsx("h6", { children: "\uC800\uC7A5 \uC815\uCC45 \uAD00\uB9AC" }), _jsx("div", { className: "d-flex mb-2", children: _jsx(Button, { onClick: onAdd, children: "\uC815\uCC45 \uCD94\uAC00" }) }), _jsxs(Table, { bordered: true, size: "sm", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "\uC774\uB984" }), _jsx("th", { children: "\uBCF4\uC874(\uC77C)" }), _jsx("th", { children: "\uC544\uCE74\uC774\uBE0C(\uC77C)" }), _jsx("th", { children: "\uD65C\uC131" }), _jsx("th", { children: "\uC561\uC158" })] }) }), _jsx("tbody", { children: policies.map((p) => (_jsxs("tr", { children: [_jsx("td", { children: p.name }), _jsx("td", { children: p.retentionDays }), _jsx("td", { children: p.archiveDays }), _jsx("td", { children: p.isActive ? 'Y' : 'N' }), _jsxs("td", { children: [_jsx(Button, { size: "sm", className: "me-2", onClick: () => onEdit(p), children: "\uD3B8\uC9D1" }), _jsx(Button, { size: "sm", variant: "danger", onClick: () => onDelete(p.id), children: "\uC0AD\uC81C" })] })] }, p.id))) })] })] }));
const UserManagementTab = ({ users, policies, onApplyPolicy }) => (_jsxs("div", { className: "p-4", children: [_jsx("h6", { children: "\uC0AC\uC6A9\uC790 \uC815\uCC45 \uB9E4\uD551" }), _jsxs(Table, { bordered: true, size: "sm", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "User ID" }), _jsx("th", { children: "\uC815\uCC45" }), _jsx("th", { children: "\uC801\uC6A9" })] }) }), _jsx("tbody", { children: users.map((u) => (_jsxs("tr", { children: [_jsx("td", { children: u.userId }), _jsx("td", { children: _jsxs(Form.Select, { defaultValue: u.policyId || '', onChange: (e) => u._nextPolicy = e.target.value, children: [_jsx("option", { value: "", children: "\uC815\uCC45 \uC120\uD0DD" }), policies.map((p) => (_jsx("option", { value: p.id, children: p.name }, p.id)))] }) }), _jsx("td", { children: _jsx(Button, { size: "sm", onClick: () => onApplyPolicy(u.userId, u._nextPolicy || u.policyId), children: "\uC801\uC6A9" }) })] }, u.userId))) })] })] }));
const MonitoringTab = ({ stats, users }) => (_jsxs("div", { className: "p-4", children: [_jsx("h6", { children: "\uBAA8\uB2C8\uD130\uB9C1 (\uAC1C\uBC1C \uC911)" }), _jsx("p", { className: "text-muted", children: "\uBAA8\uB2C8\uD130\uB9C1 \uAE30\uB2A5\uC774 \uAC1C\uBC1C \uC911\uC785\uB2C8\uB2E4." })] }));
const CleanupTab = ({ onExecuteCleanup, schedule, onScheduleSave }) => {
    const [mode, setMode] = useState('archive');
    const [days, setDays] = useState(90);
    const [category, setCategory] = useState('thumbnail');
    return (_jsxs("div", { className: "p-4", children: [_jsx("h6", { children: "\uC815\uB9AC \uC791\uC5C5" }), _jsxs("div", { className: "d-flex gap-2 align-items-center", children: [_jsxs(Form.Select, { value: mode, onChange: (e) => setMode(e.target.value), style: { width: 140 }, children: [_jsx("option", { value: "archive", children: "\uC544\uCE74\uC774\uBE0C" }), _jsx("option", { value: "delete", children: "\uC0AD\uC81C" })] }), _jsx(Form.Control, { type: "number", value: days, onChange: (e) => setDays(parseInt(e.target.value || '0')), style: { width: 120 } }), _jsx(Form.Control, { type: "text", value: category, onChange: (e) => setCategory(e.target.value), style: { width: 200 } }), _jsx(Button, { onClick: () => onExecuteCleanup(mode, days, category), children: "\uC2E4\uD589" })] }), _jsx("hr", {}), _jsx("h6", { children: "\uC608\uC57D \uC2A4\uCF00\uC904" }), _jsxs("div", { className: "d-flex gap-2 align-items-center", children: [_jsx(Form.Check, { type: "switch", id: "sched-enabled", label: "\uC0AC\uC6A9", defaultChecked: schedule?.enabled, onChange: (e) => schedule.enabled = e.target.checked }), _jsx(Form.Select, { defaultValue: schedule?.frequency || 'daily', onChange: (e) => schedule.frequency = e.target.value, style: { width: 140 }, children: _jsx("option", { value: "daily", children: "\uB9E4\uC77C" }) }), _jsx(Form.Control, { type: "time", defaultValue: schedule?.time_utc || '03:00', onChange: (e) => schedule.time_utc = e.target.value, style: { width: 140 } }), _jsxs(Form.Select, { defaultValue: schedule?.mode || 'archive', onChange: (e) => schedule.mode = e.target.value, style: { width: 140 }, children: [_jsx("option", { value: "archive", children: "\uC544\uCE74\uC774\uBE0C" }), _jsx("option", { value: "delete", children: "\uC0AD\uC81C" })] }), _jsx(Form.Control, { type: "number", defaultValue: schedule?.older_than_days || 90, onChange: (e) => schedule.older_than_days = parseInt(e.target.value || '0'), style: { width: 120 } }), _jsx(Form.Control, { type: "text", defaultValue: schedule?.category || 'thumbnail', onChange: (e) => schedule.category = e.target.value, style: { width: 200 } }), _jsx(Button, { variant: "outline-primary", onClick: () => onScheduleSave(schedule), children: "\uC800\uC7A5" })] })] }));
};
const PolicyEditModal = ({ show, onHide, policy, onSave }) => {
    const [form, setForm] = useState({ name: '', retentionDays: 365, archiveDays: 90, softDelete: true, isActive: true });
    useEffect(() => {
        if (policy)
            setForm({ name: policy.name, retentionDays: policy.retentionDays, archiveDays: policy.archiveDays, softDelete: policy.softDelete ?? true, isActive: policy.isActive });
        else
            setForm({ name: '', retentionDays: 365, archiveDays: 90, softDelete: true, isActive: true });
    }, [policy, show]);
    const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));
    return (_jsxs(Modal, { show: show, onHide: onHide, children: [_jsx(Modal.Header, { closeButton: true, children: _jsx(Modal.Title, { children: "\uC815\uCC45 \uD3B8\uC9D1" }) }), _jsx(Modal.Body, { children: _jsxs("div", { className: "d-flex flex-column gap-2", children: [_jsx(Form.Control, { placeholder: "\uC815\uCC45 \uC774\uB984", value: form.name, onChange: (e) => change('name', e.target.value) }), _jsx(Form.Control, { type: "number", placeholder: "\uBCF4\uC874(\uC77C)", value: form.retentionDays, onChange: (e) => change('retentionDays', parseInt(e.target.value || '0')) }), _jsx(Form.Control, { type: "number", placeholder: "\uC544\uCE74\uC774\uBE0C(\uC77C)", value: form.archiveDays, onChange: (e) => change('archiveDays', parseInt(e.target.value || '0')) }), _jsx(Form.Check, { type: "switch", id: "softDelete", label: "\uC18C\uD504\uD2B8 \uC0AD\uC81C", checked: form.softDelete, onChange: (e) => change('softDelete', e.target.checked) }), _jsx(Form.Check, { type: "switch", id: "isActive", label: "\uD65C\uC131", checked: form.isActive, onChange: (e) => change('isActive', e.target.checked) }), _jsx("div", { className: "d-flex justify-content-end", children: _jsx(Button, { onClick: () => onSave(form), children: "\uC800\uC7A5" }) })] }) })] }));
};
const DeleteConfirmModal = ({ show, onHide, onConfirm, title, message }) => (_jsxs(Modal, { show: show, onHide: onHide, children: [_jsx(Modal.Header, { closeButton: true, children: _jsx(Modal.Title, { children: title }) }), _jsx(Modal.Body, { children: _jsx("p", { children: message }) }), _jsxs(Modal.Footer, { children: [_jsx(Button, { variant: "secondary", onClick: onHide, children: "\uCDE8\uC18C" }), _jsx(Button, { variant: "danger", onClick: onConfirm, children: "\uC0AD\uC81C" })] })] }));
export default function ImageHostingSection() {
    // 상태 관리
    const [storagePolicies, setStoragePolicies] = useState([]);
    const [userStorages, setUserStorages] = useState([]);
    const [imageStats, setImageStats] = useState(null);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState('policies');
    const [schedule, setSchedule] = useState({ enabled: false, frequency: 'daily', time_utc: '03:00', mode: 'archive', older_than_days: 90, category: 'thumbnail', policy_id: null });
    // 초기 데이터 로드
    useEffect(() => {
        loadInitialData();
        loadPolicies();
        loadUsers();
        loadSchedule();
    }, []);
    const loadInitialData = async () => {
        // 실제 API 호출로 대체
        const mockPolicies = [
            {
                id: '1',
                name: '기본 정책',
                retentionDays: 365,
                archiveDays: 90,
                maxSizeGB: 10,
                compressionQuality: 85,
                isActive: true
            },
            {
                id: '2',
                name: '프리미엄 정책',
                retentionDays: 730,
                archiveDays: 180,
                maxSizeGB: 50,
                compressionQuality: 90,
                isActive: true
            }
        ];
        const mockUsers = [
            {
                userId: 'user1',
                username: '관리자',
                usedSpaceGB: 2.5,
                maxSpaceGB: 10,
                imageCount: 150,
                lastUpload: '2025-08-18',
                status: 'active'
            },
            {
                userId: 'user2',
                username: '일반사용자',
                usedSpaceGB: 8.2,
                maxSpaceGB: 10,
                imageCount: 320,
                lastUpload: '2025-08-17',
                status: 'warning'
            }
        ];
        const mockStats = {
            totalImages: 470,
            totalSizeGB: 10.7,
            activeImages: 420,
            archivedImages: 35,
            deletedImages: 15
        };
        setStoragePolicies(mockPolicies);
        setUserStorages(mockUsers);
        setImageStats(mockStats);
    };
    // API helpers
    const fetchJSON = async (input, init) => {
        const res = await fetch(input, init);
        if (!res.ok)
            throw new Error(await res.text());
        return res.json();
    };
    const loadPolicies = async () => {
        const data = await fetchJSON('/v1/imagehost/management/policies');
        const mapped = (data.data || []).map((d) => ({ id: d.id, name: d.name, retentionDays: d.retention_days ?? d.retentionDays, archiveDays: d.archive_days ?? d.archiveDays, softDelete: d.soft_delete ?? d.softDelete, isActive: d.is_active ?? d.isActive }));
        setStoragePolicies(mapped);
    };
    const savePolicy = async (form) => {
        if (selectedPolicy) {
            await fetchJSON(`/v1/imagehost/management/policies/${selectedPolicy.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, retention_days: form.retentionDays, archive_days: form.archiveDays, soft_delete: form.softDelete, is_active: form.isActive }) });
        }
        else {
            await fetchJSON('/v1/imagehost/management/policies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, retention_days: form.retentionDays, archive_days: form.archiveDays, soft_delete: form.softDelete, is_active: form.isActive }) });
        }
        setShowPolicyModal(false);
        setSelectedPolicy(null);
        await loadPolicies();
    };
    const removePolicy = async (policyId) => {
        await fetchJSON(`/v1/imagehost/management/policies/${policyId}`, { method: 'DELETE' });
        await loadPolicies();
    };
    const loadUsers = async () => {
        const data = await fetchJSON('/v1/imagehost/management/users');
        const mapped = (data.data || []).map((d) => ({ userId: d.user_id, policyId: d.policy_id }));
        setUserStorages(mapped);
    };
    const applyPolicyToUser = async (userId, policyId) => {
        if (!policyId)
            return;
        await fetchJSON(`/v1/imagehost/management/users/${userId}/policy/${policyId}`, { method: 'PUT' });
        await loadUsers();
    };
    const loadSchedule = async () => {
        const data = await fetchJSON('/v1/imagehost/management/schedule');
        setSchedule(data.data);
    };
    const saveSchedule = async (payload) => {
        await fetchJSON('/v1/imagehost/management/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await loadSchedule();
    };
    // 정책 관리
    const handlePolicySave = (policy) => {
        // 저장 API 호출
        savePolicy(policy);
    };
    const handlePolicyDelete = (policyId) => {
        removePolicy(policyId).then(() => setShowDeleteModal(false));
    };
    // 사용자별 정책 적용 - 실제 API 바인딩은 아래 load/apply 함수에서 처리
    // 일괄 정리 작업
    const executeCleanup = async (type, days, category) => {
        try {
            await fetch(`/v1/imagehost/management/cleanup`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: type, older_than_days: days || 90, category: category || 'thumbnail' })
            });
            // 성공 메시지 표시
        }
        catch (error) {
            console.error('정리 작업 실패:', error);
        }
    };
    // 파일명 규칙 테스트
    const testFilenameGeneration = () => {
        const testFilename = generateImageFilename('A00000020711907', 'thumbnail', 'jpg');
        console.log('생성된 파일명:', testFilename);
    };
    return (_jsxs("div", { className: "image-hosting-section", children: [imageStats && (_jsxs(Row, { className: "mb-4 p-3", children: [_jsx(Col, { md: 3, children: _jsx(Card, { className: "stat-card", children: _jsxs(Card.Body, { children: [_jsx("div", { className: "stat-icon active", children: _jsx(FaEye, {}) }), _jsxs("div", { className: "stat-content", children: [_jsx("h4", { children: imageStats.activeImages.toLocaleString() }), _jsx("p", { children: "\uD65C\uC131 \uC774\uBBF8\uC9C0" })] })] }) }) }), _jsx(Col, { md: 3, children: _jsx(Card, { className: "stat-card", children: _jsxs(Card.Body, { children: [_jsx("div", { className: "stat-icon archived", children: _jsx(FaArchive, {}) }), _jsxs("div", { className: "stat-content", children: [_jsx("h4", { children: imageStats.archivedImages.toLocaleString() }), _jsx("p", { children: "\uC544\uCE74\uC774\uBE0C" })] })] }) }) }), _jsx(Col, { md: 3, children: _jsx(Card, { className: "stat-card", children: _jsxs(Card.Body, { children: [_jsx("div", { className: "stat-icon total", children: _jsx(FaChartLine, {}) }), _jsxs("div", { className: "stat-content", children: [_jsxs("h4", { children: [imageStats.totalSizeGB.toFixed(1), " GB"] }), _jsx("p", { children: "\uCD1D \uC0AC\uC6A9\uB7C9" })] })] }) }) }), _jsx(Col, { md: 3, children: _jsx(Card, { className: "stat-card", children: _jsxs(Card.Body, { children: [_jsx("div", { className: "stat-icon users", children: _jsx(FaUsers, {}) }), _jsxs("div", { className: "stat-content", children: [_jsx("h4", { children: userStorages.length }), _jsx("p", { children: "\uD65C\uC131 \uC0AC\uC6A9\uC790" })] })] }) }) })] })), _jsxs("div", { className: "tab-navigation mb-4 mx-3", children: [_jsxs(Button, { variant: activeTab === 'policies' ? 'primary' : 'outline-primary', onClick: () => setActiveTab('policies'), className: "me-2", children: [_jsx(FaCog, { className: "me-1" }), "\uC800\uC7A5 \uC815\uCC45"] }), _jsxs(Button, { variant: activeTab === 'users' ? 'primary' : 'outline-primary', onClick: () => setActiveTab('users'), className: "me-2", children: [_jsx(FaUsers, { className: "me-1" }), "\uC0AC\uC6A9\uC790 \uAD00\uB9AC"] }), _jsxs(Button, { variant: activeTab === 'monitoring' ? 'primary' : 'outline-primary', onClick: () => setActiveTab('monitoring'), className: "me-2", children: [_jsx(FaChartLine, { className: "me-1" }), "\uBAA8\uB2C8\uD130\uB9C1"] }), _jsxs(Button, { variant: activeTab === 'cleanup' ? 'primary' : 'outline-primary', onClick: () => setActiveTab('cleanup'), children: [_jsx(FaTrash, { className: "me-1" }), "\uC815\uB9AC \uC791\uC5C5"] }), _jsx(Button, { variant: "outline-info", onClick: testFilenameGeneration, className: "ms-2", children: "\uD30C\uC77C\uBA85 \uADDC\uCE59 \uD14C\uC2A4\uD2B8" })] }), _jsxs("div", { className: "mx-3", children: [activeTab === 'policies' && (_jsx(StoragePoliciesTab, { policies: storagePolicies, onEdit: (policy) => {
                            setSelectedPolicy(policy);
                            setShowPolicyModal(true);
                        }, onDelete: (policyId) => {
                            setSelectedPolicy(storagePolicies.find(p => p.id === policyId) || null);
                            setShowDeleteModal(true);
                        }, onAdd: () => {
                            setSelectedPolicy(null);
                            setShowPolicyModal(true);
                        } })), activeTab === 'users' && (_jsx(UserManagementTab, { users: userStorages, policies: storagePolicies, onApplyPolicy: applyPolicyToUser })), activeTab === 'monitoring' && (_jsx(MonitoringTab, { stats: imageStats, users: userStorages })), activeTab === 'cleanup' && (_jsx(CleanupTab, { onExecuteCleanup: executeCleanup, schedule: schedule, onScheduleSave: saveSchedule }))] }), _jsx(PolicyEditModal, { show: showPolicyModal, onHide: () => setShowPolicyModal(false), policy: selectedPolicy, onSave: handlePolicySave }), _jsx(DeleteConfirmModal, { show: showDeleteModal, onHide: () => setShowDeleteModal(false), onConfirm: () => selectedPolicy && handlePolicyDelete(selectedPolicy.id), title: "\uC800\uC7A5 \uC815\uCC45 \uC0AD\uC81C", message: "\uC774 \uC815\uCC45\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C? \uC801\uC6A9\uB41C \uC0AC\uC6A9\uC790\uB4E4\uC758 \uC124\uC815\uC774 \uCD08\uAE30\uD654\uB429\uB2C8\uB2E4." })] }));
}
