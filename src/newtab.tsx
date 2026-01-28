import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, Container, Title, Button, Group, TextInput, ActionIcon, Paper, Text, Stack } from "@mantine/core";
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
  }, [token, loading]);

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
    <MantineProvider>
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
                    onClick={() => loadData(token)}
                    loading={loading}
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
              error={error}
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
              
              <RepoGrid repos={filteredRepos} loading={loading} />
            </Stack>
          )}
        </Container>
      </div>
    </MantineProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <NewTab />
  </React.StrictMode>
);
