// ** React Imports
import { json, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import OtpInput from "react-otp-input";
import { useForm, Controller } from "react-hook-form";
import loginImage from "@src/assets/images/login2.png";
import apiConfig from "../configs/apiConfig";

import CoinLogo from "@src/assets/images/logo/chargepal2.png";
import CoinLogoAlt from "@src/assets/images/logo/chargepal-alt2.png";

import Countdown from "react-countdown";

// ** Reactstrap Imports
import { Form, Label, Input, Button, Row, Col } from "reactstrap";

import NavbarComponent from "../components/NavbarComponent";
import LandingLinks from "../components/LandingLinks";

// ** Styles
import "@styles/react/pages/page-authentication.scss";
import axios from "axios";
import { toast } from "react-hot-toast";
import LoadingComponent from "../components/LoadingComponent";
import { isNative } from "../utility/Utils";
import themeConfig from "@configs/themeConfig";

const services = [
  // {
  //   title: 'دسترسی کامل و آنلاین به تمامی گردش ها و اطلاعات ساختمان',
  //   imgSrc: 'https://chargepal.ir/img/pages/services-card-1.webp',
  //   imgWidth: 174,
  //   imgHeight: 147
  // },
  // {
  //   title: 'هوشمند سازی و مدیریت آسان تر ساختمان',
  //   imgSrc: 'https://chargepal.ir/img/pages/services-card-2.webp',
  //   imgWidth: 249,
  //   imgHeight: 147
  // },
  // {
  //   title: 'امکان ایجاد درآمد جانبی از طریق بازارچه ساختمان',
  //   imgSrc: 'https://chargepal.ir/img/pages/services-card-3.webp',
  //   imgWidth: 176,
  //   imgHeight: 147
  // },
  // {
  //   title: 'حل مساله مالیات بر گردش حساب مدیریت ساختمان',
  //   imgSrc: 'https://chargepal.ir/img/pages/services-card-4.webp',
  //   imgWidth: 177,
  //   imgHeight: 147
  // },
  // {
  //   title: 'امنیت کامل تمام اطلاعات ساختمان',
  //   imgSrc: 'https://chargepal.ir/img/pages/services-card-5.webp',
  //   imgWidth: 215,
  //   imgHeight: 165
  // },
  // {
  //   title: 'اطلاع رسانی سریع موارد و اطلاعیه های ساختمان به ساکنین',
  //   imgSrc: 'https://chargepal.ir/img/pages/services-card-6.webp',
  //   imgWidth: 175,
  //   imgHeight: 147
  // }
];

const Login = () => {
  const [params] = useSearchParams();
  const isEnglish = params.has('lang') && params.get('lang') === 'en';

  if (params.has("token")) {
    (async () => {
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("userVerified");
        localStorage.removeItem("selectedUnit");
        localStorage.setItem("accessToken", params.get("token"));
        const response = await axios.get(`${apiConfig.baseUrl}/getMe`, {
          headers: {
            Authorization: `Bearer ${params.get("token")}`,
          },
        });
        localStorage.setItem(
          "userData",
          JSON.stringify(response.data.data.user)
        );
        localStorage.removeItem("selectedUnit");

        window.location.href = "/";
      } catch (err) {
        if (err.response) {
          const response = err.response;
          if (response.data.errors) {
            for (let key in response.data.errors) {
              toast.error(response.data.errors[key]);
            }
          } else if (response.data.message) {
            toast.error(response.data.message);
          } else {
            console.log(err);
          }
        }
      }
    })();
  }

  if (localStorage.getItem("accessToken") && localStorage.getItem("userData")) {
    window.location.href = "/";
  }

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();

  const [otp, setOtp] = useState("");
  const [otpSent, setotpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, settimeLeft] = useState(2);
  const [usePassword, setUsePassword] = useState(false);
  const [hash, setHash] = useState(null);

  const handleChange = (otp) => {
    setOtp(otp);
    setValue("otp", otp);
    if (otp.length === 4) {
      handleSubmit(onSubmit)();
    }
  };

  useEffect(() => {
    const hashMessageListener = window.addEventListener('hashMessage', (nativeEvent) => {
      setHash(nativeEvent?.detail?.hash);
    });
    const otpMessageListener = window.addEventListener('otpMessage', (nativeEvent) => {
      setOtp(nativeEvent?.detail?.otp);
      setValue("otp", nativeEvent?.detail?.otp);
      loginWithOtp(getValues("mobile"), nativeEvent?.detail?.otp);
    });
    return () => {
      window.removeEventListener('hashMessage', hashMessageListener);
      window.removeEventListener('otpMessage', otpMessageListener);
    }
  }, []);

  const loginWithOtp = async (mobile, otp) => {
    try {
      const response = await axios.post("login", {
        mobile,
        otp,
        usePassword: false,
      });
      toast.success(response.data.message);
      localStorage.setItem("accessToken", response.data.data.token);
      localStorage.setItem("userData", JSON.stringify(response.data.data.user));
      localStorage.removeItem("selectedUnit");
      if (response.data.data.user.role === "building_manager") {
        const response2 = await axios.get(
          `${apiConfig.baseUrl}/building_manager/profile`,
          {
            headers: {
              Authorization: `Bearer ${response.data.data.token}`,
            },
          }
        );
        localStorage.setItem("userVerified", response2.data.data.building.is_verified);
      }
      window.location.href = "/";
    } catch (err) {
      console.log(err);
      const response = err.response;
      if (response.data.errors) {
        for (let key in response.data.errors) {
          setError(key, { message: response.data.errors[key] });
          toast.error(response.data.errors[key]);
        }
      }
    }
  }


  const onSubmit = async (data) => {
    setLoading(true);
    if (!otpSent) {
      try {
        const response = await axios.post("/sendOtp", { ...data, hash });
        toast.success(response.data.message);
        setotpSent(true);
        const otp_expires_at = Date.parse(response.data.data.otp_expires_at);
        settimeLeft(otp_expires_at);
        if (isNative() && window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            action: "otp"
          }));
        }
        reset({
          mobile: data.mobile,
        });
      } catch (err) {
        const response = err.response;
        if (response.data.errors) {
          for (let key in response.data.errors) {
            setError(key, { message: response.data.errors[key] });
            toast.error(response.data.errors[key]);
          }
        } else if (response.data.message) {
          toast.error(response.data.message);
        } else {
          console.log(err);
        }
      }
    } else {
      try {
        data.usePassword = usePassword;
        const response = await axios.post("login", data);
        toast.success(response.data.message);
        localStorage.setItem("accessToken", response.data.data.token);
        localStorage.setItem(
          "userData",
          JSON.stringify(response.data.data.user)
        );
        localStorage.removeItem("selectedUnit");
        if (response.data.data.user.role === "building_manager") {
          const response2 = await axios.get(
            `${apiConfig.baseUrl}/building_manager/profile`,
            {
              headers: {
                Authorization: `Bearer ${response.data.data.token}`,
              },
            }
          );
          localStorage.setItem(
            "userVerified",
            response2.data.data.building.is_verified
          );
        }
        window.location.href = "/";
      } catch (err) {
        console.log(err);
        const response = err.response;
        if (response.data.errors) {
          for (let key in response.data.errors) {
            if (key === "otp") {
              setOtp("");
              if (response.data.errors[key] === "رمز عبور منقضی شده است") {
                setotpSent(false);
              }
            }
            setError(key, { message: response.data.errors[key] });
            toast.error(response.data.errors[key]);
          }
        }
      }
    }
    setLoading(false);
  };
  return (
    <div
      style={{
        height: window.innerHeight,
      }}
    >
      <NavbarComponent centerNavbarBrand={true} hideButtons={isEnglish} />
      <LoadingComponent loading={loading} />
      <div className="auth-wrapper auth-basic d-flex flex-column">
        <div
          className="mb-5 d-md-none"
          style={{
            width: "100%",
            height: "287px",
            borderRadius: "0px 0px 30px 30px",
            background: themeConfig.layout.primaryColor,
            borderTop: "0.5px solid #E0E6EE",
            filter: "drop-shadow(0px 9px 34px rgba(" + themeConfig.layout.primaryColorRGB + ", 0.3))",
            backgroundImage: `url('images/bg2.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <span className="d-flex flex-column align-items-center h-100 justify-content-center">
            {import.meta.env.VITE_APP_TYPE == 'main' && (
              <img
                src={CoinLogo}
                alt="login"
                className=""
                style={{
                  // width: "100px",
                  height: "80px",
                }}
              />
            )}
            {import.meta.env.VITE_APP_TYPE == 'standalone' && (
              <img
                src={window._env_.APP_ICON}
                alt={window._env_.APP_NAME}
                className=""
                style={{
                  maxWidth: "300px",
                  width: "100%",
                  height: "80px",
                }}
              />
            )}
            {/* <h1
                  className="brand-text m-0 p-0"
                  style={{
                    fontSize: "29px",
                    letterSpacing: "1px",
                  }}
                >
                  POULPAL
                </h1>
                <span
                  className="text-center w-100 me-auto ms-auto text-white"
                  style={{
                    fontSize: "14px",
                  }}
                >
                  سامانه مدیریت آپارتمان
                </span> */}
          </span>
        </div>
        <div className="mt-md-5 my-2 mx-2 px-2">
          <Form className="auth-login-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="w-100 d-flex justify-content-center mb-2 mt-0">
              {import.meta.env.VITE_APP_TYPE == 'main' && (
                <img
                  src={CoinLogoAlt}
                  alt="login"
                  className="img-fluid login-img2 d-none d-md-block"
                  style={{
                    // width: "100px",
                    height: "80px",
                    margin: "auto",
                  }}
                />
              )}
              {import.meta.env.VITE_APP_TYPE == 'standalone' && (
                <img
                  src={window._env_.APP_ICON}
                  alt={window._env_.APP_NAME}
                  className="img-fluid login-img2 d-none d-md-block"
                  style={{
                    // width: "100px",
                    height: "80px",
                    margin: "auto",
                  }}
                />
              )}
            </div>
            <div className="mb-1">
              {!otpSent ? (
                <Label
                  className="form-label w-100 text-center mb-1"
                  for="mobile"
                  style={{
                    fontSize: "13px",
                  }}
                >
                  {isEnglish ? "Please enter your mobile number" : "لطفا شماره موبایل خودرا وارد کنید"}
                </Label>
              ) : (
                <Label
                  className="form-label w-100 text-center mb-1"
                  for="otp"
                  style={{
                    fontSize: "13px",
                  }}
                >
                  {!usePassword
                    ? (
                      isEnglish ? "Please enter the verification code sent" :
                        "لطفا کد تایید ارسال شده را وارد کنید")
                    : (
                      isEnglish ? "Please enter your password" :
                        "لطفا رمز عبور خودرا وارد کنید")}
                </Label>
              )}
              <Controller
                name="mobile"
                control={control}
                defaultValue=""
                rules={{
                  required:
                    isEnglish ? "Mobile number is required" :
                      "شماره موبایل الزامی است",
                  pattern: {
                    value: /^09\d{9}$/,
                    message:
                      isEnglish ? "Mobile number is not valid" :
                        "شماره موبایل معتبر نیست",
                  },
                }}
                render={({ field }) => (
                  <Input
                    type="text"
                    {...field}
                    disabled={otpSent}
                    className="text-center position-relative"
                    style={{
                      direction: "ltr",
                      letterSpacing: "3px",
                      fontFamily: isEnglish ? "Arial" : 'inherit',
                    }}
                    maxLength={isEnglish ? 13 : 11}
                    autoFocus={!otpSent}
                    inputMode="tel"
                    invalid={errors.mobile && true}
                    placeholder={isEnglish ? "+12501234567" : "09123456789"}
                  />
                )}
              />
              {errors.mobile && (
                <div className="text-danger">{errors.mobile.message}</div>
              )}
            </div>
            {otpSent ? (
              <>
                <div
                  className="mb-1"
                  style={{
                    direction: "ltr",
                  }}
                >
                  {!usePassword && (
                    <Controller
                      name="otp"
                      control={control}
                      defaultValue=""
                      rules={{
                        required: "کد تایید الزامی است",
                        pattern: {
                          value: /^\d{4}$/,
                          message: "کد تایید معتبر نیست",
                        },
                      }}
                      render={({ field }) => (
                        <OtpInput
                          value={otp}
                          onChange={handleChange}
                          numInputs={4}
                          isInputNum={true}
                          shouldAutoFocus={true}
                          inputStyle="auth-input height-50 text-center numeral-mask mx-25 mb-1 form-control border-radius-15"
                          containerStyle="auth-input-wrapper d-flex align-items-center justify-content-between"
                          hasErrored={errors.otp && true}
                        />
                      )}
                    />
                  )}
                  {usePassword && (
                    <Controller
                      name="otp"
                      control={control}
                      defaultValue=""
                      rules={{
                        required: "رمز عبور الزامی است",
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="password"
                          placeholder="رمز عبور"
                          className="text-center"
                          style={{ direction: "ltr", letterSpacing: "2px" }}
                          autoFocus={otpSent}
                          invalid={errors.otp && true}
                        />
                      )}
                    />
                  )}
                  {errors.otp && (
                    <div className="text-danger">{errors.otp.message}</div>
                  )}
                  {!usePassword && (
                    <Countdown
                      date={timeLeft}
                      daysInHours={true}
                      onComplete={() => {
                        setotpSent(false);
                        reset();
                      }}
                    />
                  )}
                </div>
              </>
            ) : (
              <></>
            )}
            <div className="d-flex justify-content-center mt-2">
              <Button
                color="primary"
                type="submit"
                disabled={isEnglish}
                style={{
                  minWidth: "145px",
                }}
              >
                {otpSent ?
                  isEnglish ? "Submit" :
                    "ورود" :
                  isEnglish ? "Send code via SMS" :
                    "ارسال رمز با SMS"}
              </Button>
              {!otpSent && (import.meta.env.VITE_DISABLE_PASSWORD_LOGIN == false) && (
                <Button
                  color="primary"
                  type="button"
                  style={{
                    minWidth: "145px",
                  }}
                  className="ms-1"
                  onClick={(e) => {
                    setotpSent(true);
                    settimeLeft(Date.now() + 6000000);
                    setUsePassword(true);
                  }}
                >
                  {isEnglish ? "Login with password" : "ورود با رمز عبور"}
                </Button>
              )}
            </div>
          </Form>
          <span className="d-block text-center mt-2">
            <a href="https://chargepal.ir/privacy" style={{ marginLeft: '2px' }}>
              شرایط استفاده از خدمات و حریم خصوصی
            </a>
            را مطالعه کرده ام و با آن موافقم.
          </span>
        </div>
      </div>
      {/* <img
        src={loginImage}
        style={{
          width: "20rem",
          position: "absolute",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        alt="loginImg"
        className="img-fluid login-img d-none d-md-block"
      /> */}
      {import.meta.env.VITE_APP_TYPE == 'main' && (
        <LandingLinks isEnglish={isEnglish} />
      )}
      {import.meta.env.VITE_APP_TYPE == 'main' && (
        <div className="services-card-box">
          {services.map((service, index) => (
            <div className="services-card" key={index}>
              <div className="card-content">
                <div className="card-header-box">
                  <h4 className="card-header">{service.title}</h4>
                </div>
                <div className="card-image-wrapper">
                  <img
                    width={service.imgWidth}
                    height={service.imgHeight}
                    src={service.imgSrc}
                    alt="services-card"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Login;
