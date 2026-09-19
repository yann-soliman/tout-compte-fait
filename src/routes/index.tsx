import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Coins,
  Euro,
  RotateCcw,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type DisplayMode = "annual" | "monthly";
type EntryMode = "tjm" | "revenue";
type ScenarioTone = "micro" | "salary";

type ScenarioState = {
  common: { year: number; taxSituation: string; taxParts: number; customTaxRate: number; displayMode: DisplayMode };
  micro: { activityType: string; entryMode: EntryMode; annualRevenue: number; dailyRate: number; daysPerWeek: number; weeksOff: number; adminDays: number; expenses: number; taxOption: string };
  salary: { grossFullTime: number; workTimePercent: number; bonuses: number; participation: number; mealTicketCount: number; mealTicketValue: number; mealEmployerShare: number; otherBenefits: number; paidLeaveWeeks: number; rttDays: number; extraDaysOff: number };
};

type Result = { netAvailable: number; economicValue: number; workedDays: number; valuePerDay: number; gross: number; contributions: number; expenses: number; tax: number; benefits: number };
type Update = <Group extends keyof ScenarioState, Field extends keyof ScenarioState[Group]>(group: Group, field: Field, value: ScenarioState[Group][Field]) => void;

const defaultState: ScenarioState = {
  common: { year: 2026, taxSituation: "Célibataire, sans enfant", taxParts: 1, customTaxRate: 8, displayMode: "annual" },
  micro: { activityType: "Activité libérale BNC", entryMode: "tjm", annualRevenue: 0, dailyRate: 600, daysPerWeek: 4, weeksOff: 5, adminDays: 18, expenses: 7200, taxOption: "Versement libératoire non retenu" },
  salary: { grossFullTime: 70000, workTimePercent: 80, bonuses: 3500, participation: 2200, mealTicketCount: 188, mealTicketValue: 10, mealEmployerShare: 60, otherBenefits: 1200, paidLeaveWeeks: 5, rttDays: 5, extraDaysOff: 2 },
};

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tout compte fait — Comparateur micro-entreprise et salariat" },
      { name: "description", content: "Comparez ce que vous gagnez vraiment, le temps que vous y consacrez et les avantages associés." },
      { property: "og:title", content: "Tout compte fait — Comparateur micro-entreprise et salariat" },
      { property: "og:description", content: "Un prototype interactif pour comparer revenu disponible, valeur annuelle et temps travaillé." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [state, setState] = useState<ScenarioState>(defaultState);
  const [mobileScenario, setMobileScenario] = useState<ScenarioTone>("micro");
  const [revision, setRevision] = useState(0);
  const [showReset, setShowReset] = useState(false);
  const firstRender = useRef(true);
  const results = useMemo(() => calculateResults(state), [state]);
  const displayFactor = state.common.displayMode === "monthly" ? 12 : 1;
  const periodLabel = state.common.displayMode === "monthly" ? "par mois" : "par an";

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setRevision((value) => value + 1);
  }, [state]);

  const update: Update = (group, field, value) => {
    setState((current) => ({ ...current, [group]: { ...current[group], [field]: value } }));
    setShowReset(false);
  };

  const reset = () => {
    setState(defaultState);
    setShowReset(true);
  };

  const summary = buildSummary(results);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background pb-28 text-foreground sm:pb-0">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border pb-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-primary">Prototype · données fictives</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">Tout compte fait</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Comparez ce que vous gagnez vraiment, le temps que vous y consacrez et les avantages associés.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={reset} title="Réinitialiser les données fictives" aria-label="Réinitialiser les données fictives">
            <RotateCcw aria-hidden="true" />
          </Button>
        </header>

        {showReset ? <p role="status" className="mt-3 text-sm text-muted-foreground">Les données fictives ont été réinitialisées.</p> : null}
        <p className="sr-only" aria-live="polite" aria-atomic="true">{revision > 0 ? `Estimation mise à jour. ${summary.primary}` : ""}</p>

        <section aria-labelledby="decision-title" className="py-8 sm:py-10">
          <p className="text-sm font-semibold text-muted-foreground">Votre comparaison en un regard</p>
          <h2 id="decision-title" className="mt-2 max-w-5xl font-display text-3xl font-bold leading-tight text-balance sm:text-5xl">
            {summary.primary}
          </h2>
          <p className="mt-3 max-w-4xl text-base leading-7 text-muted-foreground sm:text-lg">{summary.secondary}</p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-attention-foreground">
            <AlertTriangle className="size-4 shrink-0 text-attention" aria-hidden="true" />
            Estimation simplifiée pour tester l’expérience, pas un calcul fiscal.
          </p>
        </section>

        <section aria-label="Cockpit de comparaison" className="border-y border-border py-6 lg:grid lg:grid-cols-[minmax(250px,0.78fr)_minmax(390px,1.35fr)_minmax(250px,0.78fr)] lg:items-start lg:gap-7">
          <div className="md:hidden">
            <Tabs value={mobileScenario} onValueChange={(value) => setMobileScenario(value as ScenarioTone)}>
              <TabsList className="grid h-12 w-full grid-cols-2" aria-label="Scénario à modifier">
                <TabsTrigger value="micro" className="h-10">Micro</TabsTrigger>
                <TabsTrigger value="salary" className="h-10">Salariat</TabsTrigger>
              </TabsList>
              <TabsContent value="micro"><MicroPanel state={state} update={update} /></TabsContent>
              <TabsContent value="salary"><SalaryPanel state={state} update={update} /></TabsContent>
            </Tabs>
          </div>

          <div className="hidden md:grid md:grid-cols-2 md:gap-6 lg:contents">
            <MicroPanel state={state} update={update} />
            <SalaryPanel state={state} update={update} className="lg:col-start-3" />
          </div>

          <div className="mt-6 md:mt-7 lg:col-start-2 lg:row-start-1 lg:mt-0">
            <PrimaryResult results={results} displayFactor={displayFactor} periodLabel={periodLabel} revision={revision} />
          </div>
        </section>

        <EquivalentsPanel equivalents={results.equivalents} />

        <section aria-label="Comprendre les résultats" className="border-t border-border py-8 sm:py-10">
          <div className="mb-6 max-w-3xl">
            <p className="text-sm font-semibold text-muted-foreground">Comprendre les écarts</p>
            <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Du montant de départ à ce qui compte vraiment</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <BreakdownPanel title="Micro-entreprise" tone="micro" result={results.micro} lines={[
              ["Chiffre d’affaires HT", results.micro.gross], ["Cotisations estimées", -results.micro.contributions], ["Dépenses professionnelles", -results.micro.expenses], ["Impôt estimé", -results.micro.tax],
            ]} />
            <BreakdownPanel title="Salariat" tone="salary" result={results.salary} lines={[
              ["Brut réellement versé", results.salary.gross], ["Cotisations salariales estimées", -results.salary.contributions], ["Impôt estimé", -results.salary.tax], ["Avantages économiques", results.salary.benefits],
            ]} />
          </div>
        </section>

        <section className="border-t border-border py-3">
          <Accordion type="multiple">
            <AccordionItem value="protection">
              <AccordionTrigger className="text-lg font-bold"><span className="flex items-center gap-3"><ShieldCheck className="size-5 text-primary" aria-hidden="true" /> Protection sociale et droits associés</span></AccordionTrigger>
              <AccordionContent><ProtectionContent /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="assumptions">
              <AccordionTrigger className="text-lg font-bold"><span className="flex items-center gap-3"><CircleHelp className="size-5 text-primary" aria-hidden="true" /> Hypothèses, méthode et affichage</span></AccordionTrigger>
              <AccordionContent><CommonSettings state={state} update={update} results={results} /></AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>

      <MobileSummary results={results} displayFactor={displayFactor} periodLabel={periodLabel} />
    </main>
  );
}

