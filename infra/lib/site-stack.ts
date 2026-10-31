import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';

export interface SiteStackProps extends cdk.StackProps {
  githubRepo: string; // owner/name allowed to deploy
  // owner@ownerId/name@repoId: GitHub puts this form in the OIDC subject when the account opts into immutable ids
  // (the Kinimals role needed it).
  githubRepoIds?: string;
  githubBranch: string;
  // Custom domain, once its nameservers point at the DNS stack's zone. Without it the site answers on the
  // CloudFront domain only.
  domain?: { name: string; zone: route53.IHostedZone };
  // false deploys everything except CloudFront (and so the certificate and domain records), for an account that
  // AWS hasn't yet verified for CloudFront; a later deploy with the default adds the distribution.
  cdn?: boolean;
}

// Static site (private S3 + CloudFront with OAC, same shape as Kinimals and aging-in-place) and the role GitHub
// Actions assumes through OIDC to publish the build.
export class SiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const distribution = props.cdn === false ? undefined : this.cdn(siteBucket, props.domain);

    // The account already has GitHub's OIDC provider (aging-in-place's deploy role uses it).
    const provider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GitHubOidc',
      `arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`,
    );
    const deployRole = new iam.Role(this, 'DeployRole', {
      roleName: 'gift-store-github-deploy',
      description: 'Assumed by GitHub Actions to publish the 4Gift site.',
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': [props.githubRepo, props.githubRepoIds]
            .filter(Boolean)
            .map((r) => `repo:${r}:ref:refs/heads/${props.githubBranch}`),
        },
      }),
    });
    siteBucket.grantReadWrite(deployRole);
    siteBucket.grantDelete(deployRole);
    if (distribution) {
      deployRole.addToPolicy(new iam.PolicyStatement({
        actions: ['cloudfront:CreateInvalidation'],
        resources: [`arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`],
      }));
      const domain = props.domain;
      new cdk.CfnOutput(this, 'SiteUrl', { value: domain ? `https://${domain.name}` : `https://${distribution.distributionDomainName}` });
      new cdk.CfnOutput(this, 'CloudFrontDomain', { value: distribution.distributionDomainName });
      new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    }
    new cdk.CfnOutput(this, 'SiteBucketName', { value: siteBucket.bucketName });
    new cdk.CfnOutput(this, 'DeployRoleArn', { value: deployRole.roleArn });
  }

  // CloudFront in front of the site bucket, with the certificate and apex + www records once the domain is ready.
  private cdn(siteBucket: s3.IBucket, domain: SiteStackProps['domain']): cloudfront.Distribution {
      const domainNames = domain ? [domain.name, `www.${domain.name}`] : undefined;
      const certificate = domain
        ? new acm.Certificate(this, 'Certificate', {
            domainName: domain.name,
            subjectAlternativeNames: [`www.${domain.name}`],
            validation: acm.CertificateValidation.fromDns(domain.zone),
          })
        : undefined;

      // Astro builds /for/mom/index.html; map /for/mom/ and /for/mom to it. www goes to the apex.
      const indexRewrite = new cloudfront.Function(this, 'IndexRewrite', {
        runtime: cloudfront.FunctionRuntime.JS_2_0,
        comment: 'Redirect www to the apex; append index.html to directory requests',
        code: cloudfront.FunctionCode.fromInline(`function handler(event) {
    var r = event.request;
    var host = r.headers.host ? r.headers.host.value : '';
    if (host.indexOf('www.') === 0) {
      var qs = Object.keys(r.querystring).map(function (k) { return k + '=' + r.querystring[k].value; }).join('&');
      return { statusCode: 301, statusDescription: 'Moved Permanently',
        headers: { location: { value: 'https://' + host.slice(4) + r.uri + (qs ? '?' + qs : '') } } };
    }
    if (r.uri.endsWith('/')) { r.uri += 'index.html'; }
    else if (!r.uri.split('/').pop().includes('.')) {
      return { statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value: r.uri + '/' } } };
    }
    return r;
  }`),
      });

      const securityHeaders = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
        securityHeadersBehavior: {
          strictTransportSecurity: { accessControlMaxAge: cdk.Duration.days(730), includeSubdomains: true, override: true },
          contentTypeOptions: { override: true },
          frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
          referrerPolicy: { referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: true },
        },
      });

      const distribution = new cloudfront.Distribution(this, 'Distribution', {
        comment: '4Gift',
        httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
        defaultRootObject: 'index.html',
        domainNames,
        certificate,
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          compress: true,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          responseHeadersPolicy: securityHeaders,
          functionAssociations: [{ function: indexRewrite, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST }],
        },
        errorResponses: [
          { httpStatus: 403, responseHttpStatus: 404, responsePagePath: '/404.html', ttl: cdk.Duration.minutes(1) },
          { httpStatus: 404, responseHttpStatus: 404, responsePagePath: '/404.html', ttl: cdk.Duration.minutes(1) },
        ],
      });

    if (domain) {
      const target = route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution));
      for (const name of [domain.name, `www.${domain.name}`]) {
        const id = name === domain.name ? 'Apex' : 'Www';
        new route53.ARecord(this, `${id}A`, { zone: domain.zone, recordName: name, target });
        new route53.AaaaRecord(this, `${id}Aaaa`, { zone: domain.zone, recordName: name, target });
      }
    }
    return distribution;
  }
}
