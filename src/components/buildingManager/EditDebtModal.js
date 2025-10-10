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

const EditDebtModal = ({ show, setShow, setLoading, refreshData, debt }) => {
  const currency = localStorage.getItem("currency");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
    setValue,
  } = useForm();

  useEffect(() => {
    setValue("unit", debt.unit_id);
    setValue("description", debt.description);
    if (currency === "rial") {
      setValue("amount", -1 * debt.amount * 10);
    }else{
      setValue("amount", -1 * debt.amount);
    }
  }, [debt, show]);

  const onSubmit = async (formData) => {
    console.log(formData);
    setLoading(true);
    if (currency === "rial") {
      formData.amount = typeof formData.amount === "string" ? parseFloat(formData.amount.replace(/,/g, "")) / 10 : formData.amount / 10;
    }
    try {
      const response = await axios.put(
        "/building_manager/invoices/" + debt.id,
        {
          amount: typeof formData.amount === "string" ? formData.amount.replace(/,/g, "") : formData.amount,
          type: "debt",
          description: formData.description,
        }
      );
      toast.success(response.data.message);
      setShow(false);
      refreshData();
      // reset();
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
      <ModalHeader toggle={() => setShow(false)}>ویرایش بدهی</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md={12}>
              <div className="mt-1">
                <Label>واحد</Label>
                <Controller
                  name="unit"
                  control={control}
                  defaultValue={"واحد " + debt.unit.unit_number}
                  // rules={{ required: true }}
                  render={({ field }) => (
                    <Input {...field} type="text" disabled />
                  )}
                />
                {errors.unit && (
                  <div className="text-danger">شماره واحد را وارد کنید</div>
                )}
              </div>
            </Col>
            <Col md={12}>
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
                  rules={{ required: true }}
                  render={({ field }) => (
                    <NumericFormat
                      {...field}
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
                ویرایش
              </Button>
            </div>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default EditDebtModal;
