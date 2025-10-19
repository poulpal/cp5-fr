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
  const currency = localStorage.getItem("currency");

  const [pattern, setPattern] = useState("");
  const [toll, setToll] = useState("");
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectType, setSelectType] = useState("all");
  const [divideType, setDivideType] = useState("equal");
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState(0);
  const [tolls, setTolls] = useState([]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(moment(new Date()).format("jYYYY/jMM/jDD"));
  const [residentType, setResidentType] = useState("resident");
  const [sendSMS, setSendSMS] = useState(false); // ✅ State برای ارسال SMS
  const [smsBalance, setSmsBalance] = useState(0); // ✅ موجودی SMS

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  // ✅ دریافت موجودی SMS
  useEffect(() => {
    const getSmsBalance = async () => {
      try {
        const response = await axios.get("/building_manager/smsMessages/getBalance");
        setSmsBalance(response.data.data.balance);
      } catch (err) {
        console.log(err);
      }
    };
    getSmsBalance();
  }, []);

  const onSubmit = async (data) => {
    // ✅ بررسی موجودی SMS (تخمین 3 واحد برای هر پیامک)
    const estimatedCreditsPerMessage = 3;
    const requiredCredits = selectedUnits.length * estimatedCreditsPerMessage;
    
    if (sendSMS && smsBalance < requiredCredits) {
      toast.error(`موجودی پیامک کافی نیست. تخمین مورد نیاز: ${requiredCredits} (${selectedUnits.length} واحد × ${estimatedCreditsPerMessage})، موجودی فعلی: ${smsBalance}`);
      return;
    }

    setLoading(true);
    let tempTolls = tolls;
    if (currency === "rial") {
      tempTolls = tolls.map((unit) => {
        return {
          ...unit,
          amount: unit.amount / 10,
        };
      });
    }
    try {
      const response = await axios.post(
        "/building_manager/tolls/addMultiple",
        {
          tolls: tempTolls,
          resident_type: residentType,
          send_sms: sendSMS, // ✅ ارسال پارامتر SMS
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
    if (selectType == 'toll_mt') {
      setSelectedUnits(units.filter(unit => parseInt(unit.charge_toll) > parseInt(toll.replace(/,/g, ""))));
    }
    if (selectType == 'select') {
      setSelectedUnits([]);
    }
  }, [selectType, toll, units]);

  useEffect(() => {
    const tempTolls = selectedUnits.map((unit) => {
      return {
        unit_number: unit.unit_number,
        amount: divideType == 'each' ? amount : divideType == 'equal' ? Math.round(amount / selectedUnits.length) : 0,
        description,
        date,
      };
    });
    setTolls(tempTolls);
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
          {/* <option value='toll_mt'>واحد ها با لینک پرداخت بیشتر از</option> */}
        </select>
      </div>
      <div className="mb-2">
            <Label>تفکیک :</Label>
            <select
              className="form-control"
              value={residentType}
              onChange={(e) => setResidentType(e.target.value)}
            >
              <option value='owner'>مالک</option>
              <option value='resident'>ساکن</option>
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
      {selectType == 'toll_mt' && (
        <div className="mb-2">
          <NumericFormat
            value={toll}
            onValueChange={(values) => {
              const { formattedValue, value } = values;
              setToll(formattedValue);
            }}
            thousandSeparator={true}
            className="form-control"
            placeholder="مبلغ لینک پرداخت (تومان)"
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
        </select>
      </div>
      <Row>

        <Col md={12}>
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
              <Label>مبلغ لینک پرداخت (ریال) *</Label>
              :
              <Label>مبلغ لینک پرداخت (تومان) *</Label>
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
      {/* ✅ بخش جدید: Checkbox ارسال SMS */}
      <div className="mb-3 p-3" style={{ 
        backgroundColor: "#f8f9fa", 
        borderRadius: "8px",
        border: "1px solid #e0e0e0"
      }}>
        <div className="form-check form-switch">
          <Input
            type="checkbox"
            className="form-check-input"
            id="sendSmsCheckboxMultiple"
            checked={sendSMS}
            onChange={(e) => setSendSMS(e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          <Label 
            className="form-check-label" 
            htmlFor="sendSmsCheckboxMultiple"
            style={{ cursor: "pointer", fontWeight: "500" }}
          >
            📱 ارسال لینک پرداخت از طریق پیامک برای همه واحدها
          </Label>
        </div>
        <small className="text-muted d-block mt-1">
          {sendSMS ? (
            <span className="text-success">
              ✓ لینک پرداخت برای <strong>{selectedUnits.length} واحد</strong> ارسال خواهد شد و تقریباً <strong>{selectedUnits.length * 3} واحد پیامک</strong> ({selectedUnits.length} × 3) از اعتبار شما کسر می‌گردد
            </span>
          ) : (
            <span>
              در صورت فعال‌سازی، لینک پرداخت به صورت خودکار برای همه واحدها ارسال می‌شود (معادل 2-3 واحد اعتبار به ازای هر پیامک)
            </span>
          )}
        </small>
        <div className="mt-2">
          <small className="text-muted">
            موجودی فعلی پیامک: <strong className={smsBalance < (selectedUnits.length * 3) ? "text-danger" : "text-success"}>{smsBalance.toLocaleString()}</strong>
          </small>
          {sendSMS && smsBalance < (selectedUnits.length * 3) && (
            <small className="text-danger d-block mt-1">
              ⚠️ موجودی پیامک شما برای ارسال به {selectedUnits.length} واحد کافی نیست (تخمین مورد نیاز: {selectedUnits.length * 3})
            </small>
          )}
        </div>
      </div>
      <hr />
      <div style={{
        maxHeight: '300px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {tolls.map((item, index) => (
          <div key={index}>
            <Row>
              <Col md="6">
                <Label for="unit_number">شماره واحد</Label>
                <input
                  name="unit_number"
                  type="text"
                  className="form-control"
                  disabled={true}
                  value={item.unit_number}
                />
              </Col>
              <Col md="6">
                <Label for="monthly_charge">مبلغ لینک پرداخت</Label>
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