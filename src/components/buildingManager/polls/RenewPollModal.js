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
import { useEffect, useState } from "react";
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
import Select from "react-select";

export default ({ show, toggle, refreshData, setLoading, poll }) => {
  const [options, setOptions] = useState(["", ""]);
  const {
    control,
    register,
    reset,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const [units, setUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectType, setSelectType] = useState("all");
  const [residtentType, setResidentType] = useState("all");


  useEffect(() => {
    setOptions(poll.options);
  }, []);


  const onSubmit = async (data) => {
    setLoading(true);
    try {
      data.ends_at = moment(data.ends_at).format("YYYY-MM-DD HH:mm:ss");

      console.log(data);
      const response = await axios.post(`building_manager/polls/${poll.id}/renew`, data);
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
      <ModalHeader toggle={toggle}>افزودن نظرسنجی</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-1">
            <Label>عنوان</Label>
            <Controller
              name="title"
              control={control}
              rules={{ required: true }}
              defaultValue={poll.title}
              render={({ field }) => (
                <Input {...field} type="text" placeholder="عنوان" disabled />
              )}
            />
            {errors.title && (
              <div className="text-danger">عنوان را وارد کنید</div>
            )}
          </div>
          <div className="mt-1">
            <Label>توضیحات</Label>
            <Controller
              name="description"
              control={control}
              defaultValue={poll.description}
              rules={{ required: true }}
              render={({ field }) => (
                <textarea
                  disabled
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
            <Label>گزینه ها</Label>
            <Row>
              {options.map((option, index) => {
                return (
                  <Col
                    md="6"
                    className="mb-1 d-flex align-items-center"
                    key={index}
                  >
                    <Input
                      type="text"
                      placeholder="گزینه"
                      value={option}
                      disabled
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                      }}
                    />
                  </Col>
                );
              })}
            </Row>
          </div>
          <div className="mt-1">
            <Row>
              <Col md="6">
                <Label>زمان شروع</Label>
                <br />
                <Controller
                  control={control}
                  name="starts_at"
                  rules={{ required: true }} //optional
                  defaultValue={moment(poll.starts_at).format("jYYYY/jMM/jDD HH:mm")}
                  render={({
                    field: { onChange, name, value },
                    fieldState: { invalid, isDirty }, //optional
                    formState: { errors }, //optional, but necessary if you want to show an error message
                  }) => (
                    <>
                      <DatePicker
                        disabled
                        format="YYYY/MM/DD HH:mm"
                        value={value || ""}
                        onChange={(date) => {
                          if (date instanceof DateObject) date = date.toDate();
                          onChange(date);
                        }}
                        calendar={persian}
                        locale={persian_fa}
                        calendarPosition="bottom-right"
                        inputClass="form-control w-100"
                        plugins={[<TimePicker position="bottom" hideSeconds />]}
                        minDate={new DateObject()}
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
              </Col>
              <Col md="6">
                <Label>زمان پایان</Label>
                <br />
                <Controller
                  control={control}
                  name="ends_at"
                  defaultValue={moment(poll.ends_at).format("jYYYY/jMM/jDD HH:mm")}
                  rules={{ required: true }} //optional
                  render={({
                    field: { onChange, name, value },
                    fieldState: { invalid, isDirty }, //optional
                    formState: { errors }, //optional, but necessary if you want to show an error message
                  }) => (
                    <>
                      <DatePicker
                        format="YYYY/MM/DD HH:mm"
                        value={value || ""}
                        onChange={(date) => {
                          if (date instanceof DateObject) date = date.toDate();
                          onChange(date);
                        }}
                        calendar={persian}
                        locale={persian_fa}
                        calendarPosition="bottom-right"
                        inputClass="form-control w-100"
                        plugins={[<TimePicker position="bottom" hideSeconds />]}
                        minDate={new DateObject()}
                      />
                      {errors &&
                        errors[name] &&
                        errors[name].type === "required" && (
                          <div className="text-danger">تاریخ را وارد کنید</div>
                        )}
                    </>
                  )}
                />
              </Col>
            </Row>
          </div>
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