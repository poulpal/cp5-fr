import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  CardLink,
  Row,
  Col,
  CardFooter,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

import LoadingComponent from "../../components/LoadingComponent";
import PriceFormat from "../../components/PriceFormat";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import ChartCard from "../../components/buildingManager/stats/chartCard";
import SignContract from "../../components/buildingManager/signContract";
import moment from "moment-jalaali";
import { isNative, NativeAppVersion } from "../../utility/Utils";
import { buildingManagerNavigation } from "../../navigation/vertical";
import { Link } from "react-router-dom";
import PopUp from "../../components/PopUp";


const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [versionInfo, setVersionInfo] = useState(null);
  const [modal, setModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const getStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/building_manager/stats");
      setStats({
        ...response.data.data,
      });
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      }
      console.log(err);
    }
    setLoading(false);
  };

  const getVersionInfo = async () => {
    try {
      const response = await axios.get("public/version");
      setVersionInfo(response.data);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    getStats();
    getVersionInfo();
    return () => { };
  }, []);

  const openModal = (data) => {
    setModalData(data);
    setModal(true);
  }

  return (
    <>
      <LoadingComponent loading={loading} />
      <Modal
        isOpen={modal}
        centered={true}
        size="md"
        toggle={() => setModal(false)}
      >
        <ModalHeader toggle={() => setModal(false)}>{modalData?.title || ""}</ModalHeader>
        <ModalBody>
          {modalData?.children.map((item, index) => item.children ? (
            <>
              {item.children.map((child, index) => (
                <Link to={child.navLink || "#"} color="link" key={index}>
                  <Card className="d-flex flex-column justify-content-center align-items-center pt-1 pb-1">
                    <span className="fw-bold">{child.title}</span>
                  </Card>
                </Link>
              ))}
            </>
          ) : (
            <Link to={item.navLink || "#"} className="text-decoration-none" key={index}>
              <Card className="d-flex flex-column justify-content-center align-items-center pt-1 pb-1">
                <span className="fw-bold">{item.title}</span>
              </Card>
            </Link>
          ))}
        </ModalBody>
      </Modal>
      {stats && (
        <>
          {stats.popup && stats.popup.text && (
            <PopUp popup={stats.popup} />
          )}
          {stats.banner && stats.banner.text && (
            <Card className="mb-2" style={{
              backgroundColor: '#eed202',
            }}>
              {stats.banner.cta && stats.banner.cta_text ? (
                <CardLink href={stats.banner.cta}>
                  <CardBody>
                    <p className="text-center" style={{
                      color: '#000',
                      marginBottom: 0,
                    }}>
                      {stats.banner.text}
                    </p>
                  </CardBody>
                </CardLink>
              ) : (
                <CardBody>
                  <p className="text-center" style={{
                    color: '#000'
                  }}>
                    {stats.banner.text}
                  </p>
                </CardBody>
              )}

              {stats.banner.cta && stats.banner.cta_text && (
                <CardFooter style={{ textAlign: 'left', paddingTop: '8px', paddingBottom: '8px' }}>
                  <CardLink href={stats.banner.cta} style={{
                    color: 'green'
                  }}>
                    {stats.banner.cta_text}
                  </CardLink>
                </CardFooter>
              )}
            </Card>
          )}
          {!stats.signed_contract && (
            <SignContract setLoading={setLoading} stats={stats} />
          )}
          {versionInfo?.version && isNative() && (NativeAppVersion() !== versionInfo.version) && (
            <Card className="mb-2" style={{
              backgroundColor: '#eed202',
            }}>
              <CardLink href="">
                <CardBody>
                  <p className="text-center" style={{
                    color: '#000',
                    marginBottom: 0,
                  }}>
                    شما از آخرین نسخه نرم افزار استفاده نمی کنید. لطفا برای بهره مندی از امکانات جدید نرم افزار خود را به آخرین نسخه بروزرسانی کنید.
                  </p>
                  <Button color="primary" className="w-100 mt-2 mb-1" onClick={
                    () => {
                      window.open(versionInfo.urls.cafebazaar, "_blank");
                    }
                  }>بروزرسانی</Button>
                </CardBody>
              </CardLink>
            </Card>
          )}

        </>
      )}
      <Row>
        {buildingManagerNavigation.map((item, index) => (
          !item.hideInDashboard && (
            <Col key={index} xl={2} md={3} sm={4} xs={6}>
              {item.children ? (
                <Link to="#" color="link" onClick={(e) => {
                  e.preventDefault();
                  openModal(item);
                }}>
                  <Card className="d-flex flex-column justify-content-center align-items-center pt-3 pb-3">
                    <div className="mb-1" style={{ scale: "1.7" }}>
                      {item.icon}
                    </div>
                    <span className="fw-bold">{item.title}</span>
                  </Card>
                </Link>
              ) : (
                <Link to={item.navLink || "#"} className="text-decoration-none">
                  <Card className="d-flex flex-column justify-content-center align-items-center pt-3 pb-3">
                    <div className="mb-1" style={{ scale: "1.7" }}>
                      {item.icon}
                    </div>
                    <span className="fw-bold">{item.title}</span>
                  </Card>
                </Link>
              )}
            </Col>
          )
        ))}
      </Row>
    </>
  );
};

export default Dashboard;
