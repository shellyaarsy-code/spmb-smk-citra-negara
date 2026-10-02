import { randomUUID } from "node:crypto";

export type RegistrationNumberGenerator = () => string;

export const generateRegistrationNumber: RegistrationNumberGenerator = () => randomUUID().toUpperCase();
