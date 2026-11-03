# 4Gifts channel drafts

Channel pieces cut from pages that are already live on the site, so they need no second approval. Each file pair is one live page:

- `NN-<slug>.json`: the pieces as data, in Masthead's piece shape (`video-script` kit, `pin-set`, `carousel`, `social` captions), ready for the channel service's held outbox once it is deployed.
- `NN-<slug>.md`: the same pieces as a page to read.

Every piece passed Masthead's review gate (the rules in Masthead-Main `scripts/check-piece.ts`): no prices, the disclosure on every post, the product in at least half the frames, scene pacing and lengths.

Per page: one Short (one render serves YouTube Shorts, Instagram Reels and TikTok, with two shorter cuts), a Pinterest pin set, an Instagram and Facebook carousel, a Facebook post and a TikTok caption. `[LINK]` is the page's address on the site.
