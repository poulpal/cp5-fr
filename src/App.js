import React, { Suspense } from "react";
import { useLocation, Navigate, json, useParams } from "react-router-dom";
// ** Router Import

import Router from "./router/Router";
import { isUserLoggedIn, getUserRole } from "./auth/auth";
import BlockUi from "@availity/block-ui";
import "@src/assets/scss/block.css";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

import { hotjar } from "react-hotjar";
import { Crisp } from "crisp-sdk-web";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import apiConfig from "./configs/apiConfig";

const setBuildingData = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("userData"));
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
    console.log(err);
  }
}

const App = () => {
  const location = useLocation();

  hotjar.initialize(3430319, 6);
  // Crisp.configure("29afeb5a-8fa4-4b96-b645-23660ea9f4a8", {
  //   locale: "fa",
  // });

  if (location && location.pathname === "/paymentStatus") {
  } else if (location && location.pathname === "/payCharge") {
  } else if (location && location.pathname === "/pay") {
  } else if (location && location.pathname === "/logout") {
  } else if (location && location.pathname === "/faq") {
  } else if (location && location.pathname === "/newBuilding") {
  } else if (location && location.pathname === "/transactions") {
  } else if (location && location.pathname === "/charity") {
  } else if (location && location.pathname === "/pricing") {
  } else if (location && location.pathname.startsWith('/reserve/')) {
  } else if (location && location.pathname.startsWith('/survey/')) {
  } else {
    if (!isUserLoggedIn()) {
      if (location && location.pathname !== "/login") {
        return <Navigate to="/login" />;
      }
    } else {
      setBuildingData();
      const location = useLocation();
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (location && location.pathname === "/login") {
        if (token) {
          (async () => {
            try {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("userData");
              localStorage.removeItem("userVerified");
              localStorage.removeItem("selectedUnit");
              const response = await axios.get(`${apiConfig.baseUrl}/getMe`, {
                headers: {
                  Authorization: `Bearer ${params.get("token")}`,
                },
              });
              localStorage.setItem("accessToken", params.get("token"));
              localStorage.setItem(
                "userData",
                JSON.stringify(response.data.data.user)
              );
              localStorage.removeItem("selectedUnit");

              window.location.href = "/";
            } catch (err) {
              if (err.response) {
                const response = err.response;
                if (response.data.errors) {
                  for (let key in response.data.errors) {
                    toast.error(response.data.errors[key]);
                  }
                } else if (response.data.message) {
                  toast.error(response.data.message);
                } else {
                  console.log(err);
                }
              }
            }
          })();
        }
        return <Navigate to="/" />;
      }
      const selectedUnit = localStorage.getItem("selectedUnit");
      const userRole = getUserRole();
      if (!selectedUnit && location.pathname !== "/selectUnit") {
        return <Navigate to="/selectUnit" />;
      }
      // const userData = JSON.parse(localStorage.getItem("userData"));
      // Crisp.user.setNickname(userData.first_name + " " + userData.last_name);
      // Crisp.user.setPhone(userData.mobile);
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
