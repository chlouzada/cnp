import React from "react";
import { Modal, Text, Group, Badge, Loader, Timeline, Avatar, ThemeIcon, Anchor, Stack } from "@mantine/core";
import { GithubRepo } from "../types/github";
import { useRecentActions } from "../hooks/useGithub";

interface ActionsModalProps {
  repo: GithubRepo | null;
  token: string | null;
  opened: boolean;
  onClose: () => void;
}

export function ActionsModal({ repo, token, opened, onClose }: ActionsModalProps) {
  const { data: actions, isLoading } = useRecentActions(
    token, 
    repo?.owner.login ?? "", 
    repo?.name ?? "", 
    opened // Só busca quando o modal está aberto
  );

  const getStatusColor = (status: string, conclusion: string | null) => {
    if (status === "in_progress" || status === "queued") return "yellow";
    if (conclusion === "success") return "green";
    if (conclusion === "failure") return "red";
    if (conclusion === "cancelled") return "gray";
    return "blue";
  };

  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === "in_progress" || status === "queued") {
      return (
        <ThemeIcon size={20} color="yellow" radius="xl">
          <Loader size={12} color="white" />
        </ThemeIcon>
      );
    }
    if (conclusion === "success") {
      return (
        <ThemeIcon size={20} color="green" radius="xl">
          <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </ThemeIcon>
      );
    }
    if (conclusion === "failure") {
      return (
        <ThemeIcon size={20} color="red" radius="xl">
          <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </ThemeIcon>
      );
    }
    return (
      <ThemeIcon size={20} color="gray" radius="xl">
        <div style={{ width: 8, height: 8, backgroundColor: 'white', borderRadius: '50%' }} />
      </ThemeIcon>
    );
  };

  return (
    <Modal 
      centered
      opened={opened} 
      onClose={onClose} 
      title={<Text fw={700}>Actions: {repo?.name}</Text>}
      size="lg"
    >
      {isLoading ? (
        <Group justify="center" p="xl">
          <Loader />
        </Group>
      ) : !actions || actions.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">Nenhum workflow executado recentemente.</Text>
      ) : (
        <Timeline active={-1} bulletSize={24} lineWidth={2}>
          {actions.map((action) => (
            <Timeline.Item 
              key={action.id} 
              bullet={getStatusIcon(action.status, action.conclusion)}
              title={
                <Group gap="xs">
                  <Text size="sm" fw={500} component="span">{action.name}</Text>
                  <Badge 
                    size="xs" 
                    color={getStatusColor(action.status, action.conclusion)} 
                    variant="light"
                  >
                    {action.conclusion || action.status}
                  </Badge>
                </Group>
              }
            >
              <Text c="dimmed" size="xs" mt={4}>
                {action.display_title}
              </Text>
              
              <Group gap="xs" mt={4}>
                <Avatar src={action.actor.avatar_url} size={20} radius="xl" />
                <Text size="xs" c="dimmed">
                  por {action.actor.login}
                </Text>
                <Text size="xs" c="dimmed">•</Text>
                <Text size="xs" c="dimmed">
                  {new Date(action.created_at).toLocaleString("pt-BR")}
                </Text>
                <Text size="xs" c="dimmed">•</Text>
                <Anchor href={action.html_url} target="_blank" size="xs">
                  Ver Logs
                </Anchor>
              </Group>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </Modal>
  );
}
