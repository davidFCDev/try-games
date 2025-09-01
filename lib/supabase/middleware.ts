import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const publicPaths = ["/", "/wods", "/workout", "/rankings"];
  const pathname = request.nextUrl.pathname;

  const isPublicPath = publicPaths.some((path) => {
    if (path === "/") {
      return pathname === "/"; // Solo la raíz exacta
    }
    return pathname === path || pathname.startsWith(path + "/");
  });
  const isAuthPath = pathname.startsWith("/auth");

  console.log(
    "Middleware - Path:",
    pathname,
    "IsPublic:",
    isPublicPath,
    "IsAuth:",
    isAuthPath
  );

  // Si es una ruta pública o de auth, permitir acceso
  if (isPublicPath || isAuthPath) {
    console.log("Allowing access to public/auth path");
    return supabaseResponse;
  }

  // Para rutas protegidas como /admin, verificar cookies de Supabase
  const cookies = request.cookies.getAll();
  console.log(
    "All cookies:",
    cookies.map((c) => `${c.name}=${c.value.substring(0, 20)}...`)
  );

  // Buscar cookies específicas de Supabase auth
  const authCookies = cookies.filter(
    (cookie) =>
      cookie.name.startsWith("sb-") &&
      (cookie.name.includes("auth-token") ||
        cookie.name.includes("access-token"))
  );

  console.log(
    "Auth cookies found:",
    authCookies.map((c) => c.name)
  );
  const hasAuthCookie = authCookies.length > 0;

  console.log("Has auth cookie:", hasAuthCookie);

  // Si no hay cookie de autenticación, redirigir al login
  if (!hasAuthCookie) {
    console.log("No auth cookie found, redirecting to login");
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Si hay cookie, permitir acceso
  console.log("Auth cookie found, allowing access");
  return supabaseResponse;
}
