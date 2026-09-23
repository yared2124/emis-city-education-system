"use client";

import { useActionState } from "react";

import {
  createSchoolAction,
  updateSchoolAction,
  type FormState,
} from "@/features/schools/actions/school-actions";

import {
  Button,
  ErrorBanner,
  Field,
  inputClasses,
} from "@/components/ui";

const SCHOOL_TYPES = [
  "PRIMARY",
  "SECONDARY",
  "PREPARATORY",
  "COMBINED",
  "SPECIAL",
  "OTHER",
];

export type DistrictOption = {
  id: string;
  name: string;
  city: {
    name: string;
  };
};

export type SchoolFormValues = {
  id?: string;
  code: string;
  name: string;
  type: string;
  districtId: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  capacity: string;
};

const initialState: FormState = {
  ok: false,
};

export function SchoolForm({
  districts,
  values,
  mode,
}: {
  districts: DistrictOption[];
  values?: SchoolFormValues;
  mode: "create" | "edit";
}) {
  const [state, action, pending] = useActionState(
    mode === "create" ? createSchoolAction : updateSchoolAction,
    initialState,
  );

  const v = values;

  return (
    <form action={action} className="space-y-5 p-5 sm:p-6">
      {v?.id ? <input type="hidden" name="id" value={v.id} /> : null}

      {state.ok ? (
        <div
          role="status"
          className="rounded-lg bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200"
        >
          Changes saved.
        </div>
      ) : null}

      {!state.ok && state.error ? <ErrorBanner>{state.error}</ErrorBanner> : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="School code" htmlFor="code">
          <input
            id="code"
            name="code"
            defaultValue={v?.code}
            placeholder="e.g. SCH-1024"
            required
            maxLength={32}
            className={inputClasses}
          />
        </Field>

        <Field label="School name" htmlFor="name">
          <input
            id="name"
            name="name"
            defaultValue={v?.name}
            placeholder="e.g. Central Primary School"
            required
            minLength={2}
            maxLength={200}
            className={inputClasses}
          />
        </Field>

        <Field label="Type" htmlFor="type">
          <select
            id="type"
            name="type"
            defaultValue={v?.type}
            required
            className={inputClasses}
          >
            <option value="" disabled>
              Select type…
            </option>

            {SCHOOL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field label="District" htmlFor="districtId">
          <select
            id="districtId"
            name="districtId"
            defaultValue={v?.districtId}
            required
            className={inputClasses}
          >
            <option value="" disabled>
              Select district…
            </option>

            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name} — {district.city.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Location" htmlFor="location" hint="Neighborhood or landmark (optional).">
          <input
            id="location"
            name="location"
            defaultValue={v?.location}
            maxLength={200}
            className={inputClasses}
          />
        </Field>

        <Field label="Capacity" htmlFor="capacity" hint="Maximum student capacity (optional).">
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={0}
            defaultValue={v?.capacity}
            className={inputClasses}
          />
        </Field>

        <Field label="Phone" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={v?.phone}
            maxLength={30}
            className={inputClasses}
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={v?.email}
            className={inputClasses}
          />
        </Field>
      </div>

      <Field label="Address" htmlFor="address">
        <textarea
          id="address"
          name="address"
          defaultValue={v?.address}
          rows={3}
          maxLength={500}
          className={inputClasses}
        />
      </Field>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create school"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
