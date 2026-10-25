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
  ChevronLeft,
  ChevronRight,
  Volume2,
  Key,
  Upload,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { LanguageModal } from '../components/LanguageModal';
import { formatLevelVietnamese } from '../types';

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
    openApiKeyModal,
    openImportModal,
    apiKey,
    themeMode,
    toggleTheme,
  } = useAppStore();

  const menuItems = [
    {
      path: '/learn/1',
      matchPath: '/learn',
      icon: GraduationCap,
      label: 'Học bài',
      badge: 'MỚI',
      badgeColor: '#58CC02',
      accent: '#58CC02',
      accentShadow: '#46A302',
      accentGlow: 'rgba(88, 204, 2, 0.28)',
      activeBg: 'rgba(88, 204, 2, 0.12)',
    },
    {
      path: '/chat',
      matchPath: '/chat',
      icon: MessageSquare,
      label: 'Hội thoại AI',
      badge: 'HOT',
      badgeColor: '#1CB0F6',
      accent: '#1CB0F6',
      accentShadow: '#1899D6',
      accentGlow: 'rgba(28, 176, 246, 0.28)',
      activeBg: 'rgba(28, 176, 246, 0.12)',
    },
    {
      path: '/dashboard',
      matchPath: '/dashboard',
      icon: LayoutDashboard,
      label: 'Bảng điều khiển',
      accent: '#CE82FF',
      accentShadow: '#A559D8',
      accentGlow: 'rgba(206, 130, 255, 0.28)',
      activeBg: 'rgba(206, 130, 255, 0.12)',
    },
    {
      path: '/topics',
      matchPath: '/topics',
      icon: BookOpen,
      label: 'Chủ đề giao tiếp',
      accent: '#FF9600',
      accentShadow: '#E58500',
      accentGlow: 'rgba(255, 150, 0, 0.28)',
      activeBg: 'rgba(255, 150, 0, 0.12)',
    },
    {
      path: '/vocabulary',
      matchPath: '/vocabulary',
      icon: Layers,
      label: 'Sổ từ vựng',
      accent: '#00C9A7',
      accentShadow: '#00967D',
      accentGlow: 'rgba(0, 201, 167, 0.28)',
      activeBg: 'rgba(0, 201, 167, 0.12)',
    },
    {
      path: '/review',
      matchPath: '/review',
      icon: Repeat,
      label: 'Luyện Flashcard (SRS)',
      accent: '#FF4B4B',
      accentShadow: '#EA2B2B',
      accentGlow: 'rgba(255, 75, 75, 0.28)',
      activeBg: 'rgba(255, 75, 75, 0.12)',
    },
    {
      path: '/grammar',
      matchPath: '/grammar',
      icon: Sparkles,
      label: 'Mẫu câu ngữ pháp',
      accent: '#00D2D3',
      accentShadow: '#00A3A4',
      accentGlow: 'rgba(0, 210, 211, 0.28)',
      activeBg: 'rgba(0, 210, 211, 0.12)',
    },
    {
      path: '/admin',
      matchPath: '/admin',
      icon: Settings,
      label: 'Quản trị giáo trình',
      accent: '#8E8E93',
      accentShadow: '#636366',
      accentGlow: 'rgba(142, 142, 147, 0.28)',
      activeBg: 'rgba(142, 142, 147, 0.12)',
    },
  ];

  const langFlag = targetLanguage === 'KO' ? '🇰🇷' : '🇺🇸';
  const langName = targetLanguage === 'KO' ? 'Tiếng Hàn' : 'Tiếng Anh';

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <LanguageModal />

      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={260}
        collapsedWidth={80}
        className="duo-sider"
      >
        {/* Brand Header */}
        <div
          style={{
            padding: collapsed ? '16px 8px 12px' : '16px 14px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: collapsed ? 'center' : 'stretch',
            gap: 10,
            borderBottom: '1px solid var(--duo-border)',
            userSelect: 'none',
          }}
        >
          {/* Logo & Collapse button row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
              }}
            >
              <div
                className="float-slow"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #58CC02, #1CB0F6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(88, 204, 2, 0.35)',
                  flexShrink: 0,
                  fontSize: 20,
                }}
              >
                🦉
              </div>
              {!collapsed && (
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--duo-text-primary)', lineHeight: 1.1 }}>
                    Lingua<span style={{ color: '#58CC02' }}>Talk</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#1CB0F6', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginTop: 2 }}>
                    Duolingo 3D
                  </div>
                </div>
              )}
            </div>

            {/* Collapse toggle button */}
            <Tooltip title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'} placement="right">
              <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'var(--duo-card-bg)',
                  border: '1.5px solid var(--duo-border)',
                  borderBottom: '2.5px solid var(--duo-border)',
                  color: 'var(--duo-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                className="duo-card-interactive"
              >
                {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              </button>
            </Tooltip>
          </div>

          {/* Compact Target Language Badge */}
          {collapsed ? (
            <Tooltip title={`Đang học: ${langName} (${formatLevelVietnamese(targetLevel)})`} placement="right">
              <button
                onClick={openLangModal}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'var(--duo-card-bg)',
                  border: '1.5px solid var(--duo-border)',
                  borderBottom: '2.5px solid var(--duo-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                className="duo-card-interactive"
              >
                {langFlag}
              </button>
            </Tooltip>
          ) : (
            <div
              onClick={openLangModal}
              style={{
                padding: '6px 10px',
                borderRadius: 10,
                background: 'var(--duo-card-bg)',
                border: '1.5px solid var(--duo-border)',
                borderBottom: '2.5px solid var(--duo-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="duo-card-interactive"
              title="Nhấn để đổi Ngôn ngữ hoặc Trình độ học"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{langFlag}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--duo-text-primary)' }}>
                  {langName}
                </span>
                <span style={{ fontSize: 11, color: '#1CB0F6', fontWeight: 700 }}>
                  • {formatLevelVietnamese(targetLevel)}
                </span>
              </div>
              <ChevronDown size={14} color="var(--duo-text-muted)" />
            </div>
          )}
        </div>

        {/* Custom Duolingo Navigation Items */}
        <div className="duo-nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.matchPath !== '/' && location.pathname.startsWith(item.matchPath));

            if (collapsed) {
              return (
                <Tooltip key={item.path} title={item.label} placement="right">
                  <button
                    onClick={() => navigate(item.path)}
                    className={`duo-nav-item ${isActive ? 'active' : ''}`}
                    style={{
                      width: 44,
                      height: 44,
                      padding: 0,
                      justifyContent: 'center',
                      margin: '0 auto',
                      borderRadius: 12,
                      ...(isActive
                        ? {
                            borderColor: item.accent,
                            borderBottomColor: item.accentShadow,
                            background: item.activeBg,
                            color: item.accent,
                            boxShadow: `0 4px 14px ${item.accentGlow}`,
                          }
                        : {}),
                    }}
                  >
                    <Icon size={20} color={isActive ? item.accent : 'currentColor'} />
                  </button>
                </Tooltip>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`duo-nav-item ${isActive ? 'active' : ''}`}
                style={
                  isActive
                    ? {
                        borderColor: item.accent,
                        borderBottomColor: item.accentShadow,
                        background: item.activeBg,
                        color: item.accent,
                        boxShadow: `0 4px 14px ${item.accentGlow}`,
                      }
                    : {}
                }
              >
                <div
                  className="duo-nav-icon-box"
                  style={{
                    background: isActive ? item.activeBg : 'transparent',
                    color: isActive ? item.accent : 'currentColor',
                  }}
                >
                  <Icon size={19} color={isActive ? item.accent : 'currentColor'} />
                </div>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      padding: '2px 7px',
                      borderRadius: 9999,
                      background: item.badgeColor,
                      color: '#FFFFFF',
                      letterSpacing: '0.4px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Unified Bottom Deck: Gamification & Utilities */}
        {!collapsed ? (
          <div style={{ padding: '8px 12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Unified Card: Diamond League + Daily Goal + Quick Tools */}
            <div
              className="duo-sider-card"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 150, 0, 0.06) 0%, rgba(88, 204, 2, 0.04) 100%)',
                borderColor: 'rgba(255, 150, 0, 0.25)',
                borderBottomColor: 'rgba(255, 150, 0, 0.4)',
              }}
            >
              {/* Streak Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Flame size={16} color="#FF9600" className="flame-bounce" />
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#FF9600' }}>
                    Chuỗi học tập
                  </span>
                </div>
                <Tag color="orange" style={{ margin: 0, fontSize: 10, fontWeight: 900, borderRadius: 6, border: 'none' }}>
                  {user?.streakCount || 5} NGÀY 🔥
                </Tag>
              </div>

              {/* Daily Goal progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--duo-text-muted)', marginBottom: 5, fontWeight: 700 }}>
                <span>Mục tiêu ngày</span>
                <span style={{ color: '#58CC02' }}>12/15 phút</span>
              </div>
              <div className="duo-progress-track" style={{ height: 6, marginBottom: 10 }}>
                <div className="duo-progress-fill" style={{ width: '80%' }} />
              </div>

              {/* Quick Action Toolbelt (2-column tactile micro-buttons) */}
              <div style={{ display: 'flex', gap: 6 }}>
                <Tooltip title={apiKey ? 'AI Key: Đã kết nối ✓' : 'Cài đặt API Key AI (Gemini / OpenAI)'}>
                  <button
                    onClick={openApiKeyModal}
                    className="duo-micro-btn"
                    style={{
                      color: apiKey ? '#58CC02' : '#FF9600',
                      borderColor: apiKey ? 'rgba(88, 204, 2, 0.3)' : 'rgba(255, 150, 0, 0.3)',
                    }}
                  >
                    <Key size={13} />
                    <span>AI Key</span>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: apiKey ? '#58CC02' : '#FF9600',
                        boxShadow: apiKey ? '0 0 6px #58CC02' : 'none',
                      }}
                    />
                  </button>
                </Tooltip>

                <Tooltip title="Nạp bài học & kịch bản hội thoại từ file JSON">
                  <button
                    onClick={openImportModal}
                    className="duo-micro-btn"
                    style={{
                      color: '#1CB0F6',
                      borderColor: 'rgba(28, 176, 246, 0.3)',
                    }}
                  >
                    <Upload size={13} />
                    <span>Nạp JSON</span>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed Bottom Action Icons */
          <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Tooltip title={`Chuỗi học tập: ${user?.streakCount || 5} ngày liên tục 🔥`} placement="right">
              <button
                className="duo-micro-btn"
                style={{ width: 40, height: 40, padding: 0, borderRadius: 12, color: '#FF9600' }}
              >
                <Flame size={18} color="#FF9600" className="flame-bounce" />
              </button>
            </Tooltip>
            <Tooltip title={apiKey ? 'AI Key: Đã kết nối ✓' : 'Cài đặt API Key AI'} placement="right">
              <button
                onClick={openApiKeyModal}
                className="duo-micro-btn"
                style={{ width: 40, height: 40, padding: 0, borderRadius: 12, color: apiKey ? '#58CC02' : '#FF9600' }}
              >
                <Key size={16} />
              </button>
            </Tooltip>
            <Tooltip title="Nạp kịch bản JSON" placement="right">
              <button
                onClick={openImportModal}
                className="duo-micro-btn"
                style={{ width: 40, height: 40, padding: 0, borderRadius: 12, color: '#1CB0F6' }}
              >
                <Upload size={16} />
              </button>
            </Tooltip>
          </div>
        )}

        {/* User Card at Bottom of Sider */}
        {user && (
          <div
            style={{
              padding: collapsed ? '12px 8px' : '10px 14px',
              borderTop: '1px solid var(--duo-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: 'var(--duo-sider-bg)',
            }}
          >
            <Avatar
              style={{
                backgroundColor: '#58CC02',
                fontWeight: 900,
                boxShadow: '0 2px 8px rgba(88, 204, 2, 0.3)',
                flexShrink: 0,
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
            {!collapsed && (
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--duo-text-primary)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: '#58CC02', fontWeight: 700 }}>
                  Học viên tích cực ✨
                </div>
              </div>
            )}
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
            {/* Duolingo Streak Counter (Only Streak Kept) */}
            <Tooltip title="Chuỗi ngày học liên tục!">
              <div className="duo-stat-pill streak">
                <Flame size={18} color="#FF9600" className="flame-bounce" />
                <span>{user?.streakCount || 5}</span>
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
              title="Nhấn để đổi Ngôn ngữ hoặc Trình độ học"
            >
              <span style={{ fontSize: 16 }}>{langFlag}</span>
              <span>{langName} • {formatLevelVietnamese(targetLevel)}</span>
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
