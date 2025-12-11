import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import AppRouter from "./router";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: "#020617",
          colorTextBase: "#e5e7eb",
          colorPrimary: "#22c55e",
        },
      }}
    >
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ConfigProvider>
  );
}
