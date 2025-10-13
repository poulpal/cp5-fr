const isAuthBypassed = () => {
  try {
    const viaVite = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_DISABLE_AUTH;
    const viaWindow = typeof window !== "undefined" && window._env_ && window._env_.DISABLE_AUTH;

    // اگر فلگ صریح داده نشده بود، روی لوکال به‌طور پیش‌فرض بای‌پس را روشن می‌کنیم
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

const ensureMockUser = () => {
  if (!localStorage.getItem('selectedUnit')) localStorage.setItem('selectedUnit','dev-unit-1');

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

const isUserLoggedIn = () => {
  if (isAuthBypassed()) {
    ensureMockUser();
    return true;
  }
  const accessToken = localStorage.getItem("accessToken");
  const userData = localStorage.getItem("userData");
  return accessToken && userData ? true : false;
};

const getUserRole = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (!userData) return null;
  if (userData.role === "user") {
    return "user";
  }
  if (userData.role === "building_manager") {
    return "buildingManager";
  }
  return null;
};

const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userData");
};

export { isAuthBypassed, isUserLoggedIn, logout, getUserRole };
