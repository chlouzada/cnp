import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, Container, Title, Button, Group, TextInput, ActionIcon, Paper, Text, Stack } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./global.css";

import { TokenForm } from "./components/TokenForm";
import { RepoGrid } from "./components/RepoGrid";
import { useGithubRepos, useValidateToken } from "./hooks/useGithub";

// Instância do React Query Client
const queryClient = new QueryClient();

const NewTabContent = () => {
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Hooks do React Query
  const { data: repos = [], isLoading: reposLoading, refetch } = useGithubRepos(token);
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
    <div style={{ backgroundColor: "var(--mantine-color-gray-0)", minHeight: "100vh", paddingBottom: "2rem" }}>
      {/* Header */}
      <Paper p="md" shadow="xs" component="header" pos="sticky" top={0} style={{ zIndex: 10 }}>
        <Container size="xl">
          <Group justify="space-between">
            <Group gap="xs">
              <Title order={3} c="indigo">🚀 Dev Dashboard</Title>
            </Group>
            
            {token && (
              <Group>
                <ActionIcon 
                  variant="light" 
                  color="indigo" 
                  size="lg" 
                  onClick={() => refetch()}
                  loading={reposLoading}
                  title="Atualizar lista"
                >
                  <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </ActionIcon>
                
                <Button 
                  variant="subtle" 
                  color="red" 
                  size="xs" 
                  onClick={handleReset}
                >
                  Sair
                </Button>
              </Group>
            )}
          </Group>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container size="xl" mt="xl">
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
                <Text size="sm" c="dimmed" style={{ borderLeft: '1px solid var(--mantine-color-gray-2)', paddingLeft: 10 }} visibleFrom="sm">
                  {filteredRepos.length} repositórios
                </Text>
              </Group>
            </Paper>
            
            <RepoGrid repos={filteredRepos} loading={reposLoading} token={token} />
          </Stack>
        )}
      </Container>
    </div>
  );
};

const NewTab = () => {
  return (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <NewTabContent />
      </QueryClientProvider>
    </MantineProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <NewTab />
  </React.StrictMode>
);
