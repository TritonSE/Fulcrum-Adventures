import "./MailingListTable.css";
// import CheckIcon from "../../icons/check.svg";
import CopyIcon from "../../icons/copy.svg";
import type { Subscriber } from "../types/email";

interface MailingListTableProps {
  subscribers: Subscriber[];
  selected: Record<string, boolean>;
  onToggleSubscriber: (email: string) => void;
  onToggleSelectAll: () => void;
}

export default function MailingListTable({
  subscribers,
  selected,
  onToggleSubscriber,
  onToggleSelectAll,
}: MailingListTableProps) {

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="table-container">
      <table className="mailing-list-table">
        <thead>
          <tr>
            <th>
              <span className="select-all-th-content">
                <input type="checkbox" checked={Object.values(selected).every((v) => v)} onChange={() => onToggleSelectAll()} />
                <p>Select All</p>
              </span>
            </th>
            <th>
              <span className="date-th-content">
                <p>
                  Date
                </p>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((subscriber) => (
            <tr key={subscriber._id} className="table-row">
              <td className="col-email">
                <input type="checkbox" checked={selected[subscriber._id] || false} onChange={() => onToggleSubscriber(subscriber._id)} />
                <p>{subscriber.email}</p>
              </td>
              <td className="col-date">
                <div className="copy-button">
                  <img src={CopyIcon} className="copy-icon" />
                </div>
                <p>{formatDate(subscriber.createdAt)}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
