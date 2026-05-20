import "./MailingListTable.css";
// import CheckIcon from "../../icons/check.svg";
import CopyIcon from "../../icons/copy.svg";

interface MailingListTableProps {
  subscribers: {
    email: string;
    dateSubscribed: Date;
  }[];
}

export default function MailingListTable({
  subscribers,
}: MailingListTableProps) {
  return (
    <div className="table-container">
      <table className="mailing-list-table">
        <thead>
          <tr>
            <th>
              <span className="select-all-th-content">
                <input type="checkbox" />
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
                <input type="checkbox" />
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
