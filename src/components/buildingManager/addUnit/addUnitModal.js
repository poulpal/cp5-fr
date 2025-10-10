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
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import axios from "axios";
import classnames from "classnames";
import { toast } from "react-hot-toast";
import { useState } from "react";
import AddMultipleUnit from "./addMultipleUnit";
import Select from "react-select";
import themeConfig from "@configs/themeConfig";

const buildingOptions = JSON.parse(localStorage.getItem("buildingOptions") || "{}");
const hasRent = buildingOptions.has_rent || false;

const AddUnitModal = ({
  addUnitModal,
  setAddUnitModal,
  setLoading,
  refreshData,
  isModal = true
}) => {
  if (!isModal) {
    return (
      <div className="px-1 pt-2 w-100">
        <_AddUnitModal
          addUnitModal={addUnitModal}
          setAddUnitModal={setAddUnitModal}
          setLoading={setLoading}
          refreshData={refreshData}
        />
      </div>
    );
  }
  return (
    <Modal
      isOpen={addUnitModal}
      toggle={() => setAddUnitModal(!addUnitModal)}
      size="lg"
      centered
    >
      <ModalHeader toggle={() => setAddUnitModal(false)}>
        افزودن واحد
      </ModalHeader>
      <_AddUnitModal
        addUnitModal={addUnitModal}
        setAddUnitModal={setAddUnitModal}
        setLoading={setLoading}
        refreshData={refreshData}
      />
    </Modal>
  );
};

