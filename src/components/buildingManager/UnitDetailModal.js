import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
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
import { useEffect, useState } from "react";
import UnitResidents from "./UnitResidents";
import classnames from "classnames";
import DataTable from "react-data-table-component";
import tableConfig from "../../configs/tableConfig";
import PastResidentsTable from "./addUnit/PastResidentsTable";

const buildingOptions = JSON.parse(localStorage.getItem("buildingOptions") || "{}");
const hasRent = buildingOptions.has_rent || false;

export default ({
  unit,
  unitDetailModal,
  setUnitDetailModal,
  setLoading,
  refreshData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
    setValue
  } = useForm();

  const [activeTab, setActiveTab] = useState("details");

  const currency = localStorage.getItem("currency");

  const onAddUnitSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.put("/building_manager/units/" + unit.id, {
        ...formData,
        charge_fee:
          typeof formData.charge_fee === "string"
            ? parseFloat(formData.charge_fee.replace(/,/g, "")) / (currency === "rial" ? 10 : 1)
            : formData.charge_fee / (currency === "rial" ? 10 : 1),
        rent_fee:
          typeof formData.rent_fee === "string"
            ? parseFloat(formData.rent_fee.replace(/,/g, "")) / (currency === "rial" ? 10 : 1)
            : formData.rent_fee / (currency === "rial" ? 10 : 1),
        area:
          typeof formData.area === "string"
            ? parseFloat(formData.area.replace(/,/g, ""))
            : formData.area,
      });

      toast.success(response.data.message);
      setUnitDetailModal(false);
      refreshData();
      reset();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      if (err.response && err.response.data.errors) {
        Object.keys(err.response.data.errors).forEach((key) => {
          addUnitSetError(key, err.response.data.errors[key][0]);
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    setValue("unit_number", unit.unit_number);
    setValue("charge_fee", unit.charge_fee * (currency === "rial" ? 10 : 1));
    setValue("rent_fee", unit.rent_fee * (currency === "rial" ? 10 : 1));
    return () => { };
  }, [unit]);

  return (
    <Modal
      isOpen={unitDetailModal}
      toggle={() => setUnitDetailModal(!unitDetailModal)}
      centered={true}
      color="primary"
      size="xl"
    >
      <ModalHeader toggle={() => setUnitDetailModal(!unitDetailModal)}>
        جزئیات واحد {unit.unit_number}
      </ModalHeader>
      <ModalBody>
        <Nav pills>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "details" })}
              onClick={() => {
                setActiveTab("details");
              }}
            >
              اطلاعات واحد
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "past_residents" })}
              onClick={() => {
                setActiveTab("past_residents");
              }}
            >
              سابقه سکونت
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="details">
            <Form onSubmit={handleSubmit(onAddUnitSubmit)}>
              <Row>
                <Col md={6}>
                  <div className="mb-2">
                    <Label>شماره واحد</Label>
                    <Controller
                      name="unit_number"
                      control={control}
                      defaultValue={unit.unit_number}
                      render={({ field }) => <Input type="text" {...field} />}
                    />
                    {errors.unit_number && (
                      <div className="text-danger">شماره واحد الزامی است</div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-2">
                    <Label>مساحت (متر مربع)</Label>
                    <Controller
                      name="area"
                      control={control}
                      defaultValue={unit.area}
                      render={({ field }) => (
                        <NumericFormat
                          thousandSeparator={true}
                          className="form-control"
                          {...field}
                          inputMode="tel"
                        />
                      )}
                    />
                    {errors.area && (
                      <div className="text-danger">مساحت واحد را وارد کنید</div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-2">
                    <Label>تعداد نفرات</Label>
                    <Controller
                      name="resident_count"
                      control={control}
                      defaultValue={unit.resident_count}
                      render={({ field }) => (
                        <NumericFormat
                          thousandSeparator={false}
                          className="form-control"
                          {...field}
                          inputMode="tel"
                        />
                      )}
                    />
                    {errors.area && (
                      <div className="text-danger">تعداد ساکنین واحد را وارد کنید</div>
                    )}
                  </div>
                </Col>
              </Row>
              <UnitResidents
                unit={unit}
                unitDetailModal={unitDetailModal}
                setUnitDetailModal={setUnitDetailModal}
                setLoading={setLoading}
                refreshData={refreshData}
              />
              <Row>
                <Col md={12}>
                  <div className="mb-2">
                    {currency === "rial" ? (
                      <Label>شارژ ماهانه (ریال)</Label>
                    ) : (
                      <Label>شارژ ماهانه (تومان)</Label>
                    )}
                    <Controller
                      name="charge_fee"
                      control={control}
                      rules={{
                        required: "شارژ ماهانه الزامی است",
                        min: {
                          value: 0,
                          message: "شارژ ماهانه نمی تواند منفی باشد",
                        },
                      }}
                      render={({ field }) => (
                        <NumericFormat
                          thousandSeparator={true}
                          className="form-control"
                          {...field}
                          inputMode="tel"
                        />
                      )}
                    />
                    {errors.charge_fee && (
                      <div className="text-danger">{errors.charge_fee.message}</div>
                    )}
                  </div>
                </Col>
              </Row>
              {hasRent && (
                <Row>
                  <Col md={12}>
                    <div className="mb-2">
                      {currency === "rial" ? (
                        <Label>اجاره ماهانه (ریال)</Label>
                      ) : (
                        <Label>اجاره ماهانه (تومان)</Label>
                      )}
                      <Controller
                        name="rent_fee"
                        control={control}
                        rules={{
                          required: "اجاره ماهانه الزامی است",
                          min: {
                            value: 0,
                            message: "اجاره ماهانه نمی تواند منفی باشد",
                          },
                        }}
                        render={({ field }) => (
                          <NumericFormat
                            thousandSeparator={true}
                            className="form-control"
                            {...field}
                            inputMode="tel"
                          />
                        )}
                      />
                      {errors.rent_fee && (
                        <div className="text-danger">{errors.rent_fee.message}</div>
                      )}
                    </div>
                  </Col>
                </Row>
              )}
              <Row>
                <div className="mt-0 d-flex justify-content-center w-100">
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
          </TabPane>
          <TabPane tabId="past_residents">
            <PastResidentsTable past_residents={unit.past_residents} />
          </TabPane>
        </TabContent>

      </ModalBody>
    </Modal>
  );
};
