import {
  Button,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import { NumericFormat } from "react-number-format";
import { Controller, set, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import "wordifyfa/dist/wordifyfa";

const CustomInput = (props) => {
  return <Input autoComplete="off" maxLength={11} {...props} />;
};

const AddBalanceModal = ({
  addBalanceModal,
  toggleAddBalanceModal,
  setLoading,
}) => {
  const {
    control: addBalanceFormControl,
    handleSubmit: handleSubmit,
    setValue: setValue,
    formState: { errors: addBalanceFormErrors },
  } = useForm();

  const [amount, setAmount] = useState(10000000);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));
    setValue("mobile", user.mobile);
    setValue("amount", 10000000);
    setAmount(10000000);

    return () => {
      setValue("mobile", "");
      setValue("amount", "");
      setAmount(0);
    };
  }, []);

  const onAddBalanceFormSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(`user/wallet/addBalance`, {
        amount:
          typeof data.amount === "string"
            ? data.amount.replace(/,/g, "") / 10
            : data.amount / 10,
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
    <Modal
      isOpen={addBalanceModal}
      toggle={toggleAddBalanceModal}
      centered={true}
      color="primary"
    >
      <ModalHeader toggle={toggleAddBalanceModal}>
        افزایش موجودی
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit(onAddBalanceFormSubmit)}>
          <Row>
            <div className="mb-2">
              <Label>شماره موبایل</Label>
              <Controller
                name="mobile"
                control={addBalanceFormControl}
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
              <Label>مبلغ (ریال)</Label>
              <Controller
                name="amount"
                control={addBalanceFormControl}
                render={({ field }) => (
                  <NumericFormat
                    rules={{ required: "مبلغ را وارد کنید", min: 10000000 }}
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
              {wordifyfa(amount.toString().replace(/,/g, "") / 10) + ' تومان'}
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
      </ModalBody>
    </Modal>
  );
};

export default AddBalanceModal;
