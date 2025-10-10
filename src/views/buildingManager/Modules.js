import toast from "react-hot-toast";
import { NavLink, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Nav, NavItem, Row, UncontrolledTooltip } from "reactstrap";
import classNames from "classnames";
import PriceFormat from "../../components/PriceFormat";
import BuyModuleModal from "../../components/buildingManager/modules/buyModuleModal";
import { NumericFormat } from "react-number-format";
import { Checkbox } from "@mui/material";
import moment from "moment-jalaali";


import whatsapp from "@src/assets/images/icons/whatsapp.png";
import skype from "@src/assets/images/icons/skype.png";
import meet from "@src/assets/images/icons/meet.png";
import telegram from "@src/assets/images/icons/telegram.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneSquare } from "@fortawesome/free-solid-svg-icons";

const icons = [
    {
        title: "واتسپ",
        icon: whatsapp,
        link: "https://web.whatsapp.com/send?phone=982191031869&text=با درود  خواهشمند است برای مجتمع تحت مدیریت اینجانب یک اکانت دمو فعال نمایید",
    },
    // {
    //   title: "اسکایپ",
    //   icon: skype,
    //   link: "https://t.me/poulpal",
    // },
    // {
    //   title: "گوگل میت",
    //   icon: meet,
    //   link: "https://t.me/poulpal",
    // },
    {
        title: "تلگرام",
        icon: telegram,
        link: "https://t.me/chargepalir",
    },
    // {
    //   title: "تماس",
    //   icon: CallIcon,
    //   link: "tel:982191031869",
    // }
];

