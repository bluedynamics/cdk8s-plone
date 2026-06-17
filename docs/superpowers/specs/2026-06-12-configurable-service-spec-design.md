# Design: Generisch steuerbare Service-Resourcen

**Datum:** 2026-06-12
**Branch:** `feat/configurable-service-spec`
**Status:** Approved (Design)

## Problem

Die von cdk8s-plone generierten Kubernetes-`Service`-Resourcen sind schlecht
steuerbar. Konkreter Anlass: Es soll `spec.trafficDistribution` gesetzt werden
können — das geht aktuell nicht. Generell ist die `Service`-Spec faktisch
hartcodiert: In [`src/service.ts`](../../../src/service.ts) baut `PloneService`
über das rohe `k8s.KubeService` nur `spec.ports` + `spec.selector`. Alle anderen
Felder (`type`, `sessionAffinity`, `externalTrafficPolicy`,
`internalTrafficPolicy`, `publishNotReadyAddresses`, `loadBalancerClass`,
`trafficDistribution`, …) sind nicht durchgereicht.

Zusätzlich ist das Plumbing nicht wartbar: Nach oben (in
[`src/plone.ts`](../../../src/plone.ts)) wird pro Feld einzeln geplumbt — aktuell
nur `serviceAnnotations`. Jedes neue Feld bräuchte Änderungen an mehreren Stellen.

## Ziel

Service-Spec-Felder konfigurierbar machen — möglichst generisch, mit wenig
Pflegeaufwand pro Feld, JSII-/Python-kompatibel, ohne Breaking Change.

## Designentscheidungen (bestätigt)

- **Hybrid-Ansatz:** Kuratierte typisierte Props für die häufigen Felder PLUS
  ein generischer Escape-Hatch für alles Übrige.
- **Gruppiertes Plumbing:** Ein einziges `service`-Objekt in `PloneBaseOptions`
  statt flacher Einzel-Props. Neue Felder ändern nur den Config-Typ.
- **`overrides`-Präzedenz:** `overrides` darf *alles* überschreiben (auch
  `ports`/`selector`) — volle Kontrolle für Power-User, dokumentiert.

## Lösung

### 1. Neuer Config-Typ `PloneServiceSpec` (in `src/service.ts`)

```typescript
export interface PloneServiceSpec {
  // Kuratierte, häufig gebrauchte Felder (alle optional, typisiert, dokumentiert):
  readonly type?: string;                       // ClusterIP | NodePort | LoadBalancer | ExternalName
  readonly trafficDistribution?: string;        // z.B. 'PreferClose'
  readonly sessionAffinity?: string;            // 'ClientIP' | 'None'
  readonly externalTrafficPolicy?: string;      // 'Cluster' | 'Local'
  readonly internalTrafficPolicy?: string;      // 'Cluster' | 'Local'
  readonly publishNotReadyAddresses?: boolean;
  readonly loadBalancerClass?: string;
  readonly loadBalancerSourceRanges?: string[];
  readonly annotations?: { [name: string]: string };  // ersetzt serviceAnnotations
  readonly labels?: { [name: string]: string };

  // Escape-Hatch für alles Übrige (ipFamilyPolicy, clusterIP, ...):
  readonly overrides?: { [key: string]: any };
}
```

Der `overrides`-Typ ist ein freiform-Record `{ [key: string]: any }` — deckt
jedes aktuelle und künftige k8s-Service-Feld ab, ohne dass Code angefasst werden
muss.

> **JSII-Constraint (entdeckt bei der Umsetzung):** Ursprünglich war
> `overrides?: k8s.ServiceSpec` geplant. JSII lehnt das ab
> (`JSII3000: Exported APIs cannot use un-exported type`), weil die generierten
> Typen aus `src/imports/k8s.ts` nicht Teil der JSII-Assembly sind. Den gesamten
> k8s-Import zu re-exportieren würde die öffentliche API mit der kompletten
> Kubernetes-API zumüllen. Ein freiform-Record ist die idiomatische, voll
> JSII-/Python-fähige (Python: `dict`) Lösung für einen generischen Escape-Hatch
> und bleibt „für alles" offen. Die kuratierten Felder bleiben typisiert.

### 2. `PloneServiceOptions` erweitern

`PloneServiceOptions` (das interne Interface von `PloneService`) bekommt ein
optionales `spec?: PloneServiceSpec`. Die bestehenden Pflichtfelder
(`targetPort`, `selectorLabel`, `portName`) bleiben unverändert. Das bestehende
`annotations` und `labels` auf `PloneServiceOptions` bleiben erhalten
(construct-managed Defaults), werden aber mit den Werten aus `spec` zusammen-
geführt (siehe Merge-Regeln).

### 3. Merge-Reihenfolge in `PloneService`

Vorhersagbar, shallow (ServiceSpec-Felder sind weitgehend flach):

```
finalSpec = { ...generatedBase, ...curatedFields, ...overrides }
```

Präzedenz steigend:

1. **Construct-Basis:** `ports`, `selector` (aus `targetPort`/`portName`/`selectorLabel`).
2. **Kuratierte Felder:** alle gesetzten Felder aus `spec` (außer `annotations`,
   `labels`, `overrides`).
