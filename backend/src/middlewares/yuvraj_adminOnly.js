export function yuvrajAdminOnly(req, res, next) {
  // Allow all requests in development (disable admin check)
  return next();
  
  // Uncomment below for production admin authentication
  // const key = req.header("x-admin-key");
  // if (process.env.ADMIN_SECRET && key === process.env.ADMIN_SECRET) return next();
  // if (!process.env.ADMIN_SECRET) return next();
  // return res.status(401).json({ message: "Admin only" });
}


