# Plone vcl_recv snippet for cloud-vinyl
# Injected into vcl_recv for GET and HEAD only, before return(hash).
# PURGE, BAN and xkey are handled by cloud-vinyl's own VCL before this point.

# Detect authenticated requests
if (req.http.Cookie ~ "__ac" || req.http.Authorization) {
  set req.http.X-Plone-Auth = "true";
  return (pass);
}

# Remove tracking cookies to improve cache hit rate
if (req.http.Cookie) {
  set req.http.Cookie = regsuball(req.http.Cookie, "(^|;\s*)(_ga[^=]*|_gid|_gat|__utm[a-z]+|_hj[a-z]+|_fbp|_fbc)=[^;]*", "");
  set req.http.Cookie = regsuball(req.http.Cookie, "^;\s*", "");
  if (req.http.Cookie ~ "^\s*$") {
    unset req.http.Cookie;
  }
}
