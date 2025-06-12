import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PatrolForm } from "./PatrolForm";

interface PatrolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "new" | "schedule";
}

export function PatrolDialog({ open, onOpenChange, mode }: PatrolDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] lg:max-w-screen-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "new" ? "Start New Patrol" : "Schedule Patrol"}
          </DialogTitle>
          <DialogDescription>
            {mode === "new"
              ? "Fill in the details to start a new patrol"
              : "Fill in the details to schedule a future patrol"}
          </DialogDescription>
        </DialogHeader>
        <PatrolForm
          mode={mode}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 