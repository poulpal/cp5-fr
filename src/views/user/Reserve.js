import { Link, useParams } from "react-router-dom";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from "reactstrap";

import "@styles/base/pages/page-misc.scss";
import PriceFormat from "../../components/PriceFormat";
import NavbarComponent from "../../components/NavbarComponent";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Avatar from "@components/Avatar";
import LoadingComponent from "../../components/LoadingComponent";
import ReserveModal from "../../components/public/ReserveModal";

const Reserve = () => {
  const [building, setbuilding] = useState();
  const [reservables, setReservables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReserve, setSelectedReserve] = useState(null);
  const [reserveModal, setReserveModal] = useState(false);

  // if (!slug) {
  //   return <Navigate to="/" />;
  // }


  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const selectedUnitId = localStorage.getItem("selectedUnit");
        if (!selectedUnitId) return;
        const unitResponse = await axios.get("/user/units/" + selectedUnitId);
        const slug = unitResponse.data.data.unit.building.name_en;
        const response = await axios.get(
          `public/reserve/${slug}`
        );
        setbuilding(response.data.data.building);
        setReservables(response.data.data.reservables);
      } catch (err) {
        console.log(err);
        toast.error("خطا در دریافت اطلاعات");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
      setLoading(false);
    })();
    return () => { };
  }, []);

  return (
    <>
      {selectedReserve && (
        <ReserveModal
          reserve={selectedReserve}
          show={reserveModal}
          toggle={() => {
            setReserveModal(!reserveModal);
          }}
          setLoading={setLoading}
        />
      )}
      <LoadingComponent loading={loading} />
      <h3 className="text-center mb-2">رزرو مشاعات</h3>
      {building && (
        <div className="">
          <div className="p-2 pt-0 mt-1 mb-2">
            <div className="w-100">
              <Row>
                {reservables.map((reservable) => (
                  <Col md="4" className="mb-2" key={reservable.id}>
                    <Card className="text-center">
                      <CardHeader className="border-bottom">
                        <h3 className="text-center w-100">{reservable.title}</h3>
                      </CardHeader>
                      <CardBody className="mt-1 mb-0">
                        <p
                          dangerouslySetInnerHTML={{ __html: reservable.description }}
                        ></p>
                        <h6 className="d-flex flex-row justify-content-between">
                          <span className="font-weight-bold">هزینه / ساعت : </span>
                          <PriceFormat price={reservable.cost_per_hour} />
                        </h6>
                      </CardBody>
                      <CardFooter>
                        <Button
                          color="success"
                          className="w-100"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedReserve(reservable);
                            setReserveModal(true);
                          }}
                        >
                          رزرو
                        </Button>
                      </CardFooter>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Reserve;
