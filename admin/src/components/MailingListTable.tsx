import "./MailingListTable.css";
import CheckIcon from "../../icons/copy_button_check.svg";
import CopyIcon from "../../icons/copy.svg";
import type { Subscriber } from "../types/email";
import { useState } from "react";

interface MailingListTableProps {
  subscribers: Subscriber[];
  selected: Record<string, boolean>;
  currentPage: number;
  onToggleSubscriber: (email: string) => void;
  onToggleSelectAll: () => void;
  onCopyEmail: () => void;
}

export default function MailingListTable({
  subscribers,
  selected,
  currentPage,
  onToggleSubscriber,
  onToggleSelectAll,
  onCopyEmail,
}: MailingListTableProps) {
  const [copiedRowIds, setCopiedRowIds] = useState<Set<string>>(new Set());

  const ITEMS_PER_PAGE = 10;
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const displayedSubscribers = subscribers.slice(startIdx, endIdx);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    subscribers.length > 0 ? (
      <div className="table-container">
        <table className="mailing-list-table">
          <thead>
            <tr>
              <th>
                <span className="select-all-th-content">
                <input
                  type="checkbox"
                  checked={Object.values(selected).every((v) => v)}
                  onChange={() => onToggleSelectAll()}
                />
                <p>Select All</p>
              </span>
            </th>
            <th>
              <span className="date-th-content">
                <p>Date</p>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {displayedSubscribers.map((subscriber) => (
            <tr key={subscriber._id} className="table-row">
              <td className="col-email">
                <input
                  type="checkbox"
                  checked={selected[subscriber._id] || false}
                  onChange={() => onToggleSubscriber(subscriber._id)}
                />
                <p>{subscriber.email}</p>
              </td>
              <td className="col-date">
                <div
                  className="copy-button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(subscriber.email);
                    const newCopiedRowIds = new Set<string>();
                    newCopiedRowIds.add(subscriber._id);
                    setCopiedRowIds(newCopiedRowIds);
                    onCopyEmail();
                  }}
                >
                  <img
                    src={
                      copiedRowIds.has(subscriber._id) ? CheckIcon : CopyIcon
                    }
                    className="copy-icon"
                  />
                </div>
                <p>{formatDate(subscriber.createdAt)}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>) : (
      <div className="no-subscribers-container">
        <p className="no-subscribers-text">No subscribers found.</p>
      </div>
    )
  );
}
