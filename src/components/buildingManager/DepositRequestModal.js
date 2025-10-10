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
import PriceFormat from "../../components/PriceFormat";

const DepositRequestModal = ({ show, setShow, setLoading, refreshData }) => {
  const [showSheba, setShowSheba] = useState(true);
  const [balances, setBalances] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
    setValue,
  } = useForm();

  const isMultiBalance = JSON.parse(localStorage.getItem("buildingOptions")).multi_balance;
  const currency = localStorage.getItem("currency");

  const getBlance = async () => {
    try {
      const response = await axios.get("/building_manager/stats");
      const balance = response.data.data.balance;
      setValue("amount", balance * 10);

      const response2 = await axios.get("/building_manager/balances");
      setBalances(response2.data.data.balances);
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  useEffect(() => {
    setValue("deposit_to", "other");
    getBlance();
  }, []);

  const onFormSubmit = async (formData) => {
    console.log(formData);
    setLoading(true);
    try {
      const response = await axios.post("/building_manager/depositRequests", {
        deposit_to: formData.deposit_to,
        sheba: formData.sheba,
        name: formData.name,
        description: formData.description,
        balance_id: formData.balance_id,
        amount:
          typeof formData.amount === "string"
            ? formData.amount.replace(/,/g, "")
            : formData.amount,
      });
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
  return (
    <Modal
      isOpen={show}
      centered={true}
      size="lg"
      toggle={() => setShow(false)}
    >
      <ModalHeader toggle={() => setShow(false)}>درخواست واریز</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit(onFormSubmit)}>
          <Row>
            {/* <Col md={12}>
              <div className="mt-1">
                <Label>به حساب : </Label>
                <Controller
                  name="deposit_to"
                  control={control}
                  rules={{ required: "وارد کردن این فیلد الزامی است" }}
                  defaultValue="me"
                  render={({ field }) => (
                    <select
                      className="form-control"
                      {...field}
                      onChange={(e) => {
                        setValue("deposit_to", e.target.value);
                        if (e.target.value === "other") {
                          setShowSheba(true);
                        } else {
                          setShowSheba(false);
                          setValue("sheba", "");
                        }
                      }}
                    >
                      <option value="me">خودم</option>
                      <option value="other">دیگر</option>
                    </select>
                  )}
                />
              </div>
            </Col> */}
            {isMultiBalance && (
              <Col md={12}>
                <div className="mt-1">
                  <Label>برداشت از صندوق :</Label>
                  <Controller
                    name="balance_id"
                    control={control}
                    rules={{ required: "وارد کردن این فیلد الزامی است" }}
                    render={({ field }) => (
                      <select
                        className="form-control"
                        {...field}
                        onChange={(e) => {
                          setValue("balance_id", e.target.value);
                          const selectedBalance = balances.find(
                            (balance) => balance.id == e.target.value
                          );
                          setValue("amount", selectedBalance.amount * 10);
                          setValue("sheba", selectedBalance.sheba);

                        }}
                      >
                        <option value={null}>انتخاب کنید</option>
                        {balances &&
                          balances.map((balance) => (
                            <option key={balance.id} value={balance.id}>
                              {balance.title} - <PriceFormat price={balance.amount} convertToRial={currency === "rial"} />
                            </option>
                          ))}
                      </select>
                    )}
                  />
                </div>
              </Col>
            )}
            {showSheba && (
              <>
                <Col md={12}>
                  <div className="mt-1">
                    <Label>شماره شبا</Label>
                    <Controller
                      name="sheba"
                      control={control}
                      defaultValue=""
                      rules={{ required: "وارد کردن این فیلد الزامی است" }}
                      inputMode="tel"
                      render={({ field }) => (
                        <Input {...field} type="text" placeholder="شماره شبا" />
                      )}
                    />
                    {errors.sheba && (
                      <div className="text-danger">{errors.sheba.message}</div>
                    )}
                  </div>
                </Col>
                <Col md={12}>
                  <div className="mt-1">
                    <Label>نام صاحب حساب</Label>
                    <Controller
                      name="name"
                      control={control}
                      defaultValue=""
                      rules={{ required: "وارد کردن این فیلد الزامی است" }}
                      inputMode="tel"
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder="نام صاحب حساب"
                        />
                      )}
                    />
                    {errors.name && (
                      <div className="text-danger">{errors.name.message}</div>
                    )}
                  </div>
                </Col>
              </>
            )}
            <Col md={12}>
              <div className="mt-1">
                <Label>مبلغ (ریال)</Label>
                <Controller
                  name="amount"
                  control={control}
                  defaultValue=""
                  rules={{ required: "وارد کردن این فیلد الزامی است" }}
                  render={({ field }) => (
                    <NumericFormat
                      {...field}
                      thousandSeparator={true}
                      className="form-control"
                      placeholder="مبلغ درخواستی"
                      inputMode="tel"
                    />
                  )}
                />
                {errors.amount && (
                  <div className="text-danger">{errors.amount.message}</div>
                )}
              </div>
            </Col>
            <Col md={12}>
              <div className="mt-1">
                <Label>توضیحات</Label>
                <Controller
                  name="description"
                  rules={{ required: "وارد کردن این فیلد الزامی است" }}
                  control={control}
                  defaultValue=""
                  render={({ field }) => <Input {...field} type="text" />}
                />
              </div>
              {errors.description && (
                <div className="text-danger">{errors.description.message}</div>
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
                ثبت
              </Button>
            </div>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default DepositRequestModal;
