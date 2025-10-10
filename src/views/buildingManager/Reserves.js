import { useState } from "react";
import { useEffect } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import axios from "axios";
import FloatingAddButton from "../../components/FloatingAddButton";
import { Badge, Button, Card } from "reactstrap";
import tableConfig from "../../configs/tableConfig";
import { useMediaQuery } from "react-responsive";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2/dist/sweetalert2.all";
import PriceFormat from "../../components/PriceFormat";

import AddReserveModal from "../../components/buildingManager/reserves/AddReserveModal";
import LoadingComponent from "../../components/LoadingComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import moment from "moment-jalaali";
import EditReserveModal from "../../components/buildingManager/reserves/EditReserveModal";
import ReserveDetailModal from "../../components/buildingManager/reserves/ReserveDetailModal";
import { truncateString } from "../../utility/Utils";

const Reserves = () => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addReserveModal, setAddReserveModal] = useState(false);
  const [editReserveModal, setEditReserveModal] = useState(false);
  const [reserveDetailModal, setReserveDetailModal] = useState(false);
  const [selectedReserve, setSelectedReserve] = useState(null);

  const MySwal = withReactContent(Swal);

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/building_manager/reservables");
      setdata(response.data.data.reservables);
      if (response.data.data.reservables.length === 0) {
        setAddReserveModal(true);
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const columns = [
    {
      name: "عنوان",
      selector: (row) => row.title,
      cell: (row) => row.title,
      sortable: true,
    },
    {
      name: "توضیحات",
      selector: (row) => row.description,
      cell: (row) => <div className="text-warp">{truncateString(row.description, 50)}</div>,
      sortable: true,
    },
    {
      name: "وضعیت",
      selector: (row) => row.remaining_time,
      cell: (row) =>
        row.is_active ? (
          <Badge color="success">فعال</Badge>
        ) : (
          <Badge color="danger">غیرفعال</Badge>
        ),
      sortable: true,
    },
    {
      name: "هزینه / ساعت",
      selector: (row) => row.cost_per_hour,
      cell: (row) => <PriceFormat price={row.cost_per_hour} />,
      sortable: true,
    },
    {
      name: "رزرو های فعال",
      selector: (row) => row.active_reservations_count,
      cell: (row) => row.active_reservations_count,
      sortable: false,
    },
    {
      name: "عملیات",
      selector: (row) => row.id,
      sortable: false,
      right: true,
      cell: (row) =>
        <>
          <div className="d-md-flex">
            {false && (
              <a
                color="danger"
                className="ms-1"
                size="sm"
                outline
                onClick={() => {
                  MySwal.fire({
                    title: "آیا از حذف رزرو مطمئن هستید؟",
                    text: "این عملیات قابل بازگشت نیست!",
                    icon: "warning",
                    showCancelButton: true,
                    customClass: {
                      confirmButton: "btn btn-danger",
                      cancelButton: "btn btn-dark ms-1",
                    },
                    confirmButtonText: "بله، حذف شود!",
                    cancelButtonText: "انصراف",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setLoading(true);
                      axios
                        .delete("/building_manager/reserves/" + row.id)
                        .then((response) => {
                          toast.success(response.data.message);
                          setdata(data.filter((unit) => unit.id !== row.id));
                        })
                        .catch((err) => {
                          if (err.response && err.response.data.message) {
                            toast.error(err.response.data.message);
                          }
                          console.log(err);
                        })
                        .finally(() => {
                          setLoading(false);
                        });
                    }
                  });
                }}
              >
                <Button color="danger" className="d-none d-md-block mr-2" size="sm" outline>
                  حذف
                </Button>
                <FontAwesomeIcon icon={faTrash} size="lg" className="text-danger d-md-none mr-2" />
              </a>

            )}
            <a
              color="dark"
              className="ms-1"
              size="sm"
              outline
              onClick={() => {
                setSelectedReserve(row);
                setReserveDetailModal(true);
              }}
            >

              <Button color="dark" className="mr-2" size="sm" outline>
                جزئیات
              </Button>
            </a>
          </div>
        </>,
    },
  ];

  return (
    <>
      <LoadingComponent loading={loading} />
      <AddReserveModal
        show={addReserveModal}
        toggle={() => setAddReserveModal(!addReserveModal)}
        refreshData={refreshData}
        setLoading={setLoading}
      />
      {selectedReserve && (
        <>
          <EditReserveModal
            show={editReserveModal}
            toggle={() => setEditReserveModal(!editReserveModal)}
            refreshData={refreshData}
            setLoading={setLoading}
            reserve={selectedReserve}
          />
          <ReserveDetailModal
            show={reserveDetailModal}
            toggle={() => setReserveDetailModal(!reserveDetailModal)}
            refreshData={refreshData}
            setLoading={setLoading}
            reserve={selectedReserve}
          />
        </>
      )}
      <Card
        style={{
          minHeight: "89vh",
        }}
      >
        <div className="pb-5 pt-2">
          <h3 className="text-center mb-1">مشاعات</h3>
          <p className="text-center mb-1">
            فضاهای اشتراکی و مشاعات قابل استفاده ساکنین را مدیریت کنید!
          </p>
          <FloatingAddButton
            onClick={() => setAddReserveModal(true)}
            text="افزودن فضای اشتراکی"
          />
          <DataTable
            title="رزرو ها"
            columns={columns}
            data={data}
            {...tableConfig}
          />
        </div>
      </Card>
    </>
  );
};

export default Reserves;
