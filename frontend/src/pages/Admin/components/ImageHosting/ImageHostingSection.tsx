// path: frontend/src/pages/Admin/components/ImageHosting/ImageHostingSection.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Table, Badge, Modal, Alert } from 'react-bootstrap';
import { FaCog, FaTrash, FaArchive, FaDownload, FaEye, FaUsers, FaChartLine } from 'react-icons/fa';
import { generateImageFilename } from '@/config/imageNaming';
import '@/styles/admin/imageHosting.css';

// 임시 컴포넌트들 (실제로는 별도 파일로 분리)
const StoragePoliciesTab = ({ policies, onEdit, onDelete, onAdd }: any) => (
    <div className="p-4">
        <h6>저장 정책 관리</h6>
        <div className="d-flex mb-2"><Button onClick={onAdd}>정책 추가</Button></div>
        <Table bordered size="sm">
            <thead><tr><th>이름</th><th>보존(일)</th><th>아카이브(일)</th><th>활성</th><th>액션</th></tr></thead>
            <tbody>
                {policies.map((p: any) => (
                    <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.retentionDays}</td>
                        <td>{p.archiveDays}</td>
                        <td>{p.isActive ? 'Y' : 'N'}</td>
                        <td>
                            <Button size="sm" className="me-2" onClick={() => onEdit(p)}>편집</Button>
                            <Button size="sm" variant="danger" onClick={() => onDelete(p.id)}>삭제</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    </div>
);

const UserManagementTab = ({ users, policies, onApplyPolicy }: any) => (
    <div className="p-4">
        <h6>사용자 정책 매핑</h6>
        <Table bordered size="sm">
            <thead><tr><th>User ID</th><th>정책</th><th>적용</th></tr></thead>
            <tbody>
                {users.map((u: any) => (
                    <tr key={u.userId}>
                        <td>{u.userId}</td>
                        <td>
                            <Form.Select defaultValue={u.policyId || ''} onChange={(e: any) => u._nextPolicy = e.target.value}>
                                <option value="">정책 선택</option>
                                {policies.map((p: any) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                            </Form.Select>
                        </td>
                        <td><Button size="sm" onClick={() => onApplyPolicy(u.userId, u._nextPolicy || u.policyId)}>적용</Button></td>
                    </tr>
                ))}
            </tbody>
        </Table>
    </div>
);

const MonitoringTab = ({ stats, users }: any) => (
    <div className="p-4">
        <h6>모니터링 (개발 중)</h6>
        <p className="text-muted">모니터링 기능이 개발 중입니다.</p>
    </div>
);

const CleanupTab = ({ onExecuteCleanup, schedule, onScheduleSave }: any) => {
    const [mode, setMode] = useState<'archive' | 'delete'>('archive');
    const [days, setDays] = useState(90);
    const [category, setCategory] = useState('thumbnail');
    return (
        <div className="p-4">
            <h6>정리 작업</h6>
            <div className="d-flex gap-2 align-items-center">
                <Form.Select value={mode} onChange={(e: any) => setMode(e.target.value)} style={{ width: 140 }}>
                    <option value="archive">아카이브</option>
                    <option value="delete">삭제</option>
                </Form.Select>
                <Form.Control type="number" value={days} onChange={(e: any) => setDays(parseInt(e.target.value || '0'))} style={{ width: 120 }} />
                <Form.Control type="text" value={category} onChange={(e: any) => setCategory(e.target.value)} style={{ width: 200 }} />
                <Button onClick={() => onExecuteCleanup(mode, days, category)}>실행</Button>
            </div>
            <hr />
            <h6>예약 스케줄</h6>
            <div className="d-flex gap-2 align-items-center">
                <Form.Check type="switch" id="sched-enabled" label="사용" defaultChecked={schedule?.enabled} onChange={(e: any) => schedule.enabled = e.target.checked} />
                <Form.Select defaultValue={schedule?.frequency || 'daily'} onChange={(e: any) => schedule.frequency = e.target.value} style={{ width: 140 }}>
                    <option value="daily">매일</option>
                </Form.Select>
                <Form.Control type="time" defaultValue={schedule?.time_utc || '03:00'} onChange={(e: any) => schedule.time_utc = e.target.value} style={{ width: 140 }} />
                <Form.Select defaultValue={schedule?.mode || 'archive'} onChange={(e: any) => schedule.mode = e.target.value} style={{ width: 140 }}>
                    <option value="archive">아카이브</option>
                    <option value="delete">삭제</option>
                </Form.Select>
                <Form.Control type="number" defaultValue={schedule?.older_than_days || 90} onChange={(e: any) => schedule.older_than_days = parseInt(e.target.value || '0')} style={{ width: 120 }} />
                <Form.Control type="text" defaultValue={schedule?.category || 'thumbnail'} onChange={(e: any) => schedule.category = e.target.value} style={{ width: 200 }} />
                <Button variant="outline-primary" onClick={() => onScheduleSave(schedule)}>저장</Button>
            </div>
        </div>
    );
};

const PolicyEditModal = ({ show, onHide, policy, onSave }: any) => {
    const [form, setForm] = useState<any>({ name: '', retentionDays: 365, archiveDays: 90, softDelete: true, isActive: true });
    useEffect(() => {
        if (policy) setForm({ name: policy.name, retentionDays: policy.retentionDays, archiveDays: policy.archiveDays, softDelete: (policy as any).softDelete ?? true, isActive: policy.isActive });
        else setForm({ name: '', retentionDays: 365, archiveDays: 90, softDelete: true, isActive: true });
    }, [policy, show]);
    const change = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }));
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>정책 편집</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex flex-column gap-2">
                    <Form.Control placeholder="정책 이름" value={form.name} onChange={(e: any) => change('name', e.target.value)} />
                    <Form.Control type="number" placeholder="보존(일)" value={form.retentionDays} onChange={(e: any) => change('retentionDays', parseInt(e.target.value || '0'))} />
                    <Form.Control type="number" placeholder="아카이브(일)" value={form.archiveDays} onChange={(e: any) => change('archiveDays', parseInt(e.target.value || '0'))} />
                    <Form.Check type="switch" id="softDelete" label="소프트 삭제" checked={form.softDelete} onChange={(e: any) => change('softDelete', e.target.checked)} />
                    <Form.Check type="switch" id="isActive" label="활성" checked={form.isActive} onChange={(e: any) => change('isActive', e.target.checked)} />
                    <div className="d-flex justify-content-end"><Button onClick={() => onSave(form)}>저장</Button></div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

const DeleteConfirmModal = ({ show, onHide, onConfirm, title, message }: any) => (
    <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>{message}</p>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>취소</Button>
            <Button variant="danger" onClick={onConfirm}>삭제</Button>
        </Modal.Footer>
    </Modal>
);

interface StoragePolicy {
    id: string;
    name: string;
    retentionDays: number;
    archiveDays: number;
    maxSizeGB: number;
    compressionQuality: number;
    isActive: boolean;
}

interface UserStorage {
    userId: string;
    username: string;
    usedSpaceGB: number;
    maxSpaceGB: number;
    imageCount: number;
    lastUpload: string;
    status: 'active' | 'warning' | 'exceeded';
}

interface ImageStats {
    totalImages: number;
    totalSizeGB: number;
    activeImages: number;
    archivedImages: number;
    deletedImages: number;
}

export default function ImageHostingSection() {
    // 상태 관리
    const [storagePolicies, setStoragePolicies] = useState<StoragePolicy[]>([]);
    const [userStorages, setUserStorages] = useState<UserStorage[]>([]);
    const [imageStats, setImageStats] = useState<ImageStats | null>(null);
    const [selectedPolicy, setSelectedPolicy] = useState<StoragePolicy | null>(null);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'policies' | 'users' | 'monitoring' | 'cleanup'>('policies');
    const [schedule, setSchedule] = useState<any>({ enabled: false, frequency: 'daily', time_utc: '03:00', mode: 'archive', older_than_days: 90, category: 'thumbnail', policy_id: null });

    // 초기 데이터 로드
    useEffect(() => {
        loadInitialData();
        loadPolicies();
        loadUsers();
        loadSchedule();
    }, []);

    const loadInitialData = async () => {
        // 실제 API 호출로 대체
        const mockPolicies: StoragePolicy[] = [
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

        const mockUsers: UserStorage[] = [
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

        const mockStats: ImageStats = {
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
    const fetchJSON = async (input: RequestInfo, init?: RequestInit) => {
        const res = await fetch(input, init);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    };

    const loadPolicies = async () => {
        const data = await fetchJSON('/v1/imagehost/management/policies');
        const mapped = (data.data || []).map((d: any) => ({ id: d.id, name: d.name, retentionDays: d.retention_days ?? d.retentionDays, archiveDays: d.archive_days ?? d.archiveDays, softDelete: d.soft_delete ?? d.softDelete, isActive: d.is_active ?? d.isActive }));
        setStoragePolicies(mapped);
    };

    const savePolicy = async (form: any) => {
        if (selectedPolicy) {
            await fetchJSON(`/v1/imagehost/management/policies/${selectedPolicy.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, retention_days: form.retentionDays, archive_days: form.archiveDays, soft_delete: form.softDelete, is_active: form.isActive }) });
        } else {
            await fetchJSON('/v1/imagehost/management/policies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, retention_days: form.retentionDays, archive_days: form.archiveDays, soft_delete: form.softDelete, is_active: form.isActive }) });
        }
        setShowPolicyModal(false); setSelectedPolicy(null); await loadPolicies();
    };

    const removePolicy = async (policyId: string) => {
        await fetchJSON(`/v1/imagehost/management/policies/${policyId}`, { method: 'DELETE' });
        await loadPolicies();
    };

    const loadUsers = async () => {
        const data = await fetchJSON('/v1/imagehost/management/users');
        const mapped = (data.data || []).map((d: any) => ({ userId: d.user_id, policyId: d.policy_id }));
        setUserStorages(mapped);
    };

    const applyPolicyToUser = async (userId: string, policyId: string) => {
        if (!policyId) return;
        await fetchJSON(`/v1/imagehost/management/users/${userId}/policy/${policyId}`, { method: 'PUT' });
        await loadUsers();
    };

    const loadSchedule = async () => {
        const data = await fetchJSON('/v1/imagehost/management/schedule');
        setSchedule(data.data);
    };

    const saveSchedule = async (payload: any) => {
        await fetchJSON('/v1/imagehost/management/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await loadSchedule();
    };

    // 정책 관리
    const handlePolicySave = (policy: StoragePolicy) => {
        // 저장 API 호출
        savePolicy(policy);
    };

    const handlePolicyDelete = (policyId: string) => {
        removePolicy(policyId).then(() => setShowDeleteModal(false));
    };

    // 사용자별 정책 적용 - 실제 API 바인딩은 아래 load/apply 함수에서 처리

    // 일괄 정리 작업
    const executeCleanup = async (type: 'archive' | 'delete', days?: number, category?: string) => {
        try {
            await fetch(`/v1/imagehost/management/cleanup`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: type, older_than_days: days || 90, category: category || 'thumbnail' })
            });
            // 성공 메시지 표시
        } catch (error) {
            console.error('정리 작업 실패:', error);
        }
    };

    // 파일명 규칙 테스트
    const testFilenameGeneration = () => {
        const testFilename = generateImageFilename('A00000020711907', 'thumbnail', 'jpg');
        console.log('생성된 파일명:', testFilename);
    };

    return (
        <div className="image-hosting-section">
            {/* 통계 카드 */}
            {imageStats && (
                <Row className="mb-4 p-3">
                    <Col md={3}>
                        <Card className="stat-card">
                            <Card.Body>
                                <div className="stat-icon active">
                                    <FaEye />
                                </div>
                                <div className="stat-content">
                                    <h4>{imageStats.activeImages.toLocaleString()}</h4>
                                    <p>활성 이미지</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="stat-card">
                            <Card.Body>
                                <div className="stat-icon archived">
                                    <FaArchive />
                                </div>
                                <div className="stat-content">
                                    <h4>{imageStats.archivedImages.toLocaleString()}</h4>
                                    <p>아카이브</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="stat-card">
                            <Card.Body>
                                <div className="stat-icon total">
                                    <FaChartLine />
                                </div>
                                <div className="stat-content">
                                    <h4>{imageStats.totalSizeGB.toFixed(1)} GB</h4>
                                    <p>총 사용량</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="stat-card">
                            <Card.Body>
                                <div className="stat-icon users">
                                    <FaUsers />
                                </div>
                                <div className="stat-content">
                                    <h4>{userStorages.length}</h4>
                                    <p>활성 사용자</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* 탭 네비게이션 */}
            <div className="tab-navigation mb-4 mx-3">
                <Button
                    variant={activeTab === 'policies' ? 'primary' : 'outline-primary'}
                    onClick={() => setActiveTab('policies')}
                    className="me-2"
                >
                    <FaCog className="me-1" />저장 정책
                </Button>
                <Button
                    variant={activeTab === 'users' ? 'primary' : 'outline-primary'}
                    onClick={() => setActiveTab('users')}
                    className="me-2"
                >
                    <FaUsers className="me-1" />사용자 관리
                </Button>
                <Button
                    variant={activeTab === 'monitoring' ? 'primary' : 'outline-primary'}
                    onClick={() => setActiveTab('monitoring')}
                    className="me-2"
                >
                    <FaChartLine className="me-1" />모니터링
                </Button>
                <Button
                    variant={activeTab === 'cleanup' ? 'primary' : 'outline-primary'}
                    onClick={() => setActiveTab('cleanup')}
                >
                    <FaTrash className="me-1" />정리 작업
                </Button>
                <Button
                    variant="outline-info"
                    onClick={testFilenameGeneration}
                    className="ms-2"
                >
                    파일명 규칙 테스트
                </Button>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="mx-3">
                {activeTab === 'policies' && (
                    <StoragePoliciesTab
                        policies={storagePolicies}
                        onEdit={(policy) => {
                            setSelectedPolicy(policy);
                            setShowPolicyModal(true);
                        }}
                        onDelete={(policyId) => {
                            setSelectedPolicy(storagePolicies.find(p => p.id === policyId) || null);
                            setShowDeleteModal(true);
                        }}
                        onAdd={() => {
                            setSelectedPolicy(null);
                            setShowPolicyModal(true);
                        }}
                    />
                )}

                {activeTab === 'users' && (
                    <UserManagementTab
                        users={userStorages}
                        policies={storagePolicies}
                        onApplyPolicy={applyPolicyToUser}
                    />
                )}

                {activeTab === 'monitoring' && (
                    <MonitoringTab
                        stats={imageStats}
                        users={userStorages}
                    />
                )}

                {activeTab === 'cleanup' && (
                    <CleanupTab
                        onExecuteCleanup={executeCleanup}
                        schedule={schedule}
                        onScheduleSave={saveSchedule}
                    />
                )}
            </div>

            {/* 정책 편집 모달 */}
            <PolicyEditModal
                show={showPolicyModal}
                onHide={() => setShowPolicyModal(false)}
                policy={selectedPolicy}
                onSave={handlePolicySave}
            />

            {/* 삭제 확인 모달 */}
            <DeleteConfirmModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={() => selectedPolicy && handlePolicyDelete(selectedPolicy.id)}
                title="저장 정책 삭제"
                message="이 정책을 삭제하시겠습니까? 적용된 사용자들의 설정이 초기화됩니다."
            />
        </div>
    );
}
