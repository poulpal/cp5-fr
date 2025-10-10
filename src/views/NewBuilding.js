import React, { useState } from "react";

import { Row, Col, Label, Input, Form, Button, Modal, ModalBody, UncontrolledTooltip } from "reactstrap";
import LoadingComponent from "@src/components/LoadingComponent";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

import axios from "axios";


import whatsapp from "@src/assets/images/icons/whatsapp.png";
import skype from "@src/assets/images/icons/skype.png";
import meet from "@src/assets/images/icons/meet.png";
import telegram from "@src/assets/images/icons/telegram.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneSquare } from "@fortawesome/free-solid-svg-icons";

const icons = [
  {
    title: "واتسپ",
    icon: whatsapp,
    link: "https://wa.me/send?phone=982191031869&text=با درود  خواهشمند است برای مجتمع تحت مدیریت اینجانب یک اکانت دمو فعال نمایید",
  },
  // {
  //   title: "اسکایپ",
  //   icon: skype,
  //   link: "https://t.me/poulpal",
  // },
  // {
  //   title: "گوگل میت",
  //   icon: meet,
  //   link: "https://t.me/poulpal",
  // },
  {
    title: "تلگرام",
    icon: telegram,
    link: "https://t.me/Chargepalir",
  },
  // {
  //   title: "تماس",
  //   icon: CallIcon,
  //   link: "tel:982191031869",
  // }
];