3. **`overrides`:** `k8s.ServiceSpec`-Partial — höchste Präzedenz, überschreibt
   auch `ports`/`selector`. Dokumentiert als „at your own risk".

`annotations` und `labels` aus `spec` fließen in `metadata` (nicht in `spec`):
- `metadata.labels = { ...spec.labels, ...constructManagedLabels }`
  (construct-managed `part-of`/`managed-by` gewinnen — wie bisher).
- `metadata.annotations = { ...serviceAnnotations (deprecated), ...spec.annotations }`
  (neue `spec.annotations` gewinnen bei Konflikt).

### 4. Plumbing: ein Punkt in `PloneBaseOptions` (`src/plone.ts`)

```typescript
/**
 * Service configuration (type, trafficDistribution, sessionAffinity,
 * annotations, raw spec overrides, ...). Applies to the component's Service.
 */
readonly service?: PloneServiceSpec;

/**
 * @deprecated use `service.annotations` instead
 */
readonly serviceAnnotations?: { [name: string]: string };
```

`backend`/`frontend` erben beide aus `PloneBaseOptions`, daher gilt die
`service`-Config automatisch für beide Services an genau einer Stelle.

In `plone.ts` (Backend-Service ~Z. 468, Frontend-Service ~Z. 570) wird
`spec` durchgereicht und die deprecated `serviceAnnotations` weiter unterstützt:

```typescript
new PloneService(backendDeployment, 'service', {
  // ... unverändert: labels, targetPort, selectorLabel, portName ...
  spec: {
    ...backend.service,
    annotations: { ...backend.serviceAnnotations, ...backend.service?.annotations },
  },
});
```

### 5. Backward-Compatibility

`serviceAnnotations` bleibt funktionsfähig, wird als `@deprecated` markiert und
mit `service.annotations` zusammengeführt (neue Variante gewinnt). Kein Breaking
Change. Bestehende Snapshots ohne `service` bleiben unverändert (alle neuen
Felder sind optional, ungesetzt → keine Spec-Änderung).

### 6. Tests (`test/service.test.ts`)

Neue Snapshot-/Assertion-Fälle:

- `trafficDistribution: 'PreferClose'` → erscheint in `spec`.
- `type: 'LoadBalancer'` + `loadBalancerSourceRanges` → erscheinen in `spec`.
- `sessionAffinity` / `externalTrafficPolicy` gesetzt.
- `overrides` (z.B. `ipFamilyPolicy`) → erscheint in `spec`.
- Präzedenz: `overrides` schlägt kuratiertes Feld (z.B. beide setzen `type`,
  `overrides` gewinnt).
- Backward-Compat: nur `serviceAnnotations` gesetzt → unverändertes Verhalten;
  `serviceAnnotations` + `service.annotations` → korrekt gemergt.

Snapshots aktualisieren via `npx projen test -- -u`.

### 7. Dokumentation

Beim Schreiben/Editieren der Doku den Skill **`plone-doc-style:author`**
verwenden (Diataxis-Quadranten-Zuordnung, MyST-Markup, Style-Enforcement),
soweit es sinnvoll ist — d.h. für die handgeschriebenen Seiten unter
`documentation/sources/` (Reference + How-to). Nicht für auto-generierte
Artefakte (`API.md`).

- **`API.md`** ist auto-generiert (`npx projen docgen`) — kein manuelles Edit,
  aber nach Implementierung neu generieren.
- **`documentation/sources/reference/configuration-options.md`:** Den Abschnitt
  „Annotations" (~Z. 200) zu einem Abschnitt „Service" erweitern bzw. einen
  neuen Abschnitt für `PloneServiceSpec` ergänzen: Tabelle der kuratierten
  Felder + `overrides`, mit Beispiel (`trafficDistribution`, `LoadBalancer`).
  `serviceAnnotations` als deprecated kennzeichnen und auf `service.annotations`
  verweisen.
- **`documentation/sources/how-to/`:** In `deploy-production-volto.md` ein
  kurzes Beispiel ergänzen (z.B. `trafficDistribution: 'PreferClose'` für
  topologie-nahes Routing), falls thematisch passend.
- Doku-Build prüfen: `cd documentation && make docs`.

## Betroffene Dateien

- `src/service.ts` — neuer `PloneServiceSpec`-Typ, erweiterte `PloneServiceOptions`, Merge-Logik.
- `src/plone.ts` — `service`-Prop in `PloneBaseOptions`, Plumbing in Backend/Frontend, `serviceAnnotations` deprecaten.
- `test/service.test.ts` (+ Snapshots) — neue Testfälle.
- `documentation/sources/reference/configuration-options.md` — Service-Config dokumentieren.
- `documentation/sources/how-to/deploy-production-volto.md` — optionales Beispiel.
- `API.md` — regenerieren via `npx projen docgen`.

## Nicht im Scope (YAGNI)

- Multi-Port-Services (mehrere `ports`-Einträge) — über `overrides` möglich,
  aber kein kuratiertes Feature.
- Eigene Validierung der Enum-Strings (`type`, `sessionAffinity`, …) — k8s
  validiert serverseitig; wir bilden die Strings 1:1 ab.
- Separate Service-Configs pro Service jenseits von backend/frontend.
