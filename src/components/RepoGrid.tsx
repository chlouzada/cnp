import React, { useState } from "react";
import { GithubRepo } from "../types/github";

interface RepoGridProps {
  repos: GithubRepo[];
  loading: boolean;
}

// Componente auxiliar para o botão de copiar
const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita abrir o link do card
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        px-2 py-1 text-xs font-medium rounded border transition-all duration-200 flex items-center gap-1
        ${
          copied
            ? "bg-green-50 text-green-600 border-green-200"
            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
        }
      `}
      title={`Copiar ${label}`}
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {label}
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
};

export function RepoGrid({ repos, loading }: RepoGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        Nenhum repositório encontrado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {repos.map((repo) => (
        <a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition duration-200 h-full"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <img
                src={repo.owner.avatar_url}
                alt={repo.owner.login}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs font-medium text-gray-500">
                {repo.owner.login}
              </span>
            </div>
            {repo.language && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {repo.language}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate mb-1">
            {repo.name}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-2 flex-grow mb-4 h-10">
            {repo.description || "Sem descrição"}
          </p>

          <div className="mt-auto space-y-3">
            {/* Clone Buttons */}
            <div className="flex gap-2">
              <CopyButton text={repo.clone_url} label="HTTPS" />
              <CopyButton text={repo.ssh_url} label="SSH" />
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                ⭐ {repo.stargazers_count}
              </span>
              <span>
                Atualizado:{" "}
                {new Date(repo.updated_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
