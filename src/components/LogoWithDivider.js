import { Link } from "react-router-dom";

const LogoWithDivider = () => {
  return (
    <Link
      className="brand-logo mt-2"
      to="/"
      onClick={(e) => e.preventDefault()}
    >
      <div className="divider my-2 w-100">
        <div className="divider-text">
          <h2
            className="brand-text text-white mb-0"
            style={{
              fontWeight: 700,
              fontSize: "32px",
              fontFamily: "Inter Bold",
            }}
          >
            POULPAL
          </h2>
        </div>
      </div>
    </Link>
  );
};
export default LogoWithDivider;
