import { ApplicationStatus } from "@prisma/client";

export class InvalidApplicationTransitionError extends Error {
  constructor() {
    super("Application status transition is not allowed");
    this.name = "InvalidApplicationTransitionError";
  }
}

const allowedTransitions = new Set([`${ApplicationStatus.DRAFT}:${ApplicationStatus.SUBMITTED}`]);

export function assertApplicationTransition(from: ApplicationStatus, to: ApplicationStatus) {
  if (!allowedTransitions.has(`${from}:${to}`)) throw new InvalidApplicationTransitionError();
}
