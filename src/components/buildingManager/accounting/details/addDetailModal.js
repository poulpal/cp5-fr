import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import {
    Button,
    Col,
    Form,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Row,
} from "reactstrap";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useEffect } from "react";
import moment from "moment-jalaali";
import Select from "react-select";
import themeConfig from "@configs/themeConfig";

export default ({ show, setShow, setLoading, refreshData, allData }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setError,
        setValue,
    } = useForm();

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            formData.type = formData.type.value;
            const response = await axios.post(
                "building_manager/accounting/details",
                formData
            );
            toast.success(response.data.message);
            reset();
            refreshData();
            setShow(false);
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            }
            if (err.response && err.response.data.error) {
                toast.error(err.response.data.error);
                setShow(false);
            }
            if (err.response && err.response.data.errors) {
                for (const [key, value] of Object.entries(err.response.data.errors)) {
                    setError(key, { message: value });
                    toast.error(value);
                }
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if (allData.length === 0) {
            setValue("code", "100001");
        } else {
            const lastChild = allData.sort((a, b) => b.code - a.code)[0];
            let newCode = parseInt(lastChild.code) + 1;
            setValue("code", newCode);
        }

    });

    const options = [
        { label: "شخص", value: "person" },
        { label: "صندوق", value: "cash" },
        { label: "بانک", value: "bank" },
        { label: "تنخواه گردان", value: "petty_cash" },
    ];

    return (
        <Modal
            isOpen={show}
            centered={true}
            size="sm"
            toggle={() => setShow(false)}
            unmountOnClose={true}
        >
            <ModalHeader toggle={() => setShow(false)}>افزودن تفضیل</ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                        <Col md={12}>
                            <div className="mt-1">
                                <Label>نام تفضیل</Label>
                                <Controller
                                    name="name"
                                    rules={{ required: true }}
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => <Input {...field} type="text" />}
                                />
                            </div>
                            {errors.name && (
                                <div className="text-danger">{errors.name.message}</div>
                            )}
                        </Col>
                        <Col md={12}>
                            <div className="mt-1">
                                <Label>کد تفضیل</Label>
                                <Controller
                                    name="code"
                                    control={control}
                                    defaultValue=""
                                    rules={{ required: "وارد کردن این فیلد الزامی است" }}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator={false}
                                            className="form-control"
                                            placeholder="کد تفضیل"
                                            inputMode="tel"
                                        />
                                    )}
                                />
                                {errors.code && (
                                    <div className="text-danger">{errors.code.message}</div>
                                )}
                            </div>
                        </Col>
                        <Col md={12}>
                            <div className="mt-1">
                                <Label>نوع تفضیل</Label>
                                <Controller
                                    name="type"
                                    rules={{ required: true }}
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) =>
                                        <Select
                                            styles={{
                                                control: (baseStyles, state) => ({
                                                    ...baseStyles,
                                                    border: "1px solid" + themeConfig.layout.primaryColor,
                                                    borderColor: themeConfig.layout.primaryColor,
                                                    height: "48px",
                                                    borderRadius: "20px",
                                                    boxShadow: state.isFocused
                                                        ? "0 3px 10px 0 rgba(34, 41, 47, 0.1)"
                                                        : "unset",
                                                }),
                                            }}
                                            noOptionsMessage={() => "..."}
                                            placeholder="انتخاب کنید"
                                            {...field}
                                            isClearable={false}
                                            options={options}
                                        />
                                    }
                                />
                            </div>
                            {errors.type && (
                                <div className="text-danger">نوع تفضیل را وارد کنید</div>
                            )}
                        </Col>
                        {/* <Col md={12}>
                            <div className="mt-1">
                                <Label>شرح تفضیل</Label>
                                <Controller
                                    name="description"
                                    rules={{ required: false }}
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => <Input {...field} type="text" />}
                                />
                            </div>
                            {errors.description && (
                                <div className="text-danger">شرح تفضیل را وارد کنید</div>
                            )}
                        </Col> */}
                    </Row>
                    <Row>
                        <div className="mt-3 d-flex justify-content-center w-100">
                            <Button
                                color="primary"
                                type="submit"
                                style={{
                                    minWidth: "150px",
                                }}
                            >
                                ثبت
                            </Button>
                        </div>
                    </Row>
                </Form>
            </ModalBody>
        </Modal>
    );
};
