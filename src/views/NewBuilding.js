import React, { useState, useEffect } from "react";

import { Row, Col, Label, Input, Form, Button } from "reactstrap";
import LoadingComponent from "@src/components/LoadingComponent";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import axios from "axios";

const NewBuilding = () => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    setValue,
    setError,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const getUserRole = async () => {
    try {
      const response = await axios.get("/getMe");
      return response.data.data.user.role;
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const role = await getUserRole();
      if (role === "building_manager") {
        navigate("/");
      }
    })();

    const userData = JSON.parse(localStorage.getItem("userData"));
    setValue("first_name", userData.first_name || "");
    setValue("last_name", userData.last_name || "");
    setValue("mobile", userData.mobile);

    return () => {};
  }, []);

  const onFormSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        if (key === "national_card_image") {
          if (value[0]) {
            formData.append(key, value[0]);
          }
        } else {
          formData.append(key, value);
        }
      }
      const response = await axios.post("/business/register", formData);
      toast.success(response.data.message);
      const newToken = response.data.data.token;
      localStorage.setItem("accessToken", newToken);
      setTimeout(async () => {
        localStorage.setItem("selectedUnit", "buildingManager");
        let userData = JSON.parse(localStorage.getItem("userData"));
        userData.role = "building_manager";
        localStorage.setItem("userData", JSON.stringify(userData));
        window.location.href = "/";
        // if (response.data.data.base_module) {
        //   await handleBuyModule(response.data.data.base_module);
        // } else {
        //   window.location.href = "/";
        // }
        return;
      }, 1000);
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
      if (error.response?.data?.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          setError(key, { message: value });
          toast.error(value);
        }
      }
    }
    setLoading(false);
  };

  const handleBuyModule = async (module) => {
    setLoading(true);
    try {
      const response = await axios.post(`building_manager/modules/buy`, {
        modules: [module],
      });
      if (response.data.success) {
        if (response.data.message) {
          toast.success(response.data.message);
          return location.reload();
        }
        const ua = navigator.userAgent;
        if (ua.indexOf("ChargePalApp") >= 0) {
          window.location.href = "/";
        } else {
          return window.location.replace(response.data.data.redirectUrl);
        }
      }
    } catch (err) {
      toast.error("خطا در خرید");
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <>
      <div>
        <LoadingComponent loading={loading} />

        <div className="pb-2">
          <h3 className="text-center mb-3">ایجاد ساختمان</h3>
          <Form onSubmit={handleSubmit(onFormSubmit)} className="pb-5">
            <input type="hidden" {...register("type")} value="building_manager" />
            <Row>
              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="first_name">نام *</Label>
                  <Controller
                    name="first_name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="first_name"
                        type="text"
                        placeholder="نام"
                        invalid={!!errors.first_name}
                        {...field}
                      />
                    )}
                  />
                  {errors.first_name && (
                    <div className="text-danger">{errors.first_name.message}</div>
                  )}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="last_name">نام خانوادگی *</Label>
                  <Controller
                    name="last_name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="last_name"
                        type="text"
                        placeholder="نام خانوادگی"
                        invalid={!!errors.last_name}
                        {...field}
                      />
                    )}
                  />
                  {errors.last_name && (
                    <div className="text-danger">{errors.last_name.message}</div>
                  )}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="mobile">تلفن همراه *</Label>
                  <Controller
                    name="mobile"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="mobile"
                        type="text"
                        placeholder="تلفن همراه"
                        invalid={!!errors.mobile}
                        {...field}
                        disabled
                      />
                    )}
                  />
                  {errors.mobile && (
                    <div className="text-danger">{errors.mobile.message}</div>
                  )}
                </div>
              </Col>

              {/* <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="national_id">کد ملی *</Label>
                  <Controller
                    name="national_id"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="national_id"
                        type="text"
                        placeholder="کد ملی"
                        invalid={!!errors.national_id}
                        {...field}
                      />
                    )}
                  />
                  {errors.national_id && (
                    <div className="text-danger">{errors.national_id.message}</div>
                  )}
                </div>
              </Col> */}

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="building_name">نام ساختمان *</Label>
                  <Controller
                    name="building_name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="building_name"
                        type="text"
                        placeholder="نام ساختمان"
                        invalid={!!errors.building_name}
                        {...field}
                      />
                    )}
                  />
                  {errors.building_name && (
                    <div className="text-danger">{errors.building_name.message}</div>
                  )}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="building_name_en">نام انگلیسی ساختمان *</Label>
                  <Controller
                    name="building_name_en"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="building_name_en"
                        type="text"
                        placeholder="نام انگلیسی ساختمان"
                        invalid={!!errors.building_name_en}
                        {...field}
                      />
                    )}
                  />
                  {errors.building_name_en && (
                    <div className="text-danger">{errors.building_name_en.message}</div>
                  )}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="unit_count">تعداد واحد ها *</Label>
                  <Controller
                    name="unit_count"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="unit_count"
                        type="text"
                        placeholder="تعداد واحد ها"
                        invalid={!!errors.unit_count}
                        {...field}
                        inputMode="tel"
                      />
                    )}
                  />
                  {errors.unit_count && (
                    <div className="text-danger">{errors.unit_count.message}</div>
                  )}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="phone_number">شماره تلفن *</Label>
                  <Controller
                    name="phone_number"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="phone_number"
                        type="text"
                        placeholder="شماره تلفن"
                        invalid={!!errors.phone_number}
                        {...field}
                        inputMode="tel"
                      />
                    )}
                  />
                  {errors.phone_number && (
                    <div className="text-danger">{errors.phone_number.message}</div>
                  )}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="province">استان *</Label>
                  <Controller
                    name="province"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="province"
                        type="text"
                        placeholder="استان"
                        invalid={!!errors.province}
                        {...field}
                      />
                    )}
                  />
                  {errors.province && (
                    <div className="text-danger">{errors.province.message}</div>
                  )}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="city">شهر *</Label>
                  <Controller
                    name="city"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="city"
                        type="text"
                        placeholder="شهر"
                        invalid={!!errors.city}
                        {...field}
                      />
                    )}
                  />
                  {errors.city && (
                    <div className="text-danger">{errors.city.message}</div>
                  )}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="district">منطقه *</Label>
                  <Controller
                    name="district"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="district"
                        type="text"
                        placeholder="منطقه"
                        invalid={!!errors.district}
                        {...field}
                        inputMode="tel"
                      />
                    )}
                  />
                  {errors.district && (
                    <div className="text-danger">{errors.district.message}</div>
                  )}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="address">آدرس *</Label>
                  <Controller
                    name="address"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="address"
                        type="text"
                        placeholder="آدرس"
                        invalid={!!errors.address}
                        {...field}
                      />
                    )}
                  />
                  {errors.address && (
                    <div className="text-danger">{errors.address.message}</div>
                  )}
                  <small>به آدرس های ناقص و غیر قابل شناسایی خدمات داده نخواهد شد.</small>
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="postal_code">کد پستی</Label>
                  <Controller
                    name="postal_code"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="postal_code"
                        type="text"
                        placeholder="کد پستی"
                        invalid={!!errors.postal_code}
                        {...field}
                      />
                    )}
                  />
                  {errors.postal_code && (
                    <div className="text-danger">{errors.postal_code.message}</div>
                  )}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="email"
                        type="email"
                        placeholder="ایمیل"
                        invalid={!!errors.email}
                        {...field}
                      />
                    )}
                  />
                  {errors.email && (
                    <div className="text-danger">{errors.email.message}</div>
                  )}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label htmlFor="referral_mobile">شماره موبایل معرف</Label>
                  <Controller
                    name="referral_mobile"
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <Input
                        id="referral_mobile"
                        type="text"
                        placeholder="شماره موبایل معرف"
                        invalid={!!errors.referral_mobile}
                        {...field}
                        inputMode="tel"
                      />
                    )}
                  />
                  {errors.referral_mobile && (
                    <div className="text-danger">{errors.referral_mobile.message}</div>
                  )}
                </div>
              </Col>
            </Row>

            {/* دکمه ثبت سراسری */}
            <Row className="mt-1">
              <Col xs="12">
                <Button color="primary" type="submit" className="w-100">
                  ثبت
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </>
  );
};

export default NewBuilding;
