import { db } from '@/prisma/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { twoFactor } from 'better-auth/plugins'

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
    },
    appName: 'Finzas App',
    plugins: [
        twoFactor({
            schema: {
                user: {
                    modelName: 'user',
                    fields: {
                        twoFactorEnabled: 'two_factor_enabled',
                        backupCodes: 'backup_codes',
                        userId: 'user_id',
                    },
                },
                twoFactor: {
                    modelName: 'twoFactor',
                    fields: {
                        twoFactorEnabled: 'two_factor_enabled',
                        backupCodes: 'backup_codes',
                        userId: 'user_id',
                    },
                },
            },
        }),
    ],
    user: {
        modelName: 'user',
        fields: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            emailVerified: 'email_verified',
        },
    },
    session: {
        modelName: 'session',
        fields: {
            createdAt: 'created_at',
            expiresAt: 'expires_at',
            ipAddress: 'ip_address',
            updatedAt: 'updated_at',
            userAgent: 'user_agent',
            userId: 'user_id',
        },
    },
    verification: {
        modelName: 'verification',
        fields: {
            createdAt: 'created_at',
            expiresAt: 'expires_at',
            updatedAt: 'updated_at',
        },
    },
    account: {
        modelName: 'account',
        fields: {
            createdAt: 'created_at',
            expiresAt: 'expires_at',
            updatedAt: 'updated_at',
            accessToken: 'access_token',
            accountId: 'account_id',
            accessTokenExpiresAt: 'access_token_expires_at',
            refreshTokenExpiresAt: 'refresh_token_expires_at',
            idToken: 'id_token',
            providerId: 'provider_id',
            userId: 'user_id',
            refreshToken: 'refresh_token',
        },
    },
    advanced: { database: { generateId: false } },
})
