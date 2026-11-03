interface ImportMetaEnv {
  readonly PUBLIC_CONTACT_URL?: string;
  readonly PUBLIC_AMAZON_TAG?: string;
  readonly PUBLIC_PINTEREST_VERIFY?: string;
  readonly PUBLIC_FIND_API?: string; // HQ's natural language search fallback; unset = browser rules only
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
