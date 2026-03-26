export const DOG_IMAGES = [
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
  'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=400',
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400',
  'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?w=400',
  'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
  'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
  'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400',
  'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400',
  'https://images.unsplash.com/photo-1554692998-0d26ff83f7e6?w=400',
  'https://images.unsplash.com/photo-1591160674255-fc8e818cf214?w=400',
];

export const CAT_IMAGES = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400',
  'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400',
  'https://images.unsplash.com/photo-1511497584788-876760111969?w=400',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
  'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400',
  'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=400',
  'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400',
  'https://images.unsplash.com/photo-1516139008210-96e45dccd83b?w=400',
  'https://images.unsplash.com/photo-1526336028067-6484187f566e?w=400',
  'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=400',
  'https://images.unsplash.com/photo-1517331156634-f2097956d8c9?w=400',
  'https://images.unsplash.com/photo-1533745848184-3db07256e163?w=400',
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400',
];

export const getRandomImage = (type?: 'Dog' | 'Cat', id?: string) => {
    const list = type === 'Cat' ? CAT_IMAGES : DOG_IMAGES;
    if (!id) return list[Math.floor(Math.random() * list.length)];

    // Deterministic random index based on ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % list.length;
    return list[index];
};
