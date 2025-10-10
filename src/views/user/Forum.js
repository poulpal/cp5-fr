import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";
import { Card, CardBody, CardFooter, CardSubtitle, CardTitle, Col, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faImage, faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import themeConfig from "@configs/themeConfig";

export default () => {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [image, setImage] = useState(null);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);



    useEffect(() => {
        window.onscroll = () => {
            const element = document.getElementById("endofposts");
            if (element && window.innerHeight + window.scrollY >= element.offsetTop) {
                loadMore();
            }
        }
        return () => {
            window.onscroll = null;
        }
    });

    const getPosts = async () => {
        setLoading(true);
        const selectedUnitId = localStorage.getItem("selectedUnit");
        try {
            const response = await axios.get(
                "/user/forumPosts?unit=" + selectedUnitId
            );
            setPosts(response.data.data);
            setLastPage(response.data.last_page);
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            } else {
                console.log(err);
            }
        }
        setLoading(false);
    };

    const loadMore = async () => {
        if (loading) {
            return;
        }
        if (page >= lastPage) {
            return;
        }
        setPage(page + 1);
        setLoading(true);
        const selectedUnitId = localStorage.getItem("selectedUnit");
        try {
            const response = await axios.get(
                "/user/forumPosts?unit=" + selectedUnitId + "&page=" + (page + 1)
            );
            setPosts([...posts, ...response.data.data]);
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            } else {
                console.log(err);
            }
        }
        setLoading(false);
    }


    useEffect(() => {
        getPosts();
        return () => { };
    }, []);

    return (
        <>
            <LoadingComponent loading={loading} />
            <h3 className="text-center mb-0">انجمن</h3>
            <Row>
                <Col xl="6" xs="12" className="m-auto">
                    <Row className="pt-2">
                        <Col md={12}>
                            <Card className="forum-card">
                                <CardBody>
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            const newPost = {
                                                content: formData.get("text"),
                                                image: formData.get("image"),
                                                unit: localStorage.getItem("selectedUnit"),
                                            };
                                            try {
                                                setLoading(true);
                                                const response = await axios.post("/user/forumPosts", newPost, {
                                                    headers: {
                                                        'Content-Type': 'multipart/form-data'
                                                    }
                                                });
                                                setPosts([response.data.data.post, ...posts]);
                                                toast.success(response.data.message);
                                                e.target.reset();
                                                setImage(null);
                                            } catch (err) {
                                                if (err.response && err.response.data.message) {
                                                    toast.error(err.response.data.message);
                                                } else {
                                                    console.log(err);
                                                }
                                            }
                                            setLoading(false);
                                        }}
                                    >
                                        <div className="mb-1">
                                            <textarea
                                                name="text"
                                                className="form-control"
                                                placeholder="متن پست"
                                                rows="5"
                                                required
                                                autoFocus
                                                style={{
                                                    minHeight: '80px',
                                                    borderRadius: 0,
                                                    border: 'unset',
                                                    boxShadow: 'unset',
                                                }}
                                                onChange={(e) => {
                                                    e.target.style.height = '80px';
                                                    e.target.style.height = e.target.scrollHeight + 'px';
                                                }}
                                            ></textarea>
                                            <img src={image} className="w-100" />
                                        </div>
                                        <div className="d-none">
                                            <input
                                                type="file"
                                                name="image"
                                                className="form-control"
                                                accept="image/*"
                                                id="image"
                                                onChange={(e) => {
                                                    setImage(URL.createObjectURL(e.target.files[0]));
                                                }}
                                            />
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <button type="submit" className="btn btn-primary">
                                                انتشار
                                            </button>
                                            <label htmlFor="image" className="pointer">
                                                <FontAwesomeIcon icon={faImage} size="xl" color={themeConfig.layout.primaryColor} />
                                            </label>

                                        </div>
                                    </form>
                                </CardBody>
                            </Card>
                        </Col>
                        {posts.map((post) => (
                            <Col key={post.id} md={12} className="mb-0">
                                <Card className="d-flex flex-row justify-content-between align-items-center forum-card">
                                    <CardBody className="p-0">
                                        <CardTitle className="mb-2 px-2 pt-1">
                                            <div className="d-flex justify-content-between">
                                                <small
                                                    style={{
                                                        color: "#37474F",
                                                    }}
                                                >
                                                    {post.user}
                                                </small>
                                                <small>{post.date}</small>
                                            </div>
                                        </CardTitle>
                                        <CardSubtitle className="text-dark px-2">
                                            <p
                                                dangerouslySetInnerHTML={{ __html: post.content }}
                                            ></p>
                                            {post.image && (
                                                <img
                                                    src={post.image}
                                                    alt="Post"
                                                    className="mb-1"
                                                    style={{ maxWidth: '100%', height: 'auto' }}
                                                />
                                            )}
                                        </CardSubtitle>
                                        <CardFooter>
                                            <div className="d-flex justify-content-end align-items-center">
                                                {post.likes > 0 && (<span style={{
                                                    marginLeft: '5px'
                                                }}>
                                                    {post.likes}
                                                </span>)}
                                                <div className="pointer" onClick={async () => {
                                                    try {
                                                        setLoading(true);
                                                        const response = await axios.post(`/user/forumPosts/${post.id}/like`, {
                                                            unit: localStorage.getItem("selectedUnit"),
                                                        });
                                                        setPosts(posts.map((p) => {
                                                            if (p.id === post.id) {
                                                                p.is_liked = response.data.data.post.is_liked;
                                                                p.likes = response.data.data.post.likes;
                                                            }
                                                            return p;
                                                        }));
                                                    } catch (err) {
                                                        if (err.response && err.response.data.message) {
                                                            toast.error(err.response.data.message);
                                                        } else {
                                                            console.log(err);
                                                        }
                                                    }
                                                    setLoading(false);
                                                }}>
                                                    {post.is_liked ? (
                                                        <FontAwesomeIcon icon={faHeartSolid} size="lg" color={themeConfig.layout.primaryColor} />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faHeart} size="lg" color="#ccc" />
                                                    )}
                                                </div>

                                            </div>
                                        </CardFooter>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                        <div id="endofposts">

                        </div>
                    </Row>
                </Col>
            </Row>
        </>
    );
};
