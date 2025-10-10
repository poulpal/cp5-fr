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

export default ({ show, setShow, setLoading, refreshData, data, allData }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setError,
        setValue,
    } = useForm();

    if (!data) return null;

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            formData.type = formData.type.value;
            const response = await axios.post(
                "building_manager/accounting/accounts/" + data.id,
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
        if (data) {
            const children = allData.filter((c) => c.parent_id === data.id);
            if (children.length === 0) {
                if (data.code.length === 1) {
                    setValue("code", data.code + "1");
                }
                if (data.code.length === 2) {
                    setValue("code", data.code + "01");
                }
                if (data.code.length === 4) {
                    setValue("code", data.code + "0001");
                }
            } else {
                const lastChild = children[children.length - 1];
                let newCode = parseInt(lastChild.code) + 1;
                setValue("code", newCode);
            }
            setValue("type", options.find((c) => c.value === data.type));
        }
    }, [data]);

    const options = [
        { label: "بدهکار", value: "debit" },
        { label: "بستانکار", value: "credit" },
        { label: "بدهکار/بستانکار", value: "both" }
    ];

    return (
        <Modal
            isOpen={show}
            centered={true}
            size="sm"
            toggle={() => setShow(false)}
            unmountOnClose={true}
        >
            <ModalHeader toggle={() => setShow(false)}>افزودن حساب</ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                        <Col md={12}>
                            <div className="mt-1">
                                <Label>افزودن به حساب</Label>
                                <Input value={data.name + " - " + data.code} type="text" readOnly />
                            </div>
                        </Col>
                        <Col md={12}>
                            <div className="mt-1">
                                <Label>نام حساب</Label>
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
                                <Label>کد حساب</Label>
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
                                            placeholder="کد حساب"
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
                                <Label>ماهیت حساب</Label>
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
                                <div className="text-danger">ماهیت حساب را وارد کنید</div>
                            )}
                        </Col>
                        <Col md={12}>
                            <div className="mt-1">
                                <Label>شرح حساب</Label>
                                <Controller
                                    name="description"
                                    rules={{ required: false }}
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => <Input {...field} type="text" />}
                                />
                            </div>
                            {errors.description && (
                                <div className="text-danger">شرح حساب را وارد کنید</div>
                            )}
                        </Col>
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
