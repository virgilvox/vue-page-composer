# Session 006 — SSR verification and end-to-end tests

Date: 2026-05-28

## Audit findings and fixes

- ComposedPage was claimed to render server side but never tested. Added an SSR test with `@vue/server-renderer` that renders it with resolved bindings, confirms no editor markup leaks server side, and confirms a null model does not throw. The render path was also confirmed free of DOM globals, so it is safe under SSR. This is the foundation the Nuxt module will build on.
- Select fields lost the type of numeric options. A select's DOM value is always a string, so a numeric option became a string in the document. The control now maps the chosen value back to the option's own value, preserving numbers.

## End-to-end tests

Chromium is available locally, so the editor now has Playwright e2e against the playground, started automatically by the test runner. Five specs, all green:

- the editor loads with the starter page,
- selecting a block shows it in the inspector,
- editing a prop updates the canvas live,
- keyboard reorder moves the selection within its zone (verifies the corrected drop index in a real browser),
- preview renders the repeater once per record.

This exercises real layout and events that the happy-dom unit tests cannot, and de-risks the iframe canvas work.

## Release

Full gate green: format, lint, both typechecks, 97 unit tests (core 55, vue 42), 5 e2e. Published the select fix at 0.4.2. The SSR test and e2e are dev infrastructure and are not published.

## Next

The SSR foundation is verified, so the Nuxt module is now low-risk to build. Iframe canvas isolation is the other large item, and Playwright is in place to verify it.
