import React, { Suspense } from "react";
import { useLocation, Navigate } from "react-router-dom";

// ** Router Import
import Router from "./router/Router";

// ** Auth utils
import { isUserLoggedIn, getUserRole, isAuthBypassed } from "./auth/auth";

// ** UI/State/Utils
import BlockUi from "@availity/block-ui";
import "@src/assets/scss/block.css";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import { hotjar } from "react-hotjar";
import { PrimeReactProvider } from "primereact/api";

// در حالت آنلاین، اطلاعات ساختمان را از سرور می‌گیریم
async function setBuildingData() {
  try {
    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user) return;
    const role = user.role;
    if (role === "building_manager") {
      const response = await axios.get("building_manager/profile");
      localStorage.setItem("buildingSlug", response.data.data.building_manager.business.name_en);
      localStorage.setItem("currency", response.data.data.options.currency);
      localStorage.setItem("buildingOptions", JSON.stringify(response.data.data.options));
      localStorage.setItem("activeModules", JSON.stringify(response.data.data.activeModules));
    } else {
      const selectedUnitId = localStorage.getItem("selectedUnit");
      if (!selectedUnitId) return;
      const response = await axios.get("/user/units/" + selectedUnitId);
      localStorage.setItem("buildingSlug", response.data.data.unit.building.name_en);
      localStorage.setItem("buildingUnitOptions", JSON.stringify(response.data.data.options));
    }
  } catch (err) {
    localStorage.setItem("buildingSlug", "");
    // console.log(err);
  }
}

const App = () => {
  const location = useLocation();

  // Hotjar/Crisp فقط در حالت غیر بای‌پس
  if (!isAuthBypassed()) {
    try {
      hotjar.initialize(3430319, 6);
      // Crisp.configure("...", { locale: "fa" });
    } catch (e) {
      // ignore
    }
  }

  // مسیرهای عمومی که نیازی به لاگین ندارند
  const isPublicPath =
    location &&
    (location.pathname === "/paymentStatus" ||
      location.pathname === "/payCharge" ||
      location.pathname === "/pay" ||
      location.pathname === "/logout" ||
      location.pathname === "/faq" ||
      location.pathname === "/newBuilding" ||
      location.pathname === "/transactions" ||
      location.pathname === "/charity" ||
      (location.pathname && location.pathname.startsWith("/reserve/")) ||
      (location.pathname && location.pathname.startsWith("/survey/")));

  if (!isPublicPath) {
    // اگر لاگین نیستی و بای‌پس هم خاموش است → به لاگین برو
    if (!isUserLoggedIn() && !isAuthBypassed()) {
      if (location && location.pathname !== "/login") {
        return <Navigate to="/login" />;
      }
    } else {
      // آنلاین که بودیم، پروفایل ساختمان را می‌گیریم
      if (!isAuthBypassed()) {
        setBuildingData();
      }

      // لاگین با توکن موجود در کوئری‌استرینگ (در صورت وجود)
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      if (
        token &&
        (location.pathname === "/" ||
          location.pathname === "/dashboard" ||
          location.pathname === "/selectUnit" ||
          location.pathname === "/profile" ||
          location.pathname === "/invoices" ||
          location.pathname === "/units")
      ) {
        (async () => {
          try {
            const response = await axios.get("/auth/callback/token-login", {
              params: { token },
            });
            localStorage.setItem("accessToken", token);
            localStorage.setItem("userData", JSON.stringify(response.data.data.user));
            localStorage.removeItem("selectedUnit");
            window.location.href = "/";
          } catch (err) {
            if (err.response) {
              const response = err.response;
              if (response.data.errors) {
                if (response.data.errors.username) {
                  toast.error(response.data.errors.username[0]);
                }
                if (response.data.errors.password) {
                  toast.error(response.data.errors.password[0]);
                }
              } else {
                toast.error(response.data.message);
              }
            } else {
              toast.error("خطا در برقراری ارتباط با سرور");
            }
          }
        })();
      }

      // اگر واحد انتخاب نشده و در صفحه انتخاب واحد نیست، هدایت کن
      const selectedUnit = localStorage.getItem("selectedUnit");
      const userRole = getUserRole();
      if (!selectedUnit && location.pathname !== "/selectUnit") {
        return <Navigate to="/selectUnit" />;
      }
    }
  }

  const loadingStore = useSelector((state) => state.loading);

  return (
    <PrimeReactProvider>
      <Router />
    </PrimeReactProvider>
  );
};

export default App;
