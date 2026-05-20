import "./MailingListTable.css";
// import CheckIcon from "../../icons/check.svg";
import CopyIcon from "../../icons/copy.svg";

interface MailingListTableProps {
  subscribers: {
    email: string;
    dateSubscribed: Date;
  }[];
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
            <tr key={subscriber.email} className="table-row">
              <td className="col-email">
                <input type="checkbox" checked={selected[subscriber.email] || false} onChange={() => onToggleSubscriber(subscriber.email)} />
                <p>{subscriber.email}</p>
              </td>
              <td className="col-date">
                <div className="copy-button">
                  <img src={CopyIcon} className="copy-icon" />
                </div>
                <p>{subscriber.dateSubscribed.toLocaleDateString()}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
