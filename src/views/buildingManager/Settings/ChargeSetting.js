import { useState } from "react";
import { useEffect } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-hot-toast";
import axios from "axios";
import FloatingAddButton from "../../../components/FloatingAddButton";
import { Button, Card, Col, Form, Input, Label, Row } from "reactstrap";
import tableConfig from "../../../configs/tableConfig";
import { useMediaQuery } from "react-responsive";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2/dist/sweetalert2.all";

import AddBuildingManagerModal from "@src/components/buildingManager/buildingmanagers/addBuildingManagerModal";
import LoadingComponent from "../../../components/LoadingComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEllipsisVertical,
    faPencil,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import DatePicker, { DateObject } from "react-multi-date-picker";
import _ from 'lodash';
import "wordifyfa/dist/wordifyfa";

const toOrderdFarsi = (number) => {
    if (number == 1) {
        return "اول";
    }
    let word = wordifyfa(number);
    word = word.replace('سه', 'سو');
    return word + 'م';
}



const ChargeSetting = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setError,
        watch,
        setValue,
    } = useForm();

    const [data, setdata] = useState([]);
    const [loading, setLoading] = useState(false);


    const ismobile = false;

    const MySwal = withReactContent(Swal);

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/building_manager/options`);
            const options = response.data.data.options;
            setValue('auto_add_monthly_charge', options.auto_add_monthly_charge && true);
            setValue('charge_day', options.charge_day);
            setValue('late_fine', options.late_fine && true);
            setValue('late_fine_days', options.late_fine_days);
            setValue('late_fine_percent', options.late_fine_percent);
            setValue('early_payment', options.early_payment && true);
            setValue('early_payment_days', options.early_payment_days);
            setValue('early_payment_percent', options.early_payment_percent);
            setValue('manual_payment', options.manual_payment && true);
            setValue('custom_payment', options.custom_payment && true);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message ?? "خطای سرور");
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    if (typeof data[key] === 'boolean') {
                        data[key] = data[key] ? 1 : 0;
                    }
                }
            }
            const response = await axios.post("/building_manager/options", data);
            toast.success(response.data.message);
            reset();
            refreshData();
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
        refreshData();
    }, []);



    return (

        <>
            <LoadingComponent loading={loading} />
            <Card
                style={{
                    minHeight: "77vh",
                }}
                className="px-md-5 px-2 py-2"
            >
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                        <Col md="6" className="mb-3">
                            <Label>اعمال اتوماتیک شارژ: </Label>
                            <br />
                            <Controller
                                name="auto_add_monthly_charge"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="checkbox"
                                        {...field}
                                        checked={field.value}
                                    />
                                )}
                            />
                            <br />
                            <small>
                                در صورت فعال بودن این گزینه، هر ماه شارژ هر واحد به صورت اتوماتیک به عنوان بدهی اعمال می شود.
                            </small>
                            {errors.auto_add_monthly_charge && (
                                <div className="text-danger">
                                    {errors.auto_add_monthly_charge.message}
                                </div>
                            )}
                        </Col>

                        <Col md="6" className="mb-3">
                            <Label>روز اعمال اتوماتیک شارژ: </Label>
                            <Controller
                                name="charge_day"
                                control={control}
                                rules={{ required: "وارد کردن این فیلد الزامی است" }}
                                render={({ field }) => (
                                    <select
                                        className="form-control"
                                        {...field}
                                        disabled={!watch('auto_add_monthly_charge')}
                                    >
                                        {_.range(1, 30).map((day) => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                )}
                            />
                            {watch('auto_add_monthly_charge') &&
                                <small>
                                    در آغاز روز <strong>{toOrderdFarsi(watch('charge_day'))}</strong> هر ماه شارژ هر واحد به صورت اتوماتیک به عنوان بدهی اعمال می شود.
                                </small>
                            }
                            {errors.charge_day && (
                                <div className="text-danger">
                                    {errors.charge_day.message}
                                </div>
                            )}
                        </Col>
                        <Col md="4" className="mb-3">
                            <Label>خسارت تاخیر در پرداخت شارژ: </Label>
                            <br />
                            <Controller
                                name="late_fine"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="checkbox"
                                        {...field}
                                        checked={field.value}
                                    />
                                )}
                            />
                            <br />
                            <small>
                                در صورت فعال بودن این گزینه در هر ماه خسارت تاخیر در پرداخت شارژ برای واحد های بدهکار اعمال خواهد شد.
                            </small>
                            {errors.late_fine && (
                                <div className="text-danger">
                                    {errors.late_fine.message}
                                </div>
                            )}
                        </Col>

                        <Col md="4" className="mb-3">
                            <Label>درصد خسارت تاخیر در پرداخت شارژ: </Label>
                            <Controller
                                name="late_fine_percent"
                                control={control}
                                rules={{ required: "وارد کردن این فیلد الزامی است" }}
                                render={({ field }) => (
                                    <input
                                        disabled={!watch('late_fine')}
                                        type="text"
                                        className="form-control"
                                        {...field}
                                    />
                                )}
                            />
                            {errors.late_fine_percent && (
                                <div className="text-danger">
                                    {errors.late_fine_percent.message}
                                </div>
                            )}
                        </Col>

                        <Col md="4" className="mb-3">
                            <Label>روز اعمال خسارت تاخیر در پرداخت شارژ: </Label>
                            <Controller
                                name="late_fine_days"
                                control={control}
                                rules={{ required: "وارد کردن این فیلد الزامی است" }}
                                render={({ field }) => (
                                    <select
                                        className="form-control"
                                        {...field}
                                        disabled={!watch('late_fine')}
                                    >
                                        {_.range(1, 30).map((day) => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                )}
                            />
                            {watch('late_fine') &&
                                <small>
                                    در پایان روز <strong>{toOrderdFarsi(watch('late_fine_days'))}</strong> هر ماه <strong>{watch('late_fine_percent')}</strong> درصد بدهی هر واحد به عنوان خسارت تاخیر در پرداخت شارژ برای واحد های بدهکار اعمال می شود.
                                </small>
                            }
                            {errors.late_fine_days && (
                                <div className="text-danger">
                                    {errors.late_fine_days.message}
                                </div>
                            )}
                        </Col>
                        {/* <Col md="4" className="mb-3">
                            <Label>تخفیف خوشحسابی: </Label>
                            <br />
                            <Controller
                                name="early_payment"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="checkbox"
                                        {...field}
                                        checked={field.value}
                                    />
                                )}
                            />
                            <br />
                            <small>
                                در صورت فعال بودن این گزینه پس از اعمال شارژ ماهانه ساکنین تا مهلت تعیین شده از تخفیف خوشحسابی برخوردار خواهند بود.
                            </small>
                            {errors.early_payment && (
                                <div className="text-danger">
                                    {errors.early_payment.message}
                                </div>
                            )}
                        </Col>

                        <Col md="4" className="mb-3">
                            <Label>درصد تخفیف خوشحسابی: </Label>
                            <Controller
                                name="early_payment_percent"
                                control={control}
                                rules={{ required: "وارد کردن این فیلد الزامی است" }}
                                render={({ field }) => (
                                    <input
                                        disabled={!watch('early_payment')}
                                        type="text"
                                        className="form-control"
                                        {...field}
                                    />
                                )}
                            />
                            {errors.early_payment_percent && (
                                <div className="text-danger">
                                    {errors.early_payment_percent.message}
                                </div>
                            )}
                        </Col>

                        <Col md="4" className="mb-3">
                            <Label>روز اعمال خسارت تاخیر در پرداخت شارژ: </Label>
                            <Controller
                                name="early_payment_days"
                                control={control}
                                rules={{ required: "وارد کردن این فیلد الزامی است" }}
                                render={({ field }) => (
                                    <select
                                        className="form-control"
                                        {...field}
                                        disabled={!watch('early_payment')}
                                    >
                                        {_.range(1, 30).map((day) => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                )}
                            />
                            {watch('early_payment') &&
                                <small>
                                    تا <strong>{watch('early_payment_days')}</strong> روز پس از اعمال شارژ اتوماتیک <strong>{watch('early_payment_percent')}</strong> درصد تخفیف برای ساکنین اعمال خواهد شد.
                                </small>
                            }
                            {errors.early_payment_days && (
                                <div className="text-danger">
                                    {errors.early_payment_days.message}
                                </div>
                            )}
                        </Col> */}


                        <Col md="6" className="mb-3">
                            <Label>پرداخت دستی: </Label>
                            <br />
                            <Controller
                                name="manual_payment"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="checkbox"
                                        {...field}
                                        checked={field.value}
                                    />
                                )}
                            />
                            <br />
                            <small>
                                در صورت فعال بودن این گزینه ساکنان می توانند رسید های پرداخت شارژ را به صورت دستی ثبت کنند.
                            </small>
                            {errors.manual_payment && (
                                <div className="text-danger">
                                    {errors.manual_payment.message}
                                </div>
                            )}
                        </Col>
                        <Col md="6" className="mb-3">
                            <Label>پرداخت مبلغ دلخواه: </Label>
                            <br />
                            <Controller
                                name="custom_payment"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="checkbox"
                                        {...field}
                                        checked={field.value}
                                    />
                                )}
                            />
                            <br />
                            <small>
                                در صورت فعال بودن این گزینه ساکنان میتوانند مبلغ دلخواه را به عنوان شارژ پرداخت کنند. در غیر اینصورت تنها قادر به پرداخت کل بدهی به صورت آنلاین هستند.
                            </small>
                            {errors.manual_payment && (
                                <div className="text-danger">
                                    {errors.manual_payment.message}
                                </div>
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
                                ذخیره
                            </Button>
                        </div>
                    </Row>
                </Form>

            </Card>
        </>
    )
}

export default ChargeSetting;