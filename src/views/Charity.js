import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  CardLink,
  Row,
  Col,
  Badge,
  CardFooter,
  Button,
  Form,
  Label,
  Input,
} from "reactstrap";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import { useState } from "react";
import LoadingComponent from "../components/LoadingComponent";
import { useEffect } from "react";
import axios from "axios";
import moment from "moment-jalaali";
import { useMediaQuery } from "react-responsive";
import PriceFormat from "../components/PriceFormat";
import AddBalanceModal from "../components/user/addBalanceModal";
import { truncateString } from "../utility/Utils";
import NavbarComponent from "../components/NavbarComponent";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";

import BannerDesktop from "../assets/images/banners/charity-desktop.jpg";
import BannerMobile from "../assets/images/banners/charity-mobile.jpg";

const CustomInput = (props) => {
  return <Input autoComplete="off" maxLength={11} {...props} />;
};

export default () => {
  const [unit, setUnit] = useState(null);
  const [data, setdata] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addBalanceModal, setAddBalanceModal] = useState(false);

  const [amount, setAmount] = useState("");

  const {
    control: addBalanceFormControl,
    handleSubmit: handleSubmit,
    setValue: setValue,
    formState: { errors: addBalanceFormErrors },
  } = useForm();

  useEffect(() => {
    return () => { };
  }, []);



  const onAddBalanceFormSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(`public/charity/pay`, {
        mobile: data.mobile,
        amount:
          typeof data.amount === "string"
            ? data.amount.replace(/,/g, "")
            : data.amount,
      });
      if (response.data.success) {
        const ua = navigator.userAgent;
        if (ua.indexOf("ChargePalApp") >= 0) {
          return window.open(response.data.data.redirectUrl, "_blank");
        } else {
          return window.location.replace(response.data.data.redirectUrl);
        }
        const { action, method, inputs } = response.data.data.redirect;
        const form = document.createElement("form");
        form.method = method;
        form.action = action;
        for (const key in inputs) {
          if (inputs.hasOwnProperty(key)) {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = inputs[key];
            form.appendChild(input);
          }
        }
        document.body.appendChild(form);
        form.submit();
      }
    } catch (error) {
      if (error.response?.data.errors) {
        for (const key in error.response.data.errors) {
          toast.error(error.response.data.errors[key]);
        }
      } else if (error.response?.data.message) {
        toast.error(error.response.data.message);
      } else {
        console.log(error);
      }
    }
    setLoading(false);
  };

  return (
    <div>
      <NavbarComponent centerNavbarBrand={true} />
      <LoadingComponent loading={loading} />
      <Row className="mb-1">
        <Col md={12} lg={10} xl={9} className="m-auto">
          <img src={BannerDesktop} className="img-fluid d-none d-md-block" />
          <img src={BannerMobile} className="img-fluid d-md-none" />
        </Col>
      </Row>
      <Row>
        <Col lg="6" className="m-auto">
          <Card>
            <Form onSubmit={handleSubmit(onAddBalanceFormSubmit)} className="p-3">
              <Row>
                <div className="mb-2">
                  <Label>شماره موبایل *</Label>
                  <Controller
                    name="mobile"
                    control={addBalanceFormControl}
                    rules={{ required: "شماره موبایل  را وارد کنید" }}
                    render={({ field }) => (
                      <input
                        type="text"
                        className="form-control"
                        {...field}
                        inputMode="tel"
                        style={{
                          direction: "ltr",
                        }}
                      />
                    )}
                  />
                  {addBalanceFormErrors.mobile && (
                    <span className="text-danger">
                      {addBalanceFormErrors.mobile.message}
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <Label>مبلغ (تومان) *</Label>
                  <Controller
                    name="amount"
                    control={addBalanceFormControl}
                    render={({ field }) => (
                      <NumericFormat
                        rules={{ required: "مبلغ را وارد کنید", min: 100000 }}
                        style={{ direction: "ltr" }}
                        {...field}
                        customInput={CustomInput}
                        thousandSeparator={true}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          field.onChange(e);
                        }}
                      />
                    )}
                  />
                  {amount && (wordifyfa(amount.toString().replace(/,/g, "")) + ' تومان')}
                  {addBalanceFormErrors.amount && (
                    <span className="text-danger">
                      {addBalanceFormErrors.amount.message}
                    </span>
                  )}
                </div>
                <div className="d-flex justify-content-center w-100">
                  <Button
                    color="primary"
                    type="submit"
                    style={{
                      minWidth: "150px",
                    }}
                  >
                    ورود به درگاه پرداخت
                  </Button>
                </div>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};


