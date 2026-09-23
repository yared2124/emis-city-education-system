"use server";

import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

import {
  createSchoolSchema,
  updateSchoolSchema,
} from "@/features/schools/schemas/school-schema";

import {
  archiveSchool,
  createSchool,
  updateSchool,
} from "@/features/schools/services/school-service";

import { AuthError } from "@/lib/auth/errors";

export type FormState = {
  ok: boolean;
  error?: string;
};

function toFormState(error: unknown): FormState {
  if (error instanceof AuthError) {
    return {
      ok: false,
      error: error.message,
    };
  }

  if (error && typeof error === "object" && "name" in error) {
    const name = (error as { name?: string }).name;

    if (name === "ZodError") {
      const issues = (error as { issues?: Array<{ message: string }> }).issues;

      return {
        ok: false,
        error: issues?.[0]?.message ?? "Please check the form values.",
      };
    }

    if (name === "PrismaClientKnownRequestError") {
      const code = (error as { code?: string }).code;

      if (code === "P2002") {
        return {
          ok: false,
          error: "A school with this code already exists.",
        };
      }
    }
  }

  return {
    ok: false,
    error: "Something went wrong. Please try again.",
  };
}

function readForm(formData: FormData) {
  return {
    code: String(formData.get("code") ?? ""),
    name: String(formData.get("name") ?? ""),
    type: String(formData.get("type") ?? ""),
    districtId: String(formData.get("districtId") ?? ""),
    location: String(formData.get("location") ?? ""),
    address: String(formData.get("address") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    capacity: formData.get("capacity")
      ? String(formData.get("capacity"))
      : "",
  };
}

function readUpdateForm(formData: FormData) {
  return {
    id: String(formData.get("id") ?? ""),
    ...readForm(formData),
  };
}

export async function createSchoolAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  let school;

  try {
    const parsed = createSchoolSchema.parse(readForm(formData));

    school = await createSchool(parsed);
  } catch (error) {
    return toFormState(error);
  }

  revalidatePath("/schools");

  redirect(`/schools/${school.id}`);
}

export async function updateSchoolAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  let schoolId;

  try {
    const parsed = updateSchoolSchema.parse(readUpdateForm(formData));

    schoolId = (await updateSchool(parsed)).id;
  } catch (error) {
    return toFormState(error);
  }

  revalidatePath("/schools");

  revalidatePath(`/schools/${schoolId}`);

  return {
    ok: true,
  };
}

export async function archiveSchoolAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  let schoolId;

  try {
    schoolId = String(formData.get("id") ?? "");

    await archiveSchool(schoolId);
  } catch (error) {
    return toFormState(error);
  }

  revalidatePath("/schools");

  revalidatePath(`/schools/${schoolId}`);

  return {
    ok: true,
  };
}
