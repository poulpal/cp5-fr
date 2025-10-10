import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";
import {
  Card,
  CardBody,
  CardSubtitle,
  CardTitle,
  Col,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faPhoneAlt } from "@fortawesome/free-solid-svg-icons";

import CallIcon from "@src/assets/images/icons/call.svg";
import CopyIcon from "@src/assets/images/icons/copy.svg";

const Contacts = () => {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);

  const getContacts = async () => {
    setLoading(true);
    const selectedUnitId = localStorage.getItem("selectedUnit");
    try {
      const response = await axios.get("/user/contacts?unit=" + selectedUnitId);
      setContacts(response.data.data.contacts);
      setFilteredContacts(response.data.data.contacts);
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
    getContacts();
    return () => {};
  }, []);

  return (
    <>
      <LoadingComponent loading={loading} />
      <h3 className="text-center mb-2">دفترچه تماس</h3>
      <Row>
        <Col md="9" xs="12" className="m-auto">
          <Row className="pt-2">
            {filteredContacts.map((contact) => (
              <Col key={contact.id} md={6} sm={6} xs={12}>
                <Card className="px-2 d-flex flex-row justify-content-between align-items-center">
                  <CardBody>
                    <CardTitle className="mb-2">{contact.name}</CardTitle>
                    <a href={"tel:" + contact.mobile}>
                      <CardTitle className="mb-2">{contact.mobile}</CardTitle>
                    </a>
                    <CardSubtitle className="text-muted">
                      {contact.category}
                    </CardSubtitle>
                  </CardBody>
                  <UncontrolledTooltip
                    placement="right"
                    target={"copy-" + contact.id}
                  >
                    کپی شماره
                  </UncontrolledTooltip>
                  <div id={"copy-" + contact.id}>
                    <img
                      src={CopyIcon}
                      alt="copy"
                      style={{
                        width: "26px",
                        height: "26px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(contact.mobile);
                        toast.success("شماره تماس کپی شد");
                      }}
                    />
                  </div>
                  <UncontrolledTooltip
                    placement="right"
                    target={"call-" + contact.id}
                  >
                    تماس
                  </UncontrolledTooltip>
                  <a href={"tel:" + contact.mobile} id={"call-" + contact.id}>
                    <img
                      src={CallIcon}
                      alt="call"
                      style={{
                        width: "26px",
                        height: "26px",
                        cursor: "pointer",
                        marginRight: "5px",
                        marginLeft: "5px",
                      }}
                    />
                  </a>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default Contacts;
