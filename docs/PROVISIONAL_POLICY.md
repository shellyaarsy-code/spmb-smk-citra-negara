# Policy configuration and pending school decisions

Operational behavior must not imply that provisional assumptions are official.

- Official selection decisions and publication require `SPMB_OFFICIAL_RULES_APPROVED=true` after written approval of the selection rules by the school.
- Student results require both the approval above and `SchoolSetting` key `SPMB_SELECTION_RESULTS_PUBLISHED=true`. The schema has no dedicated publication timestamp; this explicit setting is the release gate.
- A payment invoice must not be generated until the school sets `SchoolSetting` keys `SPMB_FORM_PAYMENT_AMOUNT`, `SPMB_PAYMENT_METHOD`, and `SPMB_PAYMENT_DESTINATION` to approved values. No payment gateway is configured.
- The payment proof metadata columns are introduced by `20261016180000_payment_proof_metadata`. Apply that migration only to a verified development database before enabling payment APIs; do not apply it to an unverified target.
- Student document and payment proof uploads stay disabled unless a Vercel Blob store is connected server-side and reachable. The application uses private objects, checks file signatures and allowed MIME types, and defaults to a 4 MiB upload limit.
- A TKA session requires an active, published `TkaTest`, an active `TkaSchedule`, and a positive `SchoolSetting` value `SPMB_TKA_DURATION_MINUTES`. This duration is operational configuration and must be approved by the school.
- TKA attempts require the application status `ELIGIBLE_FOR_TKA` or `TKA_STARTED`. The project has no operational UI that grants this eligibility yet; the school must define and approve the transition before opening real sessions.
- TKA scoring uses only the existing single-answer multiple-choice model and points explicitly stored on each question. No passing threshold or selection score is inferred.
- Notifications are in-app only. No email, SMS, WhatsApp, or push provider is configured.

Set configuration only in a development environment until the school has approved the corresponding policy. Never set test credentials against production data.
