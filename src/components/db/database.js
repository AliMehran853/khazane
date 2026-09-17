import Dexie from 'dexie';

const db = new Dexie('KhazaneDB');

db.version(1).stores({
  transactions: `
    ++id,
    memberId,
    type,
    categoryId,
    date,
    createdAt,
    updatedAt,
    [memberId+type],
    [memberId+categoryId],
    [memberId+date]
  `,

  categories: `
    id,
    memberId,
    type,
    [memberId+type]
  `,

  settings: `
    key,
    updatedAt
  `,
});

export default db;