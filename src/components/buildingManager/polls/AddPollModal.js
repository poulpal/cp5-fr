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
import themeConfig from "@configs/themeConfig";

const AddPollModal = ({ show, toggle, refreshData, setLoading }) => {
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

  const getUnits = async () => {
    try {
      const response = await axios.get("/building_manager/units");
      setUnits(response.data.data.units);
      setSelectedUnits(response.data.data.units);
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

  useEffect(() => {
    if (selectType == 'all') {
      setSelectedUnits(units);
    }
    if (selectType == 'debt_mt') {
      setSelectedUnits(units.filter(unit => parseInt(unit.charge_debt) > parseInt(debt.replace(/,/g, ""))));
    }
    if (selectType == 'select') {
      setSelectedUnits([]);
    }
  }, [selectType, units]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      data.starts_at = moment(data.starts_at).format("YYYY-MM-DD HH:mm:ss");
      data.ends_at = moment(data.ends_at).format("YYYY-MM-DD HH:mm:ss");
      data.options = options;
      data.units = selectedUnits.map((unit) => unit.id);
      data.resident_type = residtentType;

      console.log(data);
      const response = await axios.post("building_manager/polls", data);
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
          <div className="mb-2">
            <Label>واحد ها</Label>
            <select
              className="form-control"
              value={selectType}
              onChange={(e) => setSelectType(e.target.value)}
            >
              <option value='all'>همه واحد ها</option>
              <option value='select'>انتخاب واحد ها</option>
            </select>
          </div>
          {selectType == 'select' && (
            <div className="mb-2">
              <Label>واحد ها</Label>
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
                value={selectedUnits}
                onChange={(selected) => {
                  setSelectedUnits(selected);
                }}
                isClearable={true}
                isMulti={true}
                options={units}
                getOptionLabel={(option) => 'واحد ' + option.unit_number}
                getOptionValue={(option) => option.id}
              />
            </div>
          )}
          <div className="mb-2">
            <Label>تفکیک :</Label>
            <select
              className="form-control"
              value={residtentType}
              onChange={(e) => setResidentType(e.target.value)}
            >
              <option value='all'>همه</option>
              <option value='renter'>فقط مستاجران</option>
              <option value='owner'>فقط مالکان</option>
              <option value='resident'>ساکنان (مستاجر یا مالکان ساکن)</option>
            </select>
          </div>
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
            <Label>توضیحات</Label>
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
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                      }}
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="text-danger ms-1"
                      size="lg"
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        const filtered = options.filter((_, i) => i !== index);
                        console.log(filtered);
                        setOptions(filtered);
                      }}
                    />
                  </Col>
                );
              })}
            </Row>
            <div className="mt-1 d-flex justify-content-center w-100">
              <Button
                color="primary"
                onClick={() => {
                  setOptions([...options, ""]);
                }}
                style={{
                  minWidth: "150px",
                }}
              >
                افزودن گزینه جدید
              </Button>
            </div>
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

export default AddPollModal;
