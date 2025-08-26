import ratelimit from "../config/upstash.js";

const rateLimter = async (req, res, next) => {
  try {
    // If Upstash is not configured, skip limiting in local/dev
    if (!ratelimit) {
      console.log("Rate limiting disabled - Upstash not configured");
      return next();
    }
    
    const { success } = await ratelimit.limit("my-limit-key");

    if (!success) {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later." });
    }
    next();
  } catch (error) {
    console.log("Rate limiter error:", error);
    // Do not block requests if limiter fails in dev
    next();
  }
};

export default rateLimter;
