import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import moment from "moment-jalaali";

import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Select from "react-select";
import { NumericFormat } from "react-number-format";

import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import themeConfig from "@configs/themeConfig";

export default ({ units, setLoading, refreshData, toggleModal }) => {
  const currency = localStorage.getItem("currency") ?? "rial";
  const buildingOptions = JSON.parse(localStorage.getItem("buildingOptions") ?? "{}");
  const separateResidentAndOwnerInvoices = buildingOptions?.separate_resident_and_owner_invoices ?? false;

  const [pattern, setPattern] = useState("");
  const [debt, setDebt] = useState("");
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectType, setSelectType] = useState("all");
  const [divideType, setDivideType] = useState("equal");
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState(0);
  const [debts, setDebts] = useState([]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(moment(new Date()).format("jYYYY/jMM/jDD"));
  const [debtTypes, setDebtTypes] = useState([]);

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const getUnits = async () => {
    try {
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

  const onSubmit = async (data) => {
    setLoading(true);
    let tempDebts = debts;
    if (currency === "rial") {
      tempDebts = debts.map((unit) => {
        return {
          ...unit,
          amount: unit.amount / 10,
          resident_type: data.resident_type,
        };
      });
    }
    try {
      const response = await axios.post(
        "/building_manager/units/addMultipleDebt",
        {
          type: "debt",
          debts: tempDebts,
          debt_type_id: data.debtType.id,
        }
      );
      toast.success(response.data.message);
      refreshData();
      toggleModal();
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      if (err.response && err.response.data.errors) {
        Object.keys(err.response.data.errors).forEach((key) => {
          toast.error(err.response.data.errors[key][0]);
        });
      }
    }
    setLoading(false);
  };


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
  }, [selectType, debt, units]);

  useEffect(() => {
    const tempDebts = selectedUnits.map((unit) => {
      console.log(parseInt(amount) * parseFloat(unit.area));
      return {
        unit_number: unit.unit_number,
        amount: divideType == 'each' ? amount : divideType == 'equal' ? Math.round(amount / selectedUnits.length) : divideType == 'per_area' ? parseInt(amount) * parseFloat(unit.area) : 0,
        description,
        date,
      };
    });
    setDebts(tempDebts);
  }, [selectedUnits, amount, divideType, description, date]);

  return (
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
          {/* <option value='debt_mt'>واحد ها با بدهی بیشتر از</option> */}
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
      {selectType == 'debt_mt' && (
        <div className="mb-2">
          <NumericFormat
            value={debt}
            onValueChange={(values) => {
              const { formattedValue, value } = values;
              setDebt(formattedValue);
            }}
            thousandSeparator={true}
            className="form-control"
            placeholder="مبلغ بدهی (تومان)"
            inputMode="tel"
          />
        </div>
      )}
      <div className="mb-2">
        <Label>تقسیم</Label>
        <select
          className="form-control"
          value={divideType}
          onChange={(e) => setDivideType(e.target.value)}
        >
          <option value='equal'>مساوی بین واحد ها</option>
          <option value='each'>به ازای هر واحد</option>
          <option value='per_area'>بر حسب متراژ</option>
        </select>
      </div>
      <Row>
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
        <Col md={6}>
          <div className="mt-1">
            <Label>توضیحات *</Label>
            <Controller
              name="description"
              rules={{ required: true }}
              control={control}
              defaultValue=""
              render={({ field }) => <Input
                onChange={(e) => {
                  setDescription(e.target.value);
                  field.onChange(e);
                }}
                type="text" />}
            />
          </div>
          {errors.description && (
            <div className="text-danger">توضیحات را وارد کنید</div>
          )}
        </Col>
        <Col md={6}>
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
              render={({ field }) => (
                <NumericFormat
                  onChange={(e) => {
                    setAmount(e.target.value.replace(/,/g, ""));
                  }}
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
        <Col md="6">
          <div className="mt-1">
            <Label>تاریخ</Label>
            <br />
            <Controller
              control={control}
              name="date"
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
                      setDate(moment(date).format("jYYYY/jMM/jDD"));
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
      <hr />
      <div style={{
        maxHeight: '300px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {debts.map((item, index) => (
          <div key={index}>
            <Row>
              <Col sm="6">
                <Label for="unit_number">شماره واحد</Label>
                <input
                  name="unit_number"
                  type="text"
                  className="form-control"
                  disabled={true}
                  value={item.unit_number}
                />
              </Col>
              <Col sm="6">
                <Label for="monthly_charge">مبلغ بدهی</Label>
                <input
                  type="text"
                  className="form-control"
                  disabled={true}
                  value={item.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </Col>
            </Row>
          </div>
        ))}
      </div>
      <div className="mt-1 d-flex justify-content-center w-100">
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
  );
};