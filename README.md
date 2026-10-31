# 4Gift (4gift.store)

A gift ideas site organised as lists: by who it's for, occasion, budget and interest. Static Astro site on
S3 + CloudFront, with a contact form that emails longlassotx@gmail.com through Amazon SES. Same stack and design
language as Kinimals (kairologic/pet-affliates) and Aging in Place.

## How the lists work

- `src/data/taxonomy.ts` defines the four groups (top-bar menu items) and their categories. Each category is a
  list page at `/<group>/<category>/`, e.g. `/for/mom/`, `/occasion/birthday/`, `/budget/under-50/`, `/interest/cooks/`.
- `src/data/gifts.ts` holds every gift idea once, tagged with the recipient, occasion and interest lists it belongs
  on. Budget lists are worked out from each gift's starting price. Order in the file is the order on each list.
- Every list page has budget chips and a sort menu; `?max=50` preselects a budget (the home page gift finder uses it).
- Buy buttons open an Amazon search. Set `PUBLIC_AMAZON_TAG` once Associates approves the site and every link earns.

To add a gift, add one entry to `gifts.ts`; to add a list, add a category to `taxonomy.ts` and tag gifts with it.
`npm test` fails if a tag doesn't exist or any list has fewer than 6 gifts.

```bash
npm ci
npm run dev      # http://localhost:4321
npm test
npm run build
```

## Pinterest

Pinterest is the main marketing channel, so the build makes everything needed to post:

- A 1000×1500 pin for every list (`/pins/for-mom.png`), every list-and-budget pair with at least 5 gifts
  (`/pins/for-mom-under-50.png`, linking to `/for/mom/?max=50`) and every gift (`/pins/gift-weighted-blanket.png`),
  drawn by `src/lib/pins.ts` with the fonts in `src/assets/fonts` (OFL). About 150 pins in all.
- Open Graph tags (title, description, pin image, site name) on every page, which Pinterest reads as Rich Pin data.
- A red Save button on each list and gift card. It's a plain link to Pinterest's pin builder: no Pinterest script
  or cookies on our pages.
- Bulk-upload files at `/pins/week-1.csv`, `/pins/week-2.csv`, …, 35 pins each, list pins first. In Pinterest:
  create the boards named in the file (one per list title), then Create → Bulk create Pins and upload one file a week.

To claim the site: open a free Pinterest Business account, Settings → Claimed accounts → Claim website → "Add HTML
tag", copy the `content` code into the `PUBLIC_PINTEREST_VERIFY` repository variable, redeploy, then press Verify.

## Going live

Run from Git Bash with AWS credentials for account 715010566819, as for Kinimals.

1. `bash infra/deploy.sh dns` creates the Route 53 zone for 4gift.store and prints four nameservers.
2. At Hostinger (Domains → 4gift.store → Nameservers → custom), set those four. Wait about an hour.
3. `bash infra/deploy.sh` deploys the site (S3, CloudFront, certificate, apex and www), the contact API, and the
   SES identities. SES then emails longlassotx@gmail.com a verification link: click it, or the form can't deliver
   while the account is in the SES sandbox.
4. In GitHub → Settings → Secrets and variables → Actions → Variables, set `AWS_ROLE_ARN`, `SITE_BUCKET`,
   `DISTRIBUTION_ID` (GiftStoreSite outputs), `PUBLIC_CONTACT_URL` (GiftStoreContact `ContactUrl`) and
   `SITE_URL=https://4gift.store`, and `PUBLIC_PINTEREST_VERIFY` once you have it. Then run the "Deploy site" workflow.
5. Smoke test: https://4gift.store and www load, a list filters by budget, and a contact message arrives in Gmail
   (check spam the first time).

The deploy role trusts both forms of GitHub's OIDC subject for kairologic/4gift (`githubRepo` and the id-based
`githubRepoIds` in `infra/cdk.json`), which Kinimals needed.
