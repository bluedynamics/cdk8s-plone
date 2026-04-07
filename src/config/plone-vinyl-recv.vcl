# Plone vcl_recv snippet for cloud-vinyl
# Injected into vcl_recv after routing, before return()

# Handle PURGE requests from Kubernetes network
if (req.method == "PURGE") {
  if (!client.ip ~ purge) {
    return (synth(405, "Not allowed"));
  }
  return (purge);
}

# Handle BAN requests
if (req.method == "BAN") {
  if (!client.ip ~ purge) {
    return (synth(405, "Not allowed"));
  }
  ban("obj.http.x-url ~ " + req.http.x-ban-url +
      " && obj.http.x-host ~ " + req.http.x-ban-host);
  return (synth(200, "Ban added"));
}

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
