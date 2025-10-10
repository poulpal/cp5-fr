import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Select from "react-select";
import { NumericFormat } from "react-number-format";
import themeConfig from "@configs/themeConfig";

export default ({ show, toggle, refreshData, setLoading, isModal = true }) => {
  if (!isModal) {
    return (
      <div className="px-1 pt-2 w-100">
        <_AddSmsMessageModal
          show={show}
          toggle={toggle}
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
      <ModalHeader toggle={toggle}>پیام متنی جدید</ModalHeader>
      <_AddSmsMessageModal
        show={show}
        toggle={toggle}
        setLoading={setLoading}
        refreshData={refreshData}
      />
    </Modal>
  );
}

const _AddSmsMessageModal = ({ show, toggle, refreshData, setLoading }) => {
  const [pattern, setPattern] = useState("");
  const [units, setUnits] = useState([]);
  const [smsmessage, setSmsMessage] = useState("");
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectType, setSelectType] = useState("all");
  const [residtentType, setResidentType] = useState("all");
  const [count, setCount] = useState(0);
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post("building_manager/smsMessages", {
        pattern: data.pattern,
        units: selectedUnits.map((unit) => unit.id),
        resident_type: residtentType,
      });
      toast.success(response.data.message);
      reset();
      refreshData();
      toggle();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      if (err.response && err.response.data.errors) {
        for (const [key, value] of Object.entries(err.response.data.errors)) {
          toast.error(value);
        }
      }
    }
    setLoading(false);
  };

  const getUnits = async () => {
    try {
      const response = await axios.get("/building_manager/units?withResidents=1");
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
    if (selectType == 'smsmessage_mt') {
      setSelectedUnits(units.filter(unit => parseInt(unit.charge_smsmessage) > parseInt(smsmessage.replace(/,/g, ""))));
    }
    if (selectType == 'select') {
      setSelectedUnits([]);
    }
  }, [selectType, smsmessage, units]);

  useEffect(() => {
    let temp_count = 0;
    if (residtentType == 'all') {
      selectedUnits.map((unit) => {
        temp_count += unit.residents.length;
      });
    }
    if (residtentType == 'renter') {
      selectedUnits.map((unit) => {
        temp_count += unit.residents.filter(resident => resident.ownership == 'renter').length;
      }
      );
    }
    if (residtentType == 'owner') {
      selectedUnits.map((unit) => {
        temp_count += unit.residents.filter(resident => resident.ownership == 'owner').length;
      }
      );
    }
    if (residtentType == 'resident') {
      selectedUnits.map((unit) => {
        temp_count += 1;
      }
      );
    }
    setCount(temp_count);

  }, [residtentType, units, selectedUnits]);

  const limit = 210;

  const variables = [
    {
      name: "نام",
      value: "{user_first_name}",
    },
    {
      name: "نام خانوادگی",
      value: "{user_last_name}",
    },
    {
      name: "شماره واحد",
      value: "{unit_number}",
    },
    {
      name: "مبلغ شارژ ماهیانه",
      value: "{charge_amount_in_rial}",
    },
    {
      name: "مبلغ بدهی",
      value: "{smsmessage_amount_in_rial}",
    },
    {
      name: "لینک پرداخت",
      value: "{unit_payment_link}",
    },
  ];
  return (
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
            <option value='smsmessage_mt'>واحد ها با بدهی بیشتر از</option>
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
        {selectType == 'smsmessage_mt' && (
          <div className="mb-2">
            <NumericFormat
              value={smsmessage}
              onValueChange={(values) => {
                const { formattedValue, value } = values;
                setSmsMessage(formattedValue);
              }}
              thousandSeparator={true}
              className="form-control"
              placeholder="مبلغ بدهی (تومان)"
              inputMode="tel"
            />
          </div>
        )}
        <div className="mb-2">
          <Label>ارسال به</Label>
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
        <FormGroup>
          <Controller
            name="pattern"
            control={control}
            defaultValue=""
            rules={{ required: true, maxLength: limit }}
            render={({ field }) => (
              <textarea
                {...field}
                className="form-control"
                style={{
                  height: "150px",
                  color: pattern.length + 6 > limit ? "red" : "black",
                }}
                placeholder="متن پیام متنی را وارد کنید"
                value={pattern}
                onChange={(e) => {
                  setPattern(e.target.value);
                  field.onChange(e);
                }}
              />
            )}
          />
          <span>
            لغو11
          </span>
          {errors.pattern && (
            <div className="text-danger">
              {errors.pattern.type === "required" &&
                "متن پیام متنی را وارد کنید"}
              {errors.pattern.type === "maxLength" &&
                `حداکثر طول متن ${limit} کاراکتر است`}
            </div>
          )}
          <p
            style={{
              direction: "ltr",
              marginBottom: "-30px",
            }}
          >
            کاراکتر {Math.ceil((pattern.length + 6))} / پیامک {Math.ceil((pattern.length + 6) / 70)}
          </p>
        </FormGroup>
        <div className="mt-0 d-flex flex-wrap justify-content-center w-100 align-items-center">
          <Label className="me-3">متغیر ها:</Label>
          {variables.map((variable, index) => (
            <Button
              key={index}
              color="secondary"
              className="me-1 mb-1"
              onClick={() => {
                setPattern(pattern + variable.value + " ");
                setValue("pattern", pattern + variable.value);
                const textarea = document.querySelector("textarea");
                textarea.focus();
              }}
            >
              {variable.name}
            </Button>
          ))}
        </div>
        <div>
          <hr />
          <span>
            ارسال به {count} شماره

          </span>
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
    </ModalBody>
  );
};