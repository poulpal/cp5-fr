import { Card, CardBody, CardHeader, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";

import { Line } from "react-chartjs-2";
import { CategoryScale, Chart, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from "chart.js";
import { toInteger } from "lodash";
import { useState } from "react";
import classnames from "classnames";
import classNames from "classnames";

const ChartCard = ({
    stats,
}) => {

    const [activeTab, setActiveTab] = useState("week");

    const currency = localStorage.getItem("currency");

    Chart.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
    );

    return (
        <Card className="">
            <CardHeader className="border-bottom">
                <h4>نمودار پرداختی</h4>
            </CardHeader>
            <CardBody className="pt-2">
                <Nav pills justified>
                    <NavItem>
                        <NavLink
                            className={classNames({ active: activeTab === "week" })}
                            onClick={() => {
                                setActiveTab("week");
                            }}
                        >
                            روز هفته تجمیعی
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === "month" })}
                            onClick={() => {
                                setActiveTab("month");
                            }}
                        >
                            روز ماه تجمیعی
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId="week">
                        <Line className="mb-3" type="bar" data={{
                            labels: stats.payment_per_weekday.map((item) => item.day).sort((a, b) => toInteger(a.day) - toInteger(b.day)),
                            datasets: [
                                {
                                    label: currency === "rial" ? "پرداخت آنلاین (ریال)" : "پرداخت آنلاین (تومان)",
                                    data: stats.payment_per_weekday.map((item) => item.sum * (currency === "rial" ? 10 : 1)).sort((a, b) => a.day - b.day),
                                    borderColor: 'rgb(53, 162, 235)',
                                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                                },
                            ],
                        }} />
                    </TabPane>
                    <TabPane tabId="month">
                        <Line className="mb-3" type="bar" data={{
                            labels: stats.payment_per_day.map((item) => item.day).sort((a, b) => toInteger(a.day) - toInteger(b.day)),
                            datasets: [
                                {
                                    label: currency === "rial" ? "پرداخت آنلاین (ریال)" : "پرداخت آنلاین (تومان)",
                                    data: stats.payment_per_day.map((item) => item.sum * (currency === "rial" ? 10 : 1)).sort((a, b) => a.day - b.day),
                                    borderColor: 'rgb(53, 162, 235)',
                                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                                },
                            ],
                        }} />
                    </TabPane>
                </TabContent>

            </CardBody>
        </Card>
    );
};

export default ChartCard;
