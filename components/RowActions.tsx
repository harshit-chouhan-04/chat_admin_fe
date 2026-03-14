"use client";

import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface RowActionsProps {
  viewUrl?: string;
  editUrl?: string;
  onDelete?: () => void;
}

export function RowActions({ viewUrl, editUrl, onDelete }: RowActionsProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {viewUrl && (
          <DropdownMenuItem onClick={() => router.push(viewUrl)}>
            <Eye className="h-4 w-4 mr-2" /> View
          </DropdownMenuItem>
        )}
        {editUrl && (
          <DropdownMenuItem onClick={() => router.push(editUrl)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
