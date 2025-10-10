import { faHeadset, faPhone, faPhoneSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalHeader,
  Tooltip,
  UncontrolledTooltip,
} from "reactstrap";

import whatsapp from "@src/assets/images/icons/whatsapp.png";
import skype from "@src/assets/images/icons/skype.png";
import meet from "@src/assets/images/icons/meet.png";
import telegram from "@src/assets/images/icons/telegram.png";

import SupportIcon from "@src/assets/images/icons/support.svg";
import CallIcon from "@src/assets/images/icons/call.svg";

const SupportButton = ({ withImage }) => {
  const [supportTooltip, setSupportTooltip] = useState(false);
  const [modal, setModal] = useState(false);

  if (import.meta.env.VITE_APP_TYPE == 'a444') {
    return <></>;
  }
  if (import.meta.env.VITE_APP_TYPE == 'standalone') {
    return <></>;
  }

  const icons = [
    {
      title: "واتسپ",
      icon: whatsapp,
      link: "https://web.whatsapp.com/send?phone=982191031869&text= با درود.  از طریق درخواست پشتیبانی وب سایت chargepal.ir  تماس می گیرم.",
    },
    // {
    //   title: "اسکایپ",
    //   icon: skype,
    //   link: "https://t.me/poulpal",
    // },
    // {
    //   title: "گوگل میت",
    //   icon: meet,
    //   link: "https://t.me/poulpal",
    // },
    {
      title: "تلگرام",
      icon: telegram,
      link: "https://t.me/chargepalir",
    },
    // {
    //   title: "تماس",
    //   icon: CallIcon,
    //   link: "tel:982191031869",
    // }
  ];

  return (
    <>
      <Modal isOpen={modal} toggle={() => setModal(!modal)} centered={true}>
        {/* <ModalHeader toggle={() => setModal(!modal)}>پشتیبانی</ModalHeader> */}
        <ModalBody>
          <h3 className="text-center pt-3 pb-2">ارتباط با ما</h3>
          <div className="d-flex flex-row justify-content-between pb-2 px-sm-3 px-xs-1 px-2">
            {icons.map((icon, index) => (
              <div key={index}>
                <UncontrolledTooltip
                  placement="bottom"
                  target={"support_" + index}
                >
                  {icon.title}
                </UncontrolledTooltip>
                <div id={"support_" + index} href="#">
                  <a
                    href={icon.link}
                    target="_blank"
                    rel="noreferrer"
                    key={index}
                  >
                    <img
                      src={icon.icon}
                      alt={icon.title}
                      style={{
                        width: "50px",
                        height: "50px",
                      }}
                    />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
      </Modal>
      <Tooltip
        placement="bottom"
        isOpen={supportTooltip}
        target="contact"
        toggle={() => setSupportTooltip(!supportTooltip)}
      >
        پشتیبانی
      </Tooltip>
      <a onClick={() => setModal(!modal)}>
      <FontAwesomeIcon
        icon={faHeadset}
        style={{
          color: "#fff",
          cursor: "pointer",
          verticalAlign: "middle"
        }}
        id="contact"
        className="me-1 header-icon"
      />
      </a>
    </>
  );
};

export default SupportButton;
