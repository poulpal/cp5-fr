import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Button } from "reactstrap";
import axios from "axios";

const LandingLinks = ({ isEnglish }) => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);

    const getBanners = async () => {
        setLoading(true);
        try {
            const response = await axios.get("public/banners");
            setBanners(response.data.data);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        getBanners();
        return () => { };
    }, []);

    return (
        <Row>
            <Col md={6} className="m-auto">
                <Row>
                    <Col xs={12} md={6}>
                        <Link to={import.meta.env.VITE_LANDING_URL} target="_blank">
                            <Button
                                color="primary"
                                type="submit"
                                block
                                disabled={isEnglish}
                                style={{ minWidth: "145px", borderRadius: "5px", marginBottom: "10px" }}
                            >
                                ورود به سایت شارژپل
                            </Button>
                        </Link>
                    </Col>
                    <Col xs={12} md={6}>
                        <Link to={import.meta.env.VITE_LANDING_PRICING_URL} target="_blank">
                            <Button
                                color="primary"
                                type="submit"
                                block
                                disabled={isEnglish}
                                style={{ minWidth: "145px", borderRadius: "5px", marginBottom: "10px" }}
                            >
                                قیمت ها
                            </Button>
                        </Link>
                    </Col>
                    {banners.length > 0 && (
                        <Col xs={12} className="text-center my-1">
                            {banners.length > 0 && banners.map((banner, idx) => (
                                <Link to={banner.link} target="_blank" key={idx}>
                                    <img
                                        src={`${banner.image}`}
                                        alt={`banner-${idx}`}
                                        style={{ maxWidth: "100%", maxHeight: "400px", marginBottom: "10px" }}
                                    />
                                </Link>
                            ))}
                        </Col>
                    )}
                    <Col xs={12} md={6}>
                        <Link to={import.meta.env.VITE_LANDING_SERVICES_URL} target="_blank">
                            <Button
                                color="primary"
                                type="submit"
                                block
                                disabled={isEnglish}
                                style={{ minWidth: "145px", borderRadius: "5px", marginBottom: "10px" }}
                            >
                                امکانات
                            </Button>
                        </Link>
                    </Col>
                    <Col xs={12} md={6}>
                        <Link to={import.meta.env.VITE_LANDING_SURVEY_URL} target="_blank">
                            <Button
                                color="primary"
                                type="submit"
                                block
                                disabled={isEnglish}
                                style={{ minWidth: "145px", borderRadius: "5px", marginBottom: "10px" }}
                            >
                                مشاوره با کارشناسان
                            </Button>
                        </Link>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

export default LandingLinks;
