"use client";

import { useState } from "react";
import Image from "next/image";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  created_at: string;
};

type Props = {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void>;
};

function getFavicon(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookmarkItem({ bookmark, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    await onDelete(bookmark.id);
  };

  const favicon = getFavicon(bookmark.url);
  let displayUrl = "";
  try {
    displayUrl = new URL(bookmark.url).hostname.replace("www.", "");
  } catch {
    displayUrl = bookmark.url;
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 group ${deleting ? "opacity-50" : ""}`}
    >
      {/* Favicon */}
      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {favicon ? (
          <Image
            src={favicon}
            alt=""
            width={20}
            height={20}
            className="w-5 h-5"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
            unoptimized
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
            />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-gray-800 hover:text-indigo-600 transition-colors truncate block"
        >
          {bookmark.title}
        </a>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 truncate">{displayUrl}</span>
          <span className="text-gray-200">•</span>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatDate(bookmark.created_at)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
          title="Open link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>

        <button
          onClick={handleDelete}
          disabled={deleting}
          title={confirmDelete ? "Click again to confirm" : "Delete bookmark"}
          className={`transition-colors opacity-0 group-hover:opacity-100 text-sm rounded-lg px-2 py-1 ${
            confirmDelete
              ? "bg-red-100 text-red-600 opacity-100"
              : "text-gray-300 hover:text-red-500"
          }`}
        >
          {confirmDelete ? (
            <span className="text-xs font-medium">Confirm?</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}