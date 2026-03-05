# Security Notes

## Current audit status

Last validated on 2026-03-05 (local run):

- Critical: **0**
- High: **0**
- Moderate: **0**
- Low: **9**

Command used:

```bash
npm audit --json
```

## Security remediations already applied

### 1) `fast-xml-parser` vulnerability (CVE-2026-26278 and related)

Mitigation in `package.json` overrides:

- `fast-xml-parser` forced to `5.3.8`

This protects transitive trees that previously pulled vulnerable parser ranges.

### 2) Direct dependency upgrades

Upgraded to patched versions:

- `next` -> `^15.5.12`
- `eslint-config-next` -> `^15.5.12`
- `nodemailer` -> `^8.0.1`

### 3) `form-data` critical chain

A broad global override caused conflicts with Axios v4 chain, so a targeted override was used:

```json
"@types/request": {
  "form-data": "2.5.5"
}
```

This removed the critical advisory without breaking other dependency trees.

## Why 9 low vulnerabilities remain

The remaining low-severity advisories are transitive and linked mainly to the `firebase-admin` ecosystem (`@google-cloud/storage`, `teeny-request`, `http-proxy-agent`, `@tootallnate/once`, etc.).

`npm audit` suggests a fix path that requires a **major downgrade** to `firebase-admin@10.3.0`, which is not acceptable for this project because it may introduce compatibility and runtime risks.

## Risk acceptance rationale

These 9 findings are currently accepted because:

1. They are **low severity** only.
2. No critical/high/moderate findings remain.
3. The available automatic fix requires a risky major downgrade.
4. Core internet-facing high-impact packages were already patched.

## Revisit criteria

Re-open this decision when one of the following occurs:

- `firebase-admin`/Google SDK chain publishes safe updates that clear these lows without major downgrade.
- New exploit guidance upgrades severity or practical exploitability.
- Application architecture changes increase exposure of affected code paths.

## Operational follow-up

- Run `npm audit` in CI on every PR and main branch.
- Re-check advisories weekly.
- Update this file whenever dependency security posture changes.
