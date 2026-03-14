"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActions } from "@/components/RowActions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { mockCharacters, getCategoryById } from "@/lib/mock-data";

const CharactersList = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const filtered = mockCharacters.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Characters"
        description="Manage AI characters"
        actions={<Button onClick={() => router.push("/characters/add")} size="sm"><Plus className="h-4 w-4 mr-1" />Add Character</Button>}
      />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search characters..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Character</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((char) => (
                <TableRow key={char.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-secondary">{char.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium">{char.name}</span>
                        <p className="text-xs text-muted-foreground font-mono">/{char.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{char.gender}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {char.categories.map(id => getCategoryById(id)?.name).filter(Boolean).join(", ")}
                  </TableCell>
                  <TableCell><StatusBadge status={char.visibility as any} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-chart-amber text-chart-amber" />
                      <span className="text-sm font-mono">{char.rating}</span>
                      <span className="text-xs text-muted-foreground">({char.ratingCount})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={char.isActive ? "active" : "inactive"} />
                    {char.isNsfw && <StatusBadge status="nsfw" className="ml-1" />}
                  </TableCell>
                  <TableCell>
                    <RowActions viewUrl={`/characters/${char.id}/detail`} editUrl={`/characters/${char.id}/edit`} onDelete={() => {}} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} characters</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="h-8 px-3 font-mono text-xs">1</Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CharactersList;
