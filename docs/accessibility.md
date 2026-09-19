# Accessibility

LexiGuide treats accessibility as part of the core product experience.

## Implemented Features

- Semantic page structure with `main`, headings, forms, lists, and article cards.
- Skip link to jump to main content.
- MUI form labels for login, registration, document selection, and questions.
- Keyboard-accessible upload dropzone with `Enter` and `Space` activation.
- Visible focus states through the MUI theme.
- Alerts for upload, auth, loading, error, empty, and insufficient-evidence states.
- Risk severity is shown as text such as `HIGH RISK`, not color alone.
- Loading progress indicators include accessible labels.
- Responsive layouts adapt from mobile to desktop.
- Color palette is high contrast and restrained for a legal-tech context.

## Manual Checks

Before demos, verify these keyboard flows:

1. Tab from the skip link into login/register forms.
2. Use the upload control with keyboard only.
3. Navigate analysis tabs with keyboard controls.
4. Submit document questions and compare documents without a mouse.
