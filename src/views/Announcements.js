import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import LoadingComponent from "../components/LoadingComponent";
import { Card, CardBody, CardSubtitle, CardTitle, Col, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import NavbarComponent from "../components/NavbarComponent";
import Avatar from "@components/Avatar";

export default () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [building, setbuilding] = useState();
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);

  const getAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "/public/announcements?building=" + slug
      );
      setbuilding(response.data.data.building);
      setAnnouncements(response.data.data.announcements);
      setFilteredAnnouncements(response.data.data.announcements);
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        console.log(err);
      }
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
    setLoading(false);
  };

  useEffect(() => {
    getAnnouncements();
    return () => { };
  }, []);

  return (
    <>
      <NavbarComponent />
      <LoadingComponent loading={loading} />
      {building && (
        <div className="" style={{ minHeight: "89vh" }}>
          <div className="p-2 pt-0 mt-3 mb-2">
            <div className="w-100">
              <div className="d-flex align-items-center w-100 flex-column">
                <Avatar
                  className="avatar-stats p-50 m-0 mb-2"
                  color="success"
                  img={building.image}
                  imgHeight="140"
                  imgWidth="140"
                />
                <h4 className="">{building.name}</h4>
              </div>
              <Row >
                <Col md="9" xs="12" className="m-auto">
                  <Row className="pt-2">
                    {filteredAnnouncements.map((announcement) => (
                      <Col key={announcement.id} md={12}>
                        <Card className="px-2 d-flex flex-row justify-content-between align-items-center">
                          <CardBody>
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
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
