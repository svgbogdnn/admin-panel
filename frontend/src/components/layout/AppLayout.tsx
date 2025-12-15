import { Layout, Menu, Button } from "antd";
import type { MenuProps } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(label: React.ReactNode, key: string): MenuItem {
  return {
    key,
    label,
  } as MenuItem;
}

const menuItems: MenuItem[] = [
  getItem("Курсы", "/courses"),
  getItem("Посещаемость", "/attendance"),
  getItem("Фидбэк", "/feedback"),
  getItem("Экспорт", "/export"),
];

function getBgClass(pathname: string): string {
  if (pathname.startsWith("/courses")) return "page-bg--courses";
  if (pathname.startsWith("/attendance")) return "page-bg--attendance";
  if (pathname.startsWith("/feedback")) return "page-bg--feedback";
  if (pathname.startsWith("/export")) return "page-bg--export";
  if (pathname.startsWith("/profile")) return "page-bg--profile";
  return "page-bg--default";
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey =
    menuItems.find((item) => {
      if (!item || typeof item.key !== "string") return false;
      return location.pathname.startsWith(item.key);
    })?.key?.toString() || "/courses";

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const bgClass = getBgClass(location.pathname);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          paddingInline: 24,
        }}
      >
        <div
          style={{
            color: "#22c55e",
            fontWeight: 700,
            fontSize: 20,
            marginRight: 32,
          }}
        >
          ITAM
        </div>

        <Menu
          mode="horizontal"
          selectable
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            borderBottom: "none",
          }}
          theme="dark"
        />

        <div
          style={{
            display: "flex",
            gap: 12,
            marginLeft: 24,
          }}
        >
          <Button
            type="default"
            onClick={() => navigate("/profile")}
            style={{
              background: "#111827",
              borderColor: "#4b5563",
              color: "#e5e7eb",
            }}
          >
            Профиль
          </Button>

          <Button
            type="default"
            onClick={handleLogout}
            style={{
              background: "#111827",
              borderColor: "#4b5563",
              color: "#e5e7eb",
            }}
          >
            Выйти
          </Button>
        </div>
      </Header>

      <Content className={`app-content page-bg ${bgClass}`}>
        <Outlet />
      </Content>
    </Layout>
  );
}
