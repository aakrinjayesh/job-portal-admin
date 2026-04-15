// src/components/admin/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Typography, Button, Space, Drawer } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  UserAddOutlined,
  TeamOutlined,
  BankOutlined,
  KeyOutlined,
  LogoutOutlined,
  MenuOutlined,
  BellOutlined,
  ArrowLeftOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider, Header, Content } = Layout;
const { Text, Title } = Typography;

// ✅ detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  // Admin info from localStorage
  const [admin, setAdmin] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("adminInfo")) || {
        email: "admin@yourcompany.com",
      }
    );
  });

  useEffect(() => {
    const loadAdmin = () => {
      const stored = JSON.parse(localStorage.getItem("adminInfo")) || {
        email: "admin@yourcompany.com",
      };
      setAdmin(stored);
    };
    loadAdmin();
    window.addEventListener("storage", loadAdmin);
    return () => window.removeEventListener("storage", loadAdmin);
  }, []);

  /* 🔗 Menu → Route mapping */
  const menuRoutes = {
    dashboard: ["/admin/dashboard"],
    users: ["/admin/users/search"],
    adduser: ["/admin/users/add"],
    addcompany: ["/admin/add-company"],
    bulkcompany: ["/admin/bulk-company"],
    promocode: ["/admin/promocode"],
    planlimits: ["/admin/planlimitsadmin"],
    organizations: ["/admin/organizations"],
    licenses: ["/admin/licenses"],
    query: ["/admin/query"],
  };

  /* 🎯 Active menu key */
  const selectedKey = React.useMemo(() => {
    const path = location.pathname;
    const sortedRoutes = Object.entries(menuRoutes).sort(
      (a, b) =>
        Math.max(...b[1].map((p) => p.length)) -
        Math.max(...a[1].map((p) => p.length)),
    );
    for (const [key, paths] of sortedRoutes) {
      if (paths.some((p) => path.startsWith(p))) return key;
    }
    return "dashboard";
  }, [location.pathname]);

  /* 🧠 Menu click */
  const onMenuClick = ({ key }) => {
    if (isMobile) setMobileDrawerOpen(false);

    if (key === "logout") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      navigate("/admin/login");
      return;
    }

    const route = menuRoutes[key];
    if (route?.length) navigate(route[0]);
  };

  /* 🧭 Page title mapping */
  const pageTitleMap = {
    dashboard: "Dashboard",
    users: "Delete Users",
    adduser: "Add User",
    promocode: "Promo Code",
    planlimits: "Plan Limits",
    organizations: "Organizations",
    licenses: "Licenses",
    query: "SQL Query Manager",
  };

  const pageTitle = pageTitleMap[selectedKey] || "Dashboard";

  // ✅ Shared Sidebar Content
  const SidebarMenuContent = () => (
    <>
      {/* 👤 Admin Info */}
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: 24,
          alignItems: "center",
        }}
      >
        <Avatar size={40} style={{ background: "#1677FF", flexShrink: 0 }}>
          {admin?.email?.slice(0, 2)?.toUpperCase()}
        </Avatar>
        <div style={{ overflow: "hidden" }}>
          <Text
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Super Admin
          </Text>
          <Text
            style={{
              color: "#AAAAAA",
              fontSize: 11,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "block",
            }}
          >
            {admin?.email}
          </Text>
        </div>
      </div>

      {/* 📌 Main Menu */}
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[selectedKey]}
        onClick={onMenuClick}
        style={{ background: "transparent", border: "none" }}
        items={[
          {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "usermgmt",
            icon: <TeamOutlined />,
            label: "User Management",
            children: [
              {
                key: "adduser",
                icon: <UserAddOutlined />,
                label: "Add User",
              },
              {
                key: "users",
                icon: <UserOutlined />,
                label: "Delete Users",
              },
            ],
          },
          {
            key: "promocode",
            icon: <BankOutlined />,
            label: "Manage PromoCodes",
          },
          { key: "planlimits", icon: <BankOutlined />, label: "Plan Limits" },
          {
            key: "company-management",
            icon: <BankOutlined />,
            label: "Company Management",
            children: [
              {
                key: "addcompany",
                label: "Add Company",
              },
            ],
          },

          {
            key: "organizations",
            icon: <BankOutlined />,
            label: "Organizations",
          },
          //   {
          //     key: "licenses",
          //     icon: <KeyOutlined />,
          //     label: "Licenses",
          //   },
          { key: "query", icon: <DatabaseOutlined />, label: "SQL Manager" },
        ]}
      />

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "#E0E0E0",
          margin: "16px 0",
          opacity: 0.3,
        }}
      />

      {/* ⚙️ Bottom Menu */}
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[selectedKey]}
        onClick={onMenuClick}
        style={{ background: "transparent", border: "none" }}
        items={[
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Logout",
            danger: true,
          },
        ]}
      />
    </>
  );

  return (
    <Layout hasSider style={{ position: "relative" }}>
      {/* 🧭 Sidebar — Desktop */}
      <Sider
        collapsed={isMobile ? true : collapsed}
        onCollapse={(val) => {
          if (!isMobile) setCollapsed(val);
        }}
        width={260}
        collapsedWidth={60}
        style={{
          background: "#011026",
          height: "100vh",
          position: "sticky",
          top: 0,
          overflow: "visible",
        }}
      >
        {/* Floating toggle — desktop only */}
        {!isMobile && (
          <div
            onClick={() => setCollapsed((prev) => !prev)}
            style={{
              position: "absolute",
              top: "50%",
              right: -14,
              transform: "translateY(-50%)",
              zIndex: 200,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#1a2942",
              border: "2px solid #2d4a7a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1677FF";
              e.currentTarget.style.borderColor = "#1677FF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1a2942";
              e.currentTarget.style.borderColor = "#2d4a7a";
            }}
          >
            {collapsed ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18l6-6-6-6"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        )}

        {/* Avatar + name */}
        <div
          style={{
            display: "flex",
            gap: collapsed ? 0 : 12,
            padding: isMobile ? "20px 10px" : collapsed ? "24px 0" : 24,
            alignItems: "center",
            justifyContent: isMobile
              ? "center"
              : collapsed
                ? "center"
                : "flex-start",
            cursor: isMobile ? "pointer" : "default",
          }}
          onClick={() => {
            if (isMobile) setMobileDrawerOpen(true);
          }}
        >
          <Avatar size={36} style={{ background: "#1677FF", flexShrink: 0 }}>
            {admin?.email?.slice(0, 2)?.toUpperCase()}
          </Avatar>
          {!isMobile && !collapsed && (
            <div style={{ overflow: "hidden" }}>
              <Text style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>
                Super Admin
              </Text>
              <br />
              <Text
                style={{
                  color: "#AAAAAA",
                  fontSize: 11,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "block",
                  maxWidth: 160,
                }}
              >
                {admin?.email}
              </Text>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        {isMobile && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: "#fff", fontSize: 16 }} />}
              onClick={() => setMobileDrawerOpen(true)}
              style={{ background: "transparent", border: "none" }}
            />
          </div>
        )}

        {/* Main Menu */}
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          onClick={onMenuClick}
          inlineCollapsed={isMobile ? true : collapsed}
          style={{ background: "transparent", border: "none" }}
          items={[
            {
              key: "dashboard",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "usermgmt",
              icon: <TeamOutlined />,
              label: "User Management",
              children: [
                {
                  key: "adduser",
                  icon: <UserAddOutlined />,
                  label: "Add User",
                },
                { key: "users", icon: <UserOutlined />, label: "Delete User" },
              ],
            },
            {
              key: "promocode",
              icon: <BankOutlined />,
              label: "Manage PromoCodes",
            },
            { key: "planlimits", icon: <BankOutlined />, label: "Plan Limits" },
            {
              key: "organizations",
              icon: <BankOutlined />,
              label: "Organizations",
            },
            {
              key: "company-management",
              icon: <BankOutlined />,
              label: "Company Management",
              children: [
                {
                  key: "addcompany",
                  label: "Add Company",
                },
                {
                  key: "bulkcompany",
                  label: "+ More Companies",
                },
              ],
            },

            // { key: "licenses", icon: <KeyOutlined />, label: "Licenses" },
            { key: "query", icon: <DatabaseOutlined />, label: "SQL Manager" },
          ]}
        />

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "#E0E0E0",
            margin: "16px 0",
            opacity: 0.3,
          }}
        />

        {/* Bottom Menu */}
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          onClick={onMenuClick}
          inlineCollapsed={isMobile ? true : collapsed}
          style={{ background: "transparent", border: "none" }}
          items={[
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Logout",
              danger: true,
            },
          ]}
        />
      </Sider>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          width={260}
          styles={{
            body: { padding: 0, background: "#011026" },
            header: { display: "none" },
          }}
          closable={false}
        >
          <SidebarMenuContent />
        </Drawer>
      )}

      {/* 📄 Main Layout */}
      <Layout>
        {/* 🔝 Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 80,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          {/* Left */}
          <Space size={16}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{
                borderRadius: 20,
                background: "#F8F8F8",
                border: "none",
                fontWeight: 500,
              }}
            >
              {!isMobile && "Back"}
            </Button>

            <div style={{ width: 1, height: 48, background: "#F0F0F0" }} />

            <Title level={4} style={{ margin: 0 }}>
              {pageTitle}
            </Title>
          </Space>

          {/* Right */}
          <Space size={16}>
            <Avatar size={isMobile ? 36 : 44} style={{ background: "#1677FF" }}>
              {admin?.email?.slice(0, 2)?.toUpperCase()}
            </Avatar>
            {!isMobile && (
              <div style={{ lineHeight: 1.3 }}>
                <Text strong style={{ display: "block" }}>
                  Super Admin
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {admin?.email}
                </Text>
              </div>
            )}
          </Space>
        </Header>

        {/* 🧾 Content */}
        <Content
          style={{
            padding: isMobile ? 10 : 24,
            background: "#f5f6fa",
            minHeight: "calc(100vh - 80px)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
