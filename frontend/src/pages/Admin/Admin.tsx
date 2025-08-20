// path: frontend/src/pages/Admin/Admin.tsx
import React, { useState, useEffect } from 'react';
import AdminRouter from './AdminRouter';
import { customsApiService, ExchangeRateInfo } from '@/apis/customsApi';
import ImageHostingSection from './components/ImageHosting/ImageHostingSection';
import { FaCog, FaUsers, FaChartLine, FaImage, FaDatabase, FaShieldAlt, FaGlobe } from 'react-icons/fa';
import './Admin.css';

interface ApiInfo {
    id: string;
    name: string;
    endpoint: string;
    dataFormat: string;
    authKey: string;
    authKeyDecoded: string;
    status: 'active' | 'inactive' | 'expired';
    lastUsed: string;
    usageCount: number;
    costPerCall: number;
    monthlyLimit: number;
    monthlyUsage: number;
    expirationDate: string;
    description: string;
}

export default function Admin() {
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // API 정보 상태
    const [apis, setApis] = useState<ApiInfo[]>([
        {
            id: 'customs_exchange_rate',
            name: '관세청 환율정보 API',
            endpoint: 'https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo',
            dataFormat: 'XML',
            authKey: import.meta.env.VITE_CUSTOMS_API_KEY || 'API 키가 설정되지 않음',
            authKeyDecoded: import.meta.env.VITE_CUSTOMS_API_KEY ? decodeURIComponent(import.meta.env.VITE_CUSTOMS_API_KEY) : 'API 키가 설정되지 않음',
            status: 'active',
            lastUsed: '2024-08-20 10:30:00',
            usageCount: 1250,
            costPerCall: 0,
            monthlyLimit: 10000,
            monthlyUsage: 1250,
            expirationDate: '2025-12-31',
            description: '관세청에서 제공하는 환율 정보 API로, 실시간 환율 데이터를 제공합니다.'
        }
    ]);

    const [newApi, setNewApi] = useState<Partial<ApiInfo>>({
        name: '',
        endpoint: '',
        dataFormat: 'XML',
        authKey: '',
        description: ''
    });

    const [showAddForm, setShowAddForm] = useState(false);
    
    // API 테스트 상태
    const [isTestingApi, setIsTestingApi] = useState(false);
    const [apiTestResult, setApiTestResult] = useState<{
        isConnected: boolean;
        message: string;
        exchangeRates?: ExchangeRateInfo[];
    } | null>(null);

    // API 테스트 실행
    const handleTestApi = async (apiId: string) => {
        if (apiId === 'customs_exchange_rate') {
            setIsTestingApi(true);
            setApiTestResult(null);
            
            try {
                // API 연결 상태 확인
                const status = await customsApiService.checkApiStatus();
                
                if (status.isConnected) {
                    // 주요 통화 환율 정보 조회
                    const rates = await customsApiService.getMajorExchangeRates();
                    setApiTestResult({
                        isConnected: true,
                        message: 'API 연결 및 데이터 조회 성공',
                        exchangeRates: rates
                    });
                    
                    // 사용량 업데이트
                    setApis(prev => prev.map(api => 
                        api.id === apiId 
                            ? { 
                                ...api, 
                                lastUsed: new Date().toLocaleString(),
                                monthlyUsage: api.monthlyUsage + 1,
                                usageCount: api.usageCount + 1
                            }
                            : api
                    ));
                } else {
                    setApiTestResult({
                        isConnected: false,
                        message: status.message
                    });
                }
            } catch (error) {
                setApiTestResult({
                    isConnected: false,
                    message: `API 테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
                });
            } finally {
                setIsTestingApi(false);
            }
        }
    };

    // API 추가
    const handleAddApi = () => {
        if (newApi.name && newApi.endpoint && newApi.authKey) {
            const api: ApiInfo = {
                id: `api_${Date.now()}`,
                name: newApi.name,
                endpoint: newApi.endpoint,
                dataFormat: newApi.dataFormat || 'JSON',
                authKey: newApi.authKey,
                authKeyDecoded: decodeURIComponent(newApi.authKey),
                status: 'active',
                lastUsed: '-',
                usageCount: 0,
                costPerCall: 0,
                monthlyLimit: 1000,
                monthlyUsage: 0,
                expirationDate: '2025-12-31',
                description: newApi.description || ''
            };
            
            setApis(prev => [...prev, api]);
            setNewApi({
                name: '',
                endpoint: '',
                dataFormat: 'XML',
                authKey: '',
                description: ''
            });
            setShowAddForm(false);
        }
    };

    // API 상태 변경
    const handleToggleApiStatus = (apiId: string) => {
        setApis(prev => prev.map(api => 
            api.id === apiId 
                ? { ...api, status: api.status === 'active' ? 'inactive' : 'active' }
                : api
        ));
    };

    // API 삭제
    const handleDeleteApi = (apiId: string) => {
        setApis(prev => prev.filter(api => api.id !== apiId));
    };

    // API 관리 UI 렌더링
    const renderApiManagement = () => (
        <div className="api-management-section">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>API 관리</h3>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? '취소' : '새 API 추가'}
                </button>
            </div>

            {/* API 추가 폼 */}
            {showAddForm && (
                <div className="api-add-form mb-4 p-4 border rounded">
                    <h4>새 API 추가</h4>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">API 이름</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newApi.name}
                                onChange={(e) => setNewApi(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="API 이름을 입력하세요"
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">엔드포인트</label>
                            <input
                                type="url"
                                className="form-control"
                                value={newApi.endpoint}
                                onChange={(e) => setNewApi(prev => ({ ...prev, endpoint: e.target.value }))}
                                placeholder="https://api.example.com/endpoint"
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">데이터 형식</label>
                            <select
                                className="form-select"
                                value={newApi.dataFormat}
                                onChange={(e) => setNewApi(prev => ({ ...prev, dataFormat: e.target.value }))}
                            >
                                <option value="JSON">JSON</option>
                                <option value="XML">XML</option>
                                <option value="CSV">CSV</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">인증 키</label>
                            <input
                                type="password"
                                className="form-control"
                                value={newApi.authKey}
                                onChange={(e) => setNewApi(prev => ({ ...prev, authKey: e.target.value }))}
                                placeholder="API 인증 키를 입력하세요"
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">설명</label>
                        <textarea
                            className="form-control"
                            value={newApi.description}
                            onChange={(e) => setNewApi(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="API에 대한 설명을 입력하세요"
                            rows={3}
                        />
                    </div>
                    <button 
                        className="btn btn-success"
                        onClick={handleAddApi}
                        disabled={!newApi.name || !newApi.endpoint || !newApi.authKey}
                    >
                        API 추가
                    </button>
                </div>
            )}

            {/* API 목록 */}
            <div className="api-list">
                {apis.map(api => (
                    <div key={api.id} className="api-card mb-3 p-4 border rounded">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 className="mb-2">{api.name}</h5>
                                <p className="text-muted mb-2">{api.description}</p>
                                <div className="api-details">
                                    <small className="text-muted">
                                        <strong>엔드포인트:</strong> {api.endpoint}
                                    </small>
                                    <br />
                                    <small className="text-muted">
                                        <strong>형식:</strong> {api.dataFormat}
                                    </small>
                                    <br />
                                    <small className="text-muted">
                                        <strong>상태:</strong> 
                                        <span className={`badge ms-2 ${api.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                            {api.status === 'active' ? '활성' : '비활성'}
                                        </span>
                                    </small>
                                </div>
                            </div>
                            <div className="api-actions">
                                <button 
                                    className={`btn btn-sm ${api.status === 'active' ? 'btn-warning' : 'btn-success'} me-2`}
                                    onClick={() => handleToggleApiStatus(api.id)}
                                >
                                    {api.status === 'active' ? '비활성화' : '활성화'}
                                </button>
                                <button 
                                    className="btn btn-sm btn-info me-2"
                                    onClick={() => handleTestApi(api.id)}
                                    disabled={isTestingApi}
                                >
                                    {isTestingApi ? '테스트 중...' : '테스트'}
                                </button>
                                <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteApi(api.id)}
                                >
                                    삭제
                                </button>
                            </div>
                        </div>

                        {/* API 사용 통계 */}
                        <div className="api-stats mt-3 pt-3 border-top">
                            <div className="row text-center">
                                <div className="col">
                                    <small className="text-muted">총 호출</small>
                                    <div className="fw-bold">{api.usageCount.toLocaleString()}</div>
                                </div>
                                <div className="col">
                                    <small className="text-muted">월간 사용량</small>
                                    <div className="fw-bold">{api.monthlyUsage.toLocaleString()}</div>
                                </div>
                                <div className="col">
                                    <small className="text-muted">마지막 사용</small>
                                    <div className="fw-bold">{api.lastUsed}</div>
                                </div>
                                <div className="col">
                                    <small className="text-muted">만료일</small>
                                    <div className="fw-bold">{api.expirationDate}</div>
                                </div>
                            </div>
                        </div>

                        {/* API 테스트 결과 */}
                        {apiTestResult && api.id === 'customs_exchange_rate' && (
                            <div className={`api-test-result mt-3 p-3 rounded ${apiTestResult.isConnected ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                                <h6>테스트 결과</h6>
                                <p className="mb-2">{apiTestResult.message}</p>
                                {apiTestResult.exchangeRates && (
                                    <div>
                                        <strong>환율 정보:</strong>
                                        <ul className="list-unstyled mt-2">
                                            {apiTestResult.exchangeRates.map((rate, index) => (
                                                <li key={index}>
                                                    {rate.currencyCode}: {rate.exchangeRate.toLocaleString()}원
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

  return (
        <div className="admin-container">
            {/* 탭 네비게이션 */}
      <div className="admin-tabs">
                <button 
                    className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <FaCog className="me-2" />
                    대시보드
                </button>
                <button 
                    className={`tab-button ${activeTab === 'imageHosting' ? 'active' : ''}`}
                    onClick={() => setActiveTab('imageHosting')}
                >
                    <FaImage className="me-2" />
                    이미지 호스팅
                </button>
                <button 
                    className={`tab-button ${activeTab === 'api' ? 'active' : ''}`}
                    onClick={() => setActiveTab('api')}
                >
                    <FaGlobe className="me-2" />
                    API 관리
                </button>
                <button 
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <FaUsers className="me-2" />
                    사용자 관리
                </button>
                <button 
                    className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
                    onClick={() => setActiveTab('system')}
                >
                    <FaChartLine className="me-2" />
                    시스템 모니터링
                </button>
                <button 
                    className={`tab-button ${activeTab === 'database' ? 'active' : ''}`}
                    onClick={() => setActiveTab('database')}
                >
                    <FaDatabase className="me-2" />
                    데이터베이스 관리
                </button>
                <button 
                    className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <FaShieldAlt className="me-2" />
                    보안 설정
                </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="admin-content">
                {activeTab === 'dashboard' && (
                    <div className="dashboard-section">
                        <h3>시스템 대시보드</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h4>활성 API</h4>
                                <p className="stat-number">{apis.filter(api => api.status === 'active').length}</p>
                            </div>
                            <div className="stat-card">
                                <h4>총 API 호출</h4>
                                <p className="stat-number">{apis.reduce((sum, api) => sum + api.usageCount, 0).toLocaleString()}</p>
                            </div>
                            <div className="stat-card">
                                <h4>월간 사용량</h4>
                                <p className="stat-number">{apis.reduce((sum, api) => sum + api.monthlyUsage, 0).toLocaleString()}</p>
                            </div>
                            <div className="stat-card">
                                <h4>만료 예정 API</h4>
                                <p className="stat-number">{apis.filter(api => {
                                    const expDate = new Date(api.expirationDate);
                                    const now = new Date();
                                    const diffTime = expDate.getTime() - now.getTime();
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return diffDays <= 30 && diffDays > 0;
                                }).length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'imageHosting' && (
                    <ImageHostingSection />
                )}

                {activeTab === 'api' && renderApiManagement()}

                {activeTab === 'users' && (
                    <div className="users-section">
                        <h3>사용자 관리</h3>
                        <div className="p-4 text-center text-muted">
                            <FaUsers className="mb-3" style={{fontSize: '3rem', opacity: 0.3}} />
                            <p>사용자 계정, 권한, 그룹 관리</p>
                            <p>사용자 관리 기능 개발 예정</p>
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="system-section">
                        <h3>시스템 모니터링</h3>
                        <div className="p-4 text-center text-muted">
                            <FaChartLine className="mb-3" style={{fontSize: '3rem', opacity: 0.3}} />
                            <p>시스템 성능, 로그, 알림 관리</p>
                            <p>시스템 모니터링 기능 개발 예정</p>
                        </div>
                    </div>
                )}

                {activeTab === 'database' && (
                    <div className="database-section">
                        <h3>데이터베이스 관리</h3>
                        <div className="p-4 text-center text-muted">
                            <FaDatabase className="mb-3" style={{fontSize: '3rem', opacity: 0.3}} />
                            <p>DB 백업, 복구, 최적화</p>
                            <p>데이터베이스 관리 기능 개발 예정</p>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="security-section">
                        <h3>보안 설정</h3>
                        <div className="p-4 text-center text-muted">
                            <FaShieldAlt className="mb-3" style={{fontSize: '3rem', opacity: 0.3}} />
                            <p>접근 제어, 암호화, 감사 로그</p>
                            <p>보안 설정 기능 개발 예정</p>
                    </div>
                  </div>
                )}
            </div>
      </div>
  );
}
