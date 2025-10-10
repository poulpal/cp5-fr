import {
  Button,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
} from "reactstrap";
import { NumericFormat } from "react-number-format";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import classnames from "classnames";
import { toast } from "react-hot-toast";

const PayWithWallet = ({
  unit,
  setLoading,
  refreshData,
  toggleOnlinePayModal,
  residentType,
}) => {
  const {
    control: onlinePayFormControl,
    handleSubmit: handleOnlinePayFormSubmit,
    setValue: setOnlinePayFormValue,
    formState: { errors: onlinePayFormErrors },
    reset,
    setError,
  } = useForm();

  const [balance, setBalance] = useState(0);

  const getBalance = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/user/wallet/balance");
      setBalance(response.data.data.balance);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      console.log(err);
    }
    setLoading(false);
  };


  useEffect(() => {
    getBalance();
    const user = JSON.parse(localStorage.getItem("userData"));
    setOnlinePayFormValue(
      "unit_number",
      unit.unit_number + " - (" + unit.building.name + ")"
    );
    setOnlinePayFormValue("mobile", user.mobile);
    // setOnlinePayFormValue(
    //   "amount",
    //   unit.charge_debt < 0 ? 0 : (unit.charge_debt - unit.discount) * 10
    // );
    // console.log(residentType);
    if (residentType === "resident") {
      setOnlinePayFormValue("amount", unit.resident_debt < 0 ? 0 : unit.resident_debt * 10);
    }
    if (residentType === "owner") {
      setOnlinePayFormValue("amount", unit.owner_debt < 0 ? 0 : unit.owner_debt * 10);
    }

    return () => {
      setOnlinePayFormValue("unit_number", "");
      setOnlinePayFormValue("mobile", "");
      setOnlinePayFormValue("amount", "");
    };
  }, [residentType]);

  const onOnlinePayFormSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append(
        "amount",
        typeof data.amount === "string"
          ? data.amount.replace(/,/g, "") / 10
          : data.amount / 10,
      );
      formData.append(
        "resident_type",
        residentType
      );
      const response = await axios.post(
        `user/units/${unit.id}/payWithWallet`,
        formData
      );
      if (response.data.success) {
        toast.success(response.data.message);
        reset();
        getBalance();
        toggleOnlinePayModal();
        refreshData();
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        for (const key in error.response.data.errors) {
          toast.error(error.response.data.errors[key]);
          setError(key, error.response.data.errors[key]);
        }
      } else {
        console.log(error);
      }
    }
    setLoading(false);
  };
  return (
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
            render={({ field }) => (
              <input
                type="text"
                className="form-control"
                {...field}
                disabled={true}
                style={{
                  direction: "ltr",
                }}
              />
            )}
          />
        </div>
        <div className="mb-2">
          <Label>موجودی کیف پول (ریال)</Label>

          <NumericFormat
            style={{ direction: "ltr" }}
            customInput={Input}
            thousandSeparator={true}
            disabled={true}
            value={balance * 10}
          />
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
                disabled={!unit.canPayCustomAmount}
              />
            )}
          />
          {onlinePayFormErrors.amount && (
            <span className="text-danger">
              {onlinePayFormErrors.amount.message}
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
            پرداخت از کیف پول
          </Button>
        </div>
      </Row>
    </Form>
  );
};

export default PayWithWallet;
