import { Controller, useForm } from "react-hook-form";
import {
    Badge,
    Button,
    Col,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Row,
} from "reactstrap";

import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian_en from "react-date-object/locales/gregorian_en";

import _ from 'lodash';
import moment from "moment-jalaali";
import { NumericFormat } from "react-number-format";

const ReserveModal = ({
    reserve,
    show,
    toggle,
    setLoading,
}) => {

    const {
        control,
        register,
        reset,
        handleSubmit,
        setError,
        setValue,
        formState: { errors },
    } = useForm();

    const [data, setdata] = useState([]);
    const [date, setDate] = useState(null);
    const [startRange, setStartRange] = useState([]);
    const [endRange, setEndRange] = useState([]);

    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            data.date = moment(data.date).format("YYYY-MM-DD");
            const response = await axios.post(`public/reserve/${reserve.id}`, data);
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
        } catch (err) {
            setLoading(false);
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            } else {
                if (err.response && err.response.data.errors) {
                    Object.keys(err.response.data.errors).forEach((key) => {
                        toast.error(err.response.data.errors[key][0]);
                    });
                } else {
                    console.log(err);
                }
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        handleChangeDate();
    }, [date, startTime, endTime]);

    const handleChangeDate = () => {
        if (!date) {
            setStartRange([]);
            setEndRange([]);
            return;
        }

        const availableHours = reserve.available_hours;
        const activeReservations = reserve.active_reservations;
        const date_moment = moment(date);
        const weekEnum = {
            0: 'sunday',
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday'
        }

        const this_date_active_reservations = activeReservations.filter((reservation) => {
            const reservation_date = moment(reservation.start_time);
            return reservation_date.isSame(date_moment, 'year') && reservation_date.isSame(date_moment, 'month') && reservation_date.isSame(date_moment, 'day');
        });



        const day = weekEnum[date_moment.day()];
        if (!availableHours[day].enabled) {
            setStartRange([]);
            setEndRange([]);
        } else {
            const currentHour = moment().hour();
            let start = parseInt(availableHours[day].start);
            const end = parseInt(availableHours[day].end);

            if (date.getDate() == moment().date() && date.getMonth() == moment().month() && date.getFullYear() == moment().year()) {
                start = start > currentHour + 1 ? start : currentHour + 1;
            }
            let startRange = _.range(start, end);
            let endRange = _.range(parseInt(startTime) + 1, end + 1);

            this_date_active_reservations.forEach((reservation, index) => {
                const reservation_start = moment(reservation.start_time).hour();
                const reservation_end = moment(reservation.end_time).hour();
                const reservation_range = _.range(reservation_start, reservation_end);

                startRange = _.difference(startRange, reservation_range);
                endRange = _.difference(endRange, reservation_range);
            });

            let maxLen = 1000;
            if (startTime) {
                this_date_active_reservations.forEach((reservation, index) => {
                    if (moment(reservation.start_time).hour() > startTime) {
                        let len = moment(reservation.start_time).hour() - startTime;
                        if (len < maxLen) {
                            maxLen = len;
                        }
                    }
                });
            }

            if (maxLen != 1000) {
                endRange = _.range(parseInt(startTime) + 1, parseInt(startTime) + 1 + maxLen);
            }

            setStartRange(startRange);
            setEndRange(endRange);
        }
    }


    return (
        <Modal isOpen={show} centered={true} size="lg" toggle={toggle}>
            <ModalHeader toggle={toggle}>رزرو {reserve.title}</ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mt-1">
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required: true }}
                            defaultValue={reserve.title}
                            render={({ field }) => (
                                <Input {...field} type="text" placeholder="عنوان" disabled />
                            )}
                        />
                        {errors.title && (
                            <div className="text-danger">عنوان را وارد کنید</div>
                        )}
                    </div>
                    <div className="mt-1">
                        <Label>نام</Label>
                        <Controller
                            name="first_name"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input {...field} type="text" placeholder="نام" />
                            )}
                        />
                        {errors.first_name && (
                            <div className="text-danger">نام را وارد کنید</div>
                        )}
                    </div>
                    <div className="mt-1">
                        <Label>نام خانوادگی</Label>
                        <Controller
                            name="last_name"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input {...field} type="text" placeholder="نام خانوادگی" />
                            )}
                        />
                        {errors.last_name && (
                            <div className="text-danger">نام خانوادگی را وارد کنید</div>
                        )}
                    </div>
                    <div className="mt-1">
                        <Label>شماره موبایل</Label>
                        <Controller
                            name="mobile"
                            control={control}
                            rules={{
                                required: "شماره موبایل را وارد کنید",
                                pattern: {
                                    value: /^09[0-9]{9}$/,
                                    message: "شماره موبایل را صحیح وارد کنید",
                                },
                            }}
                            render={({ field }) => (
                                <input
                                    type="text"
                                    className="form-control"
                                    inputMode="tel"
                                    {...field}
                                    style={{
                                        direction: "ltr",
                                    }}
                                />
                            )}
                        />
                        {errors.mobile && (
                            <span className="text-danger">{errors.mobile.message}</span>
                        )}
                    </div>

                    <div className="mt-1">
                        <Row>
                            <Col md="12">
                                <Label>تاریخ</Label>
                                <br />
                                <Controller
                                    control={control}
                                    name="date"
                                    rules={{ required: true }} //optional
                                    render={({
                                        field: { onChange, name, value },
                                        fieldState: { invalid, isDirty }, //optional
                                        formState: { errors }, //optional, but necessary if you want to show an error message
                                    }) => (
                                        <>
                                            <DatePicker
                                                format="YYYY/MM/DD"
                                                value={value || ""}
                                                onChange={(date) => {
                                                    if (date instanceof DateObject) date = date.toDate();
                                                    onChange(date);
                                                    setDate(date);
                                                    setStartTime(null);
                                                    setEndTime(null);
                                                    setValue("start_time", null);
                                                    setValue("end_time", null);
                                                }}
                                                calendar={persian}
                                                locale={persian_fa}
                                                calendarPosition="bottom-right"
                                                inputClass="form-control w-100"
                                                minDate={new DateObject()}
                                            />
                                            {errors &&
                                                errors[name] &&
                                                errors[name].type === "required" && (
                                                    //if you want to show an error message
                                                    <div className="text-danger">تاریخ را وارد کنید</div>
                                                )}
                                        </>
                                    )}
                                />
                            </Col>
                        </Row>
                    </div>
                    {/* {reserve.active_reservations.map((reservation) => (
                        <div className="mt-1">
                            {moment(reservation.start_time).format('jYYYY/jMM/jDD')} - {moment(reservation.start_time).hour()} - {moment(reservation.end_time).hour()}
                        </div>
                    ))} */}
                    <div className="mt-1">
                        <Row>
                            <Col md="6">
                                <Label>ساعت ورود</Label>
                                <Controller
                                    name="start_time"
                                    control={control}
                                    rules={{ required: "وارد کردن این فیلد الزامی است" }}
                                    render={({ field }) => (
                                        <select
                                            disabled={!date}
                                            className="form-control"
                                            onChange={(e) => {
                                                setEndTime(null);
                                                setStartTime(e.target.value);
                                                setValue("start_time", e.target.value);
                                            }}
                                        >
                                            <option disabled selected={startTime == null}></option>
                                            {startRange.map((hour) => (
                                                <option key={hour} value={hour} selected={hour === startTime}>{hour}</option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.start_time && (
                                    <div className="text-danger">ساعت ورود را وارد کنید</div>
                                )}
                            </Col>
                            <Col md="6">
                                <Label>ساعت خروج</Label>
                                <Controller
                                    name="end_time"
                                    control={control}
                                    rules={{ required: "وارد کردن این فیلد الزامی است" }}
                                    render={({ field }) => (
                                        <select
                                            disabled={!date || !startTime}
                                            className="form-control"
                                            onChange={(e) => {
                                                setEndTime(e.target.value);
                                                setValue("end_time", e.target.value);
                                            }}
                                        >
                                            <option disabled selected={endTime == null}></option>
                                            {endRange.map((hour) => (
                                                <option key={hour} value={hour} selected={hour === endTime}>{hour}</option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.end_time && (
                                    <div className="text-danger">ساعت خروج را وارد کنید</div>
                                )}
                            </Col>
                        </Row>
                    </div>
                    <div className="mt-1">
                        <Label>هزینه (تومان)</Label>
                        <Controller
                            name="amount"
                            control={control}
                            render={({ field }) => (
                                <NumericFormat
                                    rules={{ required: "مبلغ را وارد کنید", min: 1000 }}
                                    style={{ direction: "ltr" }}
                                    {...field}
                                    customInput={Input}
                                    thousandSeparator={true}
                                    inputMode="tel"
                                    disabled={true}
                                    // value={parseInt(endTime) - parseInt(startTime) > 0 ? (parseInt(endTime) - parseInt(startTime)) * parseInt(reserve.cost_per_hour) : ""}
                                    value={(parseInt(endTime) - parseInt(startTime)) * parseInt(reserve.cost_per_hour)}
                                />
                            )}
                        />
                    </div>
                    <div className="mt-3 d-flex justify-content-center w-100">
                        <Button
                            color="primary"
                            type="submit"
                            style={{
                                minWidth: "150px",
                            }}
                        >
                            پرداخت آنلاین
                        </Button>
                    </div>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export default ReserveModal;
