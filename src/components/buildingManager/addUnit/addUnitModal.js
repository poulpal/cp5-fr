import { useState } from "react";
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
import Select from "react-select";
import AddMultipleUnit from "./addMultipleUnit";
import themeConfig from "@configs/themeConfig";

// گزینه‌های مالکیت
const ownershipOptions = [
  { value: "owner", label: "مالک" },
  { value: "renter", label: "مستأجر" },
];

// وضعیت رنت از تنظیمات ذخیره‌شده
const buildingOptions = JSON.parse(localStorage.getItem("buildingOptions") || "{}");
const hasRent = buildingOptions.has_rent || false;

// الگوی تلفن ثابت ایران: 0 + 9 یا 10 رقم (در مجموع 10 یا 11 رقم)
const landlineRegex = /^0\d{9,10}$/;

// فقط ارقام
const digitsOnly = (v) => (v || "").replace(/\D+/g, "");

// در UI همه‌چیز ریالی است
const currency = "rial";

const AddUnitModal = ({
  addUnitModal,
  setAddUnitModal,
  setLoading,
  refreshData,
  isModal = true,
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
      className="modal-dialog-centered modal-lg"
    >
      <ModalHeader toggle={() => setAddUnitModal(!addUnitModal)} style={{ fontWeight: 700 }}>
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

const _AddUnitModal = ({ addUnitModal, setAddUnitModal, setLoading, refreshData }) => {
  const {
    register: addUnitRegister,
    handleSubmit: addUnitHandleSubmit,
    formState: { errors: addUnitErrors },
    reset: addUnitReset,
    control: addUnitControl,
    setError: addUnitSetError,
    setValue: addUnitSetValue,
    getValues: addUnitGetValues,
  } = useForm({
    defaultValues: {
      unit_number: "",
      area: "0",
      resident_count: "0",
      // فیلدهای جدید
      floor: "",
      block: 1,
      parking_count: 1,
      storage_count: 1,
      parking_numbers: "",
      storage_numbers: "",
      landline_phone: "",
      ownership: ownershipOptions[0],
      charge_fee: "",
      rent_fee: "",
      first_name: "",
      last_name: "",
      mobile: "",
    },
  });

  const [activeTab, setActiveTab] = useState("single");

  const onAddUnitSubmit = async (formData) => {
    setLoading(true);
    try {
      // نرمال‌سازی مقادیر عددی نمایشی
      const charge = typeof formData.charge_fee === "string"
        ? formData.charge_fee.replace(/,/g, "")
        : formData.charge_fee;

      const rent = typeof formData.rent_fee === "string"
        ? formData.rent_fee.replace(/,/g, "")
        : formData.rent_fee;

      const area = typeof formData.area === "string"
        ? formData.area.replace(/,/g, "")
        : formData.area;

      // ⚠️ UI ریال است؛ برای سازگاری با بک‌اند ممکنِ تومان، تبدیل ریال→تومان:
      const chargeForServer = Number(charge) / (currency === "rial" ? 10 : 1);
      const rentForServer = rent ? Number(rent) / (currency === "rial" ? 10 : 1) : undefined;

      const payload = {
        ...formData,
        area,
        charge_fee: chargeForServer,
        rent_fee: rentForServer,
        ownership: formData.ownership?.value || formData.ownership,
        // اعداد صحیح و پیش‌فرض‌ها
        floor: formData.floor === "" ? undefined : Number(digitsOnly(formData.floor)),
        block: formData.block ? Number(digitsOnly(String(formData.block))) : 1,
        parking_count: formData.parking_count ? Number(digitsOnly(String(formData.parking_count))) : 1,
        storage_count: formData.storage_count ? Number(digitsOnly(String(formData.storage_count))) : 1,
        // مقادیر متنی
        landline_phone: (formData.landline_phone || "").trim(),
        parking_numbers: (formData.parking_numbers || "").trim(),
        storage_numbers: (formData.storage_numbers || "").trim(),
      };

      const response = await axios.post("/building_manager/units", payload);

      toast.success(response.data?.message || "واحد با موفقیت افزوده شد");
      setAddUnitModal(false);
      refreshData?.();
      addUnitReset();
    } catch (err) {
      if (err?.response?.data?.message) toast.error(err.response.data.message);
      if (err?.response?.data?.errors) {
        Object.keys(err.response.data.errors).forEach((k) => {
          addUnitSetError(k, { type: "server", message: err.response.data.errors[k]?.[0] });
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ModalBody>
        <Nav pills justified>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "single" })}
              onClick={() => setActiveTab("single")}
            >
              افزودن واحد تکی
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "multiple" })}
              onClick={() => setActiveTab("multiple")}
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
                      rules={{ required: true }}
                      render={({ field }) => <Input {...field} type="text" placeholder="شماره واحد" />}
                    />
                    {addUnitErrors.unit_number && <div className="text-danger">شماره واحد را وارد کنید</div>}
                  </div>
                </Col>

                <Col md={6}>
                  <div className="mt-1">
                    <Label>مساحت (متر مربع)</Label>
                    <Controller
                      name="area"
                      control={addUnitControl}
                      render={({ field }) => (
                        <NumericFormat thousandSeparator className="form-control" {...field} inputMode="tel" />
                      )}
                    />
                  </div>
                </Col>

                {/* طبقه و بلوک */}
                <Col md={6}>
                  <div className="mt-1">
                    <Label>طبقه (عددی)</Label>
                    <Controller
                      name="floor"
                      control={addUnitControl}
                      rules={{
                        validate: (v) => v === "" || /^\d+$/.test(String(v)) || "فقط عدد مجاز است",
                      }}
                      render={({ field }) => <Input {...field} type="tel" placeholder="مثال: 3" />}
                    />
                    {addUnitErrors.floor && <div className="text-danger">{addUnitErrors.floor.message}</div>}
                  </div>
                </Col>

                <Col md={6}>
                  <div className="mt-1">
                    <Label>بلوک (پیش‌فرض ۱)</Label>
                    <Controller
                      name="block"
                      control={addUnitControl}
                      render={({ field }) => (
                        <NumericFormat
                          thousandSeparator={false}
                          className="form-control"
                          {...field}
                          allowNegative={false}
                          inputMode="tel"
                        />
                      )}
                    />
                  </div>
                </Col>

                {/* تعداد نفرات */}
                <Col md={6}>
                  <div className="mt-1">
                    <Label>تعداد نفرات</Label>
                    <Controller
                      name="resident_count"
                      control={addUnitControl}
                      render={({ field }) => (
                        <NumericFormat
                          thousandSeparator={false}
                          className="form-control"
                          {...field}
                          allowNegative={false}
                          inputMode="tel"
                        />
                      )}
                    />
                  </div>
                </Col>

                {/* تلفن ثابت */}
                <Col md={6}>
                  <div className="mt-1">
                    <Label>تلفن ثابت (ایران)</Label>
                    <Controller
                      name="landline_phone"
                      control={addUnitControl}
                      rules={{
                        validate: (v) =>
                          (v?.trim() === "" || landlineRegex.test(digitsOnly(v))) ||
                          "الگوی تلفن ثابت نامعتبر است",
                      }}
                      render={({ field }) => <Input {...field} type="tel" placeholder="مثال: 02112345678" />}
                    />
                    {addUnitErrors.landline_phone && (
                      <div className="text-danger">{addUnitErrors.landline_phone.message}</div>
                    )}
                  </div>
                </Col>

                {/* پارکینگ‌ها */}
                <Col md={6}>
                  <div className="mt-1">
                    <Label>تعداد پارکینگ (پیش‌فرض ۱)</Label>
                    <Controller
                      name="parking_count"
                      control={addUnitControl}
                      render={({ field }) => (
                        <NumericFormat
                          thousandSeparator={false}
                          className="form-control"
                          {...field}
                          allowNegative={false}
                          inputMode="tel"
                        />
                      )}
                    />
                  </div>
                </Col>

                <Col md={6}>
                  <div className="mt-1">
                    <Label>شماره‌های پارکینگ</Label>
                    <Controller
                      name="parking_numbers"
                      control={addUnitControl}
                      render={({ field }) => <Input {...field} type="text" placeholder="مثال: 12، 15" />}
                    />
                  </div>
                </Col>

                {/* انباری‌ها */}
                <Col md={6}>
                  <div className="mt-1">
                    <Label>تعداد انباری (پیش‌فرض ۱)</Label>
                    <Controller
                      name="storage_count"
                      control={addUnitControl}
                      render={({ field }) => (
                        <NumericFormat
                          thousandSeparator={false}
                          className="form-control"
                          {...field}
                          allowNegative={false}
                          inputMode="tel"
                        />
                      )}
                    />
                  </div>
                </Col>

                <Col md={6}>
                  <div className="mt-1">
                    <Label>شماره‌های انباری</Label>
                    <Controller
                      name="storage_numbers"
                      control={addUnitControl}
                      render={({ field }) => (
                        <Input {...field} type="text" placeholder="مثال: B12، B15 یا 3، 7" />
                      )}
                    />
                  </div>
                </Col>

                {/* هویت ساکن فعلی واحد */}
                <Col md={6}>
                  <div className="mt-1">
                    <Label>نام</Label>
                    <Controller
                      name="first_name"
                      control={addUnitControl}
                      render={({ field }) => <Input {...field} type="text" placeholder="نام" />}
                    />
                  </div>
                </Col>

                <Col md={6}>
                  <div className="mt-1">
                    <Label>نام خانوادگی</Label>
                    <Controller
                      name="last_name"
                      control={addUnitControl}
                      render={({ field }) => <Input {...field} type="text" placeholder="نام خانوادگی" />}
                    />
                  </div>
                </Col>

                <Col md={6}>
                  <div className="mt-1">
                    <Label>تلفن همراه *</Label>
                    <Controller
                      name="mobile"
                      control={addUnitControl}
                      rules={{ required: true }}
                      render={({ field }) => <Input {...field} type="tel" placeholder="مثال: 09121234567" />}
                    />
                    {addUnitErrors.mobile && <div className="text-danger">تلفن همراه الزامی است</div>}
                  </div>
                </Col>

                <Col md={6}>
                  <div className="mt-1">
                    <Label>وضعیت *</Label>
                    <Controller
                      name="ownership"
                      control={addUnitControl}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={ownershipOptions}
                          classNamePrefix="select"
                          placeholder="مالک / مستأجر"
                        />
                      )}
                    />
                  </div>
                </Col>

                <Col md={6}>
                  <div className="mt-1">
                    <Label>شارژ ماهانه (ریال) *</Label>
                    <Controller
                      name="charge_fee"
                      control={addUnitControl}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <NumericFormat thousandSeparator className="form-control" {...field} inputMode="tel" />
                      )}
                    />
                    {addUnitErrors.charge_fee && <div className="text-danger">مبلغ شارژ الزامی است</div>}
                  </div>
                </Col>

                {hasRent && (
                  <Col md={6}>
                    <div className="mt-1">
                      <Label>اجاره ماهانه (ریال)</Label>
                      <Controller
                        name="rent_fee"
                        control={addUnitControl}
                        render={({ field }) => (
                          <NumericFormat thousandSeparator className="form-control" {...field} inputMode="tel" />
                        )}
                      />
                    </div>
                  </Col>
                )}

                <div className="mt-3 d-flex justify-content-center w-100">
                  <Button color="primary" type="submit" style={{ minWidth: "150px" }}>
                    ثبت
                  </Button>
                </div>
              </Row>
            </Form>
          </TabPane>

          {/* افزودن گروهی */}
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
