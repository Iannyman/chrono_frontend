// Auth cookies are namespaced ("chrono_*") so they cannot collide with other
// apps served from the same host IP: cookies are scoped by host, not port, and
// arcane (the Docker dashboard on :3552) sets a plain `token` cookie that
// would overwrite ours on every one of its silent session refreshes.
export const AUTH_COOKIE = process.env.AUTH_COOKIE_NAME ?? "chrono_token";
export const USER_COOKIE = process.env.USER_COOKIE_NAME ?? "chrono_user";
