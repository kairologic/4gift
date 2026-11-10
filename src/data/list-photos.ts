// Header photos for the home page, the four list hubs and every gift list. All are free Unsplash photos (Unsplash
// License: free to use, no permission needed), hotlinked from images.unsplash.com and credited to the photographer
// with a link, as Unsplash asks. The list cards on the home page and the hubs reuse the same photo.
// To swap a photo: change its id (the part after "photo-" in images.unsplash.com), alt, photographer and username.

export interface ListPhoto {
  id: string;
  alt: string;
  credit: string;
  creditUrl: string;
  /** The photo's page on Unsplash, for the reviewer. */
  page: string;
}

const UTM = 'utm_source=4gifts&utm_medium=referral';
const photo = (id: string, slug: string, alt: string, name: string, user: string): ListPhoto => ({
  id,
  alt,
  credit: `${name} on Unsplash`,
  creditUrl: `https://unsplash.com/@${user}?${UTM}`,
  page: `https://unsplash.com/photos/${slug}`,
});

/** The photo at a given size, cropped to fill it. */
export const photoSrc = (p: ListPhoto, w: number, h: number) =>
  `https://images.unsplash.com/photo-${p.id}?w=${w}&h=${h}&fit=crop&crop=faces,entropy&auto=format&q=75`;

