import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

import axios from "axios";
import toast from "react-hot-toast";
import { useEffect } from "react";

const EditContactModal = ({
  contact,
  show,
  toggle,
  refreshData,
  setLoading,
}) => {
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    reset(contact);

    return () => {};
  }, [contact]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.put(
        "building_manager/contacts/" + contact.id,
        data
      );
      toast.success(response.data.message);
      reset();
      refreshData();
      toggle();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        console.log(err);
      }
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={show} centered={true} size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle}>ویرایش مخاطب</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <Input {...field} type="text" placeholder="نام" />
              )}
            />
            {errors.name && <div className="text-danger">نام را وارد کنید</div>}
          </FormGroup>
          <FormGroup>
            <Controller
              name="mobile"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <Input {...field} type="text" placeholder="موبایل" />
              )}
            />
            {errors.mobile && (
              <div className="text-danger">موبایل را وارد کنید</div>
            )}
          </FormGroup>
          <FormGroup>
            <Controller
              name="category"
              control={control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <Input {...field} type="text" placeholder="دسته بندی" />
              )}
            />
            {errors.category && (
              <div className="text-danger">دسته بندی را وارد کنید</div>
            )}
          </FormGroup>
          <div className="mt-3 d-flex justify-content-center w-100">
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
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default EditContactModal;
