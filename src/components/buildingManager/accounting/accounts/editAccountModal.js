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

export default ({ show, setShow, setLoading, refreshData, data }) => {
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
            if (data.parent_id) {
                formData.type = formData.type.value;
            } else {
                formData.type = null;
            }
            const response = await axios.put(
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
            } else {
                console.log(err);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if (data) {
            setValue("name", data.name);
            setValue("type", options.find((c) => c.value === data.type));
            setValue("description", data.description);
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
            <ModalHeader toggle={() => setShow(false)}>ویرایش حساب</ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
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
                                <div className="text-danger">نام حساب را وارد کنید</div>
                            )}
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
                    </Row>
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
