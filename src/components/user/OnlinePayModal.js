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
  TabContent,
  TabPane,
} from "reactstrap";
import { NumericFormat } from "react-number-format";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import classnames from "classnames";
import { toast } from "react-hot-toast";
import PayWithWallet from "./PayWithWallet";

const onlinePayModal = ({
  onlinePayModal,
  toggleOnlinePayModal,
  unit,
  setLoading,
  refreshData,
  residentType
}) => {
  const {
    control: onlinePayFormControl,
    handleSubmit: handleOnlinePayFormSubmit,
    setValue: setOnlinePayFormValue,
    formState: { errors: onlinePayFormErrors },
  } = useForm();

  const [activeTab, setActiveTab] = useState("online");

  useEffect(() => {
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
    console.log(residentType);
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
      const response = await axios.post(`user/units/${unit.id}/pay`, {
        amount:
          typeof data.amount === "string"
            ? data.amount.replace(/,/g, "") / 10
            : data.amount / 10,
        resident_type: residentType,
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
      isOpen={onlinePayModal}
      toggle={toggleOnlinePayModal}
      centered={true}
      color="primary"
    >
      <ModalHeader toggle={toggleOnlinePayModal}>
        پرداخت بدهی : واحد {unit.unit_number}
      </ModalHeader>
      <Nav pills className="d-flex justify-content-around mt-1">
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "online" })}
            onClick={() => {
              setActiveTab("online");
            }}
          >
            پرداخت آنلاین
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "wallet" })}
            onClick={() => {
              setActiveTab("wallet");
            }}
          >
            پرداخت با کیف پول
          </NavLink>
        </NavItem>
      </Nav>
      <ModalBody>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="online">
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
                    ورود به درگاه پرداخت
                  </Button>
                </div>
              </Row>
            </Form>
          </TabPane>
          <TabPane tabId="wallet">
            <PayWithWallet
              unit={unit}
              setLoading={setLoading}
              refreshData={refreshData}
              toggleOnlinePayModal={toggleOnlinePayModal}
              residentType={residentType}
            />
          </TabPane>
        </TabContent>
      </ModalBody>
    </Modal>
  );
};

export default onlinePayModal;
