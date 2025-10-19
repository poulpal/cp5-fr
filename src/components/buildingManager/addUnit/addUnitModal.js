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
  Row,
} from "reactstrap";
import axios from "axios";
import { useEffect } from "react";

export default function AddUnitModal({ addUnitModal, setAddUnitModal, refreshData, setLoading }) {
  return (
    <Modal
      isOpen={addUnitModal}
      toggle={() => setAddUnitModal(!addUnitModal)}
      className="modal-dialog-centered modal-lg"
    >
      <ModalHeader toggle={() => setAddUnitModal(!addUnitModal)} style={{ fontWeight: 700 }}>
        افزودن واحد
      </ModalHeader>
      <ModalBody>
        <_AddUnitModal
          addUnitModal={addUnitModal}
          setAddUnitModal={setAddUnitModal}
          setLoading={setLoading}
          refreshData={refreshData}
        />
      </ModalBody>
    </Modal>
  );
}

const _AddUnitModal = ({ addUnitModal, setAddUnitModal, setLoading, refreshData }) => {
  const {
    register: addUnitRegister,
    handleSubmit: addUnitHandleSubmit,
    formState: { errors: addUnitErrors },
    reset: addUnitReset,
    control: addUnitControl,    // ← این را استفاده کن
    setError: addUnitSetError,
    setValue: addUnitSetValue,
    watch: addUnitWatch,
  } = useForm();

  const currency = localStorage.getItem("currency");

  const onSubmit = async (formData) => {
    setLoading?.(true);
    try {
      const payload = {
        late_fine_only_last_cycle: !!formData.late_fine_only_last_cycle,
        unit_number: formData.unit_number,
        area:
          typeof formData.area === "string"
            ? parseFloat(formData.area.replace(/,/g, ""))
            : formData.area,
        resident_count:
          typeof formData.resident_count === "string"
            ? parseFloat(formData.resident_count.replace(/,/g, ""))
            : formData.resident_count,
        charge_fee:
          typeof formData.charge_fee === "string"
            ? parseFloat(formData.charge_fee.replace(/,/g, "")) / (currency === "rial" ? 10 : 1)
            : formData.charge_fee / (currency === "rial" ? 10 : 1),
        rent_fee:
          typeof formData.rent_fee === "string"
            ? parseFloat(formData.rent_fee.replace(/,/g, "")) / (currency === "rial" ? 10 : 1)
            : formData.rent_fee / (currency === "rial" ? 10 : 1),
      };

      const { data } = await axios.post("/building_manager/units", payload);
      toast.success(data?.message || "واحد با موفقیت ایجاد شد");
      refreshData?.();
      addUnitReset();
      setAddUnitModal(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.unit_number?.[0] ||
        "خطا در ایجاد واحد";
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading?.(false);
    }
  };

  useEffect(() => () => addUnitReset(), []);

  return (
    <Form onSubmit={addUnitHandleSubmit(onSubmit)}>
      <Row>
        <Col md={6}>
          <div className="mb-2">
            <Label>شماره واحد</Label>
            <Controller
              name="unit_number"
              control={addUnitControl}
              rules={{ required: true }}
              render={({ field }) => <Input type="text" {...field} />}
            />
            {addUnitErrors.unit_number && (
              <div className="text-danger">شماره واحد الزامی است</div>
            )}
          </div>
        </Col>

        <Col md={6}>
          <div className="mb-2">
            <Label>مساحت (متر مربع)</Label>
            <Controller
              name="area"
              control={addUnitControl}
              render={({ field }) => (
                <NumericFormat
                  thousandSeparator={true}
                  className="form-control"
                  {...field}
                  inputMode="tel"
                />
              )}
            />
          </div>
        </Col>

        <Col md={6}>
          <div className="mb-2">
            <Label>تعداد نفرات</Label>
            <Controller
              name="resident_count"
              control={addUnitControl}
              render={({ field }) => (
                <NumericFormat
                  thousandSeparator={true}
                  className="form-control"
                  {...field}
                  inputMode="tel"
                />
              )}
            />
          </div>
        </Col>

        <Col md={12}>
          <div className="mb-2">
            {currency === "rial" ? (
              <Label>شارژ ماهانه (ریال)</Label>
            ) : (
              <Label>شارژ ماهانه (تومان)</Label>
            )}
            <Controller
              name="charge_fee"
              control={addUnitControl}
              rules={{
                required: "شارژ ماهانه الزامی است",
                min: { value: 0, message: "شارژ ماهانه نمی‌تواند منفی باشد" },
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
            {addUnitErrors.charge_fee && (
              <div className="text-danger">{addUnitErrors.charge_fee.message}</div>
            )}
          </div>
        </Col>

        <Col md={12}>
          <div className="mb-2">
            {currency === "rial" ? (
              <Label>اجاره ماهانه (ریال)</Label>
            ) : (
              <Label>اجاره ماهانه (تومان)</Label>
            )}
            <Controller
              name="rent_fee"
              control={addUnitControl}
              rules={{
                required: "اجاره ماهانه الزامی است",
                min: { value: 0, message: "اجاره ماهانه نمی‌تواند منفی باشد" },
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
            {addUnitErrors.rent_fee && (
              <div className="text-danger">{addUnitErrors.rent_fee.message}</div>
            )}
          </div>
        </Col>

        {/* جریمهٔ تأخیر: فقط ماه اخیر */}
        <Col md={12}>
          <div className="mb-2">
            <Label className="d-block mb-1">جریمهٔ تأخیر</Label>
            <div className="form-check">
              <Controller
                name="late_fine_only_last_cycle"
                control={addUnitControl}
                defaultValue={false}
                render={({ field }) => (
                  <Input
                    type="checkbox"
                    className="form-check-input"
                    id="create_late_fine_only_last_cycle"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              <Label className="form-check-label" htmlFor="create_late_fine_only_last_cycle">
                فقط روی شارژ ماه اخیر جریمه بنشیند
              </Label>
            </div>
          </div>
        </Col>

        <Col md={12}>
          <div className="mt-1 d-flex justify-content-center w-100">
            <Button color="primary" type="submit" style={{ minWidth: "150px" }}>
              ثبت
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
};
