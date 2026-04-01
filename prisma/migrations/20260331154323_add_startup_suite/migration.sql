-- CreateTable
CREATE TABLE "Startup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ideaPrompt" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "theme" TEXT DEFAULT 'blue',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "elevatorPitch" TEXT,
    "products" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "html" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    CONSTRAINT "Website_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "marketingPlan" TEXT,
    "pitchDeck" TEXT,
    "team" TEXT,
    "financials" TEXT,
    "roadmap" TEXT,
    "competitors" TEXT,
    "mockups" TEXT,
    "startupId" TEXT NOT NULL,
    CONSTRAINT "BusinessPlan_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Website_startupId_key" ON "Website"("startupId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPlan_startupId_key" ON "BusinessPlan"("startupId");
