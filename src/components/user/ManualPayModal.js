import {
  Button,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import { NumericFormat } from "react-number-format";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const ManualPayModal = ({
  manualPayModal,
  toggleManualPayModal,
  unit,
  setLoading,
  refreshData,
}) => {
  const {
    control: manualPayFormControl,
    handleSubmit: handleManualPayFormSubmit,
    setValue: setManualPayFormValue,
    formState: { errors: manualPayFormErrors },
    setError: setManualPayFormError,
    reset: resetManualPayForm,
    register: registerManualPayForm,
  } = useForm();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));
    setManualPayFormValue(
      "unit_number",
      unit.unit_number + " - (" + unit.building.name + ")"
    );
    setManualPayFormValue("mobile", user.mobile);

    return () => {
      setManualPayFormValue("unit_number", "");
      setManualPayFormValue("mobile", "");
      setManualPayFormValue("amount", "");
    };
  }, []);

  const onManualPayFormSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append(
        "amount",
        typeof data.amount === "string"
          ? data.amount.replace(/,/g, "") / 10
          : data.amount / 10,
      );
      formData.append("description", data.description);
      if (data.attachment[0]) {
        formData.append("attachment", data.attachment[0]);
      }

      const response = await axios.post(
        `user/units/${unit.id}/addInvoice`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        resetManualPayForm();
        toggleManualPayModal();
        refreshData();
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        for (const key in error.response.data.errors) {
          toast.error(error.response.data.errors[key]);
          setManualPayFormError(key, error.response.data.errors[key]);
        }
      } else {
        console.log(error);
      }
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={manualPayModal}
      toggle={toggleManualPayModal}
      centered={true}
      color="primary"
    >
      <ModalHeader toggle={toggleManualPayModal}>
        ثبت پرداخت دستی بدهی : واحد {unit.unit_number}
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleManualPayFormSubmit(onManualPayFormSubmit)}>
          <Row>
            <div className="mb-2">
              <Label>شماره واحد</Label>
              <Controller
                name="unit_number"
                control={manualPayFormControl}
                render={({ field }) => (
                  <input
                    type="text"
                    className="form-control"
                    {...field}
                    disabled={true}
                  />
                )}
              />
            </div>
            <div className="mb-2">
              <Label>مبلغ (ریال)</Label>
              <Controller
                name="amount"
                control={manualPayFormControl}
                rules={{
                  required: "مبلغ را وارد کنید",
                }}
                render={({ field }) => (
                  <NumericFormat
                    style={{ direction: "ltr" }}
                    rules={{ required: "مبلغ را وارد کنید" }}
                    {...field}
                    customInput={Input}
                    thousandSeparator={true}
                  />
                )}
              />
              {manualPayFormErrors.amount && (
                <span className="text-danger">
                  {manualPayFormErrors.amount.message}
                </span>
              )}
            </div>
            <div className="mb-2">
              <Label>توضیحات</Label>
              <Controller
                name="description"
                control={manualPayFormControl}
                rules={{
                  required: "توضیحات را وارد کنید",
                }}
                render={({ field }) => (
                  <input type="text" className="form-control" {...field} />
                )}
              />
              {manualPayFormErrors.description && (
                <span className="text-danger">
                  {manualPayFormErrors.description.message}
                </span>
              )}
            </div>
            <div className="mb-2">
              <Label>فایل پیوست</Label>
              <input
                name="attachment"
                type="file"
                className="form-control form-control-lg"
                accept=".png, .jpg, .jpeg"
                {...registerManualPayForm("attachment")}
              />
              {manualPayFormErrors.attachment && (
                <span className="text-danger">
                  {manualPayFormErrors.attachment.message}
                </span>
              )}
            </div>
            <div className="px-2">
              <div className="mt-1 d-flex justify-content-center w-100">
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
            </div>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default ManualPayModal;
