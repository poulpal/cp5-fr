import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";

const AccountingReports = () => {
  const [loading, setLoading] = useState(false);

  const handleGetQrcodes = async (e) => {
    // e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get("building_manager/downloadAccountingReports", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/zip" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ChargePal_AccountingReports.zip");
      link.click();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await handleGetQrcodes();
    })();
    window.history.back();
  }, []);

  return (
    <>
      <LoadingComponent loading={loading} />
    </>
  );
};

export default AccountingReports;
