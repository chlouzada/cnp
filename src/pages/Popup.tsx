import React, { useEffect, useState } from 'react';
import { MantineProvider, Container, Title, Group, Text, SegmentedControl, useMantineColorScheme, Stack, TextInput, Button, ActionIcon } from '@mantine/core';
import browser from "webextension-polyfill";
import "../global.css";

function PopupContent() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [ghToken, setGhToken] = useState('');
  const [storedToken, setStoredToken] = useState('');

  useEffect(() => {
    browser.storage.local.get(['ghToken']).then((result) => {
      if (result.ghToken) {
        setGhToken(result.ghToken as string);
        setStoredToken(result.ghToken as string);
      }
    });
  }, []);

  const handleTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGhToken(event.target.value);
  };

  const saveToken = () => {
    browser.storage.local.set({ ghToken });
    setStoredToken(ghToken);
  };

  const clearInput = () => {
    setGhToken('');
  };

  return (
    <Container p="md" style={{ width: 300, minHeight: 150 }}>
      <Stack gap="md">
        <Title order={4} c="indigo">Extension Settings</Title>

        <TextInput
          label="GitHub Token"
          placeholder="ghp_..."
          value={ghToken}
          onChange={handleTokenChange}
          rightSection={
            ghToken ? (
              <ActionIcon variant="subtle" color="gray" onClick={clearInput}>
                <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </ActionIcon>
            ) : null
          }
        />

        {ghToken !== storedToken && (
          <Button fullWidth onClick={saveToken}>
            Save
          </Button>
        )}

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
