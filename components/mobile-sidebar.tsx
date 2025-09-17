"use client";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface MobileSidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileSidebarToggle({ isOpen, onToggle }: MobileSidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="md:hidden p-2 h-8 w-8"
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      {isOpen ? <X size={16} /> : <Menu size={16} />}
    </Button>
  );
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileSidebar({ isOpen, onClose, children }: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[color:var(--background)] border-r border-white/10">
        {children}
      </div>
    </div>
  );
}