import { useState } from "react";
import { useEffect } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import axios from "axios";
import FloatingAddButton from "../../components/FloatingAddButton";
import { Button, Card } from "reactstrap";
import tableConfig from "../../configs/tableConfig";
import { useMediaQuery } from "react-responsive";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2/dist/sweetalert2.all";

import AddContactModal from "@src/components/buildingManager/contacts/addContactModal";
import LoadingComponent from "../../components/LoadingComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import EditContactModal from "../../components/buildingManager/contacts/editContactModal";
import { right } from "@popperjs/core";

const Contacts = () => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addContactModal, setAddContactModal] = useState(false);
  const [editContactModal, setEditContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const MySwal = withReactContent(Swal);

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/building_manager/contacts");
      setdata(response.data.data.contacts);
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
      name: "نام و نام خانوادگی",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "شماره تماس",
      selector: (row) => row.mobile,
      sortable: true,
    },
    {
      name: "دسته بندی",
      selector: (row) => row.category,
      sortable: true,
    },
    {
      name: "عملیات",
      selector: (row) => row.id,
      sortable: false,
      right: true,
      cell: (row) => (
        <div className="d-md-flex">
          <a
            onClick={() => {
              setSelectedContact(row);
              setEditContactModal(true);
            }}
          >
            <Button color="dark" className="d-none d-md-block mr-2" size="sm" outline>
              ویرایش
            </Button>
            <FontAwesomeIcon icon={faPencil} size="lg" className="text-dark d-md-none mr-2" />
          </a>
          <a
            color="danger"
            className="ms-1"
            size="sm"
            outline
            onClick={() => {
              MySwal.fire({
                title: "آیا از حذف مخاطب مطمئن هستید؟",
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
                    .delete("/building_manager/contacts/" + row.id)
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
      <AddContactModal
        show={addContactModal}
        toggle={() => setAddContactModal(!addContactModal)}
        refreshData={refreshData}
        setLoading={setLoading}
      />
      {selectedContact && (
        <EditContactModal
          show={editContactModal}
          toggle={() => setEditContactModal(!editContactModal)}
          refreshData={refreshData}
          setLoading={setLoading}
          contact={selectedContact}
        />
      )}
      <Card
        style={{
          minHeight: "89vh",
        }}
      >
        <div className="pb-5 pt-2">
          <h3 className="text-center mb-1">دفترچه تلفن</h3>
          <FloatingAddButton onClick={() => setAddContactModal(true)} text="افزودن مخاطب" />
          <DataTable
            title="دفترچه تلفن"
            columns={columns}
            data={data}
            {...tableConfig}
          />
        </div>
      </Card>
    </>
  );
};

export default Contacts;
