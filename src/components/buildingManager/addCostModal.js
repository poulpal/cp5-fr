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
import AddMultipleCost from "./addMultipleCost";
import DatePicker, { DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import moment from "moment-jalaali";

const AddCostModal = ({ show, setShow, setLoading, refreshData }) => {
  const [units, setUnits] = useState([]);
  const [activeTab, setActiveTab] = useState("single");
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

  useEffect(() => {
    getUnits();
  }, []);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/building_manager/invoices",
        {
          amount: formData.amount.replace(/,/g, "") / 10,
          type: "cost",
          description: formData.description,
          date: moment(formData.date).format("YYYY-MM-DD"),
          show_units: formData.show_units ? 1 : 0,
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
    <Modal
      isOpen={show}
      centered={true}
      size="lg"
      toggle={() => setShow(false)}
    >
      <ModalHeader toggle={() => setShow(false)}>افزودن هزینه</ModalHeader>
      <ModalBody>
        <Nav pills justified>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "single" })}
              onClick={() => {
                setActiveTab("single");
              }}
            >
              هزینه تکی
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "multiple" })}
              onClick={() => {
                setActiveTab("multiple");
              }}
            >
              هزینه گروهی
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="single">
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <Col md={12}>
                  <div className="mt-1">
                    <Label>مبلغ هزینه (ریال) *</Label>
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
                          placeholder="مبلغ هزینه"
                          inputMode="tel"
                        />
                      )}
                    />
                    {errors.amount && (
                      <div className="text-danger">مبلغ هزینه را وارد کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={12}>
                  <div className="mt-1">
                    <Label>توضیحات</Label>
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
                <Col md="6">
                  <div className="mt-1">
                    <Label>تاریخ</Label>
                    <br />
                    <Controller
                      control={control}
                      name="date"
                      rules={{ required: false }} //optional
                      render={({
                        field: { onChange, name, value },
                        fieldState: { invalid, isDirty }, //optional
                        formState: { errors }, //optional, but necessary if you want to show an error message
                      }) => (
                        <>
                          <DatePicker
                            format="YYYY/MM/DD"
                            value={value || new DateObject().toDate()}
                            onChange={(date) => {
                              if (date instanceof DateObject) date = date.toDate();
                              onChange(date);
                            }}
                            calendar={persian}
                            locale={persian_fa}
                            calendarPosition="bottom-right"
                            inputClass="form-control w-100"
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
                <Col md="6">
                  <div className="mt-1">
                    <Label>نمایش به واحد ها: </Label>
                    <br />
                    <Controller
                      name="show_units"
                      control={control}
                      defaultValue={true}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          {...field}
                          checked={field.value}
                        />
                      )}
                    />
                    {errors.show_units && (
                      <div className="text-danger">
                        {errors.show_units.message}
                      </div>
                    )}
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
              <AddMultipleCost
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

export default AddCostModal;
