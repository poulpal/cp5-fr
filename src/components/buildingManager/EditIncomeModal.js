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

const EditIncomeModal = ({ show, setShow, setLoading, refreshData, income }) => {
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
    setValue("amount", income.amount);
    setValue("description", income.description);
  }, [income, show]);

  const onSubmit = async (formData) => {
    console.log(formData);
    setLoading(true);
    try {
      const response = await axios.put(
        "/building_manager/invoices/" + income.id,
        {
          amount: typeof formData.amount === "string" ? formData.amount.replace(/,/g, "") : formData.amount,
          type: "income",
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
      <ModalHeader toggle={() => setShow(false)}>ویرایش درآمد</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md={12}>
              <div className="mt-1">
                <Label>مبلغ درآمد (تومان) *</Label>
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
                      placeholder="مبلغ درآمد"
                      inputMode="tel"
                    />
                  )}
                />
                {errors.amount && (
                  <div className="text-danger">مبلغ درآمد را وارد کنید</div>
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

export default EditIncomeModal;
