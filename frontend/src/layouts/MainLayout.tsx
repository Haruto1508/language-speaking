import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Avatar, Tooltip } from 'antd';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Sparkles,
  Layers,
  Repeat,
  Settings,
  Flame,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Key,
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
    apiKey,
    themeMode,
    toggleTheme,
  } = useAppStore();

  interface MenuItem {
    path: string;
    matchPath: string;
    extraMatch?: string;
    icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
    label: string;
    badge?: string;
    badgeColor?: string;
    accent: string;
    accentShadow: string;
    accentGlow: string;
    activeBg: string;
  }

  interface MenuGroup {
    key: string;
    title: string;
    items: MenuItem[];
  }

  const menuGroups: MenuGroup[] = [
    {
      key: 'learn',
      title: 'Học tập & Luyện nói',
      items: [
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
          path: '/learn/1',
          matchPath: '/learn',
          extraMatch: '/lesson',
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
          extraMatch: '/conversation',
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
          path: '/topics',
          matchPath: '/topics',
          icon: BookOpen,
          label: 'Chủ đề giao tiếp',
          accent: '#FF9600',
          accentShadow: '#E58500',
          accentGlow: 'rgba(255, 150, 0, 0.28)',
          activeBg: 'rgba(255, 150, 0, 0.12)',
        },
      ],
    },
    {
      key: 'practice',
      title: 'Ôn luyện & Tra cứu',
      items: [
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
          label: 'Luyện Flashcard',
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
      ],
    },
    {
      key: 'system',
      title: 'Hệ thống',
      items: [
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
      ],
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
            padding: collapsed ? '14px 8px 12px' : '16px 14px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--duo-border)',
            userSelect: 'none',
          }}
        >
          {/* Logo & Brand text */}
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
              title="Về Trang chủ"
            >
              🦉
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--duo-text-primary)', lineHeight: 1.1 }}>
                  Lingua<span style={{ color: '#58CC02' }}>Talk</span>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    openLangModal();
                  }}
                  style={{
                    fontSize: 11,
                    color: '#1CB0F6',
                    fontWeight: 800,
                    marginTop: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                  title="Nhấn để đổi Ngôn ngữ hoặc Trình độ học"
                >
                  <span>{langFlag}</span>
                  <span>{langName}</span>
                  <span style={{ color: 'var(--duo-text-muted)' }}>• {formatLevelVietnamese(targetLevel)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Collapse toggle button (expanded mode) */}
          {!collapsed && (
            <Tooltip title="Thu gọn thanh bên" placement="right">
              <button
                onClick={() => setCollapsed(true)}
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
                  transition: 'none',
                  flexShrink: 0,
                }}
                className="duo-card-interactive"
              >
                <ChevronLeft size={15} />
              </button>
            </Tooltip>
          )}
        </div>

        {/* When collapsed, a clean expand button below the logo */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
            <Tooltip title="Mở rộng thanh bên" placement="right">
              <button
                onClick={() => setCollapsed(false)}
                style={{
                  width: 34,
                  height: 24,
                  borderRadius: 8,
                  background: 'var(--duo-card-bg)',
                  border: '1.5px solid var(--duo-border)',
                  borderBottom: '2.5px solid var(--duo-border)',
                  color: 'var(--duo-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'none',
                }}
                className="duo-card-interactive"
              >
                <ChevronRight size={14} />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Custom Duolingo Navigation Groups */}
        <div
          className="duo-nav-list"
          style={{
            padding: collapsed ? '8px 6px' : '10px 12px',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {menuGroups.map((group, groupIdx) => (
            <div key={group.key} style={{ marginBottom: collapsed ? 8 : 12 }}>
              {/* Group Section Header */}
              {!collapsed ? (
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 900,
                    color: 'var(--duo-text-muted)',
                    letterSpacing: '0.8px',
                    padding: '6px 10px 4px',
                    textTransform: 'uppercase',
                    userSelect: 'none',
                  }}
                >
                  {group.title}
                </div>
              ) : groupIdx > 0 ? (
                <div
                  style={{
                    width: 28,
                    height: 1,
                    background: 'var(--duo-border)',
                    margin: '6px auto 8px',
                    opacity: 0.6,
                  }}
                />
              ) : null}

              {/* Group Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.matchPath !== '/' && location.pathname.startsWith(item.matchPath)) ||
                    (item.extraMatch && location.pathname.startsWith(item.extraMatch));

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
                              : {
                                  color: 'var(--duo-text-secondary)',
                                }),
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
                      style={{
                        padding: '9px 12px',
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
                      <div
                        className="duo-nav-icon-box"
                        style={{
                          background: isActive ? item.activeBg : 'transparent',
                          color: item.accent,
                          opacity: isActive ? 1 : 0.85,
                        }}
                      >
                        <Icon size={19} color={item.accent} />
                      </div>
                      <span
                        style={{
                          flex: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: 13.5,
                        }}
                      >
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
            </div>
          ))}
        </div>

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

            {/* AI Key Button */}
            <Tooltip title={apiKey ? 'AI Key: Đã kết nối ✓' : 'Cài đặt API Key AI (Gemini / OpenAI)'}>
              <button
                onClick={openApiKeyModal}
                style={{
                  height: 38,
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: apiKey ? '#58CC02' : '#FF9600',
                  background: 'var(--duo-card-bg)',
                  border: '2px solid var(--duo-border)',
                  borderBottom: '3px solid var(--duo-border)',
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                className="duo-card-interactive"
              >
                <Key size={15} />
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
