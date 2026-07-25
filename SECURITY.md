# Security Policy

## Supported version

Security fixes are applied to the current `main` branch.

## Reporting a vulnerability

Please do not disclose a suspected vulnerability in a public issue. Use
GitHub's **Security** tab to submit a private vulnerability report to the
maintainers. Include:

- the affected route, component, or dependency;
- steps to reproduce;
- the expected and observed behavior; and
- any suggested mitigation.

Do not include real credentials, confidential information, or another
learner's data in a report.

## Data boundary

The academy is frontend-only. Learner progress and interaction state are stored
in browser local storage. The academy does not require an application account,
learner database, or analytics backend. Feedback is collected through an
external Google Form and is outside the academy's learner-state system.