function buildSummary(results: { micro: Result; salary: Result }) {
  const netGap = results.micro.netAvailable - results.salary.netAvailable;
  const dayGap = results.micro.workedDays - results.salary.workedDays;
  const valueGap = results.micro.economicValue - results.salary.economicValue;
  const moneyLeader = netGap >= 0 ? "La micro-entreprise" : "Le salariat";
  const timeText = dayGap === 0 ? "avec autant de jours travaillés" : `pour ${Math.abs(Math.round(dayGap))} jours travaillés ${dayGap > 0 ? "de plus" : "de moins"} par an`;
  const valueLeader = valueGap >= 0 ? "La micro-entreprise" : "Le salariat";
  return {
    primary: `${moneyLeader} laisse environ ${eur.format(Math.abs(netGap))} de plus, ${timeText}.`,
    secondary: `${valueLeader} présente aussi la valeur économique annuelle la plus élevée dans cette estimation. Les critères restent distincts : aucun statut n’est meilleur dans toutes les situations.`,
  };
}

function PrimaryResult({ results, displayFactor, periodLabel, revision }: { results: { micro: Result; salary: Result }; displayFactor: number; periodLabel: string; revision: number }) {
  const netGap = results.micro.netAvailable - results.salary.netAvailable;
  const relative = results.salary.netAvailable === 0 ? 0 : netGap / results.salary.netAvailable;
  return (
    <section aria-labelledby="main-result" className="bg-foreground p-5 text-background sm:p-7">
      <p className="text-xs font-bold uppercase text-background/70">Résultat principal · estimé</p>
      <h2 id="main-result" className="mt-2 font-display text-2xl font-bold">Argent réellement disponible</h2>
      <div key={revision} className="result-update mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <ScenarioValue tone="micro" label="Micro-entreprise" value={eur.format(results.micro.netAvailable / displayFactor)} unit={periodLabel} />
        <ScenarioValue tone="salary" label="Salariat" value={eur.format(results.salary.netAvailable / displayFactor)} unit={periodLabel} />
      </div>
      <p className="mt-6 border-t border-background/20 pt-4 text-sm leading-6 text-background/80">
        <strong className="text-background">Écart : {eur.format(Math.abs(netGap) / displayFactor)} ({pct.format(Math.abs(relative))})</strong><br />
        {netGap >= 0 ? "en faveur de la micro-entreprise" : "en faveur du salariat"}, selon les hypothèses affichées.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-background/20 pt-5">
        <SupportingMetric icon={Coins} label="Valeur annuelle" micro={eur.format(results.micro.economicValue)} salary={eur.format(results.salary.economicValue)} />
        <SupportingMetric icon={CalendarDays} label="Jours travaillés" micro={`${Math.round(results.micro.workedDays)} j`} salary={`${Math.round(results.salary.workedDays)} j`} />
        <SupportingMetric icon={Scale} label="Valeur / jour" micro={eur.format(results.micro.valuePerDay)} salary={eur.format(results.salary.valuePerDay)} className="col-span-2" />
      </div>
    </section>
  );
}

