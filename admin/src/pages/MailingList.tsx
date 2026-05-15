import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { fetchEmails } from "../api/emails";
import { Button } from "../components/Button";
import { NavBar } from "../components/NavBar";
import type { Subscriber } from "../types/email";

import BackIcon from "../../icons/back.svg";
import PeopleIcon from "../../icons/people.svg";
import "./MailingList.css";

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MailingList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const loadEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmails(page, PAGE_SIZE);
      setSubscribers(data.emails);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSelectedIds(new Set());
    } catch {
      setError("Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadEmails();
  }, [loadEmails]);

  const pageIds = useMemo(() => subscribers.map((s) => s._id), [subscribers]);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someOnPageSelected = pageIds.some((id) => selectedIds.has(id));

  const selectedEmails = useMemo(
    () => subscribers.filter((s) => selectedIds.has(s._id)).map((s) => s.email),
    [subscribers, selectedIds],
  );

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageIds));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopy = async () => {
    if (selectedEmails.length === 0) return;
    const text = selectedEmails.join(", ");
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch {
      setCopyFeedback("Copy failed");
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  return (
    <div className="mailingListPage" style={{ background: "#F9F9F9" }}>
      <NavBar />
      <div className="mailingListContainer">
        <Link to="/dashboard" className="backContainer">
          <img src={BackIcon} className="icon" alt="" />
          <p className="backText">Back to Activities Dashboard</p>
        </Link>

        <div className="mailingListHeaderContainer">
          <p className="mailingListHeaderText">Mailing List</p>
          <div className="subscribersContainer">
            <img src={PeopleIcon} className="icon" alt="" />
            <p className="subscribersText">
              {loading ? "…" : total} subscriber{total === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="mailingListActions">
          <Button
            variant="primary"
            showIcon={false}
            disabled={selectedEmails.length === 0}
            onClick={() => void handleCopy()}
          >
            {copyFeedback ?? `Copy ${selectedEmails.length} email${selectedEmails.length === 1 ? "" : "s"}`}
          </Button>
        </div>

        <div className="mailingListTableCard">
          {error ? (
            <p className="mailingListMessage mailingListMessage--error">{error}</p>
          ) : loading ? (
            <p className="mailingListMessage">Loading subscribers…</p>
          ) : subscribers.length === 0 ? (
            <p className="mailingListMessage">No subscribers yet.</p>
          ) : (
            <table className="mailingListTable">
              <thead>
                <tr>
                  <th className="mailingListTable__checkboxCol">
                    <input
                      type="checkbox"
                      className="mailingListCheckbox"
                      checked={allOnPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected;
                      }}
                      onChange={toggleSelectAll}
                      aria-label="Select all on this page"
                    />
                  </th>
                  <th>Email</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id}>
                    <td>
                      <input
                        type="checkbox"
                        className="mailingListCheckbox"
                        checked={selectedIds.has(subscriber._id)}
                        onChange={() => toggleRow(subscriber._id)}
                        aria-label={`Select ${subscriber.email}`}
                      />
                    </td>
                    <td className="mailingListTable__email">{subscriber.email}</td>
                    <td className="mailingListTable__date">{formatDate(subscriber.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mailingListPagination">
            <Button
              variant="secondary-left"
              showIcon={false}
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="mailingListPagination__info">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary-left"
              showIcon={false}
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
