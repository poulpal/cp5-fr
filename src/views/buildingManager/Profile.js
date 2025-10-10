import { useEffect, useState } from "react";
import BlockUi from "@availity/block-ui";
import { Button, Card, Col, Form, Input, Label, Row } from "reactstrap";
import { toast } from "react-hot-toast";
import Avatar from "@components/Avatar";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowCircleUp,
  faExchange,
  faFileEdit,
  faPlusCircle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { Controller, useForm } from "react-hook-form";
import themeConfig from "@configs/themeConfig";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [buildingManager, setBuildingManager] = useState({});
  const [business, setBusiness] = useState({});
  const [building, setBuilding] = useState({});

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
    (async () => {
      setLoading(true);
      try {
        const response = await axios.get("building_manager/profile");
        setBuildingManager(response.data.data.building_manager);
        setBusiness(response.data.data.building_manager.business);
        setBuilding(response.data.data.building);

        setValue("first_name", response.data.data.building_manager.first_name);
        setValue("last_name", response.data.data.building_manager.last_name);
        setValue("mobile", response.data.data.building_manager.mobile);
        setValue("national_id", response.data.data.building_manager.national_id);
        setValue("building_name", response.data.data.building_manager.business.name);
        setValue("building_name_en", response.data.data.building_manager.business.name_en);
        setValue("phone_number", response.data.data.building_manager.business.phone_number);
        setValue("province", response.data.data.building_manager.business.province);
        setValue("city", response.data.data.building_manager.business.city);
        setValue("district", response.data.data.building_manager.business.district);
        setValue("address", response.data.data.building_manager.business.address);
        setValue("postal_code", response.data.data.building_manager.business.postal_code);
        setValue("email", response.data.data.building_manager.business.email);
        setValue("sheba_number", response.data.data.building_manager.business.sheba_number);
        setValue("card_number", response.data.data.building_manager.business.card_number);

      } catch (err) {
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        }
      }
      setLoading(false);
    })();
    return () => {
      setBuildingManager({});
    };
  }, []);

  const handleImageChange = async (e) => {
    setLoading(true);
    const file = e.target.files[0];
    let formData = new FormData();
    formData.append("image", file);
    console.log(formData);
    try {
      const response = await axios.post(
        "building_manager/profile/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setBuilding({
        ...building,
        image: response.data.data.image,
      });
      window.location.reload();
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      }
      if (err.response?.data?.errors?.image) {
        toast.error(err.response.data.errors.image[0]);
      }
    }
    setLoading(false);
  };

  const onFormSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        if (key === "national_card_image" || key === "image") {
          if (value[0]) {
            formData.append(key, value[0]);
          }
        } else {
          formData.append(key, value);
        }
      }
      const response = await axios.post("building_manager/profile", formData);
      setBuildingManager(response.data.data.building_manager);
      toast.success("اطلاعات با موفقیت ثبت شد");
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      }
      if (err.response?.data?.errors) {
        for (const [key, value] of Object.entries(err.response.data.errors)) {
          setError(key, { message: value });
          toast.error(value);
        }
      }
    }
    setLoading(false);
  };

  return (
    <>
      <div>
        <BlockUi blocking={loading} message={<></>} renderChildren={false}>
          <div className="pb-0 pt-2">
            <h3 className="text-center mb-2 d-md-none">پروفایل</h3>
            <Row>
              <Col md="4">
                <div className="d-flex align-items-center w-100 flex-column">
                  <div className="position-relative">
                    <input
                      type="file"
                      id="image"
                      onChange={handleImageChange}
                      className="d-none"
                    />
                    <Avatar
                      className="avatar-stats p-50 m-0 mb-2"
                      color="success"
                      img={building.image}
                      imgHeight="200"
                      imgWidth="200"
                    />

                    <Label for="image" className="cursor-pointer">
                      <FontAwesomeIcon
                        icon={faPlusCircle}
                        className="cursor-pointer"
                        size="3x"
                        style={{
                          position: "absolute",
                          top: "65%",
                          right: "3%",
                          color: themeConfig.layout.primaryColor,
                          backgroundColor: "#FFC727",
                          borderRadius: "50%",
                        }}
                      />
                    </Label>
                  </div>
                  <h4 className="d-none d-md-block">پروفایل مدیریت ساختمان</h4>
                </div>
              </Col>
              <Col md="8" className="mx-auto">
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
                          rules={{ required: !buildingManager.first_name }}
                          defaultValue={buildingManager.first_name}
                          render={({ field }) => (
                            <Input
                              value={buildingManager.first_name}
                              id="first_name"
                              type="text"
                              placeholder="نام"
                              invalid={errors.first_name ? true : false}
                              {...field}
                              disabled={buildingManager.first_name}
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
                          rules={{ required: !buildingManager.last_name }}
                          defaultValue={buildingManager.last_name}
                          render={({ field }) => (
                            <Input
                              value={buildingManager.last_name}
                              id="last_name"
                              type="text"
                              placeholder="نام خانوادگی"
                              invalid={errors.last_name ? true : false}
                              {...field}
                              disabled={buildingManager.last_name}
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
                          rules={{ required: !buildingManager.mobile }}
                          defaultValue={buildingManager.mobile}
                          render={({ field }) => (
                            <Input
                              value={buildingManager.mobile}
                              id="mobile"
                              type="text"
                              placeholder="تلفن همراه"
                              invalid={errors.mobile ? true : false}
                              {...field}
                              disabled={buildingManager.mobile}
                            />
                          )}
                        />
                        {errors.mobile && (
                          <div className="text-danger">
                            {errors.mobile.message}
                          </div>
                        )}
                      </div>
                    </Col>

                    <Col md="6">
                      <div className="mb-2">
                        <Label for="national_id">کد ملی*</Label>
                        <Controller
                          name="national_id"
                          control={control}
                          defaultValue={business.national_id}
                          rules={{ required: !business.national_id }}
                          render={({ field }) => (
                            < Input
                              value={business.national_id}
                              id="national_id"
                              type="text"
                              placeholder="کد ملی"
                              invalid={errors.national_id ? true : false}
                              {...field}
                              disabled={business.national_id}
                            />
                          )}
                        />
                        {errors.national_id && (
                          <div className="text-danger">
                            {errors.national_id.message}
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-2">
                        <Label for="building_name">نام ساختمان *</Label>
                        <Controller
                          name="building_name"
                          control={control}
                          rules={{ required: !business.name }}
                          defaultValue={business.name}
                          render={({ field }) => (
                            <Input
                              value={business.name}
                              id="building_name"
                              type="text"
                              placeholder="نام ساختمان"
                              invalid={errors.building_name ? true : false}
                              {...field}
                              disabled={business.name}
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
                        <Label for="building_name_en">
                          نام انگلیسی ساختمان *
                        </Label>
                        <Controller
                          name="building_name_en"
                          control={control}
                          rules={{ required: !business.name_en }}
                          defaultValue={business.name_en}
                          render={({ field }) => (
                            <Input
                              value={business.name_en}
                              id="building_name_en"
                              type="text"
                              placeholder="نام انگلیسی ساختمان"
                              invalid={errors.building_name_en ? true : false}
                              {...field}
                              disabled={business.name_en}
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
                        <Label for="phone_number">شماره تلفن *</Label>
                        <Controller
                          name="phone_number"
                          control={control}
                          rules={{ required: !business.phone_number }}
                          defaultValue={business.phone_number}
                          render={({ field }) => (
                            <Input
                              value={business.phone_number}
                              id="phone_number"
                              type="text"
                              placeholder="شماره تلفن"
                              invalid={errors.phone_number ? true : false}
                              {...field}
                              inputMode="tel"
                              disabled={business.phone_number}
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
                          rules={{ required: !business.province }}
                          defaultValue={business.province}
                          render={({ field }) => (
                            <Input
                              value={business.province}
                              id="province"
                              type="text"
                              placeholder="استان"
                              invalid={errors.province ? true : false}
                              {...field}
                              disabled={business.province}
                            />
                          )}
                        />
                        {errors.province && (
                          <div className="text-danger">
                            {errors.province.message}
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-2">
                        <Label for="city">شهر *</Label>
                        <Controller
                          name="city"
                          control={control}
                          rules={{ required: !business.city }}
                          defaultValue={business.city}
                          render={({ field }) => (
                            <Input
                              value={business.city}
                              id="city"
                              type="text"
                              placeholder="شهر"
                              invalid={errors.city ? true : false}
                              {...field}
                              disabled={business.city}
                            />
                          )}
                        />
                        {errors.city && (
                          <div className="text-danger">
                            {errors.city.message}
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-2">
                        <Label for="district">منطقه *</Label>
                        <Controller
                          name="district"
                          control={control}
                          rules={{ required: !business.district }}
                          defaultValue={business.district}
                          render={({ field }) => (
                            <Input
                              value={business.district}
                              id="district"
                              type="text"
                              placeholder="منطقه"
                              invalid={errors.district ? true : false}
                              {...field}
                              disabled={business.district}
                            />
                          )}
                        />
                        {errors.district && (
                          <div className="text-danger">
                            {errors.district.message}
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-2">
                        <Label for="address">آدرس *</Label>
                        <Controller
                          name="address"
                          control={control}
                          rules={{ required: !business.address }}
                          defaultValue={business.address}
                          render={({ field }) => (
                            <Input
                              value={business.address}
                              id="address"
                              type="text"
                              placeholder="آدرس"
                              invalid={errors.address ? true : false}
                              {...field}
                              disabled={business.address}
                            />
                          )}
                        />
                        {errors.address && (
                          <div className="text-danger">
                            {errors.address.message}
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-2">
                        <Label for="postal_code">کد پستی *</Label>
                        <Controller
                          name="postal_code"
                          control={control}
                          rules={{ required: !business.postal_code }}
                          defaultValue={business.postal_code}
                          render={({ field }) => (
                            <Input
                              value={business.postal_code}
                              id="postal_code"
                              type="text"
                              placeholder="کد پستی"
                              invalid={errors.postal_code ? true : false}
                              {...field}
                              disabled={business.postal_code}
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
                        <Label for="email">ایمیل *</Label>
                        <Controller
                          name="email"
                          control={control}
                          rules={{ required: !business.email }}
                          defaultValue={business.email}
                          render={({ field }) => (
                            <Input
                              value={business.email}
                              id="email"
                              type="email"
                              placeholder="ایمیل"
                              invalid={errors.email ? true : false}
                              {...field}
                              disabled={business.email}
                            />
                          )}
                        />
                        {errors.email && (
                          <div className="text-danger">
                            {errors.email.message}
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-2">
                        <Label for="sheba_number">شماره شبا *</Label>
                        <Controller
                          name="sheba_number"
                          control={control}
                          rules={{ required: !business.sheba_number }}
                          defaultValue={business.sheba_number}
                          render={({ field }) => (
                            <Input
                              value={business.sheba_number}
                              id="sheba_number"
                              type="text"
                              placeholder="شماره شبا"
                              invalid={errors.sheba_number ? true : false}
                              {...field}
                              inputMode="tel"
                              disabled={business.sheba_number}
                            />
                          )}
                        />
                        {errors.sheba_number && (
                          <div className="text-danger">
                            {errors.sheba_number.message}
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="mb-2">
                        <Label for="card_number">شماره کارت *</Label>
                        <Controller
                          name="card_number"
                          control={control}
                          rules={{ required: !business.card_number }}
                          defaultValue={business.card_number}
                          render={({ field }) => (
                            <Input
                              value={business.card_number}
                              id="card_number"
                              type="text"
                              placeholder="شماره کارت"
                              invalid={errors.card_number ? true : false}
                              {...field}
                              inputMode="tel"
                              disabled={business.card_number}
                            />
                          )}
                        />
                        {errors.card_number && (
                          <div className="text-danger">
                            {errors.card_number.message}
                          </div>
                        )}
                      </div>
                    </Col>
                    {business.national_card_image ? (
                      <>
                      </>
                    ) : (
                      <Col md="6">
                        <div className="mb-2">
                          <Label for="national_card_image">
                            تصویر کارت ملی
                          </Label>
                          <input
                            name="national_card_image"
                            type="file"
                            accept=".png, .jpg, .jpeg"
                            className="form-control form-control-lg"
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
                      </Col>
                    )}
                  </Row>
                  <div className="d-flex w-100 justify-content-center">
                    <Button
                      color="primary"
                      type="submit"
                      className="mt-2"
                      style={{
                        minWidth: "150px",
                      }}
                    >
                      ویرایش
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </div>
        </BlockUi>
      </div>
    </>
  );
};
export default Profile;
