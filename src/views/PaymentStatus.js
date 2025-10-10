import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Button } from "reactstrap";
import themeConfig from "@configs/themeConfig";
import illustrationsLight from "@src/assets/images/pages/error.svg";

import "@styles/base/pages/page-misc.scss";
import PriceFormat from "../components/PriceFormat";
import NavbarComponent from "../components/NavbarComponent";

const PaymentStatus = () => {
  const [params] = useSearchParams();
  return (
    <>
      <NavbarComponent />
      <div className="misc-wrapper">
        <div className="misc-inner p-2 pt-0 mt-3 mb-2">
          <div className="w-100 text-center">
            {params.get("success") == true || params.get("success") == 1 ? (
              <>
                <h2 className="mb-1">پرداخت با موفقیت انجام شد</h2>
                <p>
                  مبلغ پرداختی : <PriceFormat price={params.get("amount")} convertToRial/>
                </p>
                <p>شماره پیگیری : {params.get("tracenumber")}</p>
              </>
            ) : (
              <>
                <h2 className="mb-1">پرداخت با خطا مواجه شد</h2>
                <p>متاسفانه از سمت شما و یا بانک شما خطایی رخ داده است؛</p>
                <p>
                  چنانچه از کارت بانکی شما مبلغی کسر شده باشد حداکثر ظرف 72 ساعت
                  به حساب شما برگشت داده خواهد شد. در غیر اینصورت با بانک صادر
                  کننده کارت خود تماس بگیرید
                </p>
                <p>شرح خطا : {params.get("message")}</p>
              </>
            )}
            <Button
              tag={Link}
              to="/"
              color="primary"
              className="btn-sm-block mb-2"
            >
              بازگشت به صفحه اصلی
            </Button>
            <img className="img-fluid" src={illustrationsLight} alt="404" />
          </div>
        </div>
      </div>
    </>
  );
};
export default PaymentStatus;
