import { useEffect } from "react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import PriceFormat from "../../components/PriceFormat";
import Cleave from "cleave.js/react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { NumericFormat } from "react-number-format";
import BlockUi from "@availity/block-ui";
import Avatar from "@components/Avatar";

export default ({ unit, token, toll, buildingImage = false }) => {
  const [onlinePayModal, setOnlinePayModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control: onlinePayFormControl,
    handleSubmit: handleOnlinePayFormSubmit,
    setValue: setOnlinePayFormValue,
    formState: { errors },
    setError: setOnlinePayFormError,
  } = useForm();

  useEffect(() => {
    setOnlinePayFormValue(
      "unit_number",
      unit.unit_number + " - (" + unit.building.name + ")"
    );
    setOnlinePayFormValue(
      "amount",
      toll.amount * 10
    );

    return () => {
      setOnlinePayFormValue("unit_number", "");
      setOnlinePayFormValue("mobile", "");
      setOnlinePayFormValue("amount", "");
    };
  }, [unit]);

  const toggleOnlinePayModal = () => {
    setOnlinePayModal(!onlinePayModal);
  };

  const onOnlinePayFormSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `public/toll/payToll?token=${token}`,
        {
          mobile: data.mobile,
        }
      );
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
        setLoading(false);
      }
    } catch (error) {
      if (error.response.data.errors) {
        for (const key in error.response.data.errors) {
          toast.error(error.response.data.errors[key]);
          setOnlinePayFormError(key, error.response.data.errors[key]);
        }
      }
      setLoading(false);
    }
  };

  return (
    <>
      <BlockUi
        tag="div"
        blocking={loading}
        renderChildren={true}
        message={<></>}
      ></BlockUi>
      <Modal
        isOpen={onlinePayModal}
        toggle={toggleOnlinePayModal}
        centered={true}
        color="primary"
      >
        <ModalHeader toggle={toggleOnlinePayModal}>
          پرداخت آنلاین :  {toll.description}
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={handleOnlinePayFormSubmit(onOnlinePayFormSubmit)}>
            <Row>
              <div className="mb-2">
                <Label>شماره واحد</Label>
                <Controller
                  name="unit_number"
                  control={onlinePayFormControl}
                  render={({ field }) => (
                    <input
                      type="text"
                      className="form-control"
                      {...field}
                      disabled={true}
                    />
                  )}
                />
              </div>
              <div className="mb-2">
                <Label>شماره موبایل</Label>
                <Controller
                  name="mobile"
                  control={onlinePayFormControl}
                  invalid={errors.mobile ? true : false}
                  rules={{
                    required: "شماره موبایل را وارد کنید",
                    pattern: {
                      value: /^09[0-9]{9}$/,
                      message: "شماره موبایل را صحیح وارد کنید",
                    },
                  }}
                  render={({ field }) => (
                    <input
                      type="text"
                      className="form-control"
                      inputMode="tel"
                      {...field}
                      style={{
                        direction: "ltr",
                      }}
                    />
                  )}
                />
                {errors.mobile && (
                  <span className="text-danger">{errors.mobile.message}</span>
                )}
              </div>
              <div className="mb-2">
                <Label>مبلغ (ریال)</Label>
                <Controller
                  name="amount"
                  control={onlinePayFormControl}
                  render={({ field }) => (
                    <NumericFormat
                      rules={{ required: "مبلغ را وارد کنید", min: 1000 }}
                      style={{ direction: "ltr" }}
                      {...field}
                      customInput={Input}
                      thousandSeparator={true}
                      inputMode="tel"
                      disabled={!unit.canPayCustomAmount}
                    />
                  )}
                />
                {errors.amount && (
                  <span className="text-danger">{errors.amount.message}</span>
                )}
              </div>
              <div className="px-2">
                <Button color="success" className="w-100" type="submit">
                  ورود به درگاه پرداخت
                </Button>
              </div>
            </Row>
          </Form>
        </ModalBody>
      </Modal>
      <Card className="text-center">
        <CardHeader>
          <h3 className="text-center w-100">شماره واحد : {unit.unit_number}</h3>
          <h5 className="text-center w-100">{unit.building.name}</h5>
          {buildingImage &&
            <Avatar
              className="avatar-stats p-50 m-auto mt-0 mb-0"
              color="success"
              img={unit.building.image}
              imgHeight="100"
              imgWidth="100"
            />
          }
        </CardHeader>
        <CardBody>
          {/* <h6 className="d-flex flex-row justify-content-between">
            <span className="font-weight-bold">شارژ ماهیانه : </span>
            <PriceFormat price={unit.charge_fee} />
          </h6> */}
          <h6 className="d-flex flex-row justify-content-between">
            <span className="font-weight-bold">{toll.description} </span>
            <PriceFormat price={toll.amount} convertToRial />
          </h6>
        </CardBody>
        <CardFooter>
          <Button
            color="success"
            className="w-100 mt-1"
            onClick={() => {
              setOnlinePayModal(true);
            }}
            disabled={toll.status !== "pending"}
          >
            {toll.status === "pending" ? "پرداخت آنلاین" : "پرداخت شده"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

