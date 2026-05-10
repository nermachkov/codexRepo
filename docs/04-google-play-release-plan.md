# Google Play Release Plan

## Current Policy Notes

These notes were checked against official Google documentation on 2026-05-10.

- GitHub Pages and web hosting are only for the web build; Google Play requires an Android app package.
- New apps and updates submitted to Google Play must target Android 15, API level 35 or higher from 2025-08-31, with exceptions for Wear OS, Android Automotive OS, and Android TV.
- Google Play requires Data Safety declarations for published apps.
- Apps must provide a privacy policy link in Play Console and inside the app.
- If the app allows account creation, it must also provide a way to request account and data deletion.
- Digital products and subscriptions in Android apps distributed through Google Play generally need Google Play Billing.

Official references:

- Google Play target API requirements: https://developer.android.com/distribute/best-practices/develop/target-sdk
- Data Safety form: https://support.google.com/googleplay/android-developer/answer/10787469
- User Data policy and privacy policy requirements: https://support.google.com/googleplay/android-developer/answer/9888076
- Account deletion requirements: https://support.google.com/googleplay/android-developer/answer/13327111
- Google Play Billing: https://developer.android.com/google/play/billing

## Release Tracks

Recommended sequence:

1. Internal testing.
2. Closed testing.
3. Open testing if useful.
4. Production rollout.

## Required Store Assets

- App name.
- Short description.
- Full description.
- App icon.
- Feature graphic.
- Phone screenshots.
- Optional tablet screenshots if tablet support is claimed.
- Privacy policy URL.
- Support contact email.
- Content rating questionnaire.
- Data Safety form.
- Target audience declaration.

## Android Package Requirements

- Android App Bundle.
- Unique application ID.
- Version code.
- Version name.
- Release signing.
- Target SDK meeting current Google Play requirements.
- Minimum SDK chosen based on device support goals.

## Pre-Submission Checklist

- No debug UI visible.
- No console errors in production build.
- Back button behavior is defined.
- App resumes correctly after backgrounding.
- Offline behavior is defined.
- Privacy policy URL is public, active, non-PDF, and not geofenced.
- Data Safety answers match actual SDK behavior.
- Content rating answers match app content.
- Screenshots match real app UI.
- App does not request unnecessary permissions.

## Review Risk Areas

- Misdeclared data collection.
- Hidden SDK data collection.
- Ads without correct disclosure.
- In-app purchases outside Google Play Billing.
- Account creation without deletion path.
- Sensitive permissions without clear need.
- Misleading store listing.
- Crashes on launch.

## First Release Scope

The first Google Play release should be intentionally small:

- One polished core mode.
- Settings.
- Privacy policy.
- Stable performance.
- No account system.
- No ads.
- No purchases.

This keeps review complexity low while the product is still finding its shape.
