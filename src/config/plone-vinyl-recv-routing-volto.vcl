# Plone Volto routing snippet for cloud-vinyl (spec.vcl.snippets.vclRecvRouting)
# Runs in vcl_recv for every method except PURGE and BAN, before cloud-vinyl's
# GET/HEAD check, so logins, saves and uploads take the same route as reads.
# PloneVinylCache fills in the site id at synth time.
# Backends without their own director are shard directors in cloud-vinyl, so
# they are resolved by URL, like cloud-vinyl's own default backend hint.

# The REST API and blobs go to the Plone backend, rewritten for the
# VirtualHostMonster so that it answers for the site and builds public URLs.
if (req.url ~ "^/\+\+api\+\+" || req.url ~ "/@@(images|download|display-file)(/|$)") {
  set req.backend_hint = plone_backend.backend(by=URL);
  set req.http.x-vcl-proto = "http";
  if (req.http.X-Forwarded-Proto) {
    set req.http.x-vcl-proto = req.http.X-Forwarded-Proto;
  }
  set req.url = "/VirtualHostBase/" + req.http.x-vcl-proto + "/" + req.http.host + "/__PLONE_SITE_ID__/VirtualHostRoot" + req.url;
  unset req.http.x-vcl-proto;
} else {
  # Everything else is rendered by Volto.
  set req.backend_hint = plone_frontend.backend(by=URL);
}
