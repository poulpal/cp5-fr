// ** React Imports
import { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import "./i18n"; // تضمین می‌کند i18next قبل از رندر App مقداردهی شود

// ** Redux Imports
import { store } from "./redux/store";
import { Provider } from "react-redux";

// ** ThemeColors Context

import { ThemeContext } from "./utility/context/ThemeColors";

// ** ThemeConfig
import themeConfig from "./configs/themeConfig";

// ** Toast
import { Toaster } from "react-hot-toast";

// ** Spinner (Splash Screen)
import Spinner from "./@core/components/spinner/Fallback-spinner";

// ** Ripple Button
import "./@core/components/ripple-button";

// ** PrismJS
import "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-jsx.min";

import "react-perfect-scrollbar/dist/css/styles.css";
import "@styles/react/libs/react-hot-toasts/react-hot-toasts.scss";

// ** Core styles
import "./@core/assets/fonts/feather/iconfont.css";
import "./@core/scss/core.scss";
import "./assets/scss/style.scss";

if (import.meta.env.VITE_APP_TYPE == 'a444') {
  document.documentElement.style.setProperty('--bs-primary', '#000000');
  document.documentElement.style.setProperty('--bs-primary-rgb', '0, 0, 0');
  document.documentElement.style.setProperty('--bs-primary-rgb', '0, 0, 0');
  document.documentElement.style.setProperty('--bs-link-color', '000000');
  document.documentElement.style.setProperty('--bs-modal-bg', '000000');

}

// ** Service Worker
import * as serviceWorker from "./serviceWorker";
import apiConfig from "./configs/apiConfig";

// ** Lazy load app
const LazyApp = lazy(() => import("./App"));

const container = document.getElementById("root");
const root = createRoot(container);

axios.defaults.baseURL = apiConfig.baseUrl;

axios.interceptors.request.use(function (config) {
  if (localStorage.getItem("accessToken")) {
    config.headers.Authorization = `Bearer ${localStorage.getItem("accessToken")}`;
  }
  return config;
});

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response.data.action) {
      if (error.response.data.action === "buy_base_module") {
        setTimeout(() => {
          window.location.href = "/buildingManager/modules";
        }, 1500);
      }
    }
    if (error.response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("userVerified");
      localStorage.removeItem("selectedUnit");
      localStorage.removeItem("buildingOptions");
      localStorage.removeItem("buildingSlug");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

import CoinLogo from "@src/assets/images/logo/chargepal-alt2.png";

const Loading = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div>
        {import.meta.env.VITE_APP_TYPE == 'main' && (
          <img
            src={CoinLogo}
            alt="ChargePal"
            style={{
              width: "100%",
              maxWidth: "300px",
            }}
          />
        )}
        {import.meta.env.VITE_APP_TYPE == 'standalone' && (
          <img
            src={window._env_.APP_ICON}
            alt={window._env_.APP_NAME}
            style={{
              width: "100px",
              maxWidth: "300px",
            }}
          />
        )}
        <Spinner />
      </div>
    </div>
  );
};


root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Suspense fallback={<Loading />}>
        <ThemeContext>
          <LazyApp />
          <Toaster
            position={themeConfig.layout.toastPosition}
            toastOptions={{ className: "react-hot-toast" }}
          />
        </ThemeContext>
      </Suspense>
    </Provider>
  </BrowserRouter>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
