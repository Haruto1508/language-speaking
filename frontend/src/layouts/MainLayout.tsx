import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Space, Tag, Tooltip } from 'antd';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Sparkles,
  Layers,
  Repeat,
  Settings,
  Flame,
  Globe,
  ChevronDown,
  Volume2,
  Heart,
  Key,
  Upload,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { LanguageModal } from '../components/LanguageModal';

const { Header, Sider, Content } = Layout;

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    targetLanguage,
    targetLevel,
    openLangModal,
    user,
    hearts,
    gems,
    openApiKeyModal,
    openImportModal,
    apiKey,
    themeMode,
    toggleTheme,
  } = useAppStore();

  const menuItems = [
    {
      key: '/learn/1',
      icon: <GraduationCap size={18} color="#58CC02" />,
      label: (
        <span style={{ fontWeight: 700, color: '#58CC02' }}>
          Học bài (Duolingo Style)
        </span>
      ),
    },
    {
      key: '/chat',
      icon: <MessageSquare size={18} color="#1CB0F6" />,
      label: (
        <span style={{ fontWeight: 700, color: '#1CB0F6' }}>
          Trò chuyện AI (Duolingo)
        </span>
      ),
    },
    {
      key: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Bảng điều khiển',
    },
    {
      key: '/topics',
      icon: <BookOpen size={18} />,
      label: 'Chủ đề & Tình huống',
    },
    {
      key: '/vocabulary',
      icon: <Layers size={18} />,
      label: 'Sổ từ vựng',
    },
    {
      key: '/review',
      icon: <Repeat size={18} />,
      label: 'Ôn tập Spaced Repetition',
    },
    {
      key: '/grammar',
      icon: <Sparkles size={18} />,
      label: 'Ngữ pháp mẫu câu',
    },
    {
      key: '/admin',
      icon: <Settings size={18} />,
      label: 'Quản trị & Soạn giáo trình',
    },
  ];

  const langFlag = targetLanguage === 'KO' ? '🇰🇷' : '🇺🇸';
  const langName = targetLanguage === 'KO' ? 'Korean' : 'English';

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <LanguageModal />

      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        style={{
          background: 'var(--duo-sider-bg)',
          borderRight: '2px solid var(--duo-border)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Brand Logo & Mascot */}
        <div
          onClick={() => navigate('/')}
          style={{
            padding: '22px 18px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            className="float-slow"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #58CC02, #1CB0F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(88, 204, 2, 0.4)',
              flexShrink: 0,
              fontSize: 22,
            }}
          >
            🦉
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--duo-text-primary)', lineHeight: 1.1 }}>
                Lingua<span style={{ color: '#58CC02' }}>Talk</span>
              </div>
              <div style={{ fontSize: 10, color: '#1CB0F6', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginTop: 3 }}>
                Duolingo Master
              </div>
            </div>
          )}
        </div>

        {/* Language & Level Selector Pill */}
        {!collapsed && (
          <div style={{ padding: '0 16px 14px' }}>
            <div
              onClick={openLangModal}
              style={{
                padding: '10px 14px',
                borderRadius: 14,
                background: 'var(--duo-card-bg)',
                border: '2px solid var(--duo-border)',
                borderBottom: '3.5px solid var(--duo-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="glass-card-interactive"
              title="Nhấn để đổi Ngôn ngữ hoặc Trình độ học"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24, lineHeight: 1 }}>{langFlag}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                    {langName}
                  </div>
                  <div style={{ fontSize: 11, color: '#1CB0F6', fontWeight: 700 }}>
                    {targetLevel.replace('_', ' ')}
                  </div>
                </div>
              </div>
              <ChevronDown size={16} color="var(--duo-text-muted)" />
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div style={{ flex: 1, padding: '0 8px' }}>
          <Menu
            theme={themeMode === 'dark' ? 'dark' : 'light'}
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ border: 'none', background: 'transparent' }}
          />
        </div>

        {/* Duolingo League Mini Widget */}
        {!collapsed && (
          <div style={{ padding: '12px 16px' }}>
            <div
              className="duo-card"
              style={{
                padding: '12px 14px',
                background: 'linear-gradient(135deg, rgba(255, 200, 0, 0.08) 0%, rgba(88, 204, 2, 0.05) 100%)',
                borderColor: 'rgba(255, 200, 0, 0.3)',
                borderBottomColor: 'rgba(255, 200, 0, 0.4)',
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>💎</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#FFC800' }}>
                    Diamond League
                  </span>
                </div>
                <Tag color="gold" style={{ margin: 0, fontSize: 10, fontWeight: 800, borderRadius: 6, border: 'none' }}>
                  HẠNG #3
                </Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--duo-text-muted)', marginBottom: 4, fontWeight: 700 }}>
                <span>Mục tiêu ngày</span>
                <span style={{ color: '#58CC02' }}>12/15 min</span>
              </div>
              <div className="duo-progress-track" style={{ height: 8 }}>
                <div className="duo-progress-fill" style={{ width: '80%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Buttons in Sider */}
        {!collapsed && (
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={openApiKeyModal}
              className="duo-btn-outline"
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                color: '#1CB0F6',
                borderColor: 'rgba(28, 176, 246, 0.4)',
              }}
            >
              <Key size={14} />
              <span>{apiKey ? 'API Key (Đã kết nối ✓)' : 'Cài đặt API Key AI'}</span>
            </button>
            <button
              onClick={openImportModal}
              className="duo-btn-outline"
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                color: '#FFC800',
                borderColor: 'rgba(255, 200, 0, 0.4)',
              }}
            >
              <Upload size={14} />
              <span>Nạp kịch bản JSON</span>
            </button>
          </div>
        )}

        {/* User Card at bottom of sider */}
        {!collapsed && user && (
          <div
            style={{
              padding: '12px 16px 20px',
              borderTop: '1px solid var(--duo-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Avatar style={{ backgroundColor: '#58CC02', fontWeight: 800 }}>
              {user.name.charAt(0)}
            </Avatar>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--duo-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: '#58CC02', fontWeight: 700 }}>
                Học viên tích cực ✨
              </div>
            </div>
          </div>
        )}
      </Sider>

      <Layout style={{ background: 'transparent' }}>
        {/* Top Header */}
        <Header
          style={{
            background: 'var(--duo-header-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '2px solid var(--duo-border)',
            padding: '0 24px',
            height: 64,
            lineHeight: 'normal',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            transition: 'background 0.25s ease, border-color 0.25s ease',
          }}
        >
          {/* Header Left Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flexShrink: 1, marginRight: 12 }}>
            <span style={{ fontSize: 14, color: 'var(--duo-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Luyện nói <strong style={{ color: 'var(--duo-text-primary)' }}>{langName}</strong> thực chiến theo chuẩn <strong style={{ color: '#58CC02' }}>Duolingo 3D</strong>
            </span>
          </div>

          {/* Header Right Gamification & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Duolingo Streak Counter */}
            <Tooltip title="Chuỗi ngày học liên tục!">
              <div className="duo-stat-pill streak">
                <Flame size={18} color="#FF9600" className="flame-bounce" />
                <span>{user?.streakCount || 5}</span>
              </div>
            </Tooltip>

            {/* Duolingo Gems Counter */}
            <Tooltip title="Đá quý tích lũy!">
              <div className="duo-stat-pill gems">
                <span style={{ fontSize: 16, lineHeight: 1 }}>💎</span>
                <span>{gems}</span>
              </div>
            </Tooltip>

            {/* Duolingo Hearts Counter */}
            <Tooltip title="Trái tim năng lượng!">
              <div className="duo-stat-pill hearts">
                <Heart size={16} color="#FF4B4B" fill="#FF4B4B" />
                <span>{hearts}/5</span>
              </div>
            </Tooltip>

            {/* Theme Toggle Button (Light / Dark) */}
            <Tooltip title={themeMode === 'dark' ? 'Chuyển sang Giao diện Sáng ☀️' : 'Chuyển sang Giao diện Tối 🌙'}>
              <button
                onClick={toggleTheme}
                style={{
                  height: 38,
                  width: 38,
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: themeMode === 'dark' ? '#FFC800' : '#1CB0F6',
                  background: 'var(--duo-card-bg)',
                  border: '2px solid var(--duo-border)',
                  borderBottom: '3px solid var(--duo-border)',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                className="duo-card-interactive"
              >
                {themeMode === 'dark' ? <Sun size={18} color="#FFC800" /> : <Moon size={18} color="#1CB0F6" />}
              </button>
            </Tooltip>

            {/* Language Switch Button */}
            <button
              onClick={openLangModal}
              style={{
                height: 38,
                padding: '0 14px',
                color: 'var(--duo-text-primary)',
                background: 'var(--duo-card-bg)',
                border: '2px solid var(--duo-border)',
                borderBottom: '3px solid var(--duo-border)',
                borderRadius: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="duo-card-interactive"
            >
              <span style={{ fontSize: 16 }}>{langFlag}</span>
              <span>{langName}</span>
              <ChevronDown size={14} color="var(--duo-text-muted)" />
            </button>
          </div>
        </Header>

        {/* Main Content Area */}
        <Content style={{ padding: '28px 36px', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
