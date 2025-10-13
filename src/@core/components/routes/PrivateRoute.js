// ** React Imports
import { Navigate } from "react-router-dom";
import { useContext, Suspense, useMemo } from "react";

// ** Context Imports
import { AbilityContext } from "@src/utility/context/Can";

// ** Spinner Import
import Spinner from "../spinner/Loading-spinner";

const isAuthBypassed = () => {
  try {
    const viaVite = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_DISABLE_AUTH;
    const viaWindow = typeof window !== "undefined" && window._env_ && window._env_.DISABLE_AUTH;
    const isLocalhost =
      typeof window !== "undefined" &&
      /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(window.location.host);
    const fallback = isLocalhost ? "1" : "0";
    const flag = (viaVite ?? viaWindow ?? fallback).toString().toLowerCase().trim();
    return flag === "1" || flag === "true";
  } catch (e) {
    return false;
  }
};

const seedMockUserIfNeeded = () => {
  if (!localStorage.getItem("userData")) {
    const mockUser = {
      id: 0,
      role: "building_manager",
      fullName: "Dev Manager (Mock)",
      mobile: "09120000000",
    };
    localStorage.setItem("userData", JSON.stringify(mockUser));
  }
  if (!localStorage.getItem("accessToken")) {
    localStorage.setItem("accessToken", "dev-mock-token");
  }
};

const PrivateRoute = ({ children, route }) => {
  // ** Hooks & Vars
  const ability = useContext(AbilityContext);
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userData"));
    } catch {
      return null;
    }
  }, []);

  if (isAuthBypassed()) {
    seedMockUserIfNeeded();
    return <Suspense fallback={<Spinner className="content-loader" />}>{children}</Suspense>;
  }

  if (route) {
    const action = route.action || (route.meta && route.meta.action);
    const resource = route.resource || (route.meta && route.meta.resource);

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (ability && (action || resource)) {
      if (!ability.can(action || "read", resource || "all")) {
        return <Navigate to="/misc/not-authorized" replace />;
      }
    }
  }

  return (
    <Suspense fallback={<Spinner className="content-loader" />}>
      {children}
    </Suspense>
  );
};

export default PrivateRoute;
