import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";
import { Card } from "reactstrap";
import { isNative } from "../../utility/Utils";

import QRcodeSample from "../../assets/images/qrcode_sample.png";

const Qrcodes = () => {
  const [loading, setLoading] = useState(false);

  const handleGetQrcodes = async (e) => {
    if (isNative() && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        action: "downloadZip",
        type: "zip",
        name: "qrcodes.zip",
        url: `building_manager/downloadQrcodes`,
        token: localStorage.getItem("accessToken"),
        baseUrl: apiConfig.baseUrl,
        method: "GET",
      }));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get("building_manager/downloadQrcodes", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/zip" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "qrcodes.zip");
      link.click();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <LoadingComponent loading={loading} />
      <Card
        style={{
          minHeight: "89vh",
        }}
      >
        <div className="pb-5 pt-2">
          <h3 className="text-center mb-1">کیوآرکد (QRCode)</h3>
          <p className="text-center mb-1">
            برای هر واحد کیو آرکد (QR-COde) مستقل ایجاد کنید؛ در مکانی مناسب نصب کنید تا بدون نیاز به اپلیکیشن و به سادگی شارژ ساختمان خود را پرداخت نمایند
          </p>
          <div className="text-center mb-1 d-flex flex-column">
            <div>
              <img src={QRcodeSample} alt="qrcode" height={450} width="auto" />

            </div>
            <div>

              <button
                className="btn btn-primary mt-3"
                onClick={handleGetQrcodes}
              >
                دریافت یکجا کلیه کیوآرکدها
              </button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default Qrcodes;
