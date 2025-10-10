import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

const NotVerified = () => {
  toast.error("حساب کاربری شما تایید نشده است.");

  const isVerified = async () => {
    try {
      const response = await axios.get("/building_manager/profile");
      if (response.data.data.building.is_verified) {
        localStorage.setItem("userVerified", true);
        window.location.href = "/";
      }
      return false;
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    isVerified();

    return () => {};
  }, []);

  return <Navigate to="/" />;
};

export default NotVerified;
