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

const ChangeCashBalanceModal = ({ show, setShow, setLoading, refreshData, cash }) => {
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
    setValue("balance", cash.balance * 10);
  }, [cash, show]);

  const onSubmit = async (formData) => {
    console.log(formData);
    setLoading(true);
    try {
      const response = await axios.put(
        "/building_manager/cash/" + cash.id,
        {
          balance: typeof formData.balance === "string" ? formData.balance.replace(/,/g, "") / 10 : formData.balance / 10,
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
      <ModalHeader toggle={() => setShow(false)}>ویرایش موجودی صندوق</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md={12}>
              <div className="mt-1">
                <Label>موجودی (ریال)*</Label>
                <Controller
                  name="balance"
                  control={control}
                  defaultValue=""
                  rules={{ required: true }}
                  render={({ field }) => (
                    <NumericFormat
                      {...field}
                      thousandSeparator={true}
                      className="form-control"
                      placeholder="موجودی"
                      inputMode="tel"
                    />
                  )}
                />
                {errors.balance && (
                  <div className="text-danger">موجودی را وارد کنید</div>
                )}
              </div>
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

export default ChangeCashBalanceModal;