export default () => {
    const [loading, setLoading] = useState(false);
    const [modules, setModules] = useState([]);
    const [activeModules, setActiveModules] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);
    const [modal, setModal] = useState(false);

    const [discountCode, setDiscountCode] = useState(null);
    const [hasDiscount, setHasDiscount] = useState(false);
    const [discountValue, setDiscountValue] = useState(null);
    const [discountType, setDiscountType] = useState(null);
    const [initialDiscount, setInitialDiscount] = useState(false);

    const ua = navigator.userAgent;
    const isInApp = ua.indexOf("ChargePalApp") >= 0;

    const getModules = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/building_manager/modules");
            setModules(response.data.data.modules);
            setActiveModules(response.data.data.activeModules);

            if (response.data.data.discount_code) {
                try {
                    const response2 = await axios.post(
                        `building_manager/modules/checkDiscountCode`,
                        {
                            discount_code: response.data.data.discount_code,
                        }
                    );
                    if (response2.data.success) {
                        setDiscountValue(response2.data.data.value);
                        setDiscountType(response2.data.data.type);
                        setHasDiscount(true);
                        setDiscountCode(response.data.data.discount_code);
                        setInitialDiscount(true);

                        if (response2.data.data.type == 'percent') {
                            setModules(response.data.data.modules.map((group) => {
                                group.modules = group.modules.map((module) => {
                                    module.offer_before_price = module.price;
                                    module.price = module.price * (1 - response2.data.data.value / 100);
                                    module.is_on_offer = true;
                                    return module;
                                });
                                return group;
                            }));
                        }
                    }
                } catch (error) {
                }
            }
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

    const handleBuyModules = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `building_manager/modules/buy`,
                {
                    modules: selectedModules.map(e => e.slug),
                    discount_code: hasDiscount ? discountCode : null,
                }
            );
            if (response.data.success) {
                if (response.data.message) {
                    toast.success(response.data.message);
                    return location.reload();
                }
                const ua = navigator.userAgent;
                if (ua.indexOf("ChargePalApp") >= 0) {
                    return window.open(response.data.data.redirectUrl, "_blank");
                } else {
                    return window.location.replace(response.data.data.redirectUrl);
                }
                const { action, method, inputs } = response.data.data.redirect;
                const form = document.createElement("form");
                form.method = method;
                form.action = action;
                for (const key in inputs) {
                    if (inputs.hasOwnProperty(key)) {
                        const input = document.createElement("input");
                        input.type = "hidden";
                        input.name = key;
                        input.value = inputs[key];
                        form.appendChild(input);
                    }
                }
                document.body.appendChild(form);
                form.submit();
            }
        } catch (err) {
            if (err.response && err.response.data.errors) {
                for (const key in err.response.data.errors) {
                    toast.error(err.response.data.errors[key]);
                }
            } else {
                toast.error("خطا در خرید");
            }
            console.log(err);
        }
        setLoading(false);
    }

    const handleCheckDiscount = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `building_manager/modules/checkDiscountCode`,
                {
                    discount_code: discountCode ?? null,
                }
            );
            if (response.data.success) {
                setDiscountValue(response.data.data.value);
                setDiscountType(response.data.data.type);
                setLoading(false);
            }
        } catch (error) {
            if (error.response.data.errors) {
                for (const key in error.response.data.errors) {
                    toast.error(error.response.data.errors[key]);
                }
            }
            setLoading(false);
        }
    }

    return (
        <>
            <LoadingComponent loading={loading} />
            {/* <BuyModuleModal show={showModal} toggle={() => setShowModal(!showModal)} setLoading={setLoading} activeModule={activeModule}/> */}
            <Card
                style={{
                    minHeight: "89vh",
                    padding: "1rem",
                }}
            >
                <div className="pb-5 pt-2">
                    <h3 className="text-center mb-1">پکیج های {import.meta.env.VITE_APP_NAME}</h3>
                    <Row>
                        <Col md={9}>
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
                                            <th style={{ width: '20%' }}>تاریخ اتمام</th>
                                            <th style={{ width: '5%' }}>انتخاب</th>
                                        </tr>
                                        {group.modules.map((module) => {
                                            module.active = activeModules.map(e => e.slug).includes(module.slug);
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
                                                    <td>{activeModules.filter(e => e.slug == module.slug)[0]?.ends_at &&
                                                        moment(activeModules.filter(e => e.slug == module.slug)[0]?.ends_at).format("jYYYY/jMM/jDD")
                                                    }</td>
                                                    <td>
                                                        <Checkbox disabled={module.slug.startsWith('extra')} checked={selectedModules.map(e => e.slug).includes(module.slug)} onChange={(e) => {
                                                            if (e.target.checked) {
                                                                if (selectedModules.map(e => e.type).includes('base') && module.type == 'base') {
                                                                    setSelectedModules([...selectedModules.filter((e) => e.type !== 'base'), module]);
                                                                } else {
                                                                    setSelectedModules([...selectedModules, module]);
                                                                }
                                                            } else {
                                                                setSelectedModules(selectedModules.filter((e) => e.slug !== module.slug));
                                                            }
                                                        }} />
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </table>
                                </div>
                            ))}
                        </Col>
                        <Col md={3}>
                            {!isInApp ? (
                                <div className="mb-3">
                                    <h4 className="mb-1">
                                        صورتحساب
                                    </h4>
                                    <table className="table table-striped table-bordered table-hover table-sm">
                                        {selectedModules
                                            .sort((a, b) => a.order - b.order)
                                            .map((module) => {
                                                return (
                                                    <tr>
                                                        <td>{module.title}</td>
                                                        <td style={{ textAlign: 'left' }}>{module.price == 0 ? "رایگان" : <PriceFormat price={initialDiscount ? module.offer_before_price : module.price} decimalScale={0} showCurrency={false} />}</td>
                                                    </tr>
                                                )
                                            })}
                                    </table>
                                    {!initialDiscount && (
                                        <FormGroup switch className="py-1" >
                                            <Input type="switch" role="switch" id="discount" checked={hasDiscount} disabled={selectedModules.length == 0} onChange={(e) => setHasDiscount(e.target.checked)} />
                                            <Label check>کد تخفیف/ کد معرف دارم</Label>
                                        </FormGroup>
                                    )}

                                    {initialDiscount && (
                                        <hr></hr>
                                    )}
                                    
                                    {hasDiscount && !initialDiscount && (
                                        <Row className="pt-1 pb-1 px-1">
                                            <Col md="8" className="p-0">
                                                <Input type="text" size="sm" id="discount" value={discountCode} disabled={discountValue} onChange={(e) => setDiscountCode(e.target.value)} placeholder="کد تخفیف خود را وارد کنید" />
                                            </Col>
                                            <Col md="4" className="p-0">
                                                <Button block disabled={!discountCode || discountValue} color="primary" onClick={handleCheckDiscount}>
                                                    اعمال
                                                </Button>
                                            </Col>
                                        </Row>
                                    )}
                                    <table className="table table-striped table-bordered table-hover table-sm">
                                        <tr className="bg-light mt-3">
                                            <td>جمع کل</td>
                                            <td style={{ textAlign: 'left' }}><PriceFormat price={(() => {
                                                let total = selectedModules.reduce((a, b) => a + parseInt(initialDiscount ? b.offer_before_price : b.price), 0);
                                                return total;
                                            })()} decimalScale={0} showCurrency={false} /></td>
                                        </tr>
                                        {discountValue && (
                                            <tr>
                                                <td>تخفیف
                                                    {discountType == 'fixed' ? ' (ثابت)' : ' (' + discountValue + '%)'}
                                                </td>
                                                <td style={{ textAlign: 'left' }}><PriceFormat price={discountType == 'fixed' ? discountValue : (selectedModules.reduce((a, b) => a + parseInt(initialDiscount ? b.offer_before_price : b.price), 0) * discountValue / 100)} decimalScale={0} showCurrency={false} /></td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td>مالیات بر ارزش افزوده</td>
                                            <td style={{ textAlign: 'left' }}><PriceFormat price={(() => {
                                                let total = selectedModules.reduce((a, b) => a + parseInt(initialDiscount ? b.offer_before_price : b.price), 0);
                                                let vat = total * 0.1;
                                                return vat;
                                            })()} decimalScale={0} showCurrency={false} /></td>
                                        </tr>
                                        <tr className="bg-light">
                                            <td>مبلغ قابل پرداخت</td>
                                            <td style={{ textAlign: 'left' }}><PriceFormat price={
                                                (() => {
                                                    let total = selectedModules.reduce((a, b) => a + parseInt(initialDiscount ? b.offer_before_price : b.price), 0);
                                                    let vat = total * 0.1;
                                                    if (discountValue) {
                                                        total -= discountType == 'fixed' ? discountValue : (total * discountValue / 100);
                                                    }
                                                    total += vat;
                                                    return total;
                                                })()
                                            } decimalScale={0} showCurrency={false} /></td>
                                        </tr>
                                        <tr className="pt-5">
                                            <td colSpan={2}>
                                                <Button color="primary" disabled={selectedModules.length == 0} block onClick={handleBuyModules}>پرداخت</Button>
                                            </td>
                                        </tr>
                                    </table>
                                    <Modal isOpen={modal} toggle={() => setModal(!modal)} centered={true}>
                                        <ModalBody>
                                            <h3 className="text-center pt-3 pb-2">درخواست دمو {import.meta.env.VITE_APP_NAME}</h3>
                                            <div className="d-flex flex-row justify-content-between pb-2 px-sm-3 px-xs-1 px-2">
                                                {icons.map((icon, index) => (
                                                    <div key={index}>
                                                        <UncontrolledTooltip
                                                            placement="bottom"
                                                            target={"support_" + index}
                                                        >
                                                            {icon.title}
                                                        </UncontrolledTooltip>
                                                        <div id={"support_" + index} href="#">
                                                            <a
                                                                href={icon.link}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                key={index}
                                                            >
                                                                <img
                                                                    src={icon.icon}
                                                                    alt={icon.title}
                                                                    style={{
                                                                        width: "50px",
                                                                        height: "50px",
                                                                    }}
                                                                />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ModalBody>
                                    </Modal>
                                    <a onClick={() => setModal(!modal)} >
                                        <Button color="primary" block className="mt-1">
                                            درخواست دمو
                                        </Button>
                                    </a>
                                </div>
                            ) : (
                                <div className="mb-3">
                                    قابلیت خرید پکیج ها در این نسخه از اپلیکیشن فعال نمی باشد.
                                    برای خرید پکیج ها به وب سایت مراجعه کنید. یا با پشتیبانی تماس بگیرید.
                                </div>
                            )}
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
