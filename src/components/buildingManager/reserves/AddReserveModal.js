import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Label,
  Row,
  Col,
} from "reactstrap";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import DatePicker, { DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import moment from "moment-jalaali";
import _ from 'lodash';
import { NumericFormat } from "react-number-format";

const AddReserveModal = ({ show, toggle, refreshData, setLoading }) => {
  const [options, setOptions] = useState(["", ""]);
  const [ranges, setRanges] = useState([
    {
      key: "saturday",
      name: "شنبه",
      start: 8,
      end: 20,
      enabled: true,
    },
    {
      key: "sunday",
      name: "یکشنبه",
      start: 8,
      end: 20,
      enabled: true,
    },
    {
      key: "monday",
      name: "دوشنبه",
      start: 8,
      end: 20,
      enabled: true,
    },
    {
      key: "tuesday",
      name: "سه شنبه",
      start: 8,
      end: 20,
      enabled: true,
    },
    {
      key: "wednesday",
      name: "چهارشنبه",
      start: 8,
      end: 20,
      enabled: true,
    },
    {
      key: "thursday",
      name: "پنجشنبه",
      start: 8,
      end: 20,
      enabled: true,
    },
    {
      key: "friday",
      name: "جمعه",
      start: 8,
      end: 20,
      enabled: true,
    },
  ]);
  const {
    control,
    register,
    reset,
    handleSubmit,
    setError,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {

    setLoading(true);
    try {
      data.ranges = ranges;
      data.cost_per_hour = data.cost_per_hour.replace(/,/g, "");

      const response = await axios.post("building_manager/reservables", data);
      toast.success(response.data.message);
      reset();
      setOptions(["", ""]);
      refreshData();
      toggle();
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        if (err.response && err.response.data.errors) {
          Object.keys(err.response.data.errors).forEach((key) => {
            toast.error(err.response.data.errors[key][0]);
          });
        } else {
          console.log(err);
        }
      }
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={show} centered={true} size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle}>افزودن فضای اشتراکی</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-1">
            <Label>عنوان</Label>
            <Controller
              name="title"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input {...field} type="text" placeholder="عنوان" />
              )}
            />
            {errors.title && (
              <div className="text-danger">عنوان را وارد کنید</div>
            )}
          </div>
          <div className="mt-1">
            <Label>توضیحات / قوانین</Label>
            <Controller
              name="description"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <textarea
                  {...field}
                  className="form-control"
                  style={{
                    height: "100px",
                  }}
                  placeholder="توضیحات"
                />
              )}
            />
            {errors.description && (
              <div className="text-danger">توضیحات را وارد کنید</div>
            )}
          </div>
          <div className="mt-1">
            <Label>زمان مجاز رزرو</Label>
            {ranges.map((range, index) => (

              <Row key={index}>
                <Col md="2" className="d-flex flex-column justify-content-center align-items-center">
                  {range.name}
                  <input
                    type="checkbox"
                    checked={range.enabled}
                    onChange={(e) => {
                      setRanges(ranges.map((r) => {
                        if (r.key === range.key) {
                          r.enabled = e.target.checked;
                        }
                        return r;
                      }));
                    }}
                  />
                </Col>
                <Col md="4">
                  <Label>از:</Label>
                  <Controller
                    name={"start" + range.name}
                    control={control}
                    value={range.start}
                    // rules={{ required: "وارد کردن این فیلد الزامی است" }}
                    render={({ field }) => (
                      <select
                      disabled={!range.enabled}
                        className="form-control"
                        {...field}
                        onChange={(e) => {
                          setRanges(ranges.map((r) => {
                            if (r.key === range.key) {
                              r.start = e.target.value;
                            }
                            return r;
                          }));
                        }}
                      >
                        {_.range(0,24).map((hour) => (
                          <option value={hour} selected={hour === range.start}>{hour}</option>
                        ))}
                      </select>
                    )}
                  />
                </Col>
                <Col md="4">
                  <Label>تا:</Label>
                  <Controller
                    name={"end" + range.name}
                    control={control}
                    // rules={{ required: "وارد کردن این فیلد الزامی است" }}
                    render={({ field }) => (
                      <select
                      disabled={!range.enabled}
                        className="form-control"
                        {...field}
                        onChange={(e) => {
                          setRanges(ranges.map((r) => {
                            if (r.key === range.key) {
                              r.end = e.target.value;
                            }
                            return r;
                          }));
                        }}
                      >
                        {_.range(1,24).map((hour) => (
                          <option value={hour} selected={hour === range.end}>{hour}</option>
                        ))}
                      </select>
                    )}
                  />
                </Col>
              </Row>
            ))}
          </div>
          <Row>
            <div className="mt-1">
              <Label>هزینه هر ساعت رزرو (تومان) *</Label>
              <Controller
                name="cost_per_hour"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <NumericFormat
                    {...field}
                    thousandSeparator={true}
                    className="form-control"
                    placeholder="هزینه هر ساعت رزرو"
                    inputMode="tel"
                  />
                )}
              />
              {errors.cost_per_hour && (
                <div className="text-danger">هزینه هر ساعت رزرو را وارد کنید</div>
              )}
            </div>
          </Row>
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
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default AddReserveModal;
