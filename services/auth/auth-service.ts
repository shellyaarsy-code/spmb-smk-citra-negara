import "server-only";
import { Prisma, RoleName } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { hashPassword, isPasswordWithinHashLimit, isValidEmail, normalizeEmail, verifyPassword } from "./credentials";
import { createServerSession, type SafeUser } from "./sessions";

export class AuthenticationError extends Error {
  constructor() {
    super("Authentication failed");
    this.name = "AuthenticationError";
  }
}

export class RegistrationValidationError extends Error {
  constructor() {
    super("Registration data is invalid");
    this.name = "RegistrationValidationError";
  }
}

const safeUserSelect = {
  id: true,
  email: true,
  createdAt: true,
  role: { select: { name: true } },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function registrationFields(input: unknown) {
  if (!isRecord(input)) throw new RegistrationValidationError();

  const nisn = readString(input.nisn).trim();
  const fullName = readString(input.fullName).trim();
  const email = normalizeEmail(readString(input.email));
  const whatsapp = readString(input.whatsapp).trim();
  const password = readString(input.password);
  const passwordConfirmation = readString(input.passwordConfirmation);

  if (
    !/^\d{10}$/.test(nisn) ||
    !fullName ||
    !isValidEmail(email) ||
    !whatsapp ||
    password.length < 8 ||
    !isPasswordWithinHashLimit(password) ||
    password !== passwordConfirmation ||
    input.consent !== true
  ) {
    throw new RegistrationValidationError();
  }

  return { nisn, fullName, email, whatsapp, password };
}

export async function registerStudent(input: unknown): Promise<SafeUser> {
  const { nisn, fullName, email, whatsapp, password } = registrationFields(input);

  const [existingUser, existingNisn] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.studentProfile.findUnique({ where: { nisn }, select: { id: true } }),
  ]);

  if (existingUser || existingNisn) {
    await hashPassword(password);
    throw new AuthenticationError();
  }

  const role = await prisma.role.upsert({
    where: { name: RoleName.SISWA },
    update: {},
    create: { name: RoleName.SISWA },
    select: { id: true },
  });
  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        roleId: role.id,
        student: {
          create: {
            profile: {
              create: {
                nisn,
                fullName,
                phoneNumber: whatsapp,
              },
            },
          },
        },
      },
      select: safeUserSelect,
    });
    return { ...user, role: user.role.name };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AuthenticationError();
    }
    throw error;
  }
}

export async function loginUser(input: unknown) {
  if (!isRecord(input)) throw new AuthenticationError();

  const identifier = readString(input.identifier ?? input.email).trim();
  const password = readString(input.password);
  if (!identifier || !password || !isPasswordWithinHashLimit(password)) throw new AuthenticationError();

  const email = normalizeEmail(identifier);
  const isNisn = /^\d{10}$/.test(identifier);
  const user = await prisma.user.findFirst({
    where: {
      isActive: true,
      OR: [
        ...(isValidEmail(email) ? [{ email }] : []),
        ...(isNisn
          ? [{ student: { is: { profile: { is: { nisn: identifier } } } } }]
          : []),
      ],
    },
    select: {
      ...safeUserSelect,
      passwordHash: true,
    },
  });

  let validPassword = false;
  try {
    validPassword = user?.passwordHash
      ? await verifyPassword(password, user.passwordHash)
      : await hashPassword(password).then(() => false);
  } catch {
    validPassword = false;
  }

  if (!user || !validPassword) throw new AuthenticationError();

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    select: { id: true },
  });
  const session = await createServerSession(user.id);

  return { user: { id: user.id, email: user.email, createdAt: user.createdAt, role: user.role.name }, ...session };
}
