import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import AppRouter from "./router";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#22c55e",
          colorInfo: "#22c55e",
          colorLink: "#4ade80",
          colorBgBase: "#070b14",
          colorBgContainer: "#0b1220",
          colorBgElevated: "#0f1a2d",
          colorBorder: "rgba(148, 163, 184, 0.22)",
          colorTextBase: "#e6edf6",
          colorTextSecondary: "rgba(230, 237, 246, 0.72)",
          borderRadius: 14,
          borderRadiusLG: 18,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
          controlHeight: 40,
          controlHeightLG: 44,
        },
        components: {
          Button: {
            borderRadius: 999,
          },
          Input: {
            borderRadius: 12,
          },
          Card: {
            borderRadiusLG: 18,
          },
          Menu: {
            itemBorderRadius: 10,
          },
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
