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
import { useState } from "react";

const AddVoiceMessageModal = ({ show, toggle, refreshData, setLoading }) => {
  const [pattern, setPattern] = useState("");
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
      const response = await axios.post("building_manager/voiceMessages", data);
      toast.success(response.data.message);
      reset();
      refreshData();
      toggle();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        console.log(err);
      }
    }
    setLoading(false);
  };

  const limit = 200;

  const variables = [
    {
      name: "نام",
      value: "{first_name}",
    },
    {
      name: "نام خانوادگی",
      value: "{last_name}",
    },
    {
      name: "شماره واحد",
      value: "{unit_number}",
    },
    {
      name: "مبلغ شارژ ماهیانه",
      value: "{charge}",
    },
    {
      name: "مبلغ بدهی",
      value: "{debt}",
    },
  ];
  return (
    <Modal isOpen={show} centered={true} size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle}>پیام صوتی جدید</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
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
                    // color: pattern.length > 200 ? "red" : "black",
                  }}
                  placeholder="متن پیام صوتی را وارد کنید"
                  value={pattern}
                  onChange={(e) => {
                    setPattern(e.target.value);
                    field.onChange(e);
                  }}
                />
              )}
            />
            {errors.pattern && (
              <div className="text-danger">
                {errors.pattern.type === "required" &&
                  "متن پیام صوتی را وارد کنید"}
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
              {pattern.length} / {limit}
            </p>
          </FormGroup>
          {/* <div className="mt-0 d-flex flex-wrap justify-content-center w-100 align-items-center">
            <Label className="me-3">متغیر ها:</Label>
            {variables.map((variable, index) => (
              <Button
                key={index}
                color="secondary"
                className="me-2"
                onClick={() => {
                  setPattern(pattern + variable.value);
                  setValue("pattern", pattern + variable.value);
                  // focus on the end of the text
                  const textarea = document.querySelector("textarea");
                  textarea.focus();
                }}
              >
                {variable.name}
              </Button>
            ))}
          </div> */}
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
    </Modal>
  );
};

export default AddVoiceMessageModal;
