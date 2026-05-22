import { NavBar } from "../components/NavBar";
import BackIcon from "../../icons/back.svg";
import PeopleIcon from "../../icons/people.svg";
import "./MailingList.css";
import MailingListTable from "../components/MailingListTable";
import { Button } from "../components/Button";
import CopyIcon from "../../icons/copy.svg";
import { useEffect, useState } from "react";
import type { Subscriber } from "../types/email";
import { fetchAllEmails } from "../api/emails";
import { Pagination } from "../components/Pagination";

export default function MailingList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchSubscribers = async () => {
      const result = await fetchAllEmails();
      const defaultSelected: Record<string, boolean> = {};
      result.emails.forEach((subscriber) => {
        defaultSelected[subscriber._id] = false;
      });
      setSubscribers(result.emails);
      setSelected(defaultSelected);
      setTotalSubscribers(result.total);
      setTotalPages(result.totalPages);
    };
    fetchSubscribers();
  }, []);

  const toggleSubscriber = (id: string) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = Object.values(selected).every((v) => v);
    const newSelected: Record<string, boolean> = {};
    subscribers.forEach((subscriber) => {
      newSelected[subscriber._id] = !allSelected;
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
            <p className="subscribers-text">{totalSubscribers} subscribers</p>
          </div>
          {selectedCount > 0 && (
            <Button
              icon={CopyIcon}
              variant="secondary-left"
              className="copy-emails-button"
              onClick={() => {
                const selectedEmails = subscribers
                  .filter((subscriber) => selected[subscriber._id])
                  .map((subscriber) => subscriber.email)
                  .join(", ");
                navigator.clipboard.writeText(selectedEmails);
              }}
            >
              Copy {selectedCount} email{selectedCount > 1 ? "s" : ""}
            </Button>
          )}
        </div>

        <MailingListTable
          subscribers={subscribers}
          selected={selected}
          currentPage={currentPage}
          onToggleSubscriber={toggleSubscriber}
          onToggleSelectAll={toggleSelectAll}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
