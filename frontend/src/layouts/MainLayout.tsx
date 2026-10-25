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
    <Layout style={{ minHeight: '100vh' }}>
      <LanguageModal />

      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        style={{
          background: 'var(--duo-sider-bg)',
          borderRight: '2px solid var(--duo-border)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          style={{
            padding: '20px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #58CC02, #1CB0F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(88, 204, 2, 0.4)',
              flexShrink: 0,
            }}
          >
            <MessageSquare size={20} color="#FFFFFF" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--duo-text-primary)' }}>
                Lingua<span style={{ color: '#58CC02' }}>Talk</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--duo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Duolingo Edition
              </div>
            </div>
          )}
        </div>

        {/* Language & Level Selector Pill */}
        {!collapsed && (
          <div style={{ padding: '0 16px 16px' }}>
            <div
              onClick={openLangModal}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                background: 'var(--duo-card-bg)',
                border: '1px solid var(--duo-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              className="glass-card-interactive"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{langFlag}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--duo-text-primary)' }}>
                    {langName}
                  </div>
                  <div style={{ fontSize: 11, color: '#1CB0F6', fontWeight: 600 }}>
                    {targetLevel.replace('_', ' ')}
                  </div>
                </div>
              </div>
              <ChevronDown size={14} color="var(--duo-text-muted)" />
            </div>
          </div>
        )}

        <Menu
          theme={themeMode === 'dark' ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', background: 'transparent' }}
        />

        {/* Quick Action Buttons in Sider */}
        {!collapsed && (
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={openApiKeyModal}
              className="duo-btn-outline"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: '#1CB0F6',
                borderColor: '#1CB0F6',
              }}
            >
              <Key size={14} />
              <span>{apiKey ? 'API Key (Đã lưu)' : 'Cài đặt API Key AI'}</span>
            </button>
            <button
              onClick={openImportModal}
              className="duo-btn-outline"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: '#FFC800',
                borderColor: '#FFC800',
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
              position: 'absolute',
              bottom: 48,
              left: 16,
              right: 16,
              padding: '12px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Avatar style={{ backgroundColor: '#58CC02' }}>
              {user.name.charAt(0)}
            </Avatar>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: '#58CC02', fontWeight: 600 }}>
                Học viên Duolingo
              </div>
            </div>
          </div>
        )}
      </Sider>

      <Layout>
        {/* Top Header */}
        <Header
          style={{
            background: 'var(--duo-header-bg)',
            backdropFilter: 'blur(12px)',
            borderBottom: '2px solid var(--duo-border)',
            padding: '0 20px',
            height: 64,
            lineHeight: 'normal',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            transition: 'background 0.2s ease, border-color 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flexShrink: 1, marginRight: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--duo-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Học <strong style={{ color: 'var(--duo-text-primary)' }}>{langName}</strong> giao tiếp theo phong cách <strong style={{ color: '#58CC02' }}>Duolingo</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Duolingo Streak Counter */}
            <Tooltip title="Chuỗi ngày học liên tục!">
              <div
                style={{
                  height: 36,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0 10px',
                  borderRadius: 18,
                  background: 'rgba(255, 150, 0, 0.12)',
                  border: '1px solid rgba(255, 150, 0, 0.3)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  lineHeight: 'normal',
                }}
              >
                <Flame size={17} color="#FF9600" className="flame-icon" />
                <span style={{ fontWeight: 800, color: '#FF9600', fontSize: 13 }}>
                  {user?.streakCount || 5}
                </span>
              </div>
            </Tooltip>

            {/* Duolingo Gems Counter */}
            <Tooltip title="Đá quý tích lũy!">
              <div
                style={{
                  height: 36,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0 10px',
                  borderRadius: 18,
                  background: 'rgba(28, 176, 246, 0.12)',
                  border: '1px solid rgba(28, 176, 246, 0.3)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  lineHeight: 'normal',
                }}
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>💎</span>
                <span style={{ fontWeight: 800, color: '#1CB0F6', fontSize: 13 }}>
                  {gems}
                </span>
              </div>
            </Tooltip>

            {/* Duolingo Hearts Counter */}
            <Tooltip title="Trái tim năng lượng - làm sai sẽ mất tim!">
              <div
                style={{
                  height: 36,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0 10px',
                  borderRadius: 18,
                  background: 'rgba(255, 75, 75, 0.12)',
                  border: '1px solid rgba(255, 75, 75, 0.3)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  lineHeight: 'normal',
                }}
              >
                <Heart size={16} color="#FF4B4B" fill="#FF4B4B" />
                <span style={{ fontWeight: 800, color: '#FF4B4B', fontSize: 13 }}>
                  {hearts}/5
                </span>
              </div>
            </Tooltip>

            {/* Header Action: API Key */}
            <Button
              type="text"
              onClick={openApiKeyModal}
              style={{
                height: 36,
                padding: '0 10px',
                color: apiKey ? '#58CC02' : '#1CB0F6',
                background: 'rgba(28, 176, 246, 0.08)',
                border: '1px solid var(--duo-border)',
                borderRadius: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 700,
                fontSize: 12,
                lineHeight: 'normal',
              }}
            >
              <Key size={14} />
              <span>{apiKey ? 'API Key ✓' : 'API Key'}</span>
            </Button>

            {/* Header Action: Nạp JSON */}
            <Button
              type="text"
              onClick={openImportModal}
              style={{
                height: 36,
                padding: '0 10px',
                color: '#FFC800',
                background: 'rgba(255, 200, 0, 0.08)',
                border: '1px solid var(--duo-border)',
                borderRadius: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 700,
                fontSize: 12,
                lineHeight: 'normal',
              }}
            >
              <Upload size={14} />
              <span>Nạp JSON</span>
            </Button>

            {/* Theme Toggle Button (Light / Dark) */}
            <Tooltip title={themeMode === 'dark' ? 'Chuyển sang giao diện Sáng ☀️' : 'Chuyển sang giao diện Tối 🌙'}>
              <Button
                type="text"
                onClick={toggleTheme}
                style={{
                  height: 36,
                  width: 36,
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: themeMode === 'dark' ? '#FFC800' : '#6366F1',
                  background: themeMode === 'dark' ? 'rgba(255, 200, 0, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid var(--duo-border)',
                  borderRadius: 12,
                }}
              >
                {themeMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </Button>
            </Tooltip>

            {/* Language Switch Button */}
            <Button
              type="text"
              onClick={openLangModal}
              style={{
                height: 36,
                padding: '0 12px',
                color: 'var(--duo-text-primary)',
                background: 'var(--duo-card-bg)',
                border: '1px solid var(--duo-border)',
                borderRadius: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 700,
                fontSize: 13,
                lineHeight: 'normal',
              }}
            >
              <span>{langFlag}</span>
              <span>{langName}</span>
              <ChevronDown size={14} />
            </Button>
          </div>
        </Header>

        {/* Main Content Area */}
        <Content style={{ padding: '24px 32px', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
