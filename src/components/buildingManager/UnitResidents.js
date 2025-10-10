import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { NumericFormat } from "react-number-format";
import {
  Button,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import withReactContent from "sweetalert2-react-content";
import AddResidentModal from "./addUnit/AddResidentModal";

const UnitResidents = ({
  unit,
  unitDetailModal,
  setUnitDetailModal,
  setLoading,
  refreshData,
}) => {
  const [residents, setResidents] = useState([]);
  const [addResidentModal, setAddResidentModal] = useState(false);

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    setResidents(unit.residents);
  }, []);

  return (
    <Row>
      <AddResidentModal
        unit={unit}
        addResidentModal={addResidentModal}
        setAddResidentModal={setAddResidentModal}
        setLoading={setLoading}
        refreshData={refreshData}
        setResidents={setResidents}
      />
      <Label> اطلاعات ساکنین</Label>
      <div>
        <Button
          color="success"
          size="sm"
          type="button"
          onClick={() => setAddResidentModal(true)}
        >
          افزودن ساکن
        </Button>
      </div>
      <Col>
        {residents.map((resident) => (
          <Row key={resident.id}>
            <Col md={6}>
              <div className="mb-2">
                <Label>نام</Label>
                <Input
                  type="text"
                  value={resident.first_name}
                  readOnly={true}
                />
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-2">
                <Label>نام خانوادگی</Label>
                <Input type="text" value={resident.last_name} readOnly={true} />
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-2">
                <Label>شماره موبایل</Label>
                <Input type="text" value={resident.mobile} readOnly={true} />
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-2">
                <Label>وضعیت</Label>
                <Input
                  type="text"
                  value={resident.ownership == "owner" ? "مالک" : "مستاجر"}
                  readOnly={true}
                />
              </div>
            </Col>
            <Col md={12}>
              <div className="mb-2 d-flex justify-content-center">
                <a
                  color="danger"
                  size="sm"
                  outline
                  onClick={() => {
                    MySwal.fire({
                      title: "آیا از حذف ساکن مطمئن هستید؟",
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
                          .delete(
                            "/building_manager/units/" +
                              unit.id +
                              "/residents/" +
                              resident.id
                          )
                          .then((response) => {
                            toast.success(response.data.message);
                            const filteredResidents = residents.filter(
                              (r) => r.id != resident.id
                            );
                            setResidents(filteredResidents);
                            refreshData();
                            if (filteredResidents.length == 0) {
                              setUnitDetailModal(false);
                            }
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
                  <Button color="danger" size="sm" outline type="button">
                    حذف ساکن
                  </Button>
                </a>
              </div>
            </Col>
          </Row>
        ))}
      </Col>
    </Row>
  );
};

export default UnitResidents;