const _AddUnitModal = ({
  addUnitModal,
  setAddUnitModal,
  setLoading,
  refreshData,
}) => {
  const {
    register: addUnitRegister,
    handleSubmit: addUnitHandleSubmit,
    formState: { errors: addUnitErrors },
    reset: addUnitReset,
    control: addUnitControl,
    setError: addUnitSetError,
  } = useForm();

  const [activeTab, setActiveTab] = useState("single");

  const currency = localStorage.getItem("currency");

  const onAddUnitSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post("/building_manager/units", {
        ...formData,
        charge_fee: formData.charge_fee.replace(/,/g, "") / (currency === "rial" ? 10 : 1),
        ownership: formData.ownership.value,
        area: typeof formData.area === "string" ? formData.area.replace(/,/g, "") : formData.area,
      });

      toast.success(response.data.message);
      setAddUnitModal(false);
      refreshData();
      addUnitReset();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      if (err.response && err.response.data.errors) {
        Object.keys(err.response.data.errors).forEach((key) => {
          addUnitSetError(key, err.response.data.errors[key][0]);
        });
      }
      console.log(err);
    }

    setLoading(false);
  };
  return (
    <>
      <ModalBody>
        <Nav pills justified>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "single" })}
              onClick={() => {
                setActiveTab("single");
              }}
            >
              افزودن واحد تکی
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "multiple" })}
              onClick={() => {
                setActiveTab("multiple");
              }}
            >
              افزودن واحد گروهی
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="single">
            <Form onSubmit={addUnitHandleSubmit(onAddUnitSubmit)}>
              <Row>
                <Col md={6}>
                  <div className="mt-1">
                    <Label>شماره واحد *</Label>
                    <Controller
                      name="unit_number"
                      control={addUnitControl}
                      defaultValue=""
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder="شماره واحد"
                        />
                      )}
                    />
                    {addUnitErrors.unit_number && (
                      <div className="text-danger">شماره واحد را وارد کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mt-1">
                    <Label>مساحت (متر مربع)</Label>
                    <Controller
                      name="area"
                      control={addUnitControl}
                      defaultValue="0"
                      render={({ field }) => (
                        <NumericFormat
                          thousandSeparator={true}
                          className="form-control"
                          {...field}
                          inputMode="tel"
                        />
                      )}
                    />
                    {addUnitErrors.area && (
                      <div className="text-danger">مساحت واحد را وارد کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mt-1">
                    <Label>تعداد نفرات</Label>
                    <Controller
                      name="resident_count"
                      control={addUnitControl}
                      defaultValue="0"
                      render={({ field }) => (
                        <NumericFormat
                          thousandSeparator={false}
                          className="form-control"
                          {...field}
                          inputMode="tel"
                        />
                      )}
                    />
                    {addUnitErrors.resident_count && (
                      <div className="text-danger">تعداد نفرات واحد را وارد کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mt-1">
                    <Label>نام</Label>
                    <Controller
                      name="first_name"
                      control={addUnitControl}
                      defaultValue=""
                      render={({ field }) => (
                        <Input {...field} type="text" placeholder="نام" />
                      )}
                    />
                    {addUnitErrors.first_name && (
                      <div className="text-danger">نام را وارد کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mt-1">
                    <Label>نام خانوادگی</Label>
                    <Controller
                      name="last_name"
                      control={addUnitControl}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder="نام خانوادگی"
                        />
                      )}
                    />
                    {addUnitErrors.last_name && (
                      <div className="text-danger">
                        نام خانوادگی را وارد کنید
                      </div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mt-1">
                    <Label>تلفن همراه *</Label>
                    <Controller
                      name="mobile"
                      control={addUnitControl}
                      defaultValue=""
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder="تلفن همراه"
                        />
                      )}
                    />
                    {addUnitErrors.mobile && (
                      <div className="text-danger">تلفن همراه را وارد کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mt-1">
                    <Label>وضعیت *</Label>
                    <Controller
                      name="ownership"
                      control={addUnitControl}
                      defaultValue={{ label: "مالک", value: "owner" }}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          isSearchable={false}
                          isClearable={false}
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              border: "1px solid" + themeConfig.layout.primaryColor,
                              borderColor: themeConfig.layout.primaryColor,
                              height: "48px",
                              borderRadius: "20px",
                              boxShadow: state.isFocused
                                ? "0 3px 10px 0 rgba(34, 41, 47, 0.1)"
                                : "unset",
                            }),
                          }}
                          {...field}
                          options={[
                            { label: "مالک", value: "owner", selected: true },
                            { label: "مستاجر", value: "renter" },
                          ]}
                          defaultValue={{ label: "مالک", value: "owner" }}
                          placeholder="وضعیت"
                        />
                      )}
                    />
                    {addUnitErrors.ownership && (
                      <div className="text-danger">وضعیت را انتخاب کنید</div>
                    )}
                  </div>
                </Col>
              </Row>
              <Row>
                <div className="mt-1">
                  {currency === "rial" ? <Label>شارژ ماهانه (ریال) *</Label> : <Label>شارژ ماهانه (تومان) *</Label>}
                  <Controller
                    name="charge_fee"
                    control={addUnitControl}
                    defaultValue=""
                    rules={{ required: true }}
                    render={({ field }) => (
                      <NumericFormat
                        {...field}
                        thousandSeparator={true}
                        className="form-control"
                        placeholder="مبلغ شارژ"
                        inputMode="tel"
                      />
                    )}
                  />
                  {addUnitErrors.charge_fee && (
                    <div className="text-danger">مبلغ شارژ را وارد کنید</div>
                  )}
                </div>
                {hasRent && (
                  <div className="mt-1">
                    {currency === "rial" ? <Label>اجاره ماهانه (ریال) *</Label> : <Label>اجاره ماهانه (تومان) *</Label>}
                    <Controller
                      name="rent_fee"
                      control={addUnitControl}
                      defaultValue=""
                      rules={{ required: true }}
                      render={({ field }) => (
                        <NumericFormat
                          {...field}
                          thousandSeparator={true}
                          className="form-control"
                          placeholder="مبلغ اجاره"
                          inputMode="tel"
                        />
                      )}
                    />
                    {addUnitErrors.rent_fee && (
                      <div className="text-danger">مبلغ اجاره را وارد کنید</div>
                    )}
                  </div>
                )}
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
          </TabPane>

          <TabPane tabId="multiple">
            <AddMultipleUnit
              setLoading={setLoading}
              refreshData={refreshData}
              toggleModal={() => setAddUnitModal(!addUnitModal)}
            />
          </TabPane>
        </TabContent>
      </ModalBody>
    </>
  );
};

export default AddUnitModal;
