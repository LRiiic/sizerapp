/*
  Warnings:

  - You are about to drop the `Table` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `SizeTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `SizeTable` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Table_sizeTableId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Table";
PRAGMA foreign_keys=on;

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
INSERT INTO "new_SizeTable" ("createdAt", "id", "products", "shop", "status", "title", "updatedAt") SELECT "createdAt", "id", "products", "shop", "status", "title", "updatedAt" FROM "SizeTable";
DROP TABLE "SizeTable";
ALTER TABLE "new_SizeTable" RENAME TO "SizeTable";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
