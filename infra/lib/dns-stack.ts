import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as ses from 'aws-cdk-lib/aws-ses';
import type { Construct } from 'constructs';

export interface DnsStackProps extends cdk.StackProps {
  domainName: string; // apex, e.g. example.com
}

// The site's DNS zone. The domain stays registered at Hostinger; only its nameservers point here, so the
// certificate validates itself and the apex can alias CloudFront (most registrar DNS can't alias an apex).
// Deployed on its own first (`./infra/deploy.sh dns`), because the certificate can't validate until the
// registrar uses these nameservers.
export class DnsStack extends cdk.Stack {
  readonly zone: route53.PublicHostedZone;

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);
    this.zone = new route53.PublicHostedZone(this, 'Zone', {
      zoneName: props.domainName,
      comment: 'Gift store site',
    });
    this.zone.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    // Lets the contact form send from @<domain>. The DKIM records go into the
    // zone, so SES verifies the domain once the nameservers point here. DMARC in monitor mode helps Gmail delivery.
    new ses.EmailIdentity(this, 'MailDomain', { identity: ses.Identity.publicHostedZone(this.zone) });
    new route53.TxtRecord(this, 'Dmarc', { zone: this.zone, recordName: '_dmarc', values: ['v=DMARC1; p=none'] });
    new cdk.CfnOutput(this, 'NameServers', { value: cdk.Fn.join(' ', this.zone.hostedZoneNameServers!) });
  }
}
