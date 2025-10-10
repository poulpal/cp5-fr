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
import Select from "react-select";
import themeConfig from "@configs/themeConfig";

const AddResidentModal = ({
  unit,
  addResidentModal,
  setAddResidentModal,
  setLoading,
  refreshData,
  setResidents,
}) => {
  const {
    register: addResidentRegister,
    handleSubmit: addResidentHandleSubmit,
    formState: { errors: addResidentErrors },
    reset: addResidentReset,
    control: addResidentControl,
    setError: addResidentSetError,
  } = useForm();

  const [activeTab, setActiveTab] = useState("single");

  const onAddResidentSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post(`/building_manager/units/${unit.id}/residents`, {
        ...formData,
        ownership: formData.ownership.value,
      });

      toast.success(response.data.message);
      setResidents(response.data.data.unit.residents);
      setAddResidentModal(false);
      refreshData();
      addResidentReset();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      if (err.response && err.response.data.errors) {
        Object.keys(err.response.data.errors).forEach((key) => {
          addResidentSetError(key, err.response.data.errors[key][0]);
        });
      }
      console.log(err);
    }

    setLoading(false);
  };
  return (
    <Modal
      isOpen={addResidentModal}
      centered={true}
      size="lg"
      toggle={() => setAddResidentModal(false)}
    >
      <ModalHeader toggle={() => setAddResidentModal(false)}>
        افزودن ساکن به واحد {unit.unit_number}
      </ModalHeader>
      <ModalBody>
        {/* <Nav pills justified>
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
        </Nav> */}
        <TabContent activeTab={activeTab}>
          <TabPane tabId="single">
            <Form onSubmit={addResidentHandleSubmit(onAddResidentSubmit)}>
              <Row>
                <Col md={12}>
                  <div className="mt-1">
                    <Label>شماره واحد *</Label>
                    <Controller
                      name="unit_number"
                      control={addResidentControl}
                      defaultValue={unit.unit_number}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder="شماره واحد"
                          disabled
                        />
                      )}
                    />
                    {addResidentErrors.unit_number && (
                      <div className="text-danger">شماره واحد را وارد کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mt-1">
                    <Label>نام</Label>
                    <Controller
                      name="first_name"
                      control={addResidentControl}
                      defaultValue=""
                      render={({ field }) => (
                        <Input {...field} type="text" placeholder="نام" />
                      )}
                    />
                    {addResidentErrors.first_name && (
                      <div className="text-danger">نام را وارد کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mt-1">
                    <Label>نام خانوادگی</Label>
                    <Controller
                      name="last_name"
                      control={addResidentControl}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder="نام خانوادگی"
                        />
                      )}
                    />
                    {addResidentErrors.last_name && (
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
                      control={addResidentControl}
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
                    {addResidentErrors.mobile && (
                      <div className="text-danger">تلفن همراه را وارد کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mt-1">
                    <Label>وضعیت *</Label>
                    <Controller
                      name="ownership"
                      control={addResidentControl}
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
                    {addResidentErrors.ownership && (
                      <div className="text-danger">وضعیت را انتخاب کنید</div>
                    )}
                  </div>
                </Col>
              </Row>
              <Row>
                <div className="mt-3 d-flex justify-content-center w-100">
                  <Button
                    color="primary"
                    onClick={addResidentHandleSubmit(onAddResidentSubmit)}
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
        </TabContent>
      </ModalBody>
    </Modal>
  );
};

export default AddResidentModal;
