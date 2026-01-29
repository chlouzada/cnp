import React from 'react';
import { MantineProvider, Container, Title, Group, Text, SegmentedControl, useMantineColorScheme, Stack } from '@mantine/core';
import "../global.css";

function PopupContent() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Container p="md" style={{ width: 300, minHeight: 150 }}>
      <Stack gap="md">
        <Title order={4} c="indigo">Extension Settings</Title>

        <Group justify="space-between">
            <Text size="sm" fw={500}>Appearance</Text>
            <SegmentedControl
                size="xs"
                value={colorScheme}
                onChange={(value) => setColorScheme(value as any)}
                data={[
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                ]}
            />
        </Group>
      </Stack>
    </Container>
  );
}

export default function Popup() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <PopupContent />
    </MantineProvider>
  );
}
