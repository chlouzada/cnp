import React, { useState } from "react";
import { Card, Text, Badge, Group, SimpleGrid, Avatar, Button, Tooltip, ThemeIcon, Skeleton } from "@mantine/core";
import { GithubRepo } from "../types/github";

interface RepoGridProps {
  repos: GithubRepo[];
  loading: boolean;
}

// Componente auxiliar para o botão de copiar
const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip label={copied ? "Copiado!" : `Copiar ${label}`} withArrow position="bottom">
      <Button 
        variant={copied ? "light" : "default"} 
        color={copied ? "green" : "gray"}
        size="xs" 
        onClick={handleCopy}
        leftSection={
          copied ? (
            <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          )
        }
      >
        {label}
      </Button>
    </Tooltip>
  );
};

export function RepoGrid({ repos, loading }: RepoGridProps) {
  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} height={200} radius="md" />
        ))}
      </SimpleGrid>
    );
  }

  if (repos.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        Nenhum repositório encontrado.
      </Text>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {repos.map((repo) => (
        <Card
          key={repo.id}
          component="a"
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          style={{ 
            transition: 'transform 0.2s, box-shadow 0.2s', 
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          className="hover:shadow-md hover:-translate-y-1"
        >
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <Avatar src={repo.owner.avatar_url} size="sm" radius="xl" alt={repo.owner.login} />
              <Text size="xs" fw={500} c="dimmed">
                {repo.owner.login}
              </Text>
            </Group>
            {repo.language && (
              <Badge variant="light" color="gray" size="sm">
                {repo.language}
              </Badge>
            )}
          </Group>

          <Text fw={700} size="lg" mt="xs" mb={5} c="dark" style={{ lineHeight: 1.2 }}>
            {repo.name}
          </Text>

          <Text size="sm" c="dimmed" mb="md" lineClamp={2} style={{ flex: 1 }}>
            {repo.description || "Sem descrição"}
          </Text>

          <div style={{ marginTop: 'auto' }}>
            <Group gap="xs" mb="md">
              <CopyButton text={repo.clone_url} label="HTTPS" />
              <CopyButton text={repo.ssh_url} label="SSH" />
            </Group>

            <Group justify="space-between" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
              <Group gap={4}>
                <Text size="xs">⭐</Text>
                <Text size="xs" c="dimmed">{repo.stargazers_count}</Text>
              </Group>
              <Text size="xs" c="dimmed">
                {new Date(repo.updated_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </Text>
            </Group>
          </div>
        </Card>
      ))}
    </SimpleGrid>
  );
}
