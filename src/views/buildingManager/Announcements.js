import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";
import { Badge, Card, CardBody, CardFooter, CardLink, CardSubtitle, CardTitle, Col, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import FloatingAddButton from "../../components/FloatingAddButton";
import AddAnnouncementModal from "../../components/buildingManager/announcements/addAnnouncementModal";
import Swal from "sweetalert2/dist/sweetalert2.all";
import withReactContent from "sweetalert2-react-content";
import { useNavigate } from "react-router-dom";

const Announcements = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);

  const [showAddAnnouncementModal, setShowAddAnnouncementModal] =
    useState(false);

  const getAnnouncements = async () => {
    setLoading(true);
    const selectedUnitId = localStorage.getItem("selectedUnit");
    try {
      const response = await axios.get("/building_manager/announcements");
      setAnnouncements(response.data.data.announcements);
      setFilteredAnnouncements(response.data.data.announcements);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        console.log(err);
      }
    }
    setLoading(false);
  };

  const updatePublicStatus = async (id, status) => {
    setLoading(true);
    try {
      const response = await axios.put(
        "/building_manager/announcements/" + id,
        {
          is_public: status,
        }
      );
      toast.success(response.data.message);
      getAnnouncements();
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        console.log(err);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    getAnnouncements();
    return () => { };
  }, []);

  const MySwal = withReactContent(Swal);
  const buildingSlug = localStorage.getItem("buildingSlug");

  return (
    <>
      <LoadingComponent loading={loading} />
      <AddAnnouncementModal
        show={showAddAnnouncementModal}
        toggle={() => setShowAddAnnouncementModal(!showAddAnnouncementModal)}
        refreshData={getAnnouncements}
        setLoading={setLoading}
      />

      <Card className="mb-2" style={{
        backgroundColor: '#eed202',
      }}>
        <CardLink href="/buildingManager/smsMessage">
          <CardBody>
            <p className="text-center" style={{
              color: '#000',
              marginBottom: 0,
            }}>
              پیام فوری دارید؟   از پیام رسان پیامکی و یا صوتی استفاد کنید
            </p>
          </CardBody>
        </CardLink>


        <CardFooter style={{ textAlign: 'left', paddingTop: '8px', paddingBottom: '8px' }}>
          <CardLink href="/buildingManager/smsMessage" style={{
            color: 'green'
          }}>
            ایجاد پیام صوتی
          </CardLink>
        </CardFooter>
      </Card>
      <h3 className="text-center mb-2">اطلاعیه ها</h3>
      <p className="text-center mb-1">برای ساکنین (تکی و گروهی) و یا طرف حساب های مجتمع سند بدهکاری و بستانکاری و یا فاکتور پرداخت ایجاد کنید</p>
      <FloatingAddButton onClick={() => setShowAddAnnouncementModal(true)} text="افزودن اطلاعیه" />
      <FloatingAddButton onClick={() => navigate('/announcements/' + buildingSlug)} plusIcon={false} text="مشاهده اطلاعیه های عمومی" />
      <Row
        style={{
          maxHeight: "calc(100vh - 4.45rem - 75px)",
          overflowY: "auto",
        }}
      >
        <Col md="9" xs="12" className="m-auto">
          <Row className="pt-2">
            {filteredAnnouncements.map((announcement) => (
              <Col key={announcement.id} md={12}>
                <Card className="px-2 d-flex flex-row justify-content-between align-items-center">
                  <CardBody>
                    <div className="d-flex flex-row justify-content-end">
                      {announcement.is_public ? (
                        <Badge color="primary" className="me-2">
                          {announcement.is_public ? "عمومی" : "خصوصی"}
                        </Badge>) : <></>
                      }
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-danger"
                        size="lg"
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          MySwal.fire({
                            title: "آیا از حذف اطلاعیه مطمئن هستید؟",
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
                                .delete("/building_manager/announcements/" + announcement.id)
                                .then((response) => {
                                  toast.success(response.data.message);
                                  getAnnouncements();
                                })
                                .catch((err) => {
                                  if (
                                    err.response &&
                                    err.response.data.message
                                  ) {
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
                      />
                    </div>
                    <CardTitle className="mb-2">
                      <strong
                        style={{
                          color: "#37474F",
                        }}
                      >
                        {announcement.title}
                      </strong>
                    </CardTitle>
                    <CardSubtitle className="text-dark">
                      <p
                        dangerouslySetInnerHTML={{ __html: announcement.text }}
                      ></p>
                    </CardSubtitle>
                  </CardBody>
                </Card>
              </Col>
            ))}
            {filteredAnnouncements.length === 0 && (
              <AddAnnouncementModal
                show={showAddAnnouncementModal}
                toggle={() => setShowAddAnnouncementModal(!showAddAnnouncementModal)}
                refreshData={getAnnouncements}
                setLoading={setLoading}
                isModal={false}
              />
            )}
          </Row>
        </Col>

      </Row>
    </>
  );
};

export default Announcements;
