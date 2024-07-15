import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { authServices } from "./../services/auth.service.js";
import { generateJwt } from "../utils/auth.util.js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const OAuth2Router = express.Router();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            scope: ["openid", "profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await authServices.handleGoogleLogin(profile);
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    process.nextTick(() => done(null, user._id));
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await authServices.findByUserId(id);
        const token = await generateJwt({ userId: user._id });
        process.nextTick(() => done(null, { user, token }));
    } catch (error) {
        done(error);
    }
});

OAuth2Router.get("/google", passport.authenticate("google"));

OAuth2Router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/api/v1/auth/failed",
        successRedirect: "/api/v1/auth/success",
    })
);

OAuth2Router.get("/success", (req, res) => {
    const { user, token } = req.user;
    return res.redirect(
        `${process.env.CLIENT_URL}/success?accessToken=${token.accessToken}&refreshToken=${token.refreshToken}&userId=${user._id}&fullName=${user.fullName}&email=${user.email}`
    );
});

OAuth2Router.get("/failed", (req, res) => {
    res.status(500).json({
        message: "Failed to login",
    });
});

export { OAuth2Router, passport };
