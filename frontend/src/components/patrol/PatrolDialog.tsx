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
  mode: "new" | "schedule" | "edit";
  patrol?: any; // Pass patrol object for edit mode
  onSuccess?: () => void;
}

export function PatrolDialog({ open, onOpenChange, mode, patrol, onSuccess }: PatrolDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] lg:max-w-screen-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "new"
              ? "Start New Patrol"
              : mode === "schedule"
              ? "Schedule Patrol"
              : "Edit Patrol"}
          </DialogTitle>
          <DialogDescription>
            {mode === "new"
              ? "Fill in the details to start a new patrol"
              : mode === "schedule"
              ? "Fill in the details to schedule a future patrol"
              : "Edit patrol details and update as needed"}
          </DialogDescription>
        </DialogHeader>
        <PatrolForm
          mode={mode}
          patrol={patrol}
          onSuccess={() => {
            if (onSuccess) onSuccess();
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 