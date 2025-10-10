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
} from "reactstrap";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useEffect } from "react";
import { loadCaptchaEnginge, LoadCanvasTemplate, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';

const SupportTicketModal = ({ show, setShow, setLoading, refreshData }) => {
  const [showSheba, setShowSheba] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
    setValue,
  } = useForm();

  const onFormSubmit = async (data) => {
    setLoading(true);
    try {
      if (!validateCaptcha(data.captcha)) {
        toast.error("کد امنیتی اشتباه است");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("message", data.message);
      formData.append("section", data.section);
      // data.attachments.map((file) => {
      //   formData.append("attachments[]", file[0]);
      // });

      const response = await axios.post(
        `/building_manager/supportTickets`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(response.data.message);
      setShow(false);
      reset();
      refreshData();
    } catch (err) {
      if (err.response && err.response.data.error) {
        console.log(err.response.data.error);
        toast.error(err.response.data.error);
        setShow(false);
      }
      if (err.response && err.response.data.errors) {
        for (const [key, value] of Object.entries(err.response.data.errors)) {
          setError(key, { message: value });
          toast.error(value);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        loadCaptchaEnginge(6);
      }, 1000);
    }
  }, [show]);

  return (
    <Modal
      isOpen={show}
      centered={true}
      size="lg"
      toggle={() => setShow(false)}
    >
      <ModalHeader toggle={() => setShow(false)}>افزودن تیکت جدید</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit(onFormSubmit)}>
          <Row>
            <Col md={12}>
              <div className="mt-1">
                <Label>عنوان</Label>
                <Controller
                  name="subject"
                  control={control}
                  defaultValue=""
                  rules={{ required: "وارد کردن این فیلد الزامی است" }}
                  render={({ field }) => <Input {...field} type="text" />}
                />
                {errors.subject && (
                  <div className="text-danger">{errors.subject.message}</div>
                )}
              </div>
            </Col>
            <Col md={12}>
              <div className="mt-1">
                <Label>بخش</Label>
                <Controller
                  name="section"
                  control={control}
                  rules={{ required: "وارد کردن این فیلد الزامی است" }}
                  defaultValue="support"
                  render={({ field }) => (
                    <select
                      className="form-control"
                      {...field}
                    >
                      <option value="support">پشتیبانی</option>
                      <option value="tech">فنی</option>
                      <option value="finance">مالی</option>
                    </select>
                  )}
                />
              </div>
            </Col>

            <Col md={12}>
              <div className="mt-1">
                <Label>توضیحات</Label>
                <Controller
                  name="message"
                  rules={{ required: "وارد کردن این فیلد الزامی است" }}
                  control={control}
                  defaultValue=""
                  render={({ field }) => <textarea className="form-control" style={{
                    minHeight: "150px",
                  }} {...field} rows={15} />}
                />
              </div>
              {errors.message && (
                <div className="text-danger">{errors.message.message}</div>
              )}
            </Col>
            {/* <Col md={12}>
              <div className="mt-1">
                <Label>فایل پیوست</Label>
                <input
                  name="attachments"
                  type="file"
                  className="form-control form-control-lg"
                  accept=".png, .jpg, .jpeg"
                  multiple
                  {...register("attachments")}
                />
                {errors.attachments && (
                  <span className="text-danger">
                    {errors.attachments.message}
                  </span>
                )}
              </div>
            </Col> */}
            <LoadCanvasTemplate
              reloadText="تغییر کد امنیتی"
            />
            <div className="mt-1">
              <Label>کد امنیتی</Label>
              <input
                type="text"
                className="form-control"
                {...register("captcha", {
                  required: "وارد کردن این فیلد الزامی است",
                })}
              />
              {errors.captcha && (
                <div className="text-danger">{errors.captcha.message}</div>
              )}
            </div>
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
    </Modal >
  );
};

export default SupportTicketModal;
