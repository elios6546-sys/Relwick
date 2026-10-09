"use client";

import { ThemeProvider, useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge, Tag } from "@/components/ui/badge";
import { Checkbox, Radio, Switch } from "@/components/ui/checkbox";
import { Field, Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { useState } from "react";

function ShowcaseInner() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState("a");

  return (
    <main className="site-container" style={{ padding: "48px 0", display: "grid", gap: 24 }}>
      <h1 style={{ font: "var(--text-h2)" }}>Composants UI — thème {theme}</h1>
      <Button variant="secondary" onClick={toggleTheme}>
        Basculer le thème
      </Button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="soft">Soft</Button>
        <Button variant="danger">Danger</Button>
      </div>
      <Card>
        <Field label="Champ">
          <Input placeholder="Texte" />
        </Field>
        <Field label="Liste">
          <Select>
            <option>Option</option>
          </Select>
        </Field>
        <Checkbox label="Case à cocher" defaultChecked />
        <Radio name="r" label="Radio" defaultChecked />
        <Switch label="Switch" checked onChange={() => undefined} />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Badge tone="primary" dot>
            Badge
          </Badge>
          <Tag>Tag</Tag>
        </div>
      </Card>
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "a", label: "Onglet A" },
          { value: "b", label: "Onglet B" },
        ]}
      />
    </main>
  );
}

export function DevUiShowcase() {
  return (
    <ThemeProvider>
      <ShowcaseInner />
    </ThemeProvider>
  );
}
