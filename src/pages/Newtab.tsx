import React, { useEffect, useState } from "react";
import { MantineProvider, Container, Title, Button, Group, TextInput, ActionIcon, Paper, Text, Stack, Tooltip } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../global.css";
import "./Newtab.css";

import { TokenForm } from "../components/TokenForm";
import { RepoGrid } from "../components/RepoGrid";
import { useGithubRepos, useValidateToken } from "../hooks/useGithub";

// Instância do React Query Client
const queryClient = new QueryClient();

const NewTabContent = () => {
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Hooks do React Query
  const { data: repos = [], isLoading: reposLoading } = useGithubRepos(token);
  const { mutateAsync: validateTokenMutation, isPending: authLoading, error: authError } = useValidateToken();

  // Load token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("gh_token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Focus input when repos load
  useEffect(() => {
    if (token && !reposLoading && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [token, reposLoading]);

  const handleSaveToken = async (newToken: string) => {
    try {
      const isValid = await validateTokenMutation(newToken);
      if (isValid) {
        localStorage.setItem("gh_token", newToken);
        setToken(newToken);
      } else {
        throw new Error("Token inválido");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("gh_token");
    setToken(null);
    setSearchQuery("");
    queryClient.removeQueries({ queryKey: ["repos"] });
  };

  // Lógica de Filtragem (Simples)
  const filteredRepos = repos.filter((repo) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = repo.name.toLowerCase().includes(query);
    const orgMatch = repo.owner.login.toLowerCase().includes(query);
    return nameMatch || orgMatch;
  });

  return (
    <div style={{ backgroundColor: "var(--mantine-color-gray-2)", minHeight: "100vh", paddingBottom: "2rem" }}>
      {/* Main Content */}
      <Container size="xl" pt="xl">
        {!token ? (
          <TokenForm 
            onSave={handleSaveToken} 
            loading={authLoading} 
            error={authError ? "Token inválido ou erro de conexão." : undefined}
          />
        ) : (
          <Stack gap="lg">
            <Paper p="md" shadow="sm" radius="md">
              <Group align="center" gap="md">
                  <div style={{ flex: 1, position: 'relative' }}>
                  <TextInput
                    ref={searchInputRef}
                    placeholder="Pesquisar repositórios ou organizações..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    size="md"
                    leftSection={
                      <svg style={{ width: 16, height: 16, color: 'gray' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    }
                    variant="unstyled"
                  />
                </div>
                
                <Group gap="xs" style={{ borderLeft: '1px solid var(--mantine-color-gray-2)', paddingLeft: 10 }} visibleFrom="sm">
                  <Text size="sm" c="dimmed">
                    {filteredRepos.length} repos
                  </Text>
                  
                  <Tooltip label="Sair / Trocar Token" withArrow>
                    <ActionIcon 
                      variant="subtle" 
                      color="red" 
                      size="md" 
                      onClick={handleReset}
                    >
                      <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Paper>
            
            <RepoGrid repos={filteredRepos} loading={reposLoading} token={token} />
          </Stack>
        )}
      </Container>
    </div>
  );
};

export default function NewTab() {
  return (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <NewTabContent />
      </QueryClientProvider>
    </MantineProvider>
  );
}
