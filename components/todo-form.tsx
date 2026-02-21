"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface TodoFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function TodoForm({ open, onClose, onCreated }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priority, dueDate: dueDate || null }),
    });

    if (res.ok) {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      onClose();
      onCreated();
    } else {
      setError("No se pudo crear la tarea. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="¿Qué tenés que hacer?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Detalles opcionales..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha límite</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Guardando..." : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
