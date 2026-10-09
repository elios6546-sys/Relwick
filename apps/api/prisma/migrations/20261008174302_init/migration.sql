-- CreateTable
CREATE TABLE `Visitor` (
    `id` CHAR(36) NOT NULL,
    `firstSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastSeenAt` DATETIME(3) NOT NULL,
    `sessionCount` INTEGER NOT NULL DEFAULT 0,
    `firstIp` VARCHAR(45) NOT NULL,
    `lastIp` VARCHAR(45) NOT NULL,
    `lastCity` VARCHAR(120) NULL,
    `lastCountry` CHAR(2) NULL,
    `isBot` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Visitor_lastSeenAt_idx`(`lastSeenAt`),
    INDEX `Visitor_firstSeenAt_idx`(`firstSeenAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` CHAR(36) NOT NULL,
    `visitorId` CHAR(36) NOT NULL,
    `ip` VARCHAR(45) NOT NULL,
    `ipVersion` TINYINT NOT NULL,
    `asn` INTEGER NULL,
    `isp` VARCHAR(160) NULL,
    `countryCode` CHAR(2) NULL,
    `country` VARCHAR(80) NULL,
    `region` VARCHAR(120) NULL,
    `city` VARCHAR(120) NULL,
    `postalCode` VARCHAR(20) NULL,
    `latitude` DECIMAL(9, 6) NULL,
    `longitude` DECIMAL(9, 6) NULL,
    `accuracyKm` INTEGER NULL,
    `geoTimezone` VARCHAR(64) NULL,
    `userAgent` TEXT NOT NULL,
    `browser` VARCHAR(60) NULL,
    `browserVersion` VARCHAR(30) NULL,
    `os` VARCHAR(60) NULL,
    `osVersion` VARCHAR(30) NULL,
    `deviceType` ENUM('DESKTOP', 'MOBILE', 'TABLET', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `deviceVendor` VARCHAR(60) NULL,
    `deviceModel` VARCHAR(60) NULL,
    `screenW` SMALLINT NULL,
    `screenH` SMALLINT NULL,
    `viewportW` SMALLINT NULL,
    `viewportH` SMALLINT NULL,
    `language` VARCHAR(20) NULL,
    `browserTimezone` VARCHAR(64) NULL,
    `referrer` TEXT NULL,
    `referrerDomain` VARCHAR(255) NULL,
    `sourceCategory` ENUM('DIRECT', 'SEARCH', 'SOCIAL', 'WHATSAPP', 'REFERRAL', 'CAMPAIGN') NOT NULL DEFAULT 'DIRECT',
    `utmSource` VARCHAR(120) NULL,
    `utmMedium` VARCHAR(120) NULL,
    `utmCampaign` VARCHAR(120) NULL,
    `utmTerm` VARCHAR(120) NULL,
    `utmContent` VARCHAR(120) NULL,
    `landingPath` VARCHAR(512) NOT NULL,
    `exitPath` VARCHAR(512) NULL,
    `lastSection` VARCHAR(60) NULL,
    `pageviewCount` INTEGER NOT NULL DEFAULT 0,
    `eventCount` INTEGER NOT NULL DEFAULT 0,
    `clickCount` INTEGER NOT NULL DEFAULT 0,
    `maxScrollPct` TINYINT NOT NULL DEFAULT 0,
    `activeSeconds` INTEGER NOT NULL DEFAULT 0,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastActivityAt` DATETIME(3) NOT NULL,
    `endedAt` DATETIME(3) NULL,
    `isBounce` BOOLEAN NULL,
    `isBot` BOOLEAN NOT NULL DEFAULT false,
    `isExcluded` BOOLEAN NOT NULL DEFAULT false,
    `converted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Session_startedAt_idx`(`startedAt`),
    INDEX `Session_lastActivityAt_idx`(`lastActivityAt`),
    INDEX `Session_visitorId_startedAt_idx`(`visitorId`, `startedAt`),
    INDEX `Session_countryCode_city_idx`(`countryCode`, `city`),
    INDEX `Session_ip_idx`(`ip`),
    INDEX `Session_sourceCategory_idx`(`sourceCategory`),
    INDEX `Session_deviceType_idx`(`deviceType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageView` (
    `id` CHAR(36) NOT NULL,
    `sessionId` CHAR(36) NOT NULL,
    `path` VARCHAR(512) NOT NULL,
    `title` VARCHAR(255) NULL,
    `enteredAt` DATETIME(3) NOT NULL,
    `lastActivityAt` DATETIME(3) NOT NULL,
    `activeSeconds` INTEGER NOT NULL DEFAULT 0,
    `maxScrollPct` TINYINT NOT NULL DEFAULT 0,

    INDEX `PageView_sessionId_enteredAt_idx`(`sessionId`, `enteredAt`),
    INDEX `PageView_path_enteredAt_idx`(`path`, `enteredAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `sessionId` CHAR(36) NOT NULL,
    `pageViewId` CHAR(36) NULL,
    `type` ENUM('PAGEVIEW', 'CLICK', 'CTA_CLICK', 'CONTACT_CLICK', 'OUTBOUND_CLICK', 'SECTION_VIEW', 'SCROLL_DEPTH', 'FORM_START', 'FORM_ERROR', 'FORM_SUBMIT', 'FILTER_CHANGE', 'THEME_TOGGLE', 'MENU_TOGGLE') NOT NULL,
    `name` VARCHAR(120) NULL,
    `label` VARCHAR(160) NULL,
    `section` VARCHAR(60) NULL,
    `href` VARCHAR(1024) NULL,
    `value` INTEGER NULL,
    `xPct` DOUBLE NULL,
    `yPx` INTEGER NULL,
    `meta` JSON NULL,
    `occurredAt` DATETIME(3) NOT NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Event_type_occurredAt_idx`(`type`, `occurredAt`),
    INDEX `Event_sessionId_occurredAt_idx`(`sessionId`, `occurredAt`),
    INDEX `Event_name_occurredAt_idx`(`name`, `occurredAt`),
    INDEX `Event_section_occurredAt_idx`(`section`, `occurredAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyStat` (
    `date` DATE NOT NULL,
    `visits` INTEGER NOT NULL,
    `uniqueVisitors` INTEGER NOT NULL,
    `newVisitors` INTEGER NOT NULL,
    `pageviews` INTEGER NOT NULL,
    `totalActiveSec` INTEGER NOT NULL,
    `bounces` INTEGER NOT NULL,
    `leads` INTEGER NOT NULL,
    `botVisits` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead` (
    `id` CHAR(36) NOT NULL,
    `visitorId` CHAR(36) NULL,
    `sessionId` CHAR(36) NULL,
    `fullName` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(40) NOT NULL,
    `email` VARCHAR(190) NULL,
    `projectType` VARCHAR(60) NOT NULL,
    `callSlot` VARCHAR(20) NOT NULL,
    `message` TEXT NULL,
    `consent` BOOLEAN NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'CALL_SCHEDULED', 'CONVERTED', 'LOST') NOT NULL DEFAULT 'NEW',
    `notes` TEXT NULL,
    `ip` VARCHAR(45) NULL,
    `city` VARCHAR(120) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `contactedAt` DATETIME(3) NULL,

    INDEX `Lead_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Lead_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminUser` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `tokenHash` VARCHAR(255) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userAgent` VARCHAR(255) NULL,
    `ip` VARCHAR(45) NULL,

    INDEX `RefreshToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminLoginAttempt` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(190) NOT NULL,
    `ip` VARCHAR(45) NOT NULL,
    `success` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AdminLoginAttempt_ip_createdAt_idx`(`ip`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `key` VARCHAR(60) NOT NULL,
    `value` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_visitorId_fkey` FOREIGN KEY (`visitorId`) REFERENCES `Visitor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PageView` ADD CONSTRAINT `PageView_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_pageViewId_fkey` FOREIGN KEY (`pageViewId`) REFERENCES `PageView`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_visitorId_fkey` FOREIGN KEY (`visitorId`) REFERENCES `Visitor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
