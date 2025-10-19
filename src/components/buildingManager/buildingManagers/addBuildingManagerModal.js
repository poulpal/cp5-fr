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

const AddBuildingManagerModal = ({ show, toggle, refreshData, setLoading }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setLoading?.(true);
    try {
      // بک‌اند انتظار فیلدهای: first_name, last_name?, mobile, type (in: main, other, hsh-1)
      const payload = {
        first_name: (formData.first_name || "").trim(),
        last_name: (formData.last_name || "").trim(),
        mobile: (formData.mobile || "").trim(),
        type: formData.type, // 'main' | 'hsh-1' | 'other'
      };

      const { data } = await axios.post("building_manager/buildingManagers", payload);
      toast.success(data?.message || "با موفقیت ثبت شد");
      reset();
      refreshData?.();
      toggle?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.type?.[0] ||
        "خطا در ثبت مدیر";
      toast.error(msg);
      // اگر تلاش برای انتخاب 'main' باشد، سرور 402 برمی‌گرداند
      // و پیام مناسب را نمایش می‌دهیم.
    } finally {
      setLoading?.(false);
    }
  };

  return (
    <Modal isOpen={show} toggle={toggle} centered size="md">
      <ModalHeader toggle={toggle}>افزودن مدیر ساختمان</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>نام</Label>
            <Controller
              name="first_name"
              control={control}
              defaultValue=""
              rules={{ required: true, minLength: 2 }}
              render={({ field }) => <Input {...field} type="text" placeholder="نام" />}
            />
            {errors.first_name && (
              <div className="text-danger mt-1">نام را وارد کنید (حداقل ۲ کاراکتر)</div>
            )}
          </FormGroup>

          <FormGroup>
            <Label>نام خانوادگی</Label>
            <Controller
              name="last_name"
              control={control}
              defaultValue=""
              render={({ field }) => <Input {...field} type="text" placeholder="نام خانوادگی" />}
            />
          </FormGroup>

          <FormGroup>
            <Label>موبایل</Label>
            <Controller
              name="mobile"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                pattern: /(09)[0-9]{9}/,
              }}
              render={({ field }) => <Input {...field} type="text" placeholder="مثال: 09121234567" />}
            />
            {errors.mobile && (
              <div className="text-danger mt-1">موبایل معتبر وارد کنید (09XXXXXXXXX)</div>
            )}
          </FormGroup>

          <FormGroup>
            <Label>دسترسی</Label>
            <Controller
              name="type"
              control={control}
              defaultValue="hsh-1" // پیش‌فرض: حسابداری
              rules={{ required: true }}
              render={({ field }) => (
                <select className="form-control" {...field}>
                  {/* طبق محدودیت بک‌اند، تغییر/انتخاب مدیر اصلی از این مسیر مجاز نیست */}
                  <option value="main" disabled>
                    مدیر اصلی (دسترسی کامل)
                  </option>
                  <option value="hsh-1">حسابداری</option>
                  <option value="other">فقط مشاهده</option>
                </select>
              )}
            />
            {errors.type && <div className="text-danger mt-1">نوع دسترسی را انتخاب کنید</div>}

            <div className="text-muted mt-2">
              مدیر اصلی: دسترسی کامل <span className="text-danger">— تغییر از این قسمت غیرفعال است</span>
            </div>
            <div className="text-muted">حسابداری: دسترسی به بخش‌های مالی و گزارش‌ها</div>
            <div className="text-muted">فقط مشاهده: دسترسی صرفاً نمایشی به اکثر بخش‌ها</div>
          </FormGroup>

          <div className="mt-3 d-flex justify-content-center w-100">
            <Button
              color="primary"
              type="submit"
              style={{ minWidth: "150px" }}
            >
              ثبت
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default AddBuildingManagerModal;
