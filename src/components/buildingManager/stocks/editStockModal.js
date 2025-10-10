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

import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default ({
  stock,
  show,
  toggle,
  refreshData,
  setLoading,
}) => {
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  useEffect(() => {
    reset(stock);

    return () => {};
  }, [stock]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.put(
        "building_manager/stocks/" + stock.id,
        data
      );
      toast.success(response.data.message);
      reset();
      refreshData();
      toggle();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      if (err.response && err.response.data.errors) {
        Object.keys(err.response.data.errors).forEach((key) => {
          setError(key, { message: err.response.data.errors [key][0] });
          toast.error(err.response.data.errors[key][0]);
        });
      }
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={show} centered={true} size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle}>ویرایش کالا</ModalHeader>
      <ModalBody>
      <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md="6">
              <div className="mt-1">
                <Label>تاریخ *</Label>
                <br />
                <Controller
                  control={control}
                  name="date"
                  rules={{ required: true }} //optional
                  defaultValue={new DateObject(stock.created_at) || new DateObject().toDate()}
                  render={({
                    field: { onChange, name, value },
                    fieldState: { invalid, isDirty }, //optional
                    formState: { errors }, //optional, but necessary if you want to show an error message
                  }) => (
                    <>
                      <DatePicker
                        format="YYYY/MM/DD"
                        value={value || new DateObject()}
                        defaultValue={value || new DateObject()}
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
            <Col md={6}>
              <div className="mt-1">
                <Label>شماره *</Label>
                <Controller
                  name="invoice_number"
                  control={control}
                  defaultValue=""
                  rules={{ required: true }}
                  render={({ field }) => (
                    <NumericFormat
                      {...field}
                      thousandSeparator={false}
                      className="form-control"
                      placeholder="شماره"
                      inputMode="tel"
                    />
                  )}
                />
                {errors.invoice_number && (
                  <div className="text-danger">
                    {errors.invoice_number.message}
                  </div>
                )}
              </div>
            </Col>
            <Col md={12}>
              <div className="mt-1">
                <Label>نام کالا *</Label>
                <Controller
                  name="title"
                  rules={{ required: true }}
                  control={control}
                  defaultValue=""
                  render={({ field }) => <Input {...field} type="text" />}
                />
              </div>
              {errors.title && (
                <div className="text-danger">نام کالا را وارد کنید</div>
              )}
            </Col>
            <Col md={12}>
              <div className="mt-1">
                <Label>شرح *</Label>
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
            <Col md={6}>
              <div className="mt-1">
                <Label>تعداد</Label>
                <Controller
                  name="quantity"
                  control={control}
                  defaultValue=""
                  rules={{ required: false }}
                  render={({ field }) => (
                    <NumericFormat
                      {...field}
                      thousandSeparator={false}
                      className="form-control"
                      placeholder="تعداد"
                      inputMode="tel"
                    />
                  )}
                />
                {errors.quantity && (
                  <div className="text-danger">تعداد را وارد کنید</div>
                )}
              </div>
            </Col>
            <Col md={6}>
              <div className="mt-1">
                <Label>قیمت (تومان)</Label>
                <Controller
                  name="price"
                  control={control}
                  defaultValue=""
                  rules={{ required: false }}
                  render={({ field }) => (
                    <NumericFormat
                      {...field}
                      thousandSeparator={true}
                      className="form-control"
                      placeholder="قیمت"
                      inputMode="tel"
                    />
                  )}
                />
                {errors.price && (
                  <div className="text-danger">قیمت را وارد کنید</div>
                )}
              </div>
            </Col>
            <Col md={6}>
              <div className="mt-1">
                <Label>خریدار</Label>
                <Controller
                  name="buyer"
                  rules={{ required: false }}
                  control={control}
                  defaultValue=""
                  render={({ field }) => <Input {...field} type="text" />}
                />
              </div>
              {errors.buyer && (
                <div className="text-danger">خریدار را وارد کنید</div>
              )}
            </Col>
            <Col md={6}>
              <div className="mt-1">
                <Label>فروشنده</Label>
                <Controller
                  name="seller"
                  rules={{ required: false }}
                  control={control}
                  defaultValue=""
                  render={({ field }) => <Input {...field} type="text" />}
                />
              </div>
              {errors.seller && (
                <div className="text-danger">فروشنده را وارد کنید</div>
              )}
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
      </ModalBody>
    </Modal>
  );
};