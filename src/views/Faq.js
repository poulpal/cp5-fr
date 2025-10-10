// ** React Imports
import { Link } from "react-router-dom";

// ** Reactstrap Imports
import {
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  UncontrolledAccordion,
} from "reactstrap";

// ** Custom Hooks
import { useSkin } from "@hooks/useSkin";
import themeConfig from "@configs/themeConfig";

// ** Illustrations Imports
import illustrationsLight from "@src/assets/images/pages/error.svg";
import illustrationsDark from "@src/assets/images/pages/error-dark.svg";

// ** Styles
import "@styles/base/pages/page-misc.scss";
import NavbarComponent from "../components/NavbarComponent";

const Faq = () => {
  // ** Hooks
  const { skin } = useSkin();

  const source = skin === "dark" ? illustrationsDark : illustrationsLight;

  const faqs = [
    {
      question: "ثبت اطلاعات همه ی واحدها کار دشواری ست٬راه حل چیست؟",
      answer:
        "با استفاده از اپلیکیشن ما میتوانید اطلاعات همه ی واحدها را با یک کلیک ثبت کنید",
    },
    {
      question: "چگونه میتوانم اطلاعات واحد های خود را ویرایش کنم؟",
      answer:
        "با استفاده از اپلیکیشن ما میتوانید اطلاعات همه ی واحدها را با یک کلیک ثبت کنید",
    },
    {
      question: "ثبت اطلاعات همه ی واحدها کار دشواری ست٬راه حل چیست؟",
      answer:
        "با استفاده از اپلیکیشن ما میتوانید اطلاعات همه ی واحدها را با یک کلیک ثبت کنید",
    },
    {
      question: "چگونه میتوانم اطلاعات واحد های خود را ویرایش کنم؟",
      answer:
        "با استفاده از اپلیکیشن ما میتوانید اطلاعات همه ی واحدها را با یک کلیک ثبت کنید",
    },
    {
      question: "ثبت اطلاعات همه ی واحدها کار دشواری ست٬راه حل چیست؟",
      answer:
        "با استفاده از اپلیکیشن ما میتوانید اطلاعات همه ی واحدها را با یک کلیک ثبت کنید",
    },
    {
      question: "چگونه میتوانم اطلاعات واحد های خود را ویرایش کنم؟",
      answer:
        "با استفاده از اپلیکیشن ما میتوانید اطلاعات همه ی واحدها را با یک کلیک ثبت کنید",
    },
    {
      question: "چگونه میتوانم اطلاعات واحد های خود را ویرایش کنم؟",
      answer:
        "با استفاده از اپلیکیشن ما میتوانید اطلاعات همه ی واحدها را با یک کلیک ثبت کنید",
    },
  ];

  return (
    <>
      <UncontrolledAccordion>
        {faqs.map((faq, index) => (
          <AccordionItem key={index}>
            <AccordionHeader targetId={index.toString()}>
              <h5 className="mb-0">{faq.question}</h5>
            </AccordionHeader>
            <AccordionBody accordionId={index.toString()}>
              <p>{faq.answer}</p>
            </AccordionBody>
          </AccordionItem>
        ))}
      </UncontrolledAccordion>
    </>
  );
};
export default Faq;
