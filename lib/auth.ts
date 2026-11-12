import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { jwt } from "better-auth/plugins"

const mongoUri = process.env.BETTER_AUTH_DB_URI || process.env.MONGO_DB_URI || "mongodb://localhost:27017/hireloopdb"
const client = new MongoClient(mongoUri)
const db = client.db("hireloopdb")

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: ["seeker", "recruiter", "admin"],
                input: true,
                defaultValue: "seeker",
            },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    plugins: [
        jwt(),
    ],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        },
    },
    database: mongodbAdapter(db, {
        client,
    }),
})
