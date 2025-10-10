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

import AddVoiceMessageModal from "../../components/buildingManager/voiceMessages/addVoiceMessageModal";
import LoadingComponent from "../../components/LoadingComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import moment from "moment-jalaali";

export default () => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addVoiceMessageModal, setAddVoiceMessageModal] = useState(false);

  const ismobile = false;

  const MySwal = withReactContent(Swal);

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/building_manager/voiceMessages");
      setdata(response.data.data.voiceMessages);
      if (response.data.data.voiceMessages.length === 0) {
        setAddVoiceMessageModal(true);
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
      name: "تعداد واحد ها",
      selector: (row) => row.units,
      cell: (row) => <span>{row.units.length}</span>,
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
                      .delete("/building_manager/voiceMessages/" + row.id)
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
      <AddVoiceMessageModal
        show={addVoiceMessageModal}
        toggle={() => setAddVoiceMessageModal(!addVoiceMessageModal)}
        refreshData={refreshData}
        setLoading={setLoading}
      />
      <Card
        style={{
          minHeight: "89vh",
        }}
      >
        <div className="pb-5 pt-2">
          <h3 className="text-center mb-1">پیام های صوتی</h3>
          <p className="text-center mb-1">
          برای ساکنین پیام صوتی با تلفن ایجاد کنید. پیام متنی شما به صدا تبدیل شده و با تماس تلفنی اتوماتیک برای ساکنین ارسال می شود
          </p>
          <FloatingAddButton
            onClick={() => setAddVoiceMessageModal(true)}
            text="پیام صوتی جدید"
          />
          <DataTable
            title="پیام های صوتی"
            columns={columns}
            data={data}
            {...tableConfig}
          />
        </div>
      </Card>
    </>
  );
};
