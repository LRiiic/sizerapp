-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SizeTable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "products" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SizeTable" ("content", "createdAt", "id", "products", "shop", "status", "title", "type", "updatedAt") SELECT "content", "createdAt", "id", "products", "shop", "status", "title", "type", "updatedAt" FROM "SizeTable";
DROP TABLE "SizeTable";
ALTER TABLE "new_SizeTable" RENAME TO "SizeTable";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
