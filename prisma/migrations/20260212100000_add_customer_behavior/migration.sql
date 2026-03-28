-- CreateTable
CREATE TABLE "CustomerBehavior" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "deviceId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerBehavior_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerBehavior_userId_key" ON "CustomerBehavior"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerBehavior_deviceId_key" ON "CustomerBehavior"("deviceId");

-- CreateIndex
CREATE INDEX "CustomerBehavior_userId_idx" ON "CustomerBehavior"("userId");

-- CreateIndex
CREATE INDEX "CustomerBehavior_deviceId_idx" ON "CustomerBehavior"("deviceId");

-- AddForeignKey
ALTER TABLE "CustomerBehavior" ADD CONSTRAINT "CustomerBehavior_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
