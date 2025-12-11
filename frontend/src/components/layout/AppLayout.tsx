// import { Layout, Menu, Typography, Button } from "antd";
// import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import { clearToken } from "../../api/auth";

// const { Header, Content } = Layout;
// const { Text } = Typography;

// const menuItems = [
//   { key: "/courses", label: "Курсы" },
//   { key: "/attendance", label: "Посещаемость" },
//   { key: "/feedback", label: "Фидбэк" },
//   { key: "/export", label: "Экспорт" },
// ];

// export default function AppLayout() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const selectedKey =
//     menuItems.find((item) => location.pathname.startsWith(item.key))?.key ||
//     "/courses";

//   const handleMenuClick = (info: { key: string }) => {
//     navigate(info.key);
//   };

//   const handleLogout = () => {
//     clearToken();
//     navigate("/login", { replace: true });
//   };

//   return (
//     <Layout style={{ minHeight: "100vh", background: "#020617" }}>
//       <Header
//         style={{
//           display: "flex",
//           alignItems: "center",
//           padding: "0 32px",
//           background: "#020617",
//           borderBottom: "1px solid #1f2937",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             marginRight: 32,
//           }}
//         >
//           <Text
//             style={{
//               color: "#22c55e",
//               fontSize: 24,
//               fontWeight: 700,
//               letterSpacing: 2,
//             }}
//           >
//             ITAM
//           </Text>
//         </div>

//         <Menu
//           mode="horizontal"
//           selectable
//           selectedKeys={[selectedKey]}
//           items={menuItems}
//           onClick={handleMenuClick}
//           style={{
//             flex: 1,
//             minWidth: 0,
//             background: "transparent",
//             borderBottom: "none",
//           }}
//           theme="dark"
//         />

//         <Button
//           type="default"
//           onClick={handleLogout}
//           style={{
//             marginLeft: 24,
//             background: "#111827",
//             borderColor: "#4b5563",
//             color: "#e5e7eb",
//           }}
//         >
//           Выйти
//         </Button>
//       </Header>

//       <Content
//         style={{
//           padding: "24px 32px",
//           background: "#020617",
//         }}
//       >
//         <div
//           style={{
//             maxWidth: 1440,
//             margin: "0 auto",
//             background: "#020617",
//           }}
//         >
//           <Outlet />
//         </div>
//       </Content>
//     </Layout>
//   );
// }


import { Layout, Menu, Typography, Button } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearToken } from "../../api/auth";

const { Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: "/courses", label: "Курсы" },
  { key: "/attendance", label: "Посещаемость" },
  { key: "/feedback", label: "Фидбэк" },
  { key: "/export", label: "Экспорт" },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey =
    menuItems.find((item) => location.pathname.startsWith(item.key))?.key ||
    "/courses";

  const handleMenuClick = (info: { key: string }) => {
    navigate(info.key);
  };

  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#020617" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          background: "#020617",
          borderBottom: "1px solid #1f2937",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: 32,
          }}
        >
          <Text
            style={{
              color: "#22c55e",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            ITAM
          </Text>
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

        <Button
          type="default"
          onClick={handleLogout}
          style={{
            marginLeft: 24,
            background: "#111827",
            borderColor: "#4b5563",
            color: "#e5e7eb",
          }}
        >
          Выйти
        </Button>
      </Header>

      <Content
        style={{
          padding: "24px 32px",
          background: "#020617",
        }}
      >
        {/* БОЛЬШЕ НЕТ maxWidth: 1440 — таблицы и контент во всю ширину окна */}
        <Outlet />
      </Content>
    </Layout>
  );
}
