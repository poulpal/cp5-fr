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
import AddExcelDebt from "./AddExcelDebt";
import AddMultipleDebt from "./AddMultipleDebt";

import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import themeConfig from "@configs/themeConfig";

const AddDebtModal = ({ show, setShow, setLoading, refreshData, isModal = true }) => {
  if (!isModal) {
    return (
      <div className="px-1 pt-2 w-100">
        <_AddDebtModal
          show={show}
          setShow={setShow}
          setLoading={setLoading}
          refreshData={refreshData}
        />
      </div>
    );
  }
  return (
    <Modal
      isOpen={show}
      centered={true}
      size="lg"
      toggle={() => setShow(false)}
    >
      <ModalHeader toggle={() => setShow(false)}>افزودن بدهی</ModalHeader>
      <_AddDebtModal
        show={show}
        setShow={setShow}
        setLoading={setLoading}
        refreshData={refreshData}
      />
    </Modal>
  );
}

const _AddDebtModal = ({ show, setShow, setLoading, refreshData }) => {
  const currency = localStorage.getItem("currency") || "rial";
  const buildingOptions = localStorage.getItem("buildingOptions");
  const separateResidentAndOwnerInvoices = buildingOptions ? JSON.parse(buildingOptions).separate_resident_and_owner_invoices : false;

  const [units, setUnits] = useState([]);
  const [activeTab, setActiveTab] = useState("single");
  const [debtTypes, setDebtTypes] = useState([]);
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
      const response2 = await axios.get("/building_manager/debtTypes");
      setDebtTypes(response2.data.data.debtTypes);
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
    }
  };

  useEffect(() => {
    getUnits();
  }, []);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/building_manager/units/" + formData.unit.value + "/addInvoice",
        {
          amount: formData.amount.replace(/,/g, "") / (currency === "rial" ? 10 : 1),
          type: "debt",
          description: formData.description,
          date: formData.date,
          resident_type: formData.resident_type,
          debt_type_id: formData.debtType.id,
        }
      );
      toast.success(response.data.message);
      setShow(false);
      refreshData();
      reset();
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

    <ModalBody>
      <Nav pills justified>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "single" })}
            onClick={() => {
              setActiveTab("single");
            }}
          >
            بدهی تکی
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "multiple" })}
            onClick={() => {
              setActiveTab("multiple");
            }}
          >
            بدهی گروهی
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === "excel" })}
            onClick={() => {
              setActiveTab("excel");
            }}
          >
            ورود گروهی
          </NavLink>
        </NavItem>
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
              {separateResidentAndOwnerInvoices ? (
                <Col md={6}>
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
              ) : null}
              <Col md={6}>
                <div className="mt-1">
                  <Label>سرفصل :*</Label>
                  <Controller
                    name="debtType"
                    control={control}
                    defaultValue={debtTypes[0]}
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
                        isClearable={false}
                        options={debtTypes}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id}
                      />
                    )}
                  />
                  {errors.debtType && (
                    <div className="text-danger">سرفصل را مشخص کنید</div>
                  )}
                </div>
              </Col>
              <Col md={12}>
                <div className="mt-1">
                  {currency === 'rial' ?
                    <Label>مبلغ بدهی (ریال) *</Label>
                    :
                    <Label>مبلغ بدهی (تومان) *</Label>
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
                        placeholder="مبلغ بدهی"
                        inputMode="tel"
                      />
                    )}
                  />
                  {errors.amount && (
                    <div className="text-danger">مبلغ بدهی را وارد کنید</div>
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
            <AddMultipleDebt
              units={units}
              setLoading={setLoading}
              refreshData={refreshData}
              toggleModal={() => setShow(false)}
            />
          )}
        </TabPane>
        <TabPane tabId="excel">
          {units && (
            <AddExcelDebt
              units={units}
              setLoading={setLoading}
              refreshData={refreshData}
              toggleModal={() => setShow(false)}
            />
          )}
        </TabPane>
      </TabContent>
    </ModalBody>
  );
};

export default AddDebtModal;
