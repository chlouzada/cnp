import React, { useState } from "react";

interface TokenFormProps {
  onSave: (token: string) => void;
  loading: boolean;
  error?: string;
}

export function TokenForm({ onSave, loading, error }: TokenFormProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSave(input.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">GitHub Access Token</h2>
        <p className="text-gray-500 max-w-md">
          Para listar seus repositórios, precisamos de um Personal Access Token (Classic) com permissão de leitura de repositórios e organizações.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ghp_..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            disabled={loading}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        
        <button
          type="submit"
          disabled={!input || loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
        >
          {loading ? "Verificando..." : "Salvar Token"}
        </button>
      </form>

      <p className="text-xs text-gray-400">
        O token é salvo apenas no armazenamento local do seu navegador.
      </p>
    </div>
  );
}
