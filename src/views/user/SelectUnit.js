import { useEffect, useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import NavbarComponent from "../../components/NavbarComponent";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Button,
  Card,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import { useMediaQuery } from "react-responsive";
import { getUserRole } from "../../auth/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import themeConfig from "../../configs/themeConfig";
import LandingLinks from "../../components/LandingLinks";

const services = [
  { title: 'انواع درگاه پرداخت با نام مجتمع', className: 'item1' },
  { title: 'پنل کاربری و رمز عبور اختصاصی بانک', className: 'item2' },
  { title: 'امکان ارسال لینک پرداخت', className: 'item3' },
  {
    title: 'حسابداری',
    className: 'active item5',
    content: [
      'صورتحساب­ها (تراز و معین هر واحد)',
      'بدهی ­ها',
      'عوارض سالیانه',
      'پرداختی­ واحدها',
      'هزینه­ های ساختمان',
      'دریافتی‌ها',
      'هزینه­ ها',
      'درآمد­ها',
      'ثبت و صدور سند بصورت خودکار',
      'قابلیت تغییر کدینگ بر حسب نیاز',
      'تفصیلی شناور',
      'ترازمالی مجتمع',
      'صورت وضعیت مالک و مستاجر',
      'ارسال منظم و زمان بندی شده صورت حساب ها',
      'گزارش هزینه ها و درآمدهای کل مجتمع',
      'تراکنش های مالی مجتمع',
      'پرداخت دستی با پیوست رسید و تایید مدیریت ساختمان',
      'تعریف بانک، صندوق و تنخواه',
      'تعریف دسته چک های متعدد',
      'مدیریت وضعیت چکها',
      'نقل و انتقال بین هر یک از بانک ها',
      'ثبت سابقه تراکنش ها',
      'مشخص بودن مانده بدهی هر شخص',
      'واریز مستقیم بدهی به حساب اعلام شده',
      'ثبت خودکار واریزی ها در سیستم مالی',
      'صدور اخطاریه',
      'محاسبه جریمه دیرکرد',
      'محاسبه خوش حسابی',
      'خروجی گزارشات با فرمت های مختلف'
    ]
  },
  {
    title: 'درآمد زایی',
    className: 'active item8',
    content: [
      'بازارچه آرکپل :',
      'امکان خرید و فروش و آگهی کالاها و خدمات ساکنین هر مجتمع با هم یا با خارج از آن',
      'امکان ایجاد فروشگاه برای بخش های تجاری هر مجتمع و نیز اجاره فروشگاه های آنلاین به کسب و کارهای خارج از مجتمع',
      'امکان درج آگهی و تبلیغات در آرکپل به صورت اختصاصی برای هر مجتمع'
    ]
  },
  { title: 'کیف پول الکترونیک', className: 'item9' },
  {
    title: 'انبارداری',
    className: 'active item7',
    content: [
      'ثبت اموال و دارای های خریداری شده',
      'مدیریت موجودی هر اموال',
      'ثبت محل نگهداری و وضعیت هر اموال',
      'مدیریت جمع داری اموال'
    ]
  },
  { title: 'شفاف سازی پرداخت ها و دریافت ها', className: 'item6' },
  { title: 'امکان تعریف کاربران و دسترسی مختلف', className: 'item4' },
  { title: 'اطلاعیه ها و خبر ها', className: 'item11' },
  { title: 'ارائه QR code اختصاصی برای هر واحد', className: 'item10' },
  { title: 'انتخابات، نظر سنجی و رای گیری', className: 'item13' },
  { title: 'اطلاع رسانی از طریق پنل، پیامک و تلفن گویا', className: 'item14' },
  {
    title: 'تاسیسات',
    className: 'active item16',
    content: [
      'ثبت شناسنامه اموال و تاسیسات',
      'مشخص نمودن وضعیت و محل',
      'ثبت سابقه تعمیر و نگهداری'
    ]
  },
  {
    title: 'دبیرخانه',
    className: 'active item18',
    content: [
      'ثبت و شماره دهی نامه ها',
      'مشخص نمودن وضعیت نامه',
      'ثبت نامه های پیرو',
      'الصاق تصویر و فایل نامه',
      'دسته بندی با مشخصات گیرنده، فرستنده'
    ]
  },
  { title: 'گزارشات', className: 'lesser item20' },
  {
    title: 'مدیریت قراردادها',
    className: 'active bigger item17',
    content: [
      'تعریف قرارداد پیمانکاران',
      'قراردادهای پیمانکاری، فروش، اجاره',
      'الصاق تصویر اسناد و مدارک',
      'ثبت تعهدات و تضامین هر قرارداد',
      'ثبت متمم و الحاقیه های هر قرارداد'
    ]
  },
  { title: 'رزرو فضاهای مشترک', className: 'item12' },
  { title: 'جریمه دیرکرد و جایزه خوش حسابی', className: 'item15' },
  { title: 'صورت وضعیت حساب­ها در ارائه به دارایی', className: 'item19' },
  { title: 'امکان تغییرات و شخصی سازی برنامه', className: 'item21' }
];


const SelectUnit = () => {
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [createBuildingModal, setCreateBuildingModal] = useState(false);

  const navigate = useNavigate();

  const ismobile = false;

  const getUserRole = async () => {
    try {
      const response = await axios.get("/getMe");
      return response.data.data.user.role;
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  const getUnits = async () => {
    try {
      const role = await getUserRole();

      if (role === "building_manager") {
        // Run both requests concurrently if the role is building_manager
        const [unitsResponse, profileResponse] = await Promise.all([
          axios.get("user/units"),
          axios.get("/building_manager/profile"),
        ]);

        setUnits([
          ...unitsResponse.data.data.units,
          {
            id: "buildingManager",
            unit_number: "مدیر ساختمان",
            building: {
              name: profileResponse.data.data.building.name,
              image: profileResponse.data.data.building.image,
            },
          },
        ]);
      } else {
        // Run only the units request
        const unitsResponse = await axios.get("user/units");
        setUnits(unitsResponse.data.data.units);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  const handleSelectUnit = (unit) => {
    if (unit.id === "buildingManager") {
      localStorage.setItem("selectedUnit", "buildingManager");
      let userData = JSON.parse(localStorage.getItem("userData"));
      userData.role = "building_manager";
      localStorage.setItem("userData", JSON.stringify(userData));
      window.location.href = "/";
      return;
    }
    let userData = JSON.parse(localStorage.getItem("userData"));
    userData.role = "user";
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("selectedUnit", unit.id);
    window.location.href = "/";
  };

  useEffect(() => {
    setLoading(true);
    getUnits();
  }, []);

  return (
    <>
      <CreateBuildingModal
        createBuildingModal={createBuildingModal}
        setCreateBuildingModal={setCreateBuildingModal}
        units={units}
      />
      {/* <NavbarComponent withImage={false} /> */}
      <LoadingComponent loading={loading} />
      <div
        className="container-fluid"
        style={{
          minHeight: "90vh",
        }}
      >
        <Row className="mt-1">
          {units &&
            units.map((unit) => (
              <Col
                xs="6"
                sm="6"
                md="4"
                xl="3"
                lg="3"
                className="d-flex justify-content-center"
                onClick={() => handleSelectUnit(unit)}
                key={unit.id}
              >
                <Card
                  className=""
                  style={{
                    borderRadius: "20px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  <img
                    src={unit.building.image}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      objectPosition: "center",
                      borderRadius: "20px",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      width: "100%",
                      backgroundColor: "rgba(" + themeConfig.layout.primaryColorRGB + ", 0.5)",
                      borderRadius: "0 0 20px 20px",
                      backdropFilter: "blur(5px)",
                      padding: "10px 0 10px 0",
                    }}
                  >
                    <span className="text-white text-center d-block">
                      {unit.building.name}
                    </span>
                    <span
                      className={
                        "text-center d-block " +
                        (unit.id === "buildingManager"
                          ? "text-success"
                          : "text-white")
                      }
                    >
                      {unit.id !== "buildingManager" && "واحد"}{" "}
                      {unit.unit_number}
                    </span>
                  </div>
                </Card>
              </Col>
            ))}
          {import.meta.env.VITE_APP_TYPE !== 'standalone' && (
            <Col
              xs="6"
              sm="6"
              md="4"
              xl="3"
              lg="3"
              className="d-flex justify-content-center"
              onClick={() => setCreateBuildingModal(true)}
            >
              <Card
                className="bg-primary d-flex justify-content-center align-items-center"
                style={{
                  borderRadius: "20px",
                  cursor: "pointer",
                  width: "100%",
                  height: "180px",
                }}
              >
                <span className="text-white text-center d-flex flex-column">
                  <FontAwesomeIcon icon={faPlus} size="2x" />
                  مجموعه جدید
                </span>
              </Card>
            </Col>
          )}
          <Col
            xs="6"
            sm="6"
            md="4"
            xl="3"
            lg="3"
            className="d-flex justify-content-center"
            onClick={() => navigate("/transactions")}
          >
            <Card
              className="bg-primary d-flex justify-content-center align-items-center"
              style={{
                borderRadius: "20px",
                cursor: "pointer",
                width: "100%",
                height: "180px",
              }}
            >
              <span className="text-white text-center d-flex flex-column">
                <FontAwesomeIcon icon={faList} size="2x" />
                سابقه تراکنش ها
              </span>
            </Card>
          </Col>
        </Row>
        {import.meta.env.VITE_APP_TYPE == 'main' && (
          <LandingLinks isEnglish={false} />
        )}
        {import.meta.env.VITE_APP_TYPE == 'main' && false && (
          <Row>
            <div className="services-box-bg">
              <div className="services-wrapper pt-2">
                <h3 className="text-center mb-2 text-light">
                  خدمات {import.meta.env.VITE_APP_NAME}
                </h3>
                <div className="services-box">
                  {services.map((service, index) => (
                    <div key={index} className={`services-item-box ${service.className}`}>
                      {service.title}
                      {service.content && (
                        <div className="services-item-content">
                          <ul className="services-item-list">
                            {service.content.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Row>
        )}
      </div>
    </>
  );
};

const CreateBuildingModal = ({
  createBuildingModal,
  setCreateBuildingModal,
  units,
}) => {
  const navigate = useNavigate();

  const MySwal = withReactContent(Swal);

  const isBuildingManager = units.find((unit) => unit.id === "buildingManager");
  return (
    <>
      <Modal
        isOpen={createBuildingModal}
        toggle={() => setCreateBuildingModal(!createBuildingModal)}
        centered={true}
        size="lg"
      >
        <ModalHeader
          toggle={() => setCreateBuildingModal(!createBuildingModal)}
        >
          {" "}
          مجموعه جدید{" "}
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col xs="12" sm="12" md="12" xl="12" lg="12">
              <div className="d-flex justify-content-center">
                {!isBuildingManager && (
                  <Button
                    color="primary"
                    onClick={() => {
                      // const ua = navigator.userAgent;
                      // if (ua.indexOf("ChargePalApp") >= 0) {
                      //   toast.success(
                      //     "در حال انتقال به صفحه ورود به سیستم مجموعه، لطفا کمی صبر کنید",
                      //   );
                      //   setTimeout(() => {
                      //     window.open('https://my.chargepal.ir/login?token=' + localStorage.getItem('token'), "_blank");
                      //   }, 1000);
                      //   return;
                      // }
                      setCreateBuildingModal(!createBuildingModal);
                      navigate("/newBuilding");
                    }}
                  >
                    مدیر مجموعه هستم
                  </Button>
                )}
                <Button
                  color="primary"
                  className="ms-1"
                  onClick={() => {
                    setCreateBuildingModal(!createBuildingModal);
                    MySwal.fire({
                      title: "ایجاد مجموعه",
                      text: `
                        اگر واحد خود را در لیست مجموعه ها مشاهده نکردید؛ مدیریت مجموعه شما باید ابتدا در سایت مجموعه مربوطه را ایجاد کند سپس باید اطلاعات شما در مجموعه به عنوان یک واحد جدید ثبت گردد.
                      `,
                      icon: "info",
                      customClass: {
                        confirmButton: "btn btn-primary",
                      },
                      confirmButtonText: "متوجه شدم",
                    });
                  }}
                >
                  ساکن هستم
                </Button>
              </div>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </>
  );
};

export default SelectUnit;
