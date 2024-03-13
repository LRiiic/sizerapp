/*
  Warnings:

  - You are about to drop the `Products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `image` on the `SizeTable` table. All the data in the column will be lost.
  - Added the required column `products` to the `SizeTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `SizeTable` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Products";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Table" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sizeTableId" INTEGER NOT NULL,
    CONSTRAINT "Table_sizeTableId_fkey" FOREIGN KEY ("sizeTableId") REFERENCES "SizeTable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SizeTable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "products" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SizeTable" ("createdAt", "id", "shop", "title", "updatedAt") SELECT "createdAt", "id", "shop", "title", "updatedAt" FROM "SizeTable";
DROP TABLE "SizeTable";
ALTER TABLE "new_SizeTable" RENAME TO "SizeTable";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Table_sizeTableId_key" ON "Table"("sizeTableId");
