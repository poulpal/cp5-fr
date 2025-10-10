

const isUserLoggedIn = () => {
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
};

const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
};

export { isUserLoggedIn, logout, getUserRole };