function ScenarioValue({ tone, label, value, unit }: { tone: ScenarioTone; label: string; value: string; unit: string }) {
  return (
    <div className={cn("border-l-4 pl-3", tone === "micro" ? "border-micro-muted" : "border-salary-muted")}>
      <p className="text-sm font-semibold text-background/70">{label}</p>
      <p className="mt-1 break-words text-3xl font-bold tabular-nums text-background">{value}</p>
      <p className="text-xs text-background/70">{unit}</p>
    </div>
  );
}

function SupportingMetric({ icon: Icon, label, micro, salary, className }: { icon: typeof Euro; label: string; micro: string; salary: string; className?: string }) {
  return (
    <div className={className}>
      <p className="flex items-center gap-2 text-xs font-semibold text-background/70"><Icon className="size-4" aria-hidden="true" />{label}</p>
      <p className="mt-2 text-sm"><span className="font-bold text-background">Micro {micro}</span><br /><span className="text-background/75">Salariat {salary}</span></p>
    </div>
  );
}

function ScenarioPanel({ tone, title, icon: Icon, children, className }: { tone: ScenarioTone; title: string; icon: typeof Euro; children: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0 py-5 md:py-0", tone === "micro" ? "border-t-4 border-micro lg:border-t-0 lg:border-l-4 lg:pl-5" : "border-t-4 border-salary lg:border-t-0 lg:border-l-4 lg:pl-5", className)}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-sm", tone === "micro" ? "bg-micro-soft text-micro" : "bg-salary-soft text-salary")}><Icon aria-hidden="true" /></span>
        <div className="min-w-0"><p className="text-xs font-bold uppercase text-muted-foreground">Hypothèses essentielles</p><h2 className="truncate text-xl font-bold">{title}</h2></div>
      </div>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

