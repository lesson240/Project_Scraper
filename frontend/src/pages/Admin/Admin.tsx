// path: frontend/src/pages/Admin/Admin.tsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import { FaCog, FaUsers, FaChartLine, FaImage, FaDatabase, FaShieldAlt } from 'react-icons/fa';
import ImageHostingSection from './components/ImageHosting/ImageHostingSection';
import './Admin.css';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('imageHosting');

  const adminSections = [
    {
      key: 'imageHosting',
      title: '이미지 호스팅 관리',
      icon: <FaImage />,
      description: '이미지 저장소 정책, 사용자 관리, 모니터링',
      component: <ImageHostingSection />
    },
    {
      key: 'userManagement',
      title: '사용자 관리',
      icon: <FaUsers />,
      description: '사용자 계정, 권한, 그룹 관리',
      component: <div className="p-4 text-center text-muted">사용자 관리 기능 개발 예정</div>
    },
    {
      key: 'systemMonitoring',
      title: '시스템 모니터링',
      icon: <FaChartLine />,
      description: '시스템 성능, 로그, 알림 관리',
      component: <div className="p-4 text-center text-muted">시스템 모니터링 기능 개발 예정</div>
    },
    {
      key: 'databaseManagement',
      title: '데이터베이스 관리',
      icon: <FaDatabase />,
      description: 'DB 백업, 복구, 최적화',
      component: <div className="p-4 text-center text-muted">데이터베이스 관리 기능 개발 예정</div>
    },
    {
      key: 'securitySettings',
      title: '보안 설정',
      icon: <FaShieldAlt />,
      description: '접근 제어, 암호화, 감사 로그',
      component: <div className="p-4 text-center text-muted">보안 설정 기능 개발 예정</div>
    }
  ];

  return (
    <Container fluid className="admin-page">
      <Row className="mb-4">
        <Col>
          <div className="admin-header">
            <h1><FaCog className="me-3" />관리자 대시보드</h1>
            <p className="text-muted">시스템 전반의 설정과 모니터링을 관리합니다</p>
          </div>
        </Col>
      </Row>

      {/* 상단 가로 메뉴 */}
      <div className="admin-tabs">
        <Nav variant="tabs" className="flex-row">
          {adminSections.map((section) => (
            <Nav.Item key={section.key}>
              <Nav.Link
                active={activeTab === section.key}
                onClick={() => setActiveTab(section.key)}
                className="d-flex align-items-center"
              >
                <span className="me-2">{section.icon}</span>
                {section.title}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="admin-content">
        <Tab.Content>
          {adminSections.map((section) => (
            <Tab.Pane
              key={section.key}
              eventKey={section.key}
              active={activeTab === section.key}
              className="fade show"
            >
              <Card>
                <Card.Header>
                  <div className="d-flex align-items-center">
                    <span className="me-2">{section.icon}</span>
                    <div>
                      <h5 className="mb-0">{section.title}</h5>
                      <small className="text-muted">{section.description}</small>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  {section.component}
                </Card.Body>
              </Card>
            </Tab.Pane>
          ))}
        </Tab.Content>
      </div>
    </Container>
  );
}
