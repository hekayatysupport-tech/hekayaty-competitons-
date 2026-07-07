import { Router } from "express";
import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger";
import { supabase } from "../lib/supabase";

const router = Router();

// Rate limiter for admin auth attempts to prevent brute force
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  message: { error: "Too many authentication attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn({ ip: req.ip }, "Rate limit exceeded for admin authentication");
    res.status(options.statusCode).json(options.message);
  }
});

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

if (!ADMIN_SECRET_KEY) {
  logger.error("ADMIN_SECRET_KEY is not defined in environment variables!");
}

// POST /api/admin/auth/login
router.post("/login", adminAuthLimiter, async (req, res) => {
  const { email, password, secretKey } = req.body;

  if (!email || !password || !secretKey) {
    return res.status(400).json({ error: "Email, password, and secret key are required" });
  }

  // 1. Verify Secret Key
  if (secretKey !== ADMIN_SECRET_KEY) {
    logger.warn({ email, ip: req.ip }, "Failed admin login attempt: Invalid secret key");
    return res.status(401).json({ error: "Invalid administrator credentials." });
  }

  try {
    // 2. Verify email and password with Supabase Auth
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      // If sign in fails, attempt to sign up (Multi-function sign in / sign up)
      logger.info({ email, ip: req.ip }, "Sign in failed, attempting sign up for admin");
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: "Admin" } },
      });

      if (signUpError || !signUpData.user) {
        // If sign up fails (e.g., user already exists, wrong password), return 401
        logger.warn({ email, ip: req.ip, error: signUpError?.message || authError?.message }, "Failed admin login/signup attempt");
        return res.status(401).json({ error: "Invalid administrator credentials." });
      }

      // If sign up succeeded, call register_as_admin
      const { error: rpcError } = await supabase.rpc('register_as_admin', {
        p_user_id: signUpData.user.id,
        p_secret_key: secretKey,
        p_role: 'super_admin'
      });

      if (rpcError) {
        logger.error({ err: rpcError, email }, "Failed to add user to admin_roles during auto-signup");
        return res.status(500).json({ error: "Failed to assign admin role" });
      }

      // Automatically sign them in after successful sign up
      const { data: autoSignInData, error: autoSignInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (autoSignInError || !autoSignInData.user) {
        return res.status(500).json({ error: "Created but failed to auto-login" });
      }

      authData = autoSignInData;
    }

    // 3. Verify user exists in admin_roles
    const { data: roleData, error: roleError } = await supabase
      .from("admin_roles")
      .select("id, role")
      .eq("user_id", authData.user!.id)
      .maybeSingle();

    if (roleError || !roleData) {
      logger.warn({ email, userId: authData.user!.id, ip: req.ip }, "Failed admin login attempt: User not in admin_roles");
      return res.status(403).json({ error: "Invalid administrator credentials." });
    }

    // 4. Success - Return session data to client
    logger.info({ email, userId: authData.user.id, role: roleData.role }, "Successful admin login");
    
    return res.json({
      success: true,
      session: authData.session,
      user: authData.user,
      role: roleData.role
    });

  } catch (error) {
    logger.error({ err: error, email }, "Unexpected error during admin login");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/auth/register
router.post("/register", adminAuthLimiter, async (req, res) => {
  const { email, password, name, secretKey, role = 'super_admin' } = req.body;

  if (!email || !password || !name || !secretKey) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // 1. Verify Secret Key
  if (secretKey !== ADMIN_SECRET_KEY) {
    logger.warn({ email, ip: req.ip }, "Failed admin registration attempt: Invalid secret key");
    return res.status(401).json({ error: "Invalid administrator key." });
  }

  try {
    // 2. Create user in Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signUpError || !authData.user) {
      logger.error({ err: signUpError, email }, "Failed to create admin auth account");
      return res.status(400).json({ error: signUpError?.message || "Failed to create account" });
    }

    // 3. Call register_as_admin RPC
    // Passing the secret key to the RPC as well to satisfy DB-level security
    const { data: rpcData, error: rpcError } = await supabase.rpc('register_as_admin', {
      p_user_id: authData.user.id,
      p_secret_key: secretKey,
      p_role: role
    });

    if (rpcError) {
      logger.error({ err: rpcError, email }, "Failed to add user to admin_roles");
      return res.status(500).json({ error: "Failed to assign admin role" });
    }

    // 4. Success - Sign in to get session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
       return res.status(500).json({ error: "Created but failed to auto-login" });
    }

    logger.info({ email, userId: authData.user.id, role }, "Successful admin registration");

    return res.json({
      success: true,
      session: signInData.session,
      user: signInData.user,
      role
    });

  } catch (error) {
    logger.error({ err: error, email }, "Unexpected error during admin registration");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
