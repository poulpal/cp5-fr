import { Controller, useForm } from "react-hook-form";
import {
    Button,
    Card,
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
import { Link } from "react-router-dom";

const CurrentPlan = ({ }) => {
    return <></>;

    const selectedUnit = localStorage.getItem("selectedUnit");

    if (selectedUnit !== 'buildingManager') {
        return <></>;
    }

    const [loading, setLoading] = useState(false);
    const [data, setdata] = useState([]);

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/building_manager/plans/currentPlan`
            );
            setdata(response.data.data);
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
        return () => {
            setdata([]);
        };
    }, []);

    return (
        <div className="m-auto">
            {(!loading && data?.plan) &&
                <Link to="buildingManager/plans" className="text-decoration-none">
                    <Card style={{
                        width: "80%",
                        marginTop: "5px",
                        marginRight: "auto",
                        marginLeft: "auto",
                        height: "72px",
                        backgroundColor: "#ffffff11",
                    }}
                        className="d-flex radius-14 flex-row p-1"
                    >
                        <div>

                        </div>
                        <div className="w-100 d-flex flex-column justify-content-center align-items-center">
                            <span className="text-white" style={{
                                marginBottom: "3px"
                            }}>
                                پلن فعلی شما
                                <strong className="text-white ms-1">
                                    {data?.plan?.title}
                                </strong>
                            </span>
                            {(data?.plan_expires_at > 0) ? (
                                <span className="text-white">
                                    <strong style={{
                                        marginLeft: "3px"
                                    }}>
                                        {data?.plan_expires_at}
                                    </strong>
                                    روز تا پایان
                                </span>
                            ) : (
                                <span className="text-danger">
                                    <strong style={{
                                        marginLeft: "3px"
                                    }}>
                                        منقضی شده
                                    </strong>

                                </span>
                            )}
                        </div>
                    </Card>
                </Link>
            }
        </div>
    );
};

export default CurrentPlan;
