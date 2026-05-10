# Privacy, Data, and Compliance

## Privacy Principle

Collect no user data unless the product clearly needs it. Every SDK, analytics event, permission, and network call must have a reason.

## Initial Data Position

Recommended first release:

- No account system.
- No personal profile.
- No location.
- No contacts.
- No camera.
- No microphone.
- No advertising ID.
- No push notifications.
- Local-only saves.

This keeps the Google Play Data Safety section simpler and reduces review risk.

## Privacy Policy

Google Play requires a privacy policy link in Play Console and within the app. The policy should include:

- Developer or company name.
- Contact email.
- What data is collected.
- Why data is collected.
- Whether data is shared.
- Data retention policy.
- Data deletion process.
- Security practices.
- Clear title: Privacy Policy.

Even if no personal data is collected, the app still needs a privacy policy.

## Data Safety Form

The Data Safety answers must match reality, including data handled by third-party SDKs.

Track every SDK in this table:

| SDK | Purpose | Data Collected | Shared With Third Parties | Required For MVP |
| --- | --- | --- | --- | --- |
| None yet | Not applicable | None | No | No |

## Permissions

Default permission posture:

- Do not request sensitive permissions for MVP.
- Avoid permissions that require special Play Console declarations.
- Prefer web-safe, user-triggered features.

Potential future permissions:

| Permission | Feature | Risk | Decision |
| --- | --- | --- | --- |
| Vibration | Tactile feedback | Low | Optional |
| Internet | Hosted content, analytics, ads, updates | Medium | Likely if packaged web app needs network |
| Notifications | Retention reminders | Medium | Defer |

## Account Deletion

If the app ever lets users create accounts, it must provide:

- In-app account deletion request path.
- Web deletion request path or equivalent.
- Clear explanation of data deleted and retained.

Recommendation: avoid accounts in the first release.

## Analytics

Analytics should be added only after deciding:

- What product questions need answers.
- What events are necessary.
- Whether analytics collects device IDs or user identifiers.
- How it affects Data Safety declarations.

Initial alternative:

- Manual tester feedback.
- Local debug logs.
- No production analytics.

## Ads

Ads are not recommended for the first release. If added later:

- Choose SDK carefully.
- Update privacy policy.
- Update Data Safety.
- Consider age rating and target audience.
- Add consent flow where required.

## Purchases

Digital items and subscriptions distributed through Google Play should use Google Play Billing. Purchases should not be implemented in the HTML layer alone unless the Android wrapper correctly integrates billing and entitlement validation.

## Compliance Log

Every policy-affecting decision should be logged here:

| Date | Decision | Reason | Follow-Up |
| --- | --- | --- | --- |
| 2026-05-10 | Start with documentation and no data collection by default | Reduce early Google Play risk | Revisit after MVP design |