function MicroPanel({ state, update, className }: { state: ScenarioState; update: Update; className?: string }) {
  const billedDays = Math.max(0, Math.round((52 - state.micro.weeksOff) * state.micro.daysPerWeek - state.micro.adminDays));
  const projectedRevenue = state.micro.entryMode === "tjm" ? billedDays * state.micro.dailyRate : state.micro.annualRevenue;
  return (
    <ScenarioPanel tone="micro" title="Micro-entreprise" icon={BriefcaseBusiness} className={className}>
      {state.micro.entryMode === "tjm" ? <NumberField label="TJM hors taxes" suffix="€ / jour" value={state.micro.dailyRate} onChange={(value) => update("micro", "dailyRate", value)} /> : <NumberField label="Chiffre d’affaires annuel HT" suffix="€ / an" value={state.micro.annualRevenue} onChange={(value) => update("micro", "annualRevenue", value)} />}
      <NumberField label="Rythme facturable" suffix="jours / semaine" value={state.micro.daysPerWeek} step={0.5} onChange={(value) => update("micro", "daysPerWeek", value)} />
      <NumberField label="Semaines sans activité" suffix="semaines" value={state.micro.weeksOff} onChange={(value) => update("micro", "weeksOff", value)} />
      <p className="border-l-2 border-micro-muted pl-3 text-sm text-muted-foreground"><strong className="text-foreground">{eur.format(projectedRevenue)}</strong> de CA estimé · {billedDays} jours facturés</p>
      <Accordion type="single" collapsible>
        <AccordionItem value="micro-more"><AccordionTrigger>Paramètres secondaires</AccordionTrigger><AccordionContent><div className="grid gap-4 pt-2">
          <NumberField label="Jours non facturés" suffix="jours / an" value={state.micro.adminDays} onChange={(value) => update("micro", "adminDays", value)} />
          <NumberField label="Dépenses payées" suffix="€ / an" value={state.micro.expenses} onChange={(value) => update("micro", "expenses", value)} />
          <Field label="Méthode de saisie"><Select value={state.micro.entryMode} onValueChange={(value) => update("micro", "entryMode", value as EntryMode)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tjm">TJM × jours facturés</SelectItem><SelectItem value="revenue">CA annuel direct</SelectItem></SelectContent></Select></Field>
          <Field label="Type d’activité"><Select value={state.micro.activityType} onValueChange={(value) => update("micro", "activityType", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Activité libérale BNC">Activité libérale BNC</SelectItem><SelectItem value="Prestation de services BIC">Prestation de services BIC</SelectItem><SelectItem value="Vente de marchandises">Vente de marchandises</SelectItem></SelectContent></Select></Field>
          <Field label="Option fiscale"><Select value={state.micro.taxOption} onValueChange={(value) => update("micro", "taxOption", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Versement libératoire non retenu">Versement libératoire non retenu</SelectItem><SelectItem value="Versement libératoire simulé">Versement libératoire simulé</SelectItem><SelectItem value="Régime simplifié estimé">Régime simplifié estimé</SelectItem></SelectContent></Select></Field>
        </div></AccordionContent></AccordionItem>
      </Accordion>
    </ScenarioPanel>
  );
}

function SalaryPanel({ state, update, className }: { state: ScenarioState; update: Update; className?: string }) {
  const effectiveGross = state.salary.grossFullTime * (state.salary.workTimePercent / 100);
  return (
    <ScenarioPanel tone="salary" title="Salariat" icon={WalletCards} className={className}>
      <NumberField label="Brut annuel équivalent temps plein" suffix="€ / an ETP" value={state.salary.grossFullTime} help="Référence à 100 %, distincte du salaire versé." onChange={(value) => update("salary", "grossFullTime", value)} />
      <NumberField label="Temps de travail" suffix="%" value={state.salary.workTimePercent} onChange={(value) => update("salary", "workTimePercent", value)} />
      <NumberField label="Participation" suffix="€ / an" value={state.salary.participation} onChange={(value) => update("salary", "participation", value)} />
      <p className="border-l-2 border-salary-muted pl-3 text-sm text-muted-foreground"><strong className="text-foreground">{eur.format(effectiveGross)}</strong> brut réellement versé avant primes</p>
      <Accordion type="single" collapsible>
        <AccordionItem value="salary-more"><AccordionTrigger>Paramètres secondaires</AccordionTrigger><AccordionContent><div className="grid gap-4 pt-2">
          <NumberField label="Primes" suffix="€ / an" value={state.salary.bonuses} onChange={(value) => update("salary", "bonuses", value)} />
          <NumberField label="Congés payés" suffix="semaines" value={state.salary.paidLeaveWeeks} onChange={(value) => update("salary", "paidLeaveWeeks", value)} />
          <NumberField label="RTT" suffix="jours / an" value={state.salary.rttDays} onChange={(value) => update("salary", "rttDays", value)} />
          <NumberField label="Jours offerts" suffix="jours / an" value={state.salary.extraDaysOff} onChange={(value) => update("salary", "extraDaysOff", value)} />
          <NumberField label="Tickets-restaurant" suffix="tickets / an" value={state.salary.mealTicketCount} onChange={(value) => update("salary", "mealTicketCount", value)} />
          <NumberField label="Valeur d’un ticket" suffix="€" value={state.salary.mealTicketValue} onChange={(value) => update("salary", "mealTicketValue", value)} />
          <NumberField label="Part employeur" suffix="%" value={state.salary.mealEmployerShare} help="Part de la valeur du ticket prise en charge." onChange={(value) => update("salary", "mealEmployerShare", value)} />
          <NumberField label="Autres avantages" suffix="€ / an" value={state.salary.otherBenefits} onChange={(value) => update("salary", "otherBenefits", value)} />
        </div></AccordionContent></AccordionItem>
      </Accordion>
    </ScenarioPanel>
  );
}

function EquivalentsPanel({ equivalents }: { equivalents: ReturnType<typeof calculateEquivalents> }) {
  const rows = [
    ["Même argent disponible", equivalents.sameNet, "Ce qui reste après cotisations, dépenses et impôt."],
    ["Même valeur économique annuelle", equivalents.sameEconomic, "Le net et les avantages identifiés, hors protection sociale."],
    ["Même valeur par jour travaillé", equivalents.samePerDay, "Le montant rapporté au nombre de jours réellement travaillés."],
  ] as const;
  return (
    <section aria-labelledby="equivalents-title" className="py-9 sm:py-12">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-10">
        <div><p className="text-sm font-semibold text-muted-foreground">Le point de bascule</p><h2 id="equivalents-title" className="mt-1 font-display text-3xl font-bold text-balance sm:text-4xl">Trois salaires équivalents, trois décisions différentes.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Montants bruts annuels équivalent temps plein. Aucun ne constitue une réponse universelle.</p></div>
        <ol className="divide-y divide-border border-y border-border">
          {rows.map(([label, value, help], index) => <li key={label} className="grid gap-2 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4"><span className="text-sm font-bold text-muted-foreground">0{index + 1}</span><div><h3 className="font-bold">{label}</h3><p className="mt-1 text-sm text-muted-foreground">{help}</p></div><p className="break-words text-2xl font-bold tabular-nums sm:text-right">{eur.format(value)}<span className="block text-xs font-medium text-muted-foreground">brut ETP / an</span></p></li>)}
        </ol>
      </div>
    </section>
  );
}

function BreakdownPanel({ title, tone, result, lines }: { title: string; tone: ScenarioTone; result: Result; lines: [string, number][] }) {
  return (
    <article className={cn("border-t-4 pt-5", tone === "micro" ? "border-micro" : "border-salary")}>
      <h3 className="flex items-center gap-2 text-xl font-bold">{tone === "micro" ? <BriefcaseBusiness className="size-5 text-micro" aria-hidden="true" /> : <WalletCards className="size-5 text-salary" aria-hidden="true" />}{title}</h3>
      <dl className="mt-5 divide-y divide-border">
        {lines.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3 text-sm"><dt className="min-w-0 text-muted-foreground">{label}{label.includes("estim") ? <span className="ml-2 text-xs font-semibold text-attention-foreground">estimé</span> : null}</dt><dd className="font-bold tabular-nums">{eur.format(value)}</dd></div>)}
      </dl>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 border-t-2 border-foreground pt-4"><p className="font-semibold">Valeur économique retenue</p><p className="text-2xl font-bold tabular-nums">{eur.format(result.economicValue)}</p></div>
    </article>
  );
}

function ProtectionContent() {
  return <div className="grid gap-5 py-3 md:grid-cols-2"><div className="border-l-4 border-micro pl-4"><h3 className="font-bold">Micro-entreprise</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Plus d’autonomie, mais droits et continuité de revenu à vérifier selon la situation.</p></div><div className="border-l-4 border-salary pl-4"><h3 className="font-bold">Salariat</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Protection plus structurée, congés intégrés et avantages dépendants de l’employeur.</p></div><p className="md:col-span-2 text-sm leading-6 text-muted-foreground">Assurance chômage, arrêts maladie, retraite, prévoyance et mutuelle restent séparés du revenu : aucune valeur monétaire arbitraire ne leur est attribuée.</p></div>;
}

function CommonSettings({ state, update, results }: { state: ScenarioState; update: Update; results: { micro: Result; salary: Result } }) {
  return <div className="grid gap-6 py-3 md:grid-cols-2"><div className="grid gap-4"><NumberField label="Année de référence" value={state.common.year} onChange={(value) => update("common", "year", value)} /><Field label="Situation fiscale simplifiée"><Select value={state.common.taxSituation} onValueChange={(value) => update("common", "taxSituation", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Célibataire, sans enfant">Célibataire, sans enfant</SelectItem><SelectItem value="Couple, imposition commune">Couple, imposition commune</SelectItem><SelectItem value="Parent isolé">Parent isolé</SelectItem></SelectContent></Select></Field><NumberField label="Nombre de parts" value={state.common.taxParts} step={0.5} onChange={(value) => update("common", "taxParts", value)} /><NumberField label="Taux d’imposition personnalisé" suffix="%" value={state.common.customTaxRate} help="Taux fictif appliqué aux deux scénarios." onChange={(value) => update("common", "customTaxRate", value)} /></div><div><fieldset><legend className="font-semibold">Affichage des montants</legend><div className="mt-3 grid grid-cols-2 gap-2"><ChoiceButton active={state.common.displayMode === "annual"} onClick={() => update("common", "displayMode", "annual")}>Annuel</ChoiceButton><ChoiceButton active={state.common.displayMode === "monthly"} onClick={() => update("common", "displayMode", "monthly")}>Mensuel</ChoiceButton></div></fieldset><div className="mt-6 border-l-4 border-attention pl-4 text-sm leading-6 text-muted-foreground"><p className="font-bold text-foreground">Méthode simplifiée</p><p className="mt-1">Cotisations, impôt, abattements et avantages sont simulés localement avec des coefficients fictifs. Micro : {Math.round(results.micro.workedDays)} jours travaillés. Salariat : {Math.round(results.salary.workedDays)} jours travaillés.</p></div></div></div>;
}

function MobileSummary({ results, displayFactor, periodLabel }: { results: { micro: Result; salary: Result }; displayFactor: number; periodLabel: string }) {
  const gap = results.micro.netAvailable - results.salary.netAvailable;
  const dayGap = results.micro.workedDays - results.salary.workedDays;
  return <aside aria-label="Synthèse persistante" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-panel px-4 py-3 shadow-soft sm:hidden"><div className="mx-auto grid max-w-md grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{gap >= 0 ? "Micro" : "Salariat"} +{eur.format(Math.abs(gap) / displayFactor)} {periodLabel}</p><p className="truncate text-xs text-muted-foreground">Micro {dayGap >= 0 ? "+" : "−"}{Math.abs(Math.round(dayGap))} jours vs salariat</p></div><a href="#equivalents-title" className="shrink-0 text-sm font-bold text-primary underline underline-offset-4">Équivalences</a></div></aside>;
}

function Field({ label, help, children, htmlFor }: { label: string; help?: string; children: ReactNode; htmlFor?: string }) {
  return <div className="grid min-w-0 gap-2"><Label htmlFor={htmlFor} className="text-sm font-semibold">{label}</Label>{children}{help ? <p className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 text-xs leading-5 text-muted-foreground"><CircleHelp className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /><span>{help}</span></p> : null}</div>;
}

function NumberField({ label, help, value, onChange, suffix, step = 1 }: { label: string; help?: string; value: number; onChange: (value: number) => void; suffix?: string; step?: number }) {
  const inputId = useId();
  return <Field label={label} help={help} htmlFor={inputId}><div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-input bg-panel px-2 focus-within:shadow-focus"><Input id={inputId} className="h-11 min-w-0 border-0 px-0 text-base font-semibold shadow-none focus-visible:ring-0" type="number" step={step} value={Number.isFinite(value) ? value : 0} onChange={(event) => onChange(Number(event.target.value))} />{suffix ? <span className="max-w-28 shrink-0 text-right text-xs font-medium text-muted-foreground">{suffix}</span> : null}</div></Field>;
}

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <Button type="button" variant={active ? "default" : "calm"} className="h-11" aria-pressed={active} onClick={onClick}>{children}</Button>;
}

function calculateResults(state: ScenarioState) {
  const microBilledDays = Math.max(0, Math.round((52 - state.micro.weeksOff) * state.micro.daysPerWeek - state.micro.adminDays));
  const microGross = state.micro.entryMode === "tjm" ? microBilledDays * state.micro.dailyRate : state.micro.annualRevenue;
  const microContributions = microGross * 0.22;
  const microTaxable = Math.max(0, microGross * 0.66 - state.micro.expenses);
  const microTax = microTaxable * (state.common.customTaxRate / 100);
  const microNet = Math.max(0, microGross - microContributions - state.micro.expenses - microTax);
  const microWorkedDays = microBilledDays + state.micro.adminDays;
  const micro: Result = {
    gross: microGross,
    contributions: microContributions,
    expenses: state.micro.expenses,
    tax: microTax,
    benefits: 0,
    netAvailable: microNet,
    economicValue: microNet,
    workedDays: microWorkedDays,
    valuePerDay: microWorkedDays > 0 ? microNet / microWorkedDays : 0,
  };

  const salaryGross = state.salary.grossFullTime * (state.salary.workTimePercent / 100) + state.salary.bonuses;
  const salaryContributions = salaryGross * 0.23;
  const salaryTax = Math.max(0, (salaryGross - salaryContributions) * (state.common.customTaxRate / 100));
  const mealBenefit = state.salary.mealTicketCount * state.salary.mealTicketValue * (state.salary.mealEmployerShare / 100);
  const benefits = state.salary.participation + mealBenefit + state.salary.otherBenefits;
  const salaryNet = salaryGross - salaryContributions - salaryTax;
  const theoreticalWorkDays = 260 * (state.salary.workTimePercent / 100);
  const daysOff = state.salary.paidLeaveWeeks * 5 * (state.salary.workTimePercent / 100) + state.salary.rttDays + state.salary.extraDaysOff;
  const salaryWorkedDays = Math.max(1, Math.round(theoreticalWorkDays - daysOff));
  const salary: Result = {
    gross: salaryGross,
    contributions: salaryContributions,
    expenses: 0,
    tax: salaryTax,
    benefits,
    netAvailable: salaryNet,
    economicValue: salaryNet + benefits,
    workedDays: salaryWorkedDays,
    valuePerDay: (salaryNet + benefits) / salaryWorkedDays,
  };

  return {
    micro,
    salary,
    equivalents: calculateEquivalents(micro, salary, state),
  };
}

function calculateEquivalents(micro: Result, salary: Result, state: ScenarioState) {
  const salaryNetRatio = salary.netAvailable / Math.max(1, salary.gross);
  const salaryEconomicRatio = salary.economicValue / Math.max(1, salary.gross);
  const prorata = state.salary.workTimePercent / 100;
  const fullTimeMultiplier = prorata > 0 ? 1 / prorata : 1;
  return {
    sameNet: (micro.netAvailable / Math.max(0.45, salaryNetRatio)) * fullTimeMultiplier,
    sameEconomic: (micro.economicValue / Math.max(0.5, salaryEconomicRatio)) * fullTimeMultiplier,
    samePerDay: (micro.valuePerDay * salary.workedDays) / Math.max(0.5, salaryEconomicRatio) * fullTimeMultiplier,
  };
}