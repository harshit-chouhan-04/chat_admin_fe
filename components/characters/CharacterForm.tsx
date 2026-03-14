'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CharacterFormValues = {
  name: string;
  slug: string;
  age: string;
  gender: string;
  sexuality: string;
  description: string;
  personalityPrompt: string;
  systemPrompt: string;
  scenario: string;
  greetingMessage: string;
  conversationStyle: string;
  voiceModel: string;
  visibility: string;
  isNsfw: boolean;
  isActive: boolean;
};

type Props = {
  initialValues?: Partial<CharacterFormValues>;
  submitText: string;
  onSubmit: (values: CharacterFormValues) => void;
  onCancel: () => void;
};

const defaultValues: CharacterFormValues = {
  name: "",
  slug: "",
  age: "",
  gender: "",
  sexuality: "",
  description: "",
  personalityPrompt: "",
  systemPrompt: "",
  scenario: "",
  greetingMessage: "",
  conversationStyle: "",
  voiceModel: "",
  visibility: "public",
  isNsfw: false,
  isActive: true,
};

export default function CharacterForm({ initialValues, submitText, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<CharacterFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  useEffect(() => {
    setForm({
      ...defaultValues,
      ...initialValues,
    });
  }, [
    initialValues?.name,
    initialValues?.slug,
    initialValues?.age,
    initialValues?.gender,
    initialValues?.sexuality,
    initialValues?.description,
    initialValues?.personalityPrompt,
    initialValues?.systemPrompt,
    initialValues?.scenario,
    initialValues?.greetingMessage,
    initialValues?.conversationStyle,
    initialValues?.voiceModel,
    initialValues?.visibility,
    initialValues?.isNsfw,
    initialValues?.isActive,
  ]);

  const update = <K extends keyof CharacterFormValues>(key: K, value: CharacterFormValues[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Basic Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={e => update("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={form.slug} onChange={e => update("slug", e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" value={form.age} onChange={e => update("age", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={v => update("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sexuality">Sexuality</Label>
              <Input id="sexuality" value={form.sexuality} onChange={e => update("sexuality", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={e => update("description", e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">AI Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personalityPrompt">Personality Prompt</Label>
            <Textarea id="personalityPrompt" value={form.personalityPrompt} onChange={e => update("personalityPrompt", e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea id="systemPrompt" value={form.systemPrompt} onChange={e => update("systemPrompt", e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scenario">Scenario</Label>
            <Textarea id="scenario" value={form.scenario} onChange={e => update("scenario", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="greetingMessage">Greeting Message</Label>
            <Textarea id="greetingMessage" value={form.greetingMessage} onChange={e => update("greetingMessage", e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conversationStyle">Conversation Style</Label>
              <Input id="conversationStyle" value={form.conversationStyle} onChange={e => update("conversationStyle", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voiceModel">Voice Model</Label>
              <Input id="voiceModel" value={form.voiceModel} onChange={e => update("voiceModel", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={form.visibility} onValueChange={v => update("visibility", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isNsfw">NSFW Content</Label>
            <Switch id="isNsfw" checked={form.isNsfw} onCheckedChange={v => update("isNsfw", v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch id="isActive" checked={form.isActive} onCheckedChange={v => update("isActive", v)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitText}</Button>
      </div>
    </form>
  );
}
