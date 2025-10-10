import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "reactstrap";
import themeConfig from "@configs/themeConfig";

const FloatingAddButton = ({ onClick, text, plusIcon = true }) => {
  return (
    <Button
      color="white"
      size="sm"
      onClick={onClick}
      style={{
        backgroundColor: themeConfig.layout.primaryColor,
        boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
        marginRight: "5px",
        marginBottom: "10px",
      }}
    >
      {plusIcon && (
        <FontAwesomeIcon
          icon={faPlus}
          style={{
            color: themeConfig.layout.accentColor,
            fontSize: "12px",
            textAlign: "center",
            marginLeft: "5px",
            lineHeight: "12px",
          }}
        />
      )}
      <span
        style={{
          color: "white",
        }}
      >
        {text}
      </span>
    </Button>
  );
};

export default FloatingAddButton;
