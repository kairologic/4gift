#!/usr/bin/env bash
# Deploys the stacks without `cdk bootstrap` (same assets bucket as Kinimals and aging-in-place).
# Needs AWS credentials for account 715010566819 (us-east-1).
#   ./infra/deploy.sh           everything; attaches the custom domain once its nameservers point at Route 53
#   ./infra/deploy.sh nocdn     everything except CloudFront (for while AWS hasn't verified the account for it)
#   ./infra/deploy.sh dns       only the Route 53 zone for "domainName" in cdk.json, and prints its nameservers
#   ./infra/deploy.sh <args>    any other stack names or cdk flags
set -euo pipefail
cd "$(dirname "$0")"
npm ci
domain=$(node -p "require('./cdk.json').context.domainName || ''")

if [ "${1:-}" = "dns" ]; then
  [ -n "$domain" ] || { echo "Set domainName in infra/cdk.json first." >&2; exit 1; }
  npx cdk deploy --require-approval never GiftStoreDns --outputs-file dns-outputs.json
  echo
  echo "At your registrar, set the nameservers of $domain to:"
  node -p "require('./dns-outputs.json').GiftStoreDns.NameServers.split(' ').join('\n')"
  echo "Then run ./infra/deploy.sh again once the change has spread (usually under an hour)."
  exit 0
fi

cdn=true
if [ "${1:-}" = "nocdn" ]; then
  cdn=false
  shift
fi

ready=false
if [ -n "$domain" ]; then
  # Only attach the domain once public DNS already answers from the Route 53 zone, or the certificate can't validate.
  if node -e "require('dns').promises.resolveNs(process.argv[1]).then(ns => process.exit(ns.some(n => /awsdns/i.test(n)) ? 0 : 1), () => process.exit(1))" "$domain"; then
    ready=true
  else
    echo "Note: $domain does not use the Route 53 nameservers yet, so the site deploys without it. Run './infra/deploy.sh dns' for the list." >&2
  fi
fi
if [ $# -eq 0 ]; then set -- --all; fi
npx cdk deploy --require-approval never -c domainReady=$ready -c cdn=$cdn "$@"
