"use client";

import { useActionState, useState } from "react";

import {
  archiveSchoolAction,
  type FormState,
} from "@/features/schools/actions/school-actions";

import { Button } from "@/components/ui";

const initialState: FormState = {
  ok: false,
};

export function ArchiveButton({ schoolId }: { schoolId: string }) {
  const [state, action, pending] = useActionState(
    archiveSchoolAction,
    initialState,
  );

  const [confirming, setConfirming] = useState(false);

  if (state.ok) {
    return null;
  }

  if (!confirming) {
    return (
      <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
        Archive school
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <form action={action}>
        <input type="hidden" name="id" value={schoolId} />

        <Button type="submit" variant="danger" size="sm" disabled={pending}>
          {pending ? "Archiving…" : "Confirm archive"}
        </Button>
      </form>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => setConfirming(false)}
      >
        Cancel
      </Button>
    </div>
  );
}
