import { Button, Card, CardBody, CardHeader, Col, Form, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";

import classnames from "classnames";
import { useEffect, useState } from "react";
import axios from "axios";
import apiConfig from "../../configs/apiConfig";
import toast from "react-hot-toast";

const SignContract = ({
    stats,
    setLoading,
}) => {

    const [otpSent, setOtpSent] = useState(false);
    const [checked, setChecked] = useState(false);
    const [otp, setOtp] = useState('');

    const sendOtp = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/building_manager/sendContractOtp');
            setOtpSent(true);
            toast.success(response.data.message);
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            }
            console.log(err);
        }
        setLoading(false);
    }

    const verifyOtp = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`/building_manager/verifyContractOtp`, {
                code: otp,
            });
            setOtpSent(true);
            toast.success(response.data.message);
            window.location.reload();
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            }
            console.log(err);
        }
        setLoading(false);
    }


    return (
        <Card className="">
            <CardHeader className="border-bottom">
                <h4>امضاء قرارداد</h4>
            </CardHeader>
            <CardBody className="pt-2">
                <span>
                    کاربر گرامی، به منظور استفاده از امکانات پنل قرارداد زیر را مطالعه و امضاء نمایید.
                </span>
                <iframe
                    width="100%"
                    height="400px"
                    src={stats.contract_url}
                />

                <Form className="mt-2">
                    <input type="checkbox" className="form-check-input mx-1" disabled={otpSent} id="exampleCheck1" checked={checked} onChange={() => setChecked(!checked)} />
                    <label className="form-check-label ml-2" htmlFor="exampleCheck1">با شرایط قرارداد موافقم</label>
                    {!otpSent && (
                        <Row>
                            <Col md="6">
                                <input type="tel" className="form-control mt-2" id="contract_mobile" value={stats.contract_mobile} disabled />
                            </Col>
                            <Col md="6">

                                <Button color="primary" className="mt-2" disabled={!checked} onClick={() => sendOtp()}>ارسال کد تایید</Button>
                            </Col>
                        </Row>
                    )}
                    {otpSent && (
                        <Row>
                            <Col md="6">
                                <input type="tel" className="form-control mt-2" id="code" name="code" value={otp} placeholder="کد تایید ارسال شده را وارد نمایید." onChange={(e) => setOtp(e.target.value)} />
                            </Col>
                            <Col md="6">
                                <Button color="primary" className="mt-2" onClick={() => verifyOtp()}>تایید</Button>
                            </Col>
                        </Row>
                    )}

                </Form>

            </CardBody>
        </Card>
    );
};

export default SignContract;
