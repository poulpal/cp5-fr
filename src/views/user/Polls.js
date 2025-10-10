import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardSubtitle,
  CardTitle,
  Col,
  Row,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2/dist/sweetalert2.all";

const Polls = () => {
  const [loading, setLoading] = useState(false);
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);

  const MySwal = withReactContent(Swal);

  const getPolls = async () => {
    setLoading(true);
    const selectedUnitId = localStorage.getItem("selectedUnit");
    try {
      const response = await axios.get("/user/polls?unit=" + selectedUnitId);
      setPolls(response.data.data.polls);
      setFilteredPolls(response.data.data.polls);
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
    getPolls();
    return () => {};
  }, []);

  return (
    <>
      <LoadingComponent loading={loading} />
      <h3 className="text-center mb-2">نظرسنجی ها</h3>
      <Row>
        <Col md="9" xs="12" className="m-auto">
          <Row className="pt-2">
            {filteredPolls.map((poll) => (
              <Col key={poll.id} md={12}>
                <Card className="px-2 d-flex flex-row justify-content-between align-items-center">
                  <CardBody>
                    <CardTitle className="mb-2 d-flex justify-content-between">
                      <strong
                        style={{
                          color: "#37474F",
                        }}
                        className="me-2"
                      >
                        {poll.title}
                      </strong>
                      <small>
                        {poll.remaining_time == "pending" ? (
                          <Badge color="warning">شروع نشده</Badge>
                        ) : poll.remaining_time == "ended" ? (
                          <Badge color="dark">پایان یافته</Badge>
                        ) : (
                          <Badge color="success">{poll.remaining_time}</Badge>
                        )}
                      </small>
                    </CardTitle>
                    <CardSubtitle className="text-dark">
                      <p
                        dangerouslySetInnerHTML={{ __html: poll.description }}
                      ></p>
                    </CardSubtitle>
                    {poll.options.map((option, idx) => (
                      <div key={option.id} className="form-check">
                        {!poll.has_voted ? (
                          <input
                            className="form-check-input"
                            type="radio"
                            name={"poll" + poll.id}
                            id={"poll" + idx + "option" + idx}
                            value={idx}
                            disabled={
                              poll.remaining_time == "pending" ||
                              poll.remaining_time == "ended" ||
                              poll.has_voted
                            }
                            // checked={poll.has_voted && poll.vote == idx}
                          />
                        ) : (
                          <input
                            className="form-check-input"
                            type="radio"
                            name={"poll" + poll.id}
                            id={"poll" + idx + "option" + idx}
                            value={idx}
                            disabled={
                              poll.remaining_time == "pending" ||
                              poll.remaining_time == "ended" ||
                              poll.has_voted
                            }
                            checked={poll.has_voted && poll.vote == idx}
                          />
                        )}

                        <label
                          className="form-check-label"
                          htmlFor={"poll" + idx + "option" + idx}
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                    <Button
                      color="primary"
                      className="mt-2"
                      disabled={
                        poll.remaining_time == "pending" ||
                        poll.remaining_time == "ended" ||
                        poll.has_voted
                      }
                      onClick={() => {
                        const selectedOption = document.querySelector(
                          "input[name='poll" + poll.id + "']:checked"
                        ).nextSibling.textContent;
                        MySwal.fire({
                          title: `آیا از انتخاب ${selectedOption} مطمئن هستید؟`,
                          text: "این عملیات قابل بازگشت نیست!",
                          icon: "info",
                          showCancelButton: true,
                          customClass: {
                            confirmButton: "btn btn-primary",
                            cancelButton: "btn btn-dark ms-1",
                          },
                          confirmButtonText: "بله!",
                          cancelButtonText: "انصراف",
                        }).then((result) => {
                          if (result.isConfirmed) {
                            setLoading(true);
                            const selectedUnitId =
                              localStorage.getItem("selectedUnit");
                            axios
                              .post(`/user/polls/${poll.id}`, {
                                unit: selectedUnitId,
                                option: document.querySelector(
                                  "input[name='poll" + poll.id + "']:checked"
                                ).value,
                              })
                              .then((res) => {
                                toast.success(res.data.message);
                                getPolls();
                                setLoading(false);
                              })
                              .catch((err) => {
                                if (err.response && err.response.data.message) {
                                  toast.error(err.response.data.message);
                                } else {
                                  console.log(err);
                                }
                                setLoading(false);
                              });
                          }
                        });
                      }}
                    >
                      ثبت رای
                    </Button>
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

export default Polls;
