import { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const PopUp = ({ popup }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <>
            <Modal
                isOpen={isOpen}
                toggle={() => setIsOpen(!isOpen)}
                centered={true}
                color="primary"
            >
                <ModalHeader toggle={() => setIsOpen(!isOpen)}>
                    {popup.title}
                </ModalHeader>
                <ModalBody>
                    <p
                        dangerouslySetInnerHTML={{ __html: popup.text.replace(/\n/g, "<br>") }}
                    ></p>
                    {popup.cta && popup.cta_text && (
                        <Link to={popup.cta} className="btn btn-primary">
                            {popup.cta_text}
                        </Link>
                    )}
                </ModalBody>
            </Modal>
        </>
    );
};

export default PopUp;