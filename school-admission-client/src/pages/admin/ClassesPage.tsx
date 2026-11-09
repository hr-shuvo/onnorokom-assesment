import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "../../api/client";
import {
  deleteAcademicClass,
  listAcademicClasses,
  saveAcademicClass,
  toggleAcademicClassStatus,
} from "../../api/academic-classes";
import type { AcademicClass, AcademicClassInput } from "../../types/academic-class";
import { SHIFTS } from "../../types/academic-class";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

const emptyForm: AcademicClassInput = {
  name: "",
  order: 0,
  totalSeats: 1,
  isActive: true,
  shift: "Morning",
};

export default function ClassesPage() {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<AcademicClass | null>(null);
  const [form, setForm] = useState<AcademicClassInput>(emptyForm);
  const [deletingClass, setDeletingClass] = useState<AcademicClass | null>(null);

  const { data, error, isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: listAcademicClasses,
  });

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: ["classes"] });
  }

  const saveMutation = useMutation({
    mutationFn: saveAcademicClass,
    onSuccess: () => {
      toast.success(editingClass ? "Class updated." : "Class created.");
      setIsFormOpen(false);
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAcademicClass,
    onSuccess: () => {
      toast.success("Class deleted.");
      setDeletingClass(null);
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleAcademicClassStatus,
    onSuccess: () => {
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  function openCreateForm() {
    setEditingClass(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(academicClass: AcademicClass) {
    setEditingClass(academicClass);
    setForm({
      name: academicClass.name,
      order: academicClass.order,
      totalSeats: academicClass.totalSeats,
      isActive: academicClass.isActive,
      shift: academicClass.shift,
    });
    setIsFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    saveMutation.mutate(editingClass ? { ...form, id: editingClass.id } : form);
  }

  const isSaving = saveMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Classes</h1>
        <Button onClick={openCreateForm}>
          <PlusIcon />
          New Class
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">{getErrorMessage(error)}</p>}

      {data && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Total Seats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No classes yet.
                </TableCell>
              </TableRow>
            )}
            {data.items.map((academicClass) => (
              <TableRow key={academicClass.id}>
                <TableCell>{academicClass.order}</TableCell>
                <TableCell>{academicClass.name}</TableCell>
                <TableCell>{academicClass.shift}</TableCell>
                <TableCell>{academicClass.totalSeats}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => toggleStatusMutation.mutate(academicClass.id)}
                    disabled={toggleStatusMutation.isPending}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                      academicClass.isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {academicClass.isActive ? "Active" : "Inactive"}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEditForm(academicClass)}
                  >
                    <PencilIcon />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeletingClass(academicClass)}
                  >
                    <Trash2Icon />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingClass ? "Edit Class" : "New Class"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Class 5"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalSeats">Total Seats</Label>
                <Input
                  id="totalSeats"
                  type="number"
                  min={1}
                  value={form.totalSeats}
                  onChange={(e) => setForm({ ...form, totalSeats: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift">Shift</Label>
              <select
                id="shift"
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value as AcademicClassInput["shift"] })}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {SHIFTS.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>

            <Label className="gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="size-4"
              />
              Active
            </Label>

            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deletingClass !== null}
        onOpenChange={(open) => !open && setDeletingClass(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingClass?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingClass && deleteMutation.mutate(deletingClass.id)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
