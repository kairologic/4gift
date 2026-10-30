import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { createHash, randomUUID } from 'node:crypto';

// The site's contact form (adapted from Kinimals). Messages are kept in the table (so none is lost if email fails)
// and sent to the store's inbox with the visitor as Reply-To. Spam guards: a hidden honeypot field, a minimum time on
// the page, and at most PER_DAY messages per visitor per day (IP kept only as a salted hash, for that day's count).
// Table keys:
//   CONTACT#<day>      <iso>#<id>    the message (sent: emailed to the inbox)
//   CONTACTRATE#<day>  <ip hash>     messages per visitor that day; expires after two days
const ses = new SESv2Client({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), { marshallOptions: { removeUndefinedValues: true } });
const TABLE = process.env.TABLE_NAME ?? '';
const TO = process.env.CONTACT_EMAIL ?? '';
const FROM = process.env.FROM_EMAIL || TO;
const SITE = process.env.SITE_NAME || 'Site';
const PER_DAY = 5;
const MIN_MS_ON_PAGE = 3000;
export const TOPICS = ['question', 'gift suggestion', 'correction', 'partnership', 'other'] as const;

const day = (d = new Date()) => d.toISOString().slice(0, 10);
const json = (statusCode: number, body: unknown): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim().slice(0, max) : '');
const EMAIL = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[a-z]{2,}$/i;

async function countToday(ip: string): Promise<number> {
  const key = createHash('sha256').update(`${day()}|${ip}|${TABLE}`).digest('hex').slice(0, 24);
  const r = await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { pk: `CONTACTRATE#${day()}`, sk: key },
      UpdateExpression: 'ADD n :one SET expires = :exp',
      ExpressionAttributeValues: { ':one': 1, ':exp': Math.floor(Date.now() / 1000) + 2 * 86_400 },
      ReturnValues: 'UPDATED_NEW',
    }),
  );
  return Number(r.Attributes?.n ?? 1);
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64').toString() : (event.body ?? ''));
  } catch {
    return json(400, { error: 'Bad request' });
  }
  // Bots fill the hidden field or post instantly; tell them it worked and drop it.
  const elapsed = Date.now() - Number(body.t);
  if (text(body.website, 200) || !(elapsed >= MIN_MS_ON_PAGE)) return json(200, { ok: true });

  const name = text(body.name, 100);
  const email = text(body.email, 200);
  const message = text(body.message, 5000);
  const topic = TOPICS.includes(body.topic as any) ? (body.topic as string) : 'other';
  if (!name || !EMAIL.test(email) || message.length < 10) {
    return json(400, { error: 'Please give your name, a valid email address and a message of at least a few words.' });
  }
  if ((await countToday(event.requestContext.http.sourceIp)) > PER_DAY) {
    return json(429, { error: 'Thanks, we already have several messages from you today. Please try again tomorrow.' });
  }

  const id = randomUUID();
  const at = new Date().toISOString();
  const page = text(body.page, 300);
  const key = { pk: `CONTACT#${day()}`, sk: `${at}#${id}` };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: { ...key, id, name, email, topic, message, page, at, sent: false } }));
  if (!TO) return json(200, { ok: true });

  try {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: FROM,
        Destination: { ToAddresses: [TO] },
        ReplyToAddresses: [email],
        Content: {
          Simple: {
            Subject: { Data: `${SITE} contact: ${topic} from ${name}`.slice(0, 200) },
            Body: {
              Text: {
                Data: `${message}\n\n-- \n${name} <${email}>\nTopic: ${topic}${page ? `\nFrom page: ${page}` : ''}\nReply to this email to answer them.\n`,
              },
            },
          },
        },
      }),
    );
    await ddb.send(new UpdateCommand({ TableName: TABLE, Key: key, UpdateExpression: 'SET sent = :t', ExpressionAttributeValues: { ':t': true } }));
  } catch (e) {
    // The message is saved with sent = false, so it can be found in the table.
    console.error('contact email failed', id, e);
  }
  return json(200, { ok: true });
}
