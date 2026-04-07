import { z, type ZodTypeAny } from "zod";

export const emptyStringToNull = <T extends ZodTypeAny>(schema: T) =>
  z.preprocess((value) => value === "" ? null : value, schema);

export const optionalStringNullable = emptyStringToNull(z.string().optional().nullable());
