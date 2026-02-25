import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { ActionIcon, Paper, Textarea, Group, ColorSwatch, Popover } from "@mantine/core";
import { IconTrash, IconPlus, IconPalette, IconLock, IconLockOpen } from "@tabler/icons-react";
import browser from "webextension-polyfill";

interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  locked: boolean;
}

const COLORS = [
  "#fff9db", // yellow
  "#e7f5ff", // blue
  "#f3f0ff", // grape
  "#ebfbee", // teal
  "#fff0f6", // pink
  "#fff5f5", // red
];

export const QuickNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const timersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Load notes on mount
  useEffect(() => {
    browser.storage.local.get("quick_notes").then((res) => {
      if (res.quick_notes) {
        setNotes(res.quick_notes);
      }
    });
    
    return () => {
      // Cleanup timers on unmount
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  const resetTimer = (id: string) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
    }

    timersRef.current[id] = setTimeout(() => {
      setNotes((currentNotes) => {
        const updated = currentNotes.map((n) => 
          n.id === id ? { ...n, locked: true } : n
        );
        browser.storage.local.set({ quick_notes: updated });
        return updated;
      });
      delete timersRef.current[id];
    }, 5000);
  };

  // Save notes whenever they change (manual or auto)
  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    browser.storage.local.set({ quick_notes: newNotes });
  };

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: "",
      x: 100 + (notes.length * 20),
      y: 100 + (notes.length * 20),
      width: 250,
      height: 200,
      color: COLORS[0],
      locked: false,
    };
    saveNotes([...notes, newNote]);
    resetTimer(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((current) => {
      const newNotes = current.map((note) => {
        if (note.id === id) {
          const updated = { ...note, ...updates };
          
          // If we just unlocked it, or if it's unlocked and we're changing content/pos/size, reset timer
          if (updates.locked === false || (!updated.locked && (updates.content !== undefined || updates.x !== undefined || updates.width !== undefined))) {
            resetTimer(id);
          }
          
          // If we manually locked it, clear the timer
          if (updates.locked === true && timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
          }

          return updated;
        }
        return note;
      });
      browser.storage.local.set({ quick_notes: newNotes });
      return newNotes;
    });
  };

  const deleteNote = (id: string) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    const newNotes = notes.filter((note) => note.id !== id);
    saveNotes(newNotes);
  };

  return (
    <>
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color="blue"
          onClick={addNote}
          title="Adicionar Nota"
        >
          <IconPlus size={24} />
        </ActionIcon>
      </div>

      {notes.map((note) => (
        <Rnd
          key={note.id}
          size={{ width: note.width, height: note.height }}
          position={{ x: note.x, y: note.y }}
          onDragStop={(e, d) => {
            updateNote(note.id, { x: d.x, y: d.y });
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            updateNote(note.id, {
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
              ...position,
            });
          }}
          disableDragging={note.locked}
          enableResizing={!note.locked}
          bounds="window"
          dragHandleClassName="note-drag-handle"
          style={{ zIndex: 100 }}
        >
          <Paper
            shadow="md"
            p="xs"
            withBorder
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              backgroundColor: note.color,
              borderColor: "rgba(0,0,0,0.1)",
              color: "#000",
            }}
          >
            <Group justify="space-between" mb="xs" className="note-drag-handle" style={{ cursor: !note.locked ? "move" : "default" }}>
              <Group gap={4}>
                <Popover position="bottom" withArrow shadow="md">
                    <Popover.Target>
                    <ActionIcon variant="subtle" size="sm" color="dark">
                        <IconPalette size={16} />
                    </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown p="xs">
                    <Group gap="xs">
                        {COLORS.map((c) => (
                        <ColorSwatch
                            key={c}
                            color={c}
                            component="button"
                            onClick={() => updateNote(note.id, { color: c })}
                            style={{ cursor: "pointer", border: "1px solid rgba(0,0,0,0.1)" }}
                        />
                        ))}
                    </Group>
                    </Popover.Dropdown>
                </Popover>

                <ActionIcon 
                  variant={note.locked ? "light" : "subtle"} 
                  size="sm" 
                  color={note.locked ? "red" : "blue"}
                  onClick={() => updateNote(note.id, { locked: !note.locked })}
                  title={note.locked ? "Destravar Nota" : "Travar Nota"}
                >
                  {note.locked ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                </ActionIcon>
              </Group>

              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => deleteNote(note.id)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>

            <Textarea
              variant="unstyled"
              value={note.content}
              onChange={(e) => updateNote(note.id, { content: e.currentTarget.value })}
              placeholder="Escreva algo..."
              styles={{
                root: { flex: 1, display: "flex" },
                wrapper: { flex: 1, display: "flex" },
                input: { 
                    flex: 1, 
                    height: "100% !important", 
                    padding: 0, 
                    fontSize: "14px",
                    color: "#333"
                },
              }}
            />
          </Paper>
        </Rnd>
      ))}
    </>
  );
};
