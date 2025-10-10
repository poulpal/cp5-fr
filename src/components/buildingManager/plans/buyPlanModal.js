import { Controller, useForm } from "react-hook-form";
import {
    Button,
    Col,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
} from "reactstrap";

import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import PriceFormat from "../../PriceFormat";
import { set } from "lodash";

const BuyPlanModal = ({ show, toggle, setLoading, activePlan, activeDuration }) => {
    const [discountCode, setDiscountCode] = useState(null);
    const [hasDiscount, setHasDiscount] = useState(false);
    const [discountedPrice, setDiscountedPrice] = useState(null);

    useEffect(() => {
        setDiscountedPrice(null);
        setDiscountCode(null);
        setHasDiscount(false);
    }, [show]);


    const handleBuyPlan = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `building_manager/plans/buyPlan`,
                {
                    plan: activePlan.slug,
                    duration: activeDuration.months,
                    discount_code: hasDiscount ? discountCode : null,
                }
            );
            if (response.data.success) {
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

    const handleCheckDiscount = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `building_manager/plans/checkDiscountCode`,
                {
                    plan: activePlan.slug,
                    duration: activeDuration.months,
                    discount_code: hasDiscount ? discountCode : null,
                }
            );
            if (response.data.success) {
                setDiscountedPrice(response.data.data.price);
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
        <Modal isOpen={show} toggle={toggle} className="modal-dialog-centered">
            <ModalHeader>
                <span className="text-center w-100 text-dark fs-5">خرید اشتراک {activePlan?.title} {activeDuration?.months} ماهه</span>
            </ModalHeader>
            <ModalBody>
                <FormGroup switch>
                    <Input type="switch" role="switch" id="discount" onChange={(e) => setHasDiscount(e.target.checked)} />
                    <Label check>کد تخفیف/ کد معرف دارم</Label>
                </FormGroup>
                {hasDiscount && (
                    <Row className="row-cols-lg-auto align-items-center mt-1">
                        <Col>
                            <Input type="text" id="discount" disabled={discountedPrice} onChange={(e) => setDiscountCode(e.target.value)} placeholder="کد تخفیف خود را وارد کنید" />

                        </Col>
                        <Col>
                            <Button disabled={!discountCode || discountedPrice} color="primary" onClick={handleCheckDiscount}>
                                اعمال
                            </Button>
                        </Col>
                    </Row>
                )}
                {!discountedPrice ? (
                    <Row>
                        <span className="mt-1 text-center w-100 ">
                            هزینه : <strong><PriceFormat price={activeDuration?.price} /></strong>
                        </span>
                    </Row>
                ) : (
                    <Row>
                        <span className="mt-1 text-center w-100 ">
                            هزینه : <strong><PriceFormat price={discountedPrice} /></strong>
                        </span>
                    </Row>
                )}
            </ModalBody>
            <ModalFooter>
                <Row className="w-100">
                    <Col md={6}>
                        <Button color="success" className="w-100" onClick={handleBuyPlan}>
                            پرداخت
                        </Button>
                    </Col>
                    <Col md={6}>
                        <Button color="gray" className="w-100" onClick={toggle}>
                            انصراف
                        </Button>

                    </Col>
                </Row>
            </ModalFooter>
        </Modal>
    );
};

export default BuyPlanModal;
