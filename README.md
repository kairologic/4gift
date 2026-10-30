# 4Gift (4gift.store)

A gift ideas site organised as lists: by who it's for, occasion, budget and interest. Static Astro site on
S3 + CloudFront, with a contact form that emails giftstore26@yahoo.com through Amazon SES. Same stack and design
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

## Going live

Run from Git Bash with AWS credentials for account 715010566819, as for Kinimals.

1. `bash infra/deploy.sh dns` creates the Route 53 zone for 4gift.store and prints four nameservers.
2. At the domain registrar, set 4gift.store's nameservers to those four. Wait about an hour.
3. `bash infra/deploy.sh` deploys the site (S3, CloudFront, certificate, apex and www), the contact API, and the
   SES identities. SES then emails giftstore26@yahoo.com a verification link: click it, or the form can't deliver
   while the account is in the SES sandbox.
4. In GitHub → Settings → Secrets and variables → Actions → Variables, set `AWS_ROLE_ARN`, `SITE_BUCKET`,
   `DISTRIBUTION_ID` (GiftStoreSite outputs), `PUBLIC_CONTACT_URL` (GiftStoreContact `ContactUrl`) and
   `SITE_URL=https://4gift.store`. Then run the "Deploy site" workflow.
5. Smoke test: https://4gift.store and www load, a list filters by budget, and a contact message arrives at Yahoo
   (check spam the first time).

If the deploy role refuses GitHub's token, set `githubRepoIds` in `infra/cdk.json` to
`kairologic@<owner id>/gift-store@<repo id>` and redeploy (Kinimals needed this).
