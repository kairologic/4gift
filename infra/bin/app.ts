import * as cdk from 'aws-cdk-lib';
import { ContactStack } from '../lib/contact-stack.js';
import { DnsStack } from '../lib/dns-stack.js';
import { SiteStack } from '../lib/site-stack.js';

const app = new cdk.App();
const ctx = (k: string) => String(app.node.tryGetContext(k) ?? '');

// Same no-bootstrap setup as Kinimals and aging-in-place: assets go to a plain S3 bucket we own.
const assetsBucket = ctx('assetsBucket');
const synthesizer = (prefix: string) =>
  assetsBucket ? new cdk.CliCredentialsStackSynthesizer({ fileAssetsBucketName: assetsBucket, bucketPrefix: prefix }) : undefined;

// The domain goes live in two steps: `./infra/deploy.sh dns` creates the zone, the owner points the registrar's
// nameservers at it, then a full deploy (which checks the delegation and passes domainReady) attaches it.
const domainName = ctx('domainName').toLowerCase().replace(/^www\./, '');
const dns = domainName
  ? new DnsStack(app, 'GiftStoreDns', {
      env: { region: 'us-east-1' },
      synthesizer: synthesizer('gift-store-dns/'),
      domainName,
      description: `4Gift: Route 53 zone for ${domainName}`,
    })
  : undefined;
const domain = dns && ctx('domainReady') === 'true' ? { name: domainName, zone: dns.zone } : undefined;

new SiteStack(app, 'GiftStoreSite', {
  env: { region: 'us-east-1' },
  synthesizer: synthesizer('gift-store/'),
  githubRepo: ctx('githubRepo'),
  githubRepoIds: ctx('githubRepoIds') || undefined,
  githubBranch: ctx('githubBranch') || 'main',
  domain,
  cdn: ctx('cdn') !== 'false',
  description: '4Gift: static site (S3 + CloudFront) and GitHub deploy role',
});

new ContactStack(app, 'GiftStoreContact', {
  env: { region: 'us-east-1' },
  synthesizer: synthesizer('gift-store-contact/'),
  siteUrl: domainName ? `https://${domainName}` : '',
  contactEmail: ctx('contactEmail'),
  // Mail goes out from the site's domain once SES has verified it (DKIM records live in the DNS stack). Gmail
  // rejects mail that claims to be from a gmail.com address but is sent by SES, so never send "from" the inbox.
  fromEmail: ctx('fromEmail') || (domainName ? `hello@${domainName}` : ''),
  siteName: ctx('siteName') || '4Gift',
  description: '4Gift: contact form API, message table and SES inbox identity',
});
