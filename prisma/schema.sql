-- CreateTable
CREATE TABLE "LinkGen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeSlug" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "storeId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "benefit" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" DATETIME,
    "linkGenId" TEXT,
    CONSTRAINT "Coupon_linkGenId_fkey" FOREIGN KEY ("linkGenId") REFERENCES "LinkGen" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

