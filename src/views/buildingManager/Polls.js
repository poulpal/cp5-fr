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

import AddPollModal from "../../components/buildingManager/polls/AddPollModal";
import LoadingComponent from "../../components/LoadingComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faEye,
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import moment from "moment-jalaali";
import EditPollModal from "../../components/buildingManager/polls/EditPollModal";
import { truncateString } from "../../utility/Utils";
import VotesModal from "../../components/buildingManager/polls/votesModal";
import RenewPollModal from "../../components/buildingManager/polls/RenewPollModal";

const Polls = () => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addPollModal, setAddPollModal] = useState(false);
  const [editPollModal, setEditPollModal] = useState(false);
  const [votesModal, setVotesModal] = useState(false);
  const [renewPollModal, setRenewPollModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);

  const MySwal = withReactContent(Swal);

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/building_manager/polls");
      setdata(response.data.data.polls);
      if (response.data.data.polls.length === 0) {
        setAddTollModal(true);
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
      name: "گزینه ها",
      selector: (row) => row.options,
      cell: (row) => <div className="text-warp">
        {row.options.map((option) => <div>{option}<br /></div>)}
      </div>,
      sortable: false,
    },
    {
      name: "وضعیت",
      selector: (row) => row.remaining_time,
      cell: (row) =>
        row.remaining_time == 'pending' ? (
          <Badge color="warning">شروع نشده</Badge>
        ) : (
          row.remaining_time == 'ended' ? (
            <Badge color="dark">پایان یافته</Badge>
          ) : (
            <Badge color="success">{row.remaining_time}</Badge>
          )
        ),
      sortable: true,
    },
    {
      name: "زمان پایان",
      selector: (row) => moment(row.ends_at).format("jYYYY/jMM/jDD HH:mm"),
    },
    {
      name: "تعداد رای ها",
      selector: (row) => row.votes_count,
      cell: (row) => row.votes_count,
      sortable: false,
    },
    {
      name: "عملیات",
      selector: (row) => row.id,
      sortable: false,
      right: true,
      cell: (row) =>
      (
        <div className="d-md-flex">
          {/* <a
            color="info"
            className=""
            size="sm"
            outline
            onClick={() => {
              setSelectedPoll(row);
              setVotesModal(true);
            }}
          >
            {ismobile ? (
              <FontAwesomeIcon icon={faEye} size="lg" />
            ) : (
              <Button color="info" className="me-1" size="sm" outline>
                مشاهده
              </Button>
            )}
          </a> */}
          {row.remaining_time !== "pending" && (
            <>
              <a
                color="success"
                className=""
                size="sm"
                outline
                onClick={() => {
                  setSelectedPoll(row);
                  setRenewPollModal(true);
                }}
              >
                <Button color="success" className="me-1" size="sm" outline>
                  تمدید زمان
                </Button>
              </a>
            </>
          )}
          {(row.remaining_time === "pending" || row.votes_count == 0) && (
            <a
              color="danger"
              className=""
              size="sm"
              outline
              onClick={() => {
                MySwal.fire({
                  title: "آیا از حذف نظرسنجی مطمئن هستید؟",
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
                      .delete("/building_manager/polls/" + row.id)
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
        </div>
      )
    },
  ];

  return (
    <>
      <LoadingComponent loading={loading} />
      <AddPollModal
        show={addPollModal}
        toggle={() => setAddPollModal(!addPollModal)}
        refreshData={refreshData}
        setLoading={setLoading}
      />
      {selectedPoll && (
        <>
          <EditPollModal
            show={editPollModal}
            toggle={() => setEditPollModal(!editPollModal)}
            refreshData={refreshData}
            setLoading={setLoading}
            poll={selectedPoll}
          />
          <VotesModal
            show={votesModal}
            toggle={() => setVotesModal(!votesModal)}
            poll={selectedPoll}
          />
          <RenewPollModal
            show={renewPollModal}
            toggle={() => setRenewPollModal(!renewPollModal)}
            refreshData={refreshData}
            setLoading={setLoading}
            poll={selectedPoll}
          />
        </>
      )}
      <Card
        style={{
          minHeight: "89vh",
        }}
      >
        <div className="pb-5 pt-2">
          <h3 className="text-center mb-1">انتخاب / نظرسنجی</h3>
          <p className="text-center mb-1">
            انتخابات و نظرسنجی های مجتمع خود را آنلاین و با امنیت کامل برگزار کنید!
          </p>
          <FloatingAddButton
            onClick={() => setAddPollModal(true)}
            text="افزودن نظرسنجی"
          />
          <DataTable
            title="نظرسنجی ها"
            columns={columns}
            data={data}
            {...tableConfig}
          />
        </div>
      </Card>
    </>
  );
};

export default Polls;
