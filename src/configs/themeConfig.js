// Logo Import
import logo from "@src/assets/images/logo/logo.png";

// You can customize the template with the help of this file

//Template config options
let themeConfig = {
  app: {
    appName: import.meta.env.VITE_APP_NAME,
    appLogoImage: logo,
  },
  layout: {
    isRTL: true,
    skin: "light", // light, dark, bordered, semi-dark
    type: "vertical", // vertical, horizontal
    contentWidth: "boxed", // full, boxed
    menu: {
      isHidden: false,
      isCollapsed: false,
    },
    navbar: {
      // ? For horizontal menu, navbar type will work for navMenu type
      type: "static", // static , sticky , floating, hidden
      backgroundColor: "navbar", // BS color options [primary, success, etc]
    },
    footer: {
      type: "hidden", // static, sticky, hidden
    },
    primaryColor: "#133D70",
    primaryColorRGB: "19, 61, 112",
    accentColor: "#FFC727",
    customizer: false,
    scrollTop: true, // Enable scroll to top button
    toastPosition: "top-right", // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
  },
};

if (import.meta.env.VITE_APP_TYPE == 'a444'){
  themeConfig.layout.primaryColor = '#000000';
  themeConfig.layout.primaryColorRGB = '0, 0, 0';
  themeConfig.layout.accentColor = '#FFFFFF';
}

export default themeConfig;
