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
  return <Input autoComplete="off" maxLength={7} {...props} />;
};

export default ({
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

  const [count, setCount] = useState("");
  const [amount, setAmount] = useState("");
  const [smsPrice, setSmsPrice] = useState(0);

  const getPrice = async () => {
    try {
      const response = await axios.get("/building_manager/smsMessages/getSmsPrice");
      setSmsPrice(response.data.data.price);
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
    }
  };

  useEffect(() => {
    setValue("count", "3000");
    setCount("3000");
    getPrice();
    return () => {
      setValue("amount", "");
      setAmount(0);
    };
  }, []);

  useEffect(() => {
    setAmount(count.replace(/,/g, "") * smsPrice * 10);
  }, [count, smsPrice]);

  const onAddBalanceFormSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(`building_manager/smsMessages/addBalance`, {
        count:
          typeof data.count === "string"
            ? data.count.replace(/,/g, "")
            : data.count,
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
              <Label>تعداد پیام *</Label>
              <Controller
                name="count"
                control={addBalanceFormControl}
                render={({ field }) => (
                  <NumericFormat
                    rules={{ required: "تعداد را وارد کنید", min: 50 }}
                    style={{ direction: "ltr" }}
                    {...field}
                    customInput={CustomInput}
                    thousandSeparator={true}
                    onChange={(e) => {
                      field.onChange(e);
                      setCount(e.target.value);
                    }}
                  />
                )}
              />
              {addBalanceFormErrors.count && (
                <span className="text-danger">
                  {addBalanceFormErrors.count.message}
                </span>
              )}
            </div>
            <div className="mb-2">
              <Label>مبلغ (ریال)</Label>
              <NumericFormat
                style={{ direction: "ltr" }}
                customInput={CustomInput}
                thousandSeparator={true}
                value={amount.toString().replace(/,/g, "")}
                disabled
              />
              {wordifyfa(parseInt(amount.toString().replace(/,/g, "")) / 10) + ' تومان'}
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
