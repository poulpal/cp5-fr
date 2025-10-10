import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

import axios from "axios";
import toast from "react-hot-toast";

const AddAnnouncementModal = ({ show, setShow, setLoading, refreshData, isModal = true }) => {
  if (!isModal) {
    return (
      <div className="px-1 pt-2 pb-2 w-100">
        <_AddAnnouncementModal
          show={show}
          setShow={setShow}
          setLoading={setLoading}
          refreshData={refreshData}
        />
      </div>
    );
  }
  return (
    <Modal
      isOpen={show}
      centered={true}
      size="lg"
      toggle={() => setShow(false)}
    >
      <ModalHeader toggle={() => setShow(false)}>ثبت اطلاعیه جدید</ModalHeader>
      <_AddAnnouncementModal
        show={show}
        setShow={setShow}
        setLoading={setLoading}
        refreshData={refreshData}
      />
    </Modal>
  );
}

const _AddAnnouncementModal = ({ show, toggle, refreshData, setLoading }) => {
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post("building_manager/announcements", data);
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
    <ModalBody>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-1">
          <Label>عنوان</Label>
          <Controller
            name="title"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => (
              <Input {...field} type="text" placeholder="عنوان" />
            )}
          />
          {errors.title && <div className="text-danger">عنوان را وارد کنید</div>}
        </div>
        <div className="mt-1">
          <Label>وضعیت نمایش</Label>
          <Controller
            name="is_public"
            control={control}
            defaultValue={true}
            render={({ field }) => (
              <Input {...field} type="select" className="form-control">
                <option value="1">عمومی</option>
                <option value="0">فقط در پنل</option>
              </Input>
            )}
          />
        </div>
        <div className="mt-1">
          <Label>متن اطلاعیه</Label>
          <Controller
            name="text"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => (
              <Input {...field} type="textarea" placeholder="متن" style={{ minHeight: "150px" }} />
            )}
          />
          {errors.text && <div className="text-danger">متن را وارد کنید</div>}
        </div>

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
      </Form>
    </ModalBody>
  );
};

export default AddAnnouncementModal;
