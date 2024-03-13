-- CreateTable
CREATE TABLE "SizeTable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" TEXT NOT NULL,
    "featuredMedia" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sizeTableId" INTEGER NOT NULL,
    CONSTRAINT "Products_sizeTableId_fkey" FOREIGN KEY ("sizeTableId") REFERENCES "SizeTable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