/** Keyed by page path. */
export const listPhotos: Record<string, ListPhoto> = {
  '/': photo('1758874089961-e52549c294c3', 'VtRXNeBpknA', 'Woman happily receiving a gift from man', 'Vitaly Gariev', 'silverkblack'),
  '/for/': photo('1633683788767-ac390c4bf988', 'xKggi7Gtfs4', 'Two wrapped presents stacked', 'Kostiantyn Li', 'leekos'),
  '/occasion/': photo('1492684223066-81342ee5ff30', 'ZODcBkEohk8', 'People partying with confetti', 'Pablo Heimplatz', 'pabloheimplatz'),
  '/budget/': photo('1764385827344-079d60aa9b8d', '30c8EkH54gk', 'Gift wrapping with scissors and ribbon', 'Jess Bailey', 'jessbaileydesigns'),
  '/interest/': photo('1758522275604-6fe5cecfbee1', 'xUR_UEIJfmE', 'Artist mixing paints on a palette', 'Vitaly Gariev', 'silverkblack'),
  '/for/her/': photo('1608573773585-199ff9a61c09', 'RYZ4f7mAHtc', 'Woman holding a floral gift box', 'Kateryna Hliznitsova', 'kate_gliz'),
  '/for/him/': photo('1512909006721-3d6018887383', 'IPx7J1n_xUc', 'Person holding out a brown gift box', 'Kira auf der Heide', 'kadh'),
  '/for/mom/': photo('1551498624-3712f8e41930', '5rL71DCxn7s', 'Woman kissing her daughter\'s cheek among white roses', 'Liana Mikah', 'lianamikah'),
  '/for/dad/': photo('1557176278-3326a3193580', 'HptxPPct2d4', 'Man and boy walking on the seashore', 'Szilvia Basso', 'szilviabasso'),
  '/for/kids/': photo('1661966895121-6020b25dc7ef', 'y0YmwfJPi90', 'A little girl holding a book', 'Josh Duncan', 'joshbduncan'),
  '/for/teens/': photo('1536010447069-d2c8af80c584', 'WFBVn6fSgys', 'Three friends hugging and smiling for a photo', 'Priscilla Du Preez', 'priscilladupreez'),
  '/for/couples/': photo('1758522489604-b61149ff97ba', '23Zra4t_UuI', 'Couple opening a gift in a kitchen', 'Vitaly Gariev', 'silverkblack'),
  '/for/coworkers/': photo('1758691737584-a8f17fb34475', 'Kxo17w7BurY', 'Colleagues celebrating in an office', 'Vitaly Gariev', 'silverkblack'),
  '/occasion/birthday/': photo('1765530950709-67e6af4ce3ad', 'uFE1OelerPk', 'Children at a birthday party with balloons and cake', 'john renzzel', 'johnrenzzel'),
  '/occasion/christmas/': photo('1767743189702-5683fde98766', 'sOYaDxeKcy8', 'Wrapped presents under a decorated tree', 'Julia Blumberg', 'juliablumberg'),
  '/occasion/anniversary/': photo('1746138394984-5691db44df00', 'X2ve0lEx34g', 'Couple having a romantic dinner on the beach at sunset', 'Adam Juman', 'jumanjiphotos'),
  '/occasion/wedding/': photo('1764385827123-45525c44373c', 'SYji7nzYEjg', 'Golden gift box tied with pink and gold ribbons', 'Jess Bailey', 'jessbaileydesigns'),
  '/occasion/housewarming/': photo('1480074568708-e7b720bb3f09', '1ddol8rgUH8', 'White house under maple trees', 'Scott Webb', 'scottwebb'),
  '/occasion/mothers-day/': photo('1619903180479-6602d32de99c', 'xLA0XpFpe0U', 'Mother\'s Day card beside a bouquet of flowers', 'Ijaz Rafi', 'ijazrafi'),
  '/occasion/fathers-day/': photo('1542948843-bf19f4f535cf', 'WnsQxkepmiY', 'Silhouette of a man carrying a baby at golden hour', 'Steve DiMatteo', 'stevedimatteo'),
  '/occasion/graduation/': photo('1757875749961-9b52ef1299bb', '8ONdf8MyA8A', 'Two graduates in caps and gowns jumping at sunset', 'Akbar Nemati', 'akbarnemati'),
  '/occasion/thank-you/': photo('1554830072-52d78d0d4c18', 'CjI_2QX7hvU', 'Dog holding a thank-you note in its mouth', 'Howie R', 'howier'),
  '/budget/small-luxuries/': photo('1513201099705-a9746e1e201f', 'f94JPVrDbnY', 'Brown gift box with a pink ribbon', 'Jess Bailey', 'jessbaileydesigns'),
  '/budget/40-to-75/': photo('1764764138818-0b22ab4d4023', 'l6A1CggyaS4', 'Gift box wrapped with twine and greenery', 'Raymond Petrik', 'raymondpetrik'),
  '/budget/75-to-150/': photo('1644015040594-8924d3ecc0dd', 'iiuHDR8Om44', 'Brown paper gift bag on a table', 'Tamás Szabó', 'tomi_'),
  '/budget/150-and-up/': photo('1697717852279-cc39a8eb481a', '1lpIoXPdqpI', 'Red and pink gift boxes with gold bows', 'Tony Litvyak', 'justatony'),
  '/interest/cooks/': photo('1528712306091-ed0763094c98', 'APDMfLHZiRA', 'Person holding a frying pan', 'Kevin McCutcheon', 'kevinmccutcheon'),
  '/interest/coffee-tea/': photo('1498804103079-a6351b050096', 'pMW4jzELQCw', 'Eight lattes in mugs on a round table', 'Nathan Dumlao', 'nate_dumlao'),
  '/interest/gardeners/': photo('1611843467160-25afb8df1074', 'q13Zq1Jufks', 'Hands planting seedlings in garden soil', 'Sandie Clarke', 'honeypoppet'),
  '/interest/readers/': photo('1761416938064-b91b81262c84', '6J9sqSWQtcY', 'Young woman reading a book in a field at sunset', 'Olga Nevajno', 'princeska77'),
  '/interest/travelers/': photo('1726313475606-5c414edbfd8b', '3KXW9cJLHLw', 'Woman sitting in an open suitcase', 'Annie Spratt', 'anniespratt'),
  '/interest/fitness/': photo('1584735935682-2f2b69dff9d2', 'IZOAOjvwhaM', 'Two dumbbells and a resistance band on a wooden surface', 'Kelly Sikkema', 'kellysikkema'),
  '/interest/gamers/': photo('1629760946220-5693ee4c46ac', '3WceTBlUoMs', 'Colorful game pieces and dice on a board game', 'Nik Korba', 'goodfindsvolusia'),
  '/interest/tech/': photo('1609081219090-a6d81d3085bf', 'Q2uV5TkjNz8', 'White and gray wireless headphones', 'Akhil Yerabati', 'justaguyintech'),
  '/interest/self-care/': photo('1786315227730-c1a82ea3806d', 'rz_zDGgawQ0', 'A mug of latte, an open book and a lit candle', 'Bade Saba', 'badesaba'),
  '/interest/pet-lovers/': photo('1557495235-340eb888a9fb', 'FtuJIuBbUhI', 'Woman hugging a dog', 'Wade Austin Ellis', 'wadeaustinellis'),
};

export const listPhoto = (path: string): ListPhoto | undefined => listPhotos[path];
