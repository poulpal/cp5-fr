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

const Unit = ({ unit, token, buildingImage = false }) => {
  const [onlinePayModal, setOnlinePayModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [residentType, setResidentType] = useState('resident');

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
      unit.charge_debt < 0 ? 0 : (unit.charge_debt - unit.discount) * 10
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
        `public/charge/payCharge?token=${token}`,
        {
          amount:
            typeof data.amount === "string"
              ? data.amount.replace(/,/g, "") / 10
              : data.amount / 10,
          mobile: data.mobile,
          'resident_type': residentType,
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
          پرداخت آنلاین بدهی : واحد {unit.unit_number}
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
                      rules={{ required: "مبلغ را وارد کنید", min: 10000 }}
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
          <h6 className="text-center text-danger w-100"> تمامی مبالغ به ریال است </h6>
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
          {unit.separateResidentAndOwnerInvoices ? (<>
            <h6 className="d-flex flex-row justify-content-between">
              <span className="font-weight-bold">مبلغ بدهی (سهم ساکن): </span>
              <PriceFormat price={unit.resident_debt > 0 ? unit.resident_debt : 0} convertToRial />
            </h6>
            <h6 className="d-flex flex-row justify-content-between">
              <span className="font-weight-bold">مبلغ بدهی (سهم مالک): </span>
              <PriceFormat price={unit.owner_debt > 0 ? unit.owner_debt : 0} convertToRial />
            </h6>
          </>) : (
            <h6 className="d-flex flex-row justify-content-between">
              <span className="font-weight-bold">مبلغ بدهی : </span>
              <PriceFormat price={unit.charge_debt > 0 ? unit.charge_debt : 0} convertToRial />
            </h6>
          )}
          {unit.discount > 0 &&
            <h6 className="d-flex flex-row justify-content-between text-success">
              <span className="font-weight-bold">جایزه خوشحسابی : </span>
              <PriceFormat price={unit.discount} convertToRial />
            </h6>
          }
        </CardBody>
        <CardFooter>
          {unit.separateResidentAndOwnerInvoices ? (<>
            <Button
              color="success"
              className="w-100 mt-1"
              onClick={() => {
                setOnlinePayFormValue('amount', unit?.resident_debt < 0 ? 0 : (unit?.resident_debt) * 10);
                setResidentType('resident');
                setOnlinePayModal(true);
              }}
            >
              پرداخت آنلاین بدهی (سهم ساکن)
            </Button>
            <Button
              color="success"
              className="w-100 mt-1"
              onClick={() => {
                setOnlinePayFormValue('amount', unit?.owner_debt < 0 ? 0 : (unit?.owner_debt) * 10);
                setResidentType('owner');
                setOnlinePayModal(true);
              }}
            >
              پرداخت آنلاین بدهی (سهم مالک)
            </Button>
          </>) : (
            <Button
              color="success"
              className="w-100 mt-1"
              onClick={() => {
                setOnlinePayFormValue('amount', unit?.charge_debt < 0 ? 0 : (unit?.charge_debt) * 10);
                setResidentType('resident');
                setOnlinePayModal(true);
              }}
            >
              پرداخت آنلاین بدهی
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
};

export default Unit;
