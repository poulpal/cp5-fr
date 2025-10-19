import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import {
  Button,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import Select from "react-select";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useEffect } from "react";
import classnames from "classnames";
import AddExcelToll from "./AddExcelToll";
import AddMultipleToll from "./AddMultipleToll";

import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import themeConfig from "@configs/themeConfig";

export default ({ show, setShow, setLoading, refreshData }) => {
  const currency = localStorage.getItem("currency");

  const [units, setUnits] = useState([]);
  const [activeTab, setActiveTab] = useState("single");
  const [sendSMS, setSendSMS] = useState(false); // ✅ State برای ارسال SMS
  const [smsBalance, setSmsBalance] = useState(0); // ✅ موجودی SMS
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
  } = useForm();

  const getUnits = async () => {
    try {
      const response = await axios.get("/building_manager/units");
      setUnits(response.data.data.units);
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
    }
  };

  // ✅ دریافت موجودی SMS
  const getSmsBalance = async () => {
    try {
      const response = await axios.get("/building_manager/smsMessages/getBalance");
      setSmsBalance(response.data.data.balance);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUnits();
    getSmsBalance(); // ✅ فراخوانی موجودی SMS
  }, []);

  const onSubmit = async (formData) => {
    // ✅ بررسی موجودی SMS اگر ارسال فعال باشد (هر پیامک = 7 واحد)
    const smsCreditsRequired = 7;
    
    if (sendSMS && smsBalance < smsCreditsRequired) {
      toast.error(`موجودی پیامک کافی نیست. مورد نیاز: ${smsCreditsRequired}، موجودی فعلی: ${smsBalance}`);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "/building_manager/tolls/" + formData.unit.value + "/addInvoice",
        {
          amount: formData.amount.replace(/,/g, "") / (currency === "rial" ? 10 : 1),
          type: "toll",
          description: formData.description,
          date: formData.date,
          resident_type: formData.resident_type,
          send_sms: sendSMS, // ✅ ارسال پارامتر SMS
        }
      );
      toast.success(response.data.message);
      setShow(false);
      refreshData();
      reset();
      setSendSMS(false); // ✅ ریست کردن checkbox
      getSmsBalance(); // ✅ به‌روزرسانی موجودی SMS
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      if (err.response && err.response.data.errors) {
        Object.keys(err.response.data.errors).forEach((key) => {
          setError(key, err.response.data.errors[key][0]);
        });
      }
      console.log(err);
    }

    setLoading(false);
  };
  return (
    <Modal
      isOpen={show}
      centered={true}
      size="lg"
      toggle={() => setShow(false)}
    >
      <ModalHeader toggle={() => setShow(false)}>افزودن لینک پرداخت</ModalHeader>
      <ModalBody>
        <Nav pills justified>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "single" })}
              onClick={() => {
                setActiveTab("single");
              }}
            >
              لینک پرداخت تکی
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "multiple" })}
              onClick={() => {
                setActiveTab("multiple");
              }}
            >
              لینک پرداخت گروهی
            </NavLink>
          </NavItem>
          {/* <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "excel" })}
              onClick={() => {
                setActiveTab("excel");
              }}
            >
              ورود گروهی
            </NavLink>
          </NavItem> */}
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="single">
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <Col md={12}>
                  <div className="mt-1">
                    <Label>واحد *</Label>
                    <Controller
                      name="unit"
                      control={control}
                      defaultValue=""
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              border: "1px solid" + themeConfig.layout.primaryColor,
                              borderColor: themeConfig.layout.primaryColor,
                              height: "48px",
                              borderRadius: "20px",
                              boxShadow: state.isFocused
                                ? "0 3px 10px 0 rgba(34, 41, 47, 0.1)"
                                : "unset",
                            }),
                          }}
                          noOptionsMessage={() => "..."}
                          placeholder="انتخاب کنید"
                          {...field}
                          isClearable={true}
                          options={units.map((unit) => ({
                            value: unit.id,
                            label: `واحد ${unit.unit_number}`,
                          }))}
                        />
                      )}
                    />
                    {errors.unit && (
                      <div className="text-danger">شماره واحد را وارد کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={12}>
                  <div className="mt-1">
                    <Label>تفکیک :*</Label>
                    <Controller
                      name="resident_type"
                      control={control}
                      defaultValue="resident"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <select {...field} className="form-control">
                          <option value="resident"> ساکن </option>
                          <option value="owner"> مالک </option>
                        </select>
                      )}
                    />
                    {errors.resident_type && (
                      <div className="text-danger">تفکیک را مشخص کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={12}>
                  <div className="mt-1">
                    {currency === 'rial' ?
                      <Label>مبلغ لینک پرداخت (ریال) *</Label>
                      :
                      <Label>مبلغ لینک پرداخت (تومان) *</Label>
                    }
                    <Controller
                      name="amount"
                      control={control}
                      defaultValue=""
                      rules={{ required: true }}
                      render={({ field }) => (
                        <NumericFormat
                          {...field}
                          thousandSeparator={true}
                          className="form-control"
                          placeholder="مبلغ لینک پرداخت"
                          inputMode="tel"
                        />
                      )}
                    />
                    {errors.amount && (
                      <div className="text-danger">مبلغ لینک پرداخت را وارد کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={12}>
                  <div className="mt-1">
                    <Label>توضیحات *</Label>
                    <Controller
                      name="description"
                      rules={{ required: true }}
                      control={control}
                      defaultValue=""
                      render={({ field }) => <Input {...field} type="text" />}
                    />
                  </div>
                  {errors.description && (
                    <div className="text-danger">توضیحات را وارد کنید</div>
                  )}
                </Col>
                <Col md="12">
                  <div className="mt-1">
                    <Label>تاریخ</Label>
                    <br />
                    <Controller
                      control={control}
                      name="date"
                      rules={{ required: true }} //optional
                      defaultValue={new DateObject().toDate()}
                      render={({
                        field: { onChange, name, value },
                        fieldState: { invalid, isDirty }, //optional
                        formState: { errors }, //optional, but necessary if you want to show an error message
                      }) => (
                        <>
                          <DatePicker
                            format="YYYY/MM/DD"
                            value={value || new DateObject()}
                            defaultValue={new DateObject()}
                            onChange={(date) => {
                              if (date instanceof DateObject) date = date.toDate();
                              onChange(date);
                            }}
                            calendar={persian}
                            locale={persian_fa}
                            calendarPosition="bottom-right"
                            inputClass="form-control w-100"
                            maxDate={new DateObject()}
                          />
                          {errors &&
                            errors[name] &&
                            errors[name].type === "required" && (
                              //if you want to show an error message
                              <div className="text-danger">تاریخ را وارد کنید</div>
                            )}
                        </>
                      )}
                    />
                  </div>
                </Col>
                {/* ✅ بخش جدید: Checkbox ارسال SMS */}
                <Col md={12}>
                  <div className="mt-2 p-3" style={{ 
                    backgroundColor: "#f8f9fa", 
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0"
                  }}>
                    <div className="form-check form-switch">
                      <Input
                        type="checkbox"
                        className="form-check-input"
                        id="sendSmsCheckbox"
                        checked={sendSMS}
                        onChange={(e) => setSendSMS(e.target.checked)}
                        style={{ cursor: "pointer" }}
                      />
                      <Label 
                        className="form-check-label" 
                        htmlFor="sendSmsCheckbox"
                        style={{ cursor: "pointer", fontWeight: "500" }}
                      >
                        📱 ارسال لینک پرداخت از طریق پیامک
                      </Label>
                    </div>
                    <small className="text-muted d-block mt-1">
                      {sendSMS ? (
                        <span className="text-success">
                          ✓ لینک پرداخت برای مخاطب ارسال خواهد شد و <strong>7 واحد پیامک</strong> از اعتبار شما کسر می‌گردد
                        </span>
                      ) : (
                        <span>
                          در صورت فعال‌سازی، لینک پرداخت به صورت خودکار برای مخاطب ارسال می‌شود (7 واحد اعتبار)
                        </span>
                      )}
                    </small>
                    <div className="mt-2">
                      <small className="text-muted">
                        موجودی فعلی پیامک: <strong className={smsBalance < 70 ? "text-danger" : "text-success"}>{smsBalance.toLocaleString()}</strong>
                      </small>
                      {smsBalance < 70 && (
                        <small className="text-warning d-block mt-1">
                          ⚠️ موجودی پیامک شما کم است (کمتر از 10 پیامک)
                        </small>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <div className="mt-3 d-flex justify-content-center w-100">
                  <Button
                    color="primary"
                    type="submit"
                    style={{
                      minWidth: "150px",
                    }}
                  >
                    ثبت
                  </Button>
                </div>
              </Row>
            </Form>
          </TabPane>
          <TabPane tabId="multiple">
            {units && (
              <AddMultipleToll
                units={units}
                setLoading={setLoading}
                refreshData={refreshData}
                toggleModal={() => setShow(false)}
              />
            )}
          </TabPane>
          <TabPane tabId="excel">
            {units && (
              <AddExcelToll
                units={units}
                setLoading={setLoading}
                refreshData={refreshData}
                toggleModal={() => setShow(false)}
              />
            )}
          </TabPane>
        </TabContent>
      </ModalBody>
    </Modal>
  );
};