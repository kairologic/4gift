import * as cdk from 'aws-cdk-lib';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ses from 'aws-cdk-lib/aws-ses';
import type { Construct } from 'constructs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export type ContactStackProps = cdk.StackProps & {
  siteUrl: string; // the only browser origin allowed to post
  contactEmail: string; // the store's inbox
  fromEmail: string; // an address on a domain SES has verified
  siteName: string;
};

// The site's contact form: POST /contact on a small HTTP API. The Lambda keeps every message in a table (so none is
// lost if email fails) and emails it to the store's inbox with the visitor as Reply-To. Same handler as Kinimals.
export class ContactStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ContactStackProps) {
    super(scope, id, props);
    const { siteUrl, contactEmail, fromEmail, siteName } = props;

    const table = new ddb.TableV2(this, 'Messages', {
      partitionKey: { name: 'pk', type: ddb.AttributeType.STRING },
      sortKey: { name: 'sk', type: ddb.AttributeType.STRING },
      billing: ddb.Billing.onDemand(),
      timeToLiveAttribute: 'expires',
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // While SES is in its sandbox it only delivers to verified addresses. Creating the identity makes SES email
    // the inbox a verification link; click it once and the form starts delivering.
    if (contactEmail) new ses.EmailIdentity(this, 'Inbox', { identity: ses.Identity.email(contactEmail) });

    const fn = new NodejsFunction(this, 'Contact', {
      entry: path.join(here, '..', 'lambda', 'contact.ts'),
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(10),
      logGroup: new logs.LogGroup(this, 'ContactLogs', { retention: logs.RetentionDays.ONE_MONTH, removalPolicy: RemovalPolicy.DESTROY }),
      bundling: { minify: true, target: 'node22' },
      environment: { TABLE_NAME: table.tableName, CONTACT_EMAIL: contactEmail, FROM_EMAIL: fromEmail, SITE_NAME: siteName },
    });
    table.grantReadWriteData(fn);
    fn.addToRolePolicy(new iam.PolicyStatement({ actions: ['ses:SendEmail'], resources: ['*'] }));

    const api = new apigw.HttpApi(this, 'Api', {
      corsPreflight: {
        allowOrigins: [siteUrl, 'http://localhost:4321'].filter(Boolean).map((u) => u.replace(/\/$/, '')),
        allowMethods: [apigw.CorsHttpMethod.POST, apigw.CorsHttpMethod.OPTIONS],
        allowHeaders: ['content-type'],
        maxAge: Duration.hours(1),
      },
    });
    const stage = api.defaultStage!.node.defaultChild as apigw.CfnStage;
    stage.defaultRouteSettings = { throttlingBurstLimit: 20, throttlingRateLimit: 5 };
    api.addRoutes({ path: '/contact', methods: [apigw.HttpMethod.POST], integration: new HttpLambdaIntegration('ContactInt', fn) });

    new cdk.CfnOutput(this, 'ContactUrl', { value: `${api.apiEndpoint}/contact` });
    new cdk.CfnOutput(this, 'MessagesTable', { value: table.tableName });
  }
}
