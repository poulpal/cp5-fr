import { useState } from "react";
import { useEffect } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import axios from "axios";
import FloatingAddButton from "../../components/FloatingAddButton";
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from "reactstrap";
import tableConfig from "../../configs/tableConfig";
import { useMediaQuery } from "react-responsive";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2/dist/sweetalert2.all";

import AddFcmMessageModal from "../../components/buildingManager/fcmMessages/addFcmMessageModal";
import LoadingComponent from "../../components/LoadingComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import moment from "moment-jalaali";
import PriceFormat from "../../components/PriceFormat";

export default () => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addFcmMessageModal, setAddFcmMessageModal] = useState(false);

  const MySwal = withReactContent(Swal);

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/building_manager/fcmMessages");
      setdata(response.data.data.fcmMessages);
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
      name: "متن",
      selector: (row) => row.pattern,
      cell: (row) => <p>{row.pattern}</p>,
      sortable: true,
      width: "50%",
    },
    // {
    //   name: "زمان ارسال",
    //   selector: (row) => moment(row.scheduled_at).format("jYYYY/jMM/jDD HH:mm"),
    //   cell: (row) => (
    //     <div className="d-flex flex-column justify-content-center align-items-center">
    //       <span>{moment(row.scheduled_at).format("jYYYY/jMM/jDD")}</span>
    //       <span>{moment(row.scheduled_at).format("HH:mm")}</span>
    //     </div>
    //   ),
    //   sortable: true,
    // },
    {
      name: "وضعیت",
      selector: (row) => row.status,
      cell: (row) =>
        row.status == 'completed' ? (
          <Badge color="success">ارسال شده</Badge>
        ) : (
          row.status == 'pending' ? (
            <Badge color="warning">در انتظار تایید</Badge>
          ) : (
            <Badge color="dark">{row.status}</Badge>
          )
        ),
      sortable: true,
    },
    {
      name: "تعداد شماره ها",
      selector: (row) => row.count,
      cell: (row) => <span>{row.count}</span>,
      sortable: true,
    },
    {
      name: "طول پیام",
      selector: (row) => row.length,
      cell: (row) => <span>{row.length}</span>,
      sortable: true,
    },
    {
      name: "تاریخ",
      selector: (row) => row.created_at,
      cell: (row) => (
        <div className="">
          <span>{moment(row.created_at).format("jYYYY/jMM/jDD HH:mm")}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "عملیات",
      selector: (row) => row.id,
      sortable: false,
      cell: (row) =>
        row.status === "pending" && (
          <div className="d-md-flex">
            <a
              color="danger"
              className="ms-1"
              size="sm"
              outline
              onClick={() => {
                MySwal.fire({
                  title: "آیا از حذف پیام مطمئن هستید؟",
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
                      .delete("/building_manager/fcmMessages/" + row.id)
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
          </div>
        ),
    },
  ];

  return (
    <>
      <LoadingComponent loading={loading} />
      <AddFcmMessageModal
        show={addFcmMessageModal}
        toggle={() => setAddFcmMessageModal(!addFcmMessageModal)}
        refreshData={refreshData}
        setLoading={setLoading}
      />

      <Card
        style={{
          minHeight: "58vh",
        }}
      >
        <div className="pb-5 pt-2">
          <h3 className="text-center mb-1">نوتیفیکیشن ها</h3>
          <p className="text-center mb-1">
            پیام های خود را به صورت نوتیفیکیشن روی اپلیکشن شارژپل بفرستید
          </p>
          <FloatingAddButton
            onClick={() => setAddFcmMessageModal(true)}
            text="نوتیفیکیشن جدید"
          />
          <DataTable
            title="پیام های متنی"
            columns={columns}
            data={data}
            {...tableConfig}
            noDataComponent={
              <AddFcmMessageModal
                show={addFcmMessageModal}
                toggle={() => setAddFcmMessageModal(!addFcmMessageModal)}
                refreshData={refreshData}
                setLoading={setLoading}
                isModal={false}
              />
            }
          />
        </div>
      </Card>
    </>
  );
};
