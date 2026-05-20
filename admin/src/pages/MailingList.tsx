import { NavBar } from "../components/NavBar";
import BackIcon from "../../icons/back.svg";
import PeopleIcon from "../../icons/people.svg";
import "./MailingList.css";
import MailingListTable from "../components/MailingListTable";
import { Button } from "../components/Button";
import CopyIcon from "../../icons/copy.svg";
import { useState } from "react";

export default function MailingList() {
  const subscribers = [
    { email: "example1@example.com", dateSubscribed: new Date() },
    { email: "example2@example.com", dateSubscribed: new Date() },
  ];

  const [selected, setSelected] = useState<Record<string, boolean>>({
    "example1@example.com": false,
    "example2@example.com": false,
  });

  const toggleSubscriber = (email: string) => {
    setSelected((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = Object.values(selected).every((v) => v);
    const newSelected: Record<string, boolean> = {};
    subscribers.forEach((subscriber) => {
      newSelected[subscriber.email] = !allSelected;
    });
    setSelected(newSelected);
  };

  const selectedCount = Object.values(selected).filter((v) => v).length;

  return (
    <div style={{ background: "#F9F9F9" }}>
      <NavBar />
      <div className="mailing-list-container">
        <div
          className="back-container"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          <img src={BackIcon} className="icon" />
          <p className="back-text">Back to Activities Dashboard</p>
        </div>
        <div className="mailing-list-header-container">
          <p className="mailing-list-header-text">Mailing List</p>
          <div className="subscribers-container">
            <img src={PeopleIcon} className="icon" />
            <p className="subscribers-text">{subscribers.length} subscribers</p>
          </div>
          {selectedCount > 0 && (
            <Button
              icon={CopyIcon}
              variant="secondary-left"
              className="copy-emails-button"
            >
              Copy {selectedCount} email{selectedCount > 1 ? "s" : ""}
            </Button>
          )}
        </div>
        <MailingListTable
          subscribers={subscribers}
          selected={selected}
          onToggleSubscriber={toggleSubscriber}
          onToggleSelectAll={toggleSelectAll}
        />
      </div>
    </div>
  );
}
