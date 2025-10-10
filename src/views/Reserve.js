import { Link, useParams } from "react-router-dom";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from "reactstrap";

import "@styles/base/pages/page-misc.scss";
import PriceFormat from "../components/PriceFormat";
import NavbarComponent from "../components/NavbarComponent";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Avatar from "@components/Avatar";
import LoadingComponent from "../components/LoadingComponent";
import ReserveModal from "../components/public/ReserveModal";

const Reserve = () => {
  const { slug } = useParams();
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
        const response = await axios.get(
          `public/reserve/${slug}`
        );
        setbuilding(response.data.data.building);
        setReservables(response.data.data.reservables);
      } catch (err) {
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
      <NavbarComponent />
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
      {building && (
        <div className="">
          <div className="p-2 pt-0 mt-3 mb-2">
            <div className="w-100">
              <div className="d-flex align-items-center w-100 flex-column mb-4">
                <Avatar
                  className="avatar-stats p-50 m-0 mb-2"
                  color="success"
                  img={building.image}
                  imgHeight="200"
                  imgWidth="200"
                />

                <h4 className="">{building.name}</h4>
              </div>
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
