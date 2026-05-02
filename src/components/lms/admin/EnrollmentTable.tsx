"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Adaptar a la data real obtenida de Prisma
type EnrollmentWithCustomer = {
  id: string;
  enrolledAt: Date;
  completedAt: Date | null;
  progress: number;
  orderId: string;
  customer: {
    name: string;
    email: string;
  };
};

interface EnrollmentTableProps {
  enrollments: EnrollmentWithCustomer[];
}

export function EnrollmentTable({ enrollments }: EnrollmentTableProps) {
  if (enrollments.length === 0) {
    return <p className="text-muted-foreground text-center p-8 border rounded-lg bg-muted/10">No hay alumnos matriculados aún.</p>;
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Orden Origen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => (
            <TableRow key={enrollment.id}>
              <TableCell>
                <div className="font-medium">{enrollment.customer.name}</div>
                <div className="text-xs text-muted-foreground">{enrollment.customer.email}</div>
              </TableCell>
              <TableCell>
                {format(new Date(enrollment.enrolledAt), "dd MMM yyyy", { locale: es })}
              </TableCell>
              <TableCell className="w-[200px]">
                <div className="flex items-center gap-2">
                  <Progress value={enrollment.progress} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {Math.round(enrollment.progress)}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {enrollment.progress === 100 ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completado</span>
                ) : enrollment.progress > 0 ? (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">En curso</span>
                ) : (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">No iniciado</span>
                )}
              </TableCell>
              <TableCell className="text-xs font-mono text-muted-foreground">
                {enrollment.orderId.slice(-8).toUpperCase()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
