import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./global.css";

import { GithubRepo } from "./types/github";
import { validateToken, fetchAllRecentRepos } from "./services/github";
import { TokenForm } from "./components/TokenForm";
import { RepoGrid } from "./components/RepoGrid";

const NewTab = () => {
  const [token, setToken] = useState<string | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Load token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("gh_token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch repos when token changes
  useEffect(() => {
    if (token) {
      loadData(token);
    }
  }, [token]);

  // Focus input when token exists (view is active)
  useEffect(() => {
    if (token && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [token, loading]); // Tenta focar quando logar ou terminar de carregar

  const loadData = async (authToken: string) => {
    setLoading(true);
    try {
      const data = await fetchAllRecentRepos(authToken);
      setRepos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToken = async (newToken: string) => {
    setAuthLoading(true);
    setError(undefined);
    try {
      const isValid = await validateToken(newToken);
      if (isValid) {
        localStorage.setItem("gh_token", newToken);
        setToken(newToken);
      } else {
        setError("Token inválido ou expirado.");
      }
    } catch (err) {
      setError("Erro ao validar token. Verifique sua conexão.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("gh_token");
    setToken(null);
    setRepos([]);
    setSearchQuery("");
  };

  // Lógica de Filtragem
  const filteredRepos = repos.filter((repo) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = repo.name.toLowerCase().includes(query);
    const orgMatch = repo.owner.login.toLowerCase().includes(query);
    return nameMatch || orgMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            🚀 Dev Dashboard
          </h1>
          
          {token && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => loadData(token)}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-full transition"
                disabled={loading}
                title="Atualizar lista"
              >
                <svg className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <button
                onClick={handleReset}
                className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition border border-transparent hover:border-red-100"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!token ? (
          <TokenForm 
            onSave={handleSaveToken} 
            loading={authLoading} 
            error={error}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <div className="relative flex-1 w-full">
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Pesquisar repositórios ou organizações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent border-none text-lg text-gray-800 placeholder-gray-400 focus:ring-0 outline-none"
                  tabIndex={1}
                />
              </div>
              <div className="text-sm text-gray-500 whitespace-nowrap px-2 border-l border-gray-100 hidden sm:block">
                {filteredRepos.length} repositórios
              </div>
            </div>
            
            <RepoGrid repos={filteredRepos} loading={loading} />
          </div>
        )}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <NewTab />
  </React.StrictMode>
);
