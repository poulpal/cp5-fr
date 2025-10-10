import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingComponent from '../../../components/LoadingComponent';
import toast from 'react-hot-toast';
import moment from "moment-jalaali";

import { useNavigate, useParams } from 'react-router';


export default () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [ticket, setTicket] = useState({});
    const [replyText, setReplyText] = useState("");

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/building_manager/supportTickets/" + id);
            setTicket(response.data.data.supportTicket);
            setTimeout(() => {
                const endOfChat = document.querySelector(".end-of-chat");
                console.log(endOfChat);
                if (endOfChat) {
                    endOfChat.scrollIntoView();
                }
            }, 100);
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            }
        }
        setLoading(false);
    };

    const sendReply = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/building_manager/supportTickets/" + id + "/reply", {
                message: replyText,
            });
            setReplyText("");
            refreshData();
        } catch (err) {
            if (err.response && err.response.data.message) {
                toast.error(err.response.data.message);
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        refreshData();
    }, []);
    return (
        <div className="card" style={{
            minHeight: "89vh",
        }}>
            <LoadingComponent loading={loading} />
            <div className="py-1 px-2 d-flex justify-content-center align-items-center">
                <h3 className="text-center mb-2 pt-1 pb-0">{ticket.subject}</h3>
            </div>
            <div className="d-flex flex-column" style={{
                height: "50vh",
                overflowY: "auto",
                overflowX: "hidden",
            }}>
                {ticket.replies?.map((reply, index) => (
                    <div key={index} className="p-2 mb-2 mx-1 border-dark text-white"
                        style={{
                            borderRadius: "0.9rem",
                            borderBottomLeftRadius: reply.from === "support" ? "0" : "0.9rem",
                            borderBottomRightRadius: reply.from === "support" ? "0.9rem" : "0",
                            alignSelf: reply.from === "user" ? "flex-start" : "flex-end",
                            left: "0",
                            position: "relative",
                            maxWidth: "700px",
                            minWidth: "50%",
                            backgroundColor: reply.from === "support" ? "white" : "var(--bs-primary)",
                        }}>
                        <div className="d-flex justify-content-between">
                            <div
                                style={{
                                    color: reply.from === "support" ? "black" : "white",
                                }}
                            >
                                <p
                                    dangerouslySetInnerHTML={{ __html: reply.message.split("\n").join("<br>") }}></p>
                            </div>
                        </div>
                        <span className='text-right' style={{
                            color: reply.from === "support" ? "black" : "white",
                        }}>
                            {moment(reply.updated_at).format("HH:mm jYYYY/jMM/jDD")}
                        </span>
                    </div>
                ))}
                <div className="end-of-chat"></div>
            </div>
            <div className="d-flex justify-content-center p-1">
                <textarea
                    className="form-control"
                    style={{
                        borderRadius: "0.9rem",
                        minHeight: "100px",
                    }}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="متن خود را وارد کنید"
                    rows="5"
                ></textarea>
                <button className="btn btn-primary ms-1" style={{
                    borderRadius: "0.9rem",
                }}
                    onClick={sendReply}
                >ارسال</button>
            </div>
        </div>
    );
};
