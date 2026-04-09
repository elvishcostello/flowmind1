# COMPONENTS.md — Shared Component Inventory

Specifications for shared UI components live in `screens/components/`. These components are used by two or more screens and are documented separately to avoid duplicating specs.

## Index

| Component | File | Used by |
|---|---|---|
| `HowOftenPicker` | `screens/components/how-often-picker.md` | `how-often`, `update-tasks` |

## Conventions

- Component specs describe props, behaviour, and usage examples.
- Screen specs reference a component by name and link to its spec rather than duplicating the logic.
- Shared components live in `components/` at the project root.
