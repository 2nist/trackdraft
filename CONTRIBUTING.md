# Contributing to TrackDraft

## Code Style Guidelines

### No Emojis Policy

**Do not use emojis in code, UI text, or comments.**

This includes:
- Error messages
- Success messages
- UI labels and buttons
- Comments and documentation
- Any user-facing text

Use clear, descriptive text instead. For example:
- ❌ `showError("❌ Failed to sync")`
- ✅ `showError("Failed to sync")`

- ❌ `<button>📂 Browse Files</button>`
- ✅ `<button>Browse Files</button>`

This policy ensures:
- Better accessibility (screen readers can process text properly)
- Consistent cross-platform rendering
- Professional appearance
- Avoids encoding issues

If you see emojis in the codebase, please remove them as part of your changes.

