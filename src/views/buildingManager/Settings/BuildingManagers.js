import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Button, Card } from "reactstrap";
import tableConfig from "../../../configs/tableConfig";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2/dist/sweetalert2.all";
import FloatingAddButton from "../../../components/FloatingAddButton";
import LoadingComponent from "../../../components/LoadingComponent";
// توجه: مسیر صحیح با رعایت حروف بزرگ/کوچک
import AddBuildingManagerModal from "@src/components/buildingManager/buildingManagers/addBuildingManagerModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const MySwal = withReactContent(Swal);

const BuildingManagers = () => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addBuildingManagerModal, setAddBuildingManagerModal] = useState(false);

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/building_manager/buildingManagers");
      // پاسخ سرور: data.data.building_managers
      const list =
        res?.data?.data?.building_managers ??
        res?.data?.data ??
        res?.data ??
        [];
      setdata(Array.isArray(list) ? list : []);
    } catch (err) {
      const msg = err?.response?.data?.message || "خطا در دریافت فهرست مدیران";
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const removeManager = async (row) => {
    const confirm = await MySwal.fire({
      title: "حذف مدیر",
      text: "آیا از حذف این مدیر مطمئن هستید؟ این عملیات قابل بازگشت نیست.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "انصراف",
      confirmButtonColor: "#d33",
    });
    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const { data: resp } = await axios.delete(
        "/building_manager/buildingManagers/" + row.id
      );
      toast.success(resp?.message || "با موفقیت حذف شد");
      setdata((prev) => prev.filter((item) => item.id !== row.id));
    } catch (err) {
      const msg = err?.response?.data?.message || "حذف انجام نشد";
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "نام و نام خانوادگی",
      selector: (row) => row.last_name,
      cell: (row) => `${row.first_name || ""} ${row.last_name || ""}`.trim(),
      sortable: true,
    },
    {
      name: "شماره تماس",
      selector: (row) => row.mobile,
      sortable: true,
    },
    {
      name: "دسترسی",
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => {
        // نگاشت نوع دسترسی به برچسب فارسی
        const labels = {
          main: "مدیر اصلی",
          "hsh-1": "حسابداری",
          other: "فقط مشاهده",
          superadmin: "سوپرادمین", // اگر از API بازگردد، صرفاً برای نمایش
        };
        return labels[row.type] ?? row.type ?? "-";
      },
    },
    {
      name: "عملیات",
      selector: (row) => row.id,
      sortable: false,
      right: true,
      cell: (row) => (
        <div className="d-flex">
          <Button
            color="link"
            className="text-danger p-0"
            title="حذف"
            onClick={() => removeManager(row)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <LoadingComponent loading={loading} />
      <Card className="p-2">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="m-0">مدیران</h5>
          <Button
            color="primary"
            onClick={() => setAddBuildingManagerModal(true)}
          >
            افزودن مدیر
          </Button>
        </div>

        <DataTable title="مدیران" columns={columns} data={data} {...tableConfig} />

        <FloatingAddButton
          onClick={() => setAddBuildingManagerModal(true)}
          text="افزودن مدیر"
        />
      </Card>

      <AddBuildingManagerModal
        show={addBuildingManagerModal}
        toggle={() => setAddBuildingManagerModal(false)}
        refreshData={loadList}
        setLoading={setLoading}
      />
    </>
  );
};

export default BuildingManagers;
