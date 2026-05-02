export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, "UNAUTHORIZED");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "No encontrado") {
    super(message, "NOT_FOUND");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Sin permisos") {
    super(message, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto de datos") {
    super(message, "CONFLICT");
  }
}
