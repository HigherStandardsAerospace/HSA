# HSA FormSubmit implementation checklist

Status: published to the GitHub Pages preview; recipient activation and live delivery tests are pending.

## Completed locally

- [x] Confirm the five intended departments and current recipient addresses.
- [x] Store the department routing table in `_data/contact_departments.yml`.
- [x] Replace the `mailto:` fallback with a real `POST` form for FormSubmit.
- [x] Add a required department dropdown as the first visible form field.
- [x] Route each dropdown choice directly to its department endpoint.
- [x] Use the visitor's email as the message reply address.
- [x] Add a department-specific email subject.
- [x] Keep FormSubmit's built-in reCAPTCHA enabled.
- [x] Remove the optional honeypot field after it rendered visibly in the preview.
- [x] Keep the inquiry form free of a mandatory consent checkbox.
- [x] Add a warning not to submit sensitive information.
- [x] Add sending and duplicate-submit protection.
- [x] Add a first-party confirmation page at `/contact-success/`.
- [x] Track `generate_lead` only after returning to the confirmation page.
- [x] Replace the unrelated recruitment privacy text with contact-form information.
- [x] Exclude this operational checklist from the generated public site.
- [x] Build successfully with the GitHub Pages-compatible Jekyll dependencies.
- [x] Validate all five routing actions and subjects in Chrome without sending external requests.
- [x] Visually review the form at 1440 × 1000 and 1366 × 768.
- [x] Visually review the form at an iPhone-sized 390 × 844 viewport.
- [x] Confirm the form introduces no mobile horizontal overflow.
- [ ] Approve the contact-form privacy wording with HSA.

## Recipient activation — requires access to HSA mailboxes

FormSubmit requires one activation per destination. Do these steps only after the updated preview has been published.

- [ ] Submit one clearly labeled activation test to **General Inquiries / Sales**.
- [ ] Ask `sales@higherstandardsaerospace.com` to open the FormSubmit activation email and select the activation link.
- [ ] Submit one clearly labeled activation test to **Accounting**.
- [ ] Ask `accounting@higherstandardsaerospace.com` to activate its FormSubmit endpoint.
- [ ] Submit one clearly labeled activation test to **Business Development**.
- [ ] Ask `john.valencia@higherstandardsaerospace.com` to activate its FormSubmit endpoint.
- [ ] Submit one clearly labeled activation test to **Purchasing**.
- [ ] Ask `gonzalo.ortiz@higherstandardsaerospace.com` to activate its FormSubmit endpoint.
- [ ] Submit one clearly labeled activation test to **Quality Assurance**.
- [ ] Ask `john.thomson@higherstandardsaerospace.com` to activate its FormSubmit endpoint.
- [ ] Check Inbox and Junk/Spam for every activation message.

Do not send all five tests at once without first telling the recipients what the activation emails are.

## Delivery verification

After all five endpoints are activated, submit a second test through each dropdown option.

| Dropdown option | Expected recipient | Delivered | Reply opens visitor address |
| --- | --- | --- | --- |
| General Inquiries / Sales | `sales@higherstandardsaerospace.com` | [ ] | [ ] |
| Accounting | `accounting@higherstandardsaerospace.com` | [ ] | [ ] |
| Business Development | `john.valencia@higherstandardsaerospace.com` | [ ] | [ ] |
| Purchasing | `gonzalo.ortiz@higherstandardsaerospace.com` | [ ] | [ ] |
| Quality Assurance | `john.thomson@higherstandardsaerospace.com` | [ ] | [ ] |

- [ ] Confirm each message includes name, email, department, and message.
- [ ] Confirm each subject contains the selected department.
- [ ] Confirm the reCAPTCHA challenge works when FormSubmit requests it.
- [ ] Confirm successful submissions return to `/contact-success/`.
- [ ] Confirm invalid or incomplete forms remain on the page and show browser validation.
- [ ] Test desktop Safari/Chrome and one iPhone-sized viewport.

## Optional endpoint privacy

After activation, FormSubmit may provide each recipient with a random endpoint string. The public form works without this replacement, and the current site already publishes the department email addresses. If HSA still wants to obscure addresses in the form markup:

- [ ] Collect the five random endpoint strings from the activation emails.
- [ ] Replace only the `endpoint` values in `_data/contact_departments.yml`.
- [ ] Rebuild and repeat one delivery test per department.

## Publication and production cutover

- [x] Publish the prepared changes to the personal GitHub Pages preview.
- [ ] Complete activation and delivery verification on the GitHub Pages preview.
- [ ] Obtain HSA approval for the form, privacy wording, and routing matrix.
- [ ] Change `_config.yml` from preview settings to the production domain only when the full website is approved.
- [ ] Publish to the production domain.
- [ ] Repeat one live delivery test per department from the production domain.
- [ ] Review delivery and spam placement after the first week and monthly thereafter.

## Important operational notes

- FormSubmit processes and retains form submissions for up to 30 days according to its published documentation.
- The provider advertises unlimited forms and submissions, but this is not a contractual uptime guarantee.
- Do not send real customer, payment, credential, or sensitive technical information during testing.
- If FormSubmit delivery becomes unreliable, restore the direct department email links immediately and evaluate the documented Formspree/Microsoft 365 fallback.
