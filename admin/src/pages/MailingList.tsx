import { NavBar } from "../components/NavBar";
import BackIcon from "../../icons/back.svg";
import PeopleIcon from "../../icons/people.svg";
import "./MailingList.css";

export default function MailingList() {
  const NUM_SUBSCRIBERS = 17;

  return (
    <div style={{ background: "#F9F9F9" }}>
      <NavBar />
      <div className="mailingListContainer">
        <div
          className="backContainer"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          <img src={BackIcon} className="icon" />
          <p className="backText">Back to Activities Dashboard</p>
        </div>
        <div className="mailingListHeaderContainer">
          <p className="mailingListHeaderText">Mailing List</p>
          <div className="subscribersContainer">
            <img src={PeopleIcon} className="icon" />
            <p className="subscribersText">{NUM_SUBSCRIBERS} subscribers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
