# Higher Standards Aerospace — Jekyll migration

Static Jekyll replica of the current Higher Standards Aerospace WordPress website.

## Local preview

```sh
BUNDLE_GEMFILE=Gemfile.local bundle install
BUNDLE_GEMFILE=Gemfile.local bundle exec jekyll serve
```

The GitHub Pages preview is configured for `https://ajratoni.github.io/HSA/`.

## Before production cutover

1. Set `url` to `https://higherstandardsaerospace.com` and `baseurl` to an empty string in `_config.yml`.
2. Set `preview_mode: false` so search engines can index the site.
3. Add the custom domain configuration and update DNS only after the preview is approved.
4. Complete the FormSubmit recipient activation and delivery tests in `FORM_SUBMIT_IMPLEMENTATION_CHECKLIST.md`.

## Contact form

The contact form posts directly to FormSubmit. Department labels and recipient
endpoints are maintained in `_data/contact_departments.yml`. Do not send live
tests until the relevant HSA recipients have been told to expect FormSubmit
activation emails. The complete activation, QA, and production checklist is in
`FORM_SUBMIT_IMPLEMENTATION_CHECKLIST.md`.

The certificate PDFs remain in the local migration workspace. The public
preview links to the same public files on the current website until HSA
explicitly approves committing those documents to this public repository.
