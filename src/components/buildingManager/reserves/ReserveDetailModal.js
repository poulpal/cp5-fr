import { Controller, useForm } from "react-hook-form";
import {
  Badge,
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
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import tableConfig from "../../../configs/tableConfig";
import PriceFormat from "../../PriceFormat";

import moment from "moment-jalaali";

const columns = [
  {
    name: "نام و نام خانوادگی",
    selector: (row) => row.user.last_name,
    cell: (row) => row.user.first_name + " " + row.user.last_name,
    sortable: true,
  },
  {
    name: "شماره تماس",
    selector: (row) => row.user.mobile,
    cell: (row) => row.user.mobile,
    sortable: true,
  },
  {
    name: "هزینه",
    selector: (row) => row.cost,
    cell: (row) => <PriceFormat price={row.cost} />,
    sortable: true,
  },
  {
    name: "تاریخ",
    selector: (row) => row.start_time,
    cell: (row) => {
      const date = moment(row.start_time).format(
        "jYYYY/jMM/jDD"
      );
      return (
        <>
          <div>{date}</div>
        </>
      );
    },
    sortable: false,
  },
  {
    name: "زمان",
    selector: (row) => row.start_time,
    cell: (row) => {
      const start_time = moment(row.start_time).format(
        "HH:mm"
      );
      const end_time = moment(row.end_time).format(
        "HH:mm"
      );
      return (
        <>
          <div>{start_time + " - " + end_time}</div>
        </>
      );
    },
    sortable: false,
  },
  {
    name: "عملیات",
    selector: (row) => row.id,
    sortable: false,
    right: true,
    omit: true,
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
              <FontAwesomeIcon icon={faTrash} size="lg" className="text-danger d-md-none" />
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

const ReserveDetailModal = ({
  reserve,
  show,
  toggle,
  setLoading,
}) => {

  const [data, setdata] = useState([]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/building_manager/reservables/${reserve.id}`);
      setdata(response.data.data.reservable);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [reserve]);

  return (
    <Modal isOpen={show} centered={true} size="xl" toggle={toggle}>
      <ModalHeader toggle={toggle}>جزئیات {reserve.title}</ModalHeader>
      <ModalBody>
        <h1 className="h4 text-center">سابقه رزرو ها</h1>
        <DataTable
          title="رزرو ها"
          columns={columns}
          data={data.reservations}
          {...tableConfig}
        />
      </ModalBody>
    </Modal>
  );
};

export default ReserveDetailModal;
