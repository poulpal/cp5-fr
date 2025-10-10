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

const ChangePasswordModal = ({
  changePasswordModal,
  toggleChangePasswordModal,
  setLoading,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));
    if (user){
      setValue("mobile", user.mobile);
    }

    return () => {
      setValue("mobile", "");
    };
  }, []);

  const onFormSubmit = async (data) => {
    if (data.password !== data.password_confirmation) {
      setError("password_confirmation", {
        type: "manual",
        message: "تکرار رمز عبور با رمز عبور یکسان نیست",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`changePassword`, data);
      if (response.data.success) {
        toast.success(response.data.message);
        toggleChangePasswordModal();
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        for (const key in error.response.data.errors) {
          toast.error(error.response.data.errors[key]);
          setError(key, error.response.data.errors[key]);
        }
      } else {
        console.log(error);
      }
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={changePasswordModal}
      toggle={toggleChangePasswordModal}
      centered={true}
      color="primary"
    >
      <ModalHeader toggle={toggleChangePasswordModal}>
        تغییر رمز عبور
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit(onFormSubmit)}>
          <Row>
            <div className="mb-2">
              <Label>موبایل</Label>
              <Controller
                name="mobile"
                control={control}
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
              <Label>رمز عبور جدید</Label>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "رمز عبور جدید را وارد کنید",
                  minLength: {
                    value: 6,
                    message: "رمز عبور باید حداقل 6 کاراکتر باشد",
                  },
                }}
                render={({ field }) => (
                  <input type="password" className="form-control" {...field} />
                )}
              />
              {errors.password && (
                <span className="text-danger">{errors.password.message}</span>
              )}
            </div>
            <div className="mb-2">
              <Label>تکرار رمز عبور جدید</Label>
              <Controller
                name="password_confirmation"
                control={control}
                rules={{
                  required: "تکرار رمز عبور جدید را وارد کنید",
                  minLength: {
                    value: 6,
                    message: "رمز عبور باید حداقل 6 کاراکتر باشد",
                  },
                }}
                render={({ field }) => (
                  <input type="password" className="form-control" {...field} />
                )}
              />
              {errors.password_confirmation && (
                <span className="text-danger">
                  {errors.password_confirmation.message}
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

export default ChangePasswordModal;
