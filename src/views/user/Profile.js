import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  CardLink,
  Form,
  Input,
  Button,
  Label,
  Row,
  Col,
} from "reactstrap";
import { getUserRole } from "@src/auth/auth";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import apiConfig from "@src/configs/apiConfig";
import BlockUi from "@availity/block-ui";
import { toast } from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";

const Profile = () => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await axios.get("/user/profile");
        setValue("first_name", response.data.data.user.first_name || "");
        setValue("last_name", response.data.data.user.last_name || "");
        setValue("mobile", response.data.data.user.mobile || "");
      } catch (err) {
        if (err.response?.data.message){
          toast.error(err.response.data.message);
        }else{
          console.log(err);
        }
      }
      setLoading(false);
    })();
    return () => {
      reset();
    };
  }, []);

  const onSubmit = async (data) => {
    console.log(data);
    setLoading(true);
    try {
      const response = await axios.put(
        `${apiConfig.baseUrl}/user/profile`,
        data
      );
      toast.success(response.data.message);
      reset({
        first_name: response.data.data.user.first_name,
        last_name: response.data.data.user.last_name,
        mobile: response.data.data.user.mobile,
      });
      localStorage.setItem("userData", JSON.stringify(response.data.data.user));
    } catch (err) {
      if (err.response.data.errors) {
        for (let key in err.response.data.errors) {
          setError(key, { message: err.response.data.errors[key] });
        }
      } else {
        toast.error("خطایی رخ داده است");
      }
    }
    setLoading(false);
  };

  return (
    <>
      <BlockUi message={<></>} blocking={loading}></BlockUi>
      <div className="pt-2">
        <h3 className="text-center mb-3">پروفایل</h3>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md="6">
              <div className="mb-2">
                <Label for="first_name">نام</Label>
                <Controller
                  name="first_name"
                  id="first_name"
                  control={control}
                  rules={{
                    required: "نام الزامی است",
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="نام"
                      invalid={errors.first_name ? true : false}
                    />
                  )}
                />
                {errors.first_name && (
                  <span className="text-danger">
                    {errors.first_name.message}
                  </span>
                )}
              </div>
            </Col>
            <Col md="6">
              <div className="mb-2">
                <Label for="last_name">نام خانوادگی</Label>
                <Controller
                  name="last_name"
                  id="last_name"
                  control={control}
                  rules={{ required: "نام خانوادگی الزامی است" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="نام خانوادگی"
                      invalid={errors.last_name ? true : false}
                    />
                  )}
                />
                {errors.last_name && (
                  <span className="text-danger">
                    {errors.last_name.message}
                  </span>
                )}
              </div>
            </Col>
            <Col md="6">
              <div className="mb-2">
                <Label for="mobile">شماره موبایل</Label>
                <Controller
                  name="mobile"
                  id="mobile"
                  control={control}
                  rules={{ required: "شماره موبایل الزامی است" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="شماره موبایل"
                      invalid={errors.mobile ? true : false}
                      disabled={true}
                    />
                  )}
                />
                {errors.mobile && (
                  <span className="text-danger">شماره موبایل الزامی است</span>
                )}
              </div>
            </Col>
          </Row>
          <div className="mt-2">
            <Button color="primary" type="submit" className="btn-md-block">
              ثبت
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default Profile;
