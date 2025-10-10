import { Link } from "react-router-dom";
import { isUserLoggedIn, getUserRole } from "../auth/auth";

const slug = localStorage.getItem("buildingSlug");

const NavBarBanner = () => {
    return null;
    // if (isUserLoggedIn && slug == "jamtower") {
    //     return <div className="w-100 bg-primary text-center text-white pb-1">
    //         اعتبار پنل شما به پایان رسیده است. لطفا جهت تمدید با پشتیبانی تماس بگیرید.
    //     </div>;
    // }
    if (!isUserLoggedIn || getUserRole() !== "user") {
        return null;
    }
    return (
        <>
            <Link to="/wallet">
                <div className="w-100 bg-primary text-center text-white pb-1">
                    برنده این ماه قرعه کشی شارژ رایگان " ف. ای***ی"  به شماره 85*****0912 از مجتمع گلشهر
                </div>
            </Link>
        </>);

};

export default NavBarBanner;