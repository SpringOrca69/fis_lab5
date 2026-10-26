---
description: Run the build → test → approve loop for one HeartPay phase
argument-hint: <phase number>
---

Run phase $ARGUMENTS of HeartPay using the loop in `phases.md`.

1. Check `phases.md`: the previous phase must be `approved`. If not, stop and say so.
2. Set this phase's status to `building`. Create branch `phase-$ARGUMENTS`.
3. Spawn the `phase-builder` agent for phase $ARGUMENTS.
4. Set status `testing`. Spawn the `phase-tester` agent for phase $ARGUMENTS.
5. Set status `review`. Spawn the `phase-approver` agent for phase $ARGUMENTS.
6. Read `reviews/phase-$ARGUMENTS-approval.md`:
   - `CHANGES REQUESTED`: go back to step 3 (builder fixes only the listed items), then re-test and re-approve. After 3 loops, stop and ask me.
   - `NEEDS HUMAN`: set status `needs-human`, show me the device checks, and wait for my reply.
   - `APPROVED`: merge `phase-$ARGUMENTS` into `main`, set status `approved` with today's date in `phases.md`, and tell me to `/clear` before the next phase.
7. Report in a few lines: verdict, what was built, what I need to do.

Never start the next phase on your own.
