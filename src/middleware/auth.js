"use strict";
require("dotenv").config();

const pg = require("pg");
const rateLimit = require("express-rate-limit");
const expressFileupload = require("express-fileupload");
const config = require("../../config");
const pool = new pg.Pool(config.database);
const queries = require("../queries/queries");

module.exports = {
  validateLimit: rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: {
      result: "Failed",
      message: "Too many request, Please try again later",
    },
  }),

  fileUpload: expressFileupload(),

  appPagination: (req, res, next) => {
    try {
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit); 
      if(!page) return res.status(400).json({
        result: "Invalid",
        message: "Page is missing.",
      });
      if(!limit) return res.status(400).json({
        result: "Invalid",
        message: "Limit is missing.",
      }); 
      next();
    } catch (error) {
      res
        .status(500)
        .json({
          error: error.message,
          stack: config.app.environment === "development" ? err.stack : null,
        });
    }
  },

  validateApp: (req, res, next) => {
    try {
      let _clientid = config.app.clientId;
      let _clientSecret = config.app.clientSecret;

      let clientID = req.headers["client-id"];
      let clientSecret = req.headers["client-secret"];

      if (!clientID)
        return res.status(401).json({
          result: "Unathorized",
          message: "Client Id is missing.",
        });
      if (!clientSecret)
        return res.status(401).json({
          result: "Unathorized",
          message: "Client Secret is missing",
        });
      if (_clientid !== clientID)
        return res.status(401).json({
          result: "Unathorized",
          message: "Invalid Client Id",
        });
      if (_clientSecret !== clientSecret)
        return res.status(401).json({
          result: "Unathorized",
          message: "Invalid Client Secret",
        });
      next();
    } catch (error) {
      res
        .status(500)
        .json({
          error: error.message,
          stack: config.app.environment === "development" ? err.stack : null,
        });
    }
  },

  validateToken: (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];

      if (!authHeader)
        return res.status(401).json({
          result: "Unathorized",
          message: "Invalid Token",
        });
      req.token = authHeader;
      next();
    } catch (error) {
      res
        .status(500)
        .json({
          error: error.message,
          stack: config.app.environment === "development" ? err.stack : null,
        });
    }
  },
};
