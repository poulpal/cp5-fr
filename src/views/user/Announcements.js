import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";
import { Card, CardBody, CardSubtitle, CardTitle, Col, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

const Announcements = () => {
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);

  const getAnnouncements = async () => {
    setLoading(true);
    const selectedUnitId = localStorage.getItem("selectedUnit");
    try {
      const response = await axios.get(
        "/user/announcements?unit=" + selectedUnitId
      );
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

  useEffect(() => {
    getAnnouncements();
    return () => {};
  }, []);

  return (
    <>
      <LoadingComponent loading={loading} />
      <h3 className="text-center mb-2">اطلاعیه ها</h3>
      <Row>
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
    </>
  );
};

export default Announcements;