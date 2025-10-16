import toast from "react-hot-toast";
import { NavLink, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Nav, NavItem, Row } from "reactstrap";
import LoadingComponent from "../components/LoadingComponent";
import PriceFormat from "../components/PriceFormat";
import NavbarComponent from "../components/NavbarComponent";

export default () => {
    const [loading, setLoading] = useState(false);
    const [modules, setModules] = useState([]);
    const [activeModules, setActiveModules] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const [discountCode, setDiscountCode] = useState(null);
    const [hasDiscount, setHasDiscount] = useState(false);
    const [discountValue, setDiscountValue] = useState(null);
    const [discountType, setDiscountType] = useState(null);

    const getModules = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/public/modules");
            setModules(response.data.data.modules);
        } catch (err) {
            toast.error("خطا در دریافت اطلاعات");
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        getModules();
        return () => { };
    }, []);

    return (
        <>
            <NavbarComponent centerNavbarBrand={true} />
            <LoadingComponent loading={loading} />
            {/* <BuyModuleModal show={showModal} toggle={() => setShowModal(!showModal)} setLoading={setLoading} activeModule={activeModule}/> */}
            <Card
                style={{
                    // minHeight: "89vh",
                    padding: "1rem",
                }}
            >
                <div className="pb-0 pt-2">
                    <h3 className="text-center mb-1">پکیج های {import.meta.env.VITE_APP_NAME}</h3>
                    <Row>
                        <Col md={2}>
                        </Col>
                        <Col md={8}>
                            {modules.map((group) => (
                                <div className="mb-3">
                                    <h4 className="mb-1">
                                        {group.type}
                                    </h4>
                                    <table className="table table-striped table-bordered table-hover table-sm">
                                        <tr>
                                            <th style={{ width: '20%' }}>نام</th>
                                            <th style={{ width: '40%' }}>توضیحات</th>
                                            <th style={{ width: '20%' }}>قیمت</th>
                                        </tr>
                                        {group.modules.map((module) => {
                                            return (
                                                <tr>
                                                    <td>{module.title}</td>
                                                    <td>{module.description}</td>
                                                    <td>
                                                        {module.is_on_offer && module.offer_before_price != null && module.offer_before_price != 0 ?
                                                            <>
                                                                <PriceFormat price={module.offer_before_price / 1000} showCurrency={false} decimalScale={1} strikeThrough={true} />
                                                                {(module.price == 0 ? "رایگان" : <PriceFormat price={module.price / 1000} showCurrency={false} decimalScale={1} />)}
                                                            </>
                                                            : ""}
                                                        {!module.is_on_offer &&
                                                            (module.price == 0 ? "رایگان" : <PriceFormat price={module.price / 1000} showCurrency={false} decimalScale={1} />)}

                                                        {module.is_on_offer && module.offer_description != null ? <><br></br><span className="text-dark"> ({module.offer_description})</span></> : ""}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </table>
                                </div>
                            ))}
                        </Col>
                        <Col md={2}>
                        </Col>
                    </Row>
                </div>
                <strong className="text-center">
                    قیمت ها با واحد هزار تومان و مدت پکیج ها یکساله است
                </strong>
            </Card>
        </>
    );
};
