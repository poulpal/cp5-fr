import { useEffect } from "react";

const Logout = () => {
  useEffect(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userVerified");
    localStorage.removeItem("selectedUnit");
    window.location.href = import.meta.env.VITE_APP_TYPE === "standalone" ? window._env_.APP_URL : import.meta.env.VITE_LANDING_URL;

    return () => {};
  }, []);

  return <div></div>;
};

export default Logout;
