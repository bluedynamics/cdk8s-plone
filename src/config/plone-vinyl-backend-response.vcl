# Plone vcl_backend_response snippet for cloud-vinyl
# Injected into vcl_backend_response

# Remove Set-Cookie from static resources
if (bereq.url ~ "\.(pdf|asc|dat|txt|doc|xls|ppt|tgz|csv|png|gif|jpeg|jpg|ico|swf|css|js|svg|woff|woff2|ttf|eot)(\?.*)?$") {
  unset beresp.http.Set-Cookie;
}

# Don't cache responses with Set-Cookie
if (beresp.http.Set-Cookie) {
  set beresp.uncacheable = true;
  return (deliver);
}

# Don't cache private responses
if (beresp.http.Cache-Control ~ "private") {
  set beresp.uncacheable = true;
  return (deliver);
}

# Default TTL for responses without Cache-Control
if (!beresp.http.Cache-Control) {
  set beresp.ttl = 30s;
  set beresp.grace = 60s;
}
