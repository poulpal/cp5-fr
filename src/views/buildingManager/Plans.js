import toast from "react-hot-toast";
import { NavLink, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Modal, ModalBody, ModalHeader, Nav, NavItem, Row } from "reactstrap";
import classNames from "classnames";
import PriceFormat from "../../components/PriceFormat";
import BuyPlanModal from "../../components/buildingManager/plans/buyPlanModal";
import { NumericFormat } from "react-number-format";

export default () => {
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [durations, setDurations] = useState([]);
    const [features, setFeatures] = useState([]);
    const [activePlan, setActivePlan] = useState(null);
    const [activeDuration, setActiveDuration] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const getPlans = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/public/plans");
            setPlans(response.data.data.plans);
            setDurations(response.data.data.durations);
            response.data.data.plans.map((plan) => {
                setFeatures([...features, ...plan.features]);
            })

        } catch (err) {
            toast.error("خطا در دریافت اطلاعات");
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        getPlans();
        const uniqueFeatures = [...new Set(features)];
        setFeatures(uniqueFeatures);
        return () => { };
    }, []);

    console.log(features);

    return (
        <>
            <LoadingComponent loading={loading} />
            <BuyPlanModal show={showModal} toggle={() => setShowModal(!showModal)} setLoading={setLoading} activePlan={activePlan} activeDuration={activeDuration} />
            <Card
                style={{
                    minHeight: "89vh",
                    padding: "1rem",
                }}
            >
                <div className="pb-5 pt-2">
                    <h3 className="text-center mb-1">اشتراک {import.meta.env.VITE_APP_NAME}</h3>
                    <Row>
                        <Col md={3} className="d-md-block d-none">
                            <Card className="plan-card">
                                <CardHeader style={{
                                    borderBottom: "solid 1px #e0e0e0",
                                    marginBottom: "1rem",
                                    color: "#fff",
                                    backgroundColor: "var(--bs-primary)"
                                }}>
                                    <span className="text-center w-100 text-white fs-4">ویژگی ها</span>
                                </CardHeader>
                                <CardBody>
                                    {features.map((feature) => (
                                        <div className="d-flex justify-content-center mb-1 fs-5 fw-bold text-center align-items-center" key={feature} style={{ 
                                            height: "35px"
                                         }}>
                                            {/* <span className="text-success me-1">✓</span> */}
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </CardBody>
                                <CardFooter>
                                    {durations.map((duration) => (
                                        <Button
                                            key={duration}
                                            style={{
                                                width: '100%',
                                            }}
                                            className="btn-primary mb-1 d-flex justify-content-center"
                                            onClick={() => {
                                            }}
                                        >
                                            <span>
                                                {duration} ماه
                                            </span>
                                        </Button>
                                    ))}
                                </CardFooter>
                            </Card>
                        </Col>
                        {plans.map((plan) => (
                            <Col md={3} key={plan.slug}>
                                <Card className="plan-card">
                                    <CardHeader style={{
                                        borderBottom: "solid 1px #e0e0e0",
                                        marginBottom: "1rem",
                                        color: "#fff",
                                        backgroundColor: "var(--bs-primary)"
                                    }}>
                                        <span className="text-center w-100 text-white fs-5">اشتراک {plan.title}</span>
                                    </CardHeader>
                                    <CardBody>
                                        {features.map((feature) => (
                                            <div className="d-flex justify-content-between justify-content-md-center align-items-center mb-1" key={feature} style={{ 
                                                height: "35px"
                                             }}>
                                                <span className="d-block d-md-none">{feature}</span>
                                                {plan.features.includes(feature) ? (
                                                    <span className="text-success me-1 fs-5">✓</span>
                                                ) : (
                                                    <span className="text-danger me-1 fs-5">✗</span>
                                                )}

                                            </div>
                                        ))}
                                    </CardBody>
                                    <CardFooter>
                                        {plan.durations.map((duration) => (
                                            <Button
                                                key={duration.months}
                                                style={{
                                                    width: '100%',
                                                }}
                                                className="btn-primary mb-1 d-flex justify-content-between justify-content-md-center"
                                                onClick={() => {
                                                    if (duration.price == 'call') {
                                                        return window.open(`tel:982191031869`, "_blank");
                                                    }
                                                    setActivePlan(plan);
                                                    setActiveDuration(duration);
                                                    setShowModal(true);
                                                }}
                                            >
                                                <span className="d-block d-md-none">
                                                    {duration.months} ماه
                                                </span>
                                                {duration.price == 'call' ? (<span> تماس بگیرید</span>) :
                                                    (<NumericFormat
                                                        value={duration.price / 1000}
                                                        displayType={"text"}
                                                        thousandSeparator={true}
                                                        decimalScale={4}
                                                    />)}
                                            </Button>
                                        ))}
                                    </CardFooter>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <span className="d-block w-100 text-center fs-5"> تمامی قیمت ها به هزار تومان است.</span>
                </div>
            </Card>
        </>
    );
};