const NewBuilding = () => {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);

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

    return () => { };
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
      const response = await axios.post(
        `building_manager/modules/buy`,
        {
          modules: [module]
        }
      );
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
  }

  return (
    <>
      <div>
        <LoadingComponent loading={loading} />
        <Modal isOpen={modal} toggle={() => setModal(!modal)} centered={true}>
          <ModalBody>
            <h3 className="text-center pt-3 pb-2">درخواست دمو {import.meta.env.VITE_APP_NAME}</h3>
            <div className="d-flex flex-row justify-content-between pb-2 px-sm-3 px-xs-1 px-2">
              {icons.map((icon, index) => (
                <div key={index}>
                  <UncontrolledTooltip
                    placement="bottom"
                    target={"support_" + index}
                  >
                    {icon.title}
                  </UncontrolledTooltip>
                  <div id={"support_" + index} href="#">
                    <a
                      href={icon.link}
                      target="_blank"
                      rel="noreferrer"
                      key={index}
                    >
                      <img
                        src={icon.icon}
                        alt={icon.title}
                        style={{
                          width: "50px",
                          height: "50px",
                        }}
                      />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </ModalBody>
        </Modal>
        <div className="pb-2">
          <h3 className="text-center mb-3">ایجاد ساختمان</h3>
          <Form onSubmit={handleSubmit(onFormSubmit)} className="pb-5">
            <input
              type="hidden"
              {...register("type")}
              value="building_manager"
            />
            <Row>
              <Col md="6">
                <div className="mb-2">
                  <Label for="first_name">نام *</Label>
                  <Controller
                    name="first_name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="first_name"
                        type="text"
                        placeholder="نام"
                        invalid={errors.first_name ? true : false}
                        {...field}
                      />
                    )}
                  />
                  {errors.first_name && (
                    <div className="text-danger">
                      {errors.first_name.message}
                    </div>
                  )}
                </div>
              </Col>
              <Col md="6">
                <div className="mb-2">
                  <Label for="last_name">نام خانوادگی *</Label>
                  <Controller
                    name="last_name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="last_name"
                        type="text"
                        placeholder="نام خانوادگی"
                        invalid={errors.last_name ? true : false}
                        {...field}
                      />
                    )}
                  />
                  {errors.last_name && (
                    <div className="text-danger">
                      {errors.last_name.message}
                    </div>
                  )}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-2">
                  <Label for="mobile">تلفن همراه *</Label>
                  <Controller
                    name="mobile"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="mobile"
                        type="text"
                        placeholder="تلفن همراه"
                        invalid={errors.mobile ? true : false}
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
                  <Label for="national_id">کد ملی *</Label>
                  <Controller
                    name="national_id"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="national_id"
                        type="text"
                        placeholder="کد ملی"
                        invalid={errors.national_id ? true : false}
                        {...field}
                      />
                    )}
                  />
                  {errors.national_id && (
                    <div className="text-danger">
                      {errors.national_id.message}
                    </div>
                  )}
                </div>
              </Col> */}
              <Col md="6">
                <div className="mb-2">
                  <Label for="building_name">نام ساختمان *</Label>
                  <Controller
                    name="building_name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="building_name"
                        type="text"
                        placeholder="نام ساختمان"
                        invalid={errors.building_name ? true : false}
                        {...field}
                      />
                    )}
                  />
                  {errors.building_name && (
                    <div className="text-danger">
                      {errors.building_name.message}
                    </div>
                  )}
                </div>
              </Col>
              <Col md="6">
                <div className="mb-2">
                  <Label for="building_name_en">نام انگلیسی ساختمان *</Label>
                  <Controller
                    name="building_name_en"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="building_name_en"
                        type="text"
                        placeholder="نام انگلیسی ساختمان"
                        invalid={errors.building_name_en ? true : false}
                        {...field}
                      />
                    )}
                  />
                  {errors.building_name_en && (
                    <div className="text-danger">
                      {errors.building_name_en.message}
                    </div>
                  )}
                </div>
              </Col>
              <Col md="6">
                <div className="mb-2">
                  <Label for="unit_count">تعداد واحد ها *</Label>
                  <Controller
                    name="unit_count"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="unit_count"
                        type="text"
                        placeholder="تعداد واحد ها"
                        invalid={errors.unit_count ? true : false}
                        {...field}
                        inputMode="tel"
                      />
                    )}
                  />
                  {errors.phone_number && (
                    <div className="text-danger">
                      {errors.unit_count.message}
                    </div>
                  )}
                </div>
              </Col>
              <Col md="6">
                <div className="mb-2">
                  <Label for="phone_number">شماره تلفن *</Label>
                  <Controller
                    name="phone_number"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="phone_number"
                        type="text"
                        placeholder="شماره تلفن"
                        invalid={errors.phone_number ? true : false}
                        {...field}
                        inputMode="tel"
                      />
                    )}
                  />
                  {errors.phone_number && (
                    <div className="text-danger">
                      {errors.phone_number.message}
                    </div>
                  )}
                </div>
              </Col>
              <Col md="6">
                <div className="mb-2">
                  <Label for="province">استان *</Label>
                  <Controller
                    name="province"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="province"
                        type="text"
                        placeholder="استان"
                        invalid={errors.province ? true : false}
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
                  <Label for="city">شهر *</Label>
                  <Controller
                    name="city"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="city"
                        type="text"
                        placeholder="شهر"
                        invalid={errors.city ? true : false}
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
                  <Label for="district">منطقه *</Label>
                  <Controller
                    name="district"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="district"
                        type="text"
                        placeholder="منطقه"
                        invalid={errors.district ? true : false}
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
                  <Label for="address">آدرس *</Label>
                  <Controller
                    name="address"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="address"
                        type="text"
                        placeholder="آدرس"
                        invalid={errors.address ? true : false}
                        {...field}
                      />
                    )}
                  />
                  {errors.address && (
                    <div className="text-danger">{errors.address.message}</div>
                  )}
                  <small>
                    به آدرس های ناقص و غیر قابل شناسایی خدمات داده نخواهد شد.
                  </small>
                </div>
              </Col>
              <Col md="6">
                <div className="mb-2">
                  <Label for="postal_code">کد پستی</Label>
                  <Controller
                    name="postal_code"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="postal_code"
                        type="text"
                        placeholder="کد پستی"
                        invalid={errors.postal_code ? true : false}
                        {...field}
                      />
                    )}
                  />
                  {errors.postal_code && (
                    <div className="text-danger">
                      {errors.postal_code.message}
                    </div>
                  )}
                </div>
              </Col>
              <Col md="6">
                <div className="mb-2">
                  <Label for="email">ایمیل</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="email"
                        type="email"
                        placeholder="ایمیل"
                        invalid={errors.email ? true : false}
                        {...field}
                      />
                    )}
                  />
                  {errors.email && (
                    <div className="text-danger">{errors.email.message}</div>
                  )}
                </div>
              </Col>
              {/* <Col md="6">
                <div className="mb-2">
                  <Label for="sheba_number">شماره شبا</Label>
                  <Controller
                    name="sheba_number"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="sheba_number"
                        type="text"
                        placeholder="شماره شبا"
                        invalid={errors.sheba_number ? true : false}
                        {...field}
                        inputMode="tel"
                      />
                    )}
                  />
                  {errors.sheba_number && (
                    <div className="text-danger">
                      {errors.sheba_number.message}
                    </div>
                  )}
                </div>
              </Col> */}
              {/* <Col md="6">
                <div className="mb-2">
                  <Label for="card_number">شماره کارت</Label>
                  <Controller
                    name="card_number"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        id="card_number"
                        type="text"
                        placeholder="شماره کارت"
                        invalid={errors.card_number ? true : false}
                        {...field}
                        inputMode="tel"
                      />
                    )}
                  />
                  {errors.card_number && (
                    <div className="text-danger">
                      {errors.card_number.message}
                    </div>
                  )}
                </div>
              </Col> */}
              {/* <Col md="6">
                <div className="mb-2">
                  <Label for="national_card_image">تصویر کارت ملی *</Label>
                  <input
                    name="national_card_image"
                    type="file"
                    className="form-control form-control-lg"
                    accept=".png, .jpg, .jpeg"
                    invalid={errors.national_card_image ? true : false}
                    {...register("national_card_image", {
                      required: "تصویر کارت ملی الزامی است",
                    })}
                  />
                </div>
                {errors.national_card_image && (
                  <div className="text-danger">
                    {errors.national_card_image.message}
                  </div>
                )}
              </Col> */}
              <Col md="6">
                <div className="mb-2">
                  <Label for="referral_mobile">شماره موبایل معرف</Label>
                  <Controller
                    name="referral_mobile"
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <Input
                        id="referral_mobile"
                        type="text"
                        placeholder="شماره موبایل معرف"
                        invalid={errors.referral_mobile ? true : false}
                        {...field}
                        inputMode="tel"
                      />
                    )}
                  />
                  {errors.referral_mobile && (
                    <div className="text-danger">
                      {errors.referral_mobile.message}
                    </div>
                  )}
                </div>
              </Col>
            </Row>
            <Row>
              <Col md="9">
                <Button color="primary" type="submit" block>
                  ثبت
                </Button>
              </Col>
              {import.meta.env.VITE_APP_TYPE == 'main' && (
                <Col md="3">
                  <Button color="dark" onClick={() =>
                    setModal(!modal)
                  } block outline>
                    درخواست دمو
                  </Button>
                </Col>
              )}
            </Row>
          </Form>
        </div>
      </div>
    </>
  );
};
export default NewBuilding;
