import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Coins,
  Edit3,
  Euro,
  Landmark,
  LineChart,
  Scale,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type DisplayMode = "annual" | "monthly";
type EntryMode = "tjm" | "revenue";

type ScenarioState = {
  common: {
    year: number;
    taxSituation: string;
    taxParts: number;
    customTaxRate: number;
    displayMode: DisplayMode;
  };
  micro: {
    activityType: string;
    entryMode: EntryMode;
    annualRevenue: number;
    dailyRate: number;
    daysPerWeek: number;
    weeksOff: number;
    adminDays: number;
    expenses: number;
    taxOption: string;
  };
  salary: {
    grossFullTime: number;
    workTimePercent: number;
    bonuses: number;
    participation: number;
    mealTicketCount: number;
    mealTicketValue: number;
    mealEmployerShare: number;
    otherBenefits: number;
    paidLeaveWeeks: number;
    rttDays: number;
    extraDaysOff: number;
  };
};

type Result = {
  netAvailable: number;
  economicValue: number;
  workedDays: number;
  valuePerDay: number;
  gross: number;
  contributions: number;
  expenses: number;
  tax: number;
  benefits: number;
};

const defaultState: ScenarioState = {
  common: {
    year: 2026,
    taxSituation: "Célibataire, sans enfant",
    taxParts: 1,
    customTaxRate: 8,
    displayMode: "annual",
  },
  micro: {
    activityType: "Activité libérale BNC",
    entryMode: "tjm",
    annualRevenue: 0,
    dailyRate: 600,
    daysPerWeek: 4,
    weeksOff: 5,
    adminDays: 18,
    expenses: 7200,
    taxOption: "Versement libératoire non retenu",
  },
  salary: {
    grossFullTime: 70000,
    workTimePercent: 80,
    bonuses: 3500,
    participation: 2200,
    mealTicketCount: 188,
    mealTicketValue: 10,
    mealEmployerShare: 60,
    otherBenefits: 1200,
    paidLeaveWeeks: 5,
    rttDays: 5,
    extraDaysOff: 2,
  },
};

const steps = [
  { title: "Profil", detail: "Cadre commun", icon: Landmark },
  { title: "Micro", detail: "Activité indépendante", icon: BriefcaseBusiness },
  { title: "Salariat", detail: "Proposition salariée", icon: WalletCards },
  { title: "Résultats", detail: "Comparaison", icon: LineChart },
];

const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const pct = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prototype comparateur micro-entreprise et salariat" },
      {
        name: "description",
        content:
          "Prototype UX français pour comparer une activité en micro-entreprise avec une situation salariée à partir de données fictives.",
      },
      { property: "og:title", content: "Prototype comparateur micro-entreprise et salariat" },
      {
        property: "og:description",
        content:
          "Parcours guidé et tableau comparatif local pour tester la compréhension des revenus, jours travaillés et salaires équivalents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [state, setState] = useState<ScenarioState>(defaultState);
  const [step, setStep] = useState(0);
  const [view, setView] = useState<"wizard" | "dashboard">("wizard");
  const [mobileScenario, setMobileScenario] = useState<"micro" | "salary">("micro");

  const results = useMemo(() => calculateResults(state), [state]);
  const displayFactor = state.common.displayMode === "monthly" ? 12 : 1;
  const periodLabel = state.common.displayMode === "monthly" ? "par mois" : "par an";

  const update = <Group extends keyof ScenarioState, Field extends keyof ScenarioState[Group]>(
    group: Group,
    field: Field,
    value: ScenarioState[Group][Field],
  ) => {
    setState((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  };

  const goDashboard = () => {
    setView("dashboard");
    setStep(3);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg bg-panel px-4 py-3 shadow-soft sm:flex sm:flex-wrap sm:justify-between sm:px-5">
          <div className="min-w-0">
            <p className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              <Sparkles className="size-4 shrink-0 text-primary" aria-hidden="true" />
              Prototype UX — données fictives
            </p>
            <h1 className="mt-1 truncate font-display text-xl font-bold tracking-normal text-foreground sm:text-2xl">
              Comparaison micro-entreprise / salariat
            </h1>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant={view === "wizard" ? "default" : "calm"} size="sm" onClick={() => setView("wizard")}>
              Assistant
            </Button>
            <Button variant={view === "dashboard" ? "default" : "calm"} size="sm" onClick={goDashboard}>
              Tableau
            </Button>
          </div>
        </header>

        <div className="rounded-lg bg-attention-soft px-4 py-3 text-sm text-attention-foreground">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p>
              Simulation volontairement simplifiée : les montants servent à tester l’interface, pas à produire un calcul fiscal exact.
            </p>
          </div>
        </div>

        {view === "wizard" ? (
          <WizardView
            state={state}
            update={update}
            step={step}
            setStep={setStep}
            results={results}
            onComplete={goDashboard}
            displayFactor={displayFactor}
            periodLabel={periodLabel}
          />
        ) : (
          <DashboardView
            state={state}
            update={update}
            results={results}
            displayFactor={displayFactor}
            periodLabel={periodLabel}
            mobileScenario={mobileScenario}
            setMobileScenario={setMobileScenario}
          />
        )}
      </section>
    </main>
  );
}

function WizardView({
  state,
  update,
  step,
  setStep,
  results,
  onComplete,
  displayFactor,
  periodLabel,
}: {
  state: ScenarioState;
  update: <Group extends keyof ScenarioState, Field extends keyof ScenarioState[Group]>(
    group: Group,
    field: Field,
    value: ScenarioState[Group][Field],
  ) => void;
  step: number;
  setStep: (step: number) => void;
  results: { micro: Result; salary: Result; equivalents: ReturnType<typeof calculateEquivalents> };
  onComplete: () => void;
  displayFactor: number;
  periodLabel: string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-lg bg-panel p-4 shadow-soft lg:sticky lg:top-8 lg:self-start">
        <p className="text-sm font-semibold text-muted-foreground">Première simulation guidée</p>
        <div className="mt-4 grid gap-2">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const active = index === step;
            const done = index < step;
            return (
              <button
                key={item.title}
                className={cn(
                  "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-md px-3 py-3 text-left transition-colors",
                  active ? "bg-primary text-primary-foreground" : "bg-surface text-foreground hover:bg-surface-strong",
                )}
                onClick={() => setStep(index)}
                type="button"
              >
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-md", done ? "bg-micro text-micro-foreground" : "bg-panel text-foreground")}>
                  {done ? <Check className="size-4" aria-hidden="true" /> : <Icon className="size-4" aria-hidden="true" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{item.title}</span>
                  <span className={cn("block truncate text-xs", active ? "text-primary-foreground" : "text-muted-foreground")}>{item.detail}</span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="rounded-lg bg-panel p-4 shadow-soft sm:p-6 lg:p-8">
        {step === 0 && <CommonStep state={state} update={update} />}
        {step === 1 && <MicroStep state={state} update={update} />}
        {step === 2 && <SalaryStep state={state} update={update} />}
        {step === 3 && <ResultsStep results={results} displayFactor={displayFactor} periodLabel={periodLabel} />}

        <div className="mt-8 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-5">
          <Button variant="calm" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ArrowLeft aria-hidden="true" />
            Retour
          </Button>
          <p className="min-w-0 text-center text-sm text-muted-foreground">Étape {step + 1} sur 4</p>
          {step < 3 ? (
            <Button onClick={() => setStep(Math.min(3, step + 1))}>
              Continuer
              <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <Button variant="micro" onClick={onComplete}>
              Modifier les hypothèses
              <Edit3 aria-hidden="true" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

function CommonStep({
  state,
  update,
}: {
  state: ScenarioState;
  update: <Group extends keyof ScenarioState, Field extends keyof ScenarioState[Group]>(
    group: Group,
    field: Field,
    value: ScenarioState[Group][Field],
  ) => void;
}) {
  return (
    <StepFrame
      eyebrow="Étape 1"
      title="Situation générale et fiscale"
      text="Ces informations servent de cadre commun aux deux scénarios, afin que la comparaison porte sur les mêmes règles d’affichage."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <NumberField label="Année de référence" help="L’année affichée contextualise les hypothèses du prototype." value={state.common.year} onChange={(value) => update("common", "year", value)} />
        <Field label="Situation fiscale simplifiée" help="Elle aide à lire les résultats sans détailler tout le foyer fiscal.">
          <Select value={state.common.taxSituation} onValueChange={(value) => update("common", "taxSituation", value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Célibataire, sans enfant">Célibataire, sans enfant</SelectItem>
              <SelectItem value="Couple, imposition commune">Couple, imposition commune</SelectItem>
              <SelectItem value="Parent isolé">Parent isolé</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <NumberField label="Nombre de parts" help="Valeur simplifiée pour comparer les deux cas avec le même foyer." value={state.common.taxParts} step={0.5} onChange={(value) => update("common", "taxParts", value)} />
        <NumberField label="Taux d’imposition personnalisé" suffix="%" help="Taux fictif appliqué aux deux scénarios dans ce prototype." value={state.common.customTaxRate} onChange={(value) => update("common", "customTaxRate", value)} />
      </div>
      <div className="mt-6 rounded-lg bg-surface p-4">
        <Label className="text-base">Préférence d’affichage</Label>
        <p className="mt-1 text-sm text-muted-foreground">Les montants restent calculés annuellement, puis affichés selon ce choix.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ChoiceButton active={state.common.displayMode === "annual"} onClick={() => update("common", "displayMode", "annual")}>Annuel</ChoiceButton>
          <ChoiceButton active={state.common.displayMode === "monthly"} onClick={() => update("common", "displayMode", "monthly")}>Mensuel indicatif</ChoiceButton>
        </div>
      </div>
    </StepFrame>
  );
}

function MicroStep({
  state,
  update,
}: {
  state: ScenarioState;
  update: <Group extends keyof ScenarioState, Field extends keyof ScenarioState[Group]>(
    group: Group,
    field: Field,
    value: ScenarioState[Group][Field],
  ) => void;
}) {
  const billedDays = Math.max(0, Math.round((52 - state.micro.weeksOff) * state.micro.daysPerWeek - state.micro.adminDays));
  const projectedRevenue = state.micro.entryMode === "tjm" ? billedDays * state.micro.dailyRate : state.micro.annualRevenue;

  return (
    <StepFrame
      eyebrow="Étape 2"
      title="Activité en micro-entreprise"
      text="On distingue le chiffre d’affaires encaissé, le temps réellement travaillé et les dépenses payées par l’activité."
      tone="micro"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Type d’activité" help="Le prototype utilise une activité libérale BNC fictive.">
          <Select value={state.micro.activityType} onValueChange={(value) => update("micro", "activityType", value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Activité libérale BNC">Activité libérale BNC</SelectItem>
              <SelectItem value="Prestation de services BIC">Prestation de services BIC</SelectItem>
              <SelectItem value="Vente de marchandises">Vente de marchandises</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Méthode de saisie du chiffre d’affaires" help="Le CA peut être saisi directement ou estimé depuis un TJM.">
          <Select value={state.micro.entryMode} onValueChange={(value: EntryMode) => update("micro", "entryMode", value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tjm">Calcul depuis TJM × jours facturés</SelectItem>
              <SelectItem value="revenue">Chiffre d’affaires annuel direct</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {state.micro.entryMode === "tjm" ? (
          <>
            <NumberField label="TJM hors taxes" suffix="€ / jour" help="Montant facturé pour une journée client." value={state.micro.dailyRate} onChange={(value) => update("micro", "dailyRate", value)} />
            <NumberField label="Rythme facturable" suffix="jours / semaine" help="Rythme moyen, avant congés et jours non facturés." value={state.micro.daysPerWeek} step={0.5} onChange={(value) => update("micro", "daysPerWeek", value)} />
            <ReadOnlyMetric label="CA annuel estimé" value={eur.format(projectedRevenue)} help={`${billedDays} jours facturés simulés`} />
          </>
        ) : (
          <NumberField label="Chiffre d’affaires annuel HT" suffix="€ / an" help="Montant total encaissé avant cotisations et dépenses." value={state.micro.annualRevenue} onChange={(value) => update("micro", "annualRevenue", value)} />
        )}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <NumberField label="Semaines sans activité" suffix="semaines" help="Congés, pauses ou périodes sans mission." value={state.micro.weeksOff} onChange={(value) => update("micro", "weeksOff", value)} />
        <NumberField label="Jours non facturés" suffix="jours / an" help="Administratif, prospection, formation ou rendez-vous non payés." value={state.micro.adminDays} onChange={(value) => update("micro", "adminDays", value)} />
        <NumberField label="Dépenses payées" suffix="€ / an" help="Outils, assurances, comptabilité ou frais réellement supportés." value={state.micro.expenses} onChange={(value) => update("micro", "expenses", value)} />
      </div>

      <Accordion type="single" collapsible className="mt-6">
        <AccordionItem value="micro-options">
          <AccordionTrigger>Options fiscales principales</AccordionTrigger>
          <AccordionContent>
            <Field label="Option retenue" help="Option fictive, affichée pour évaluer la compréhension du parcours.">
              <Select value={state.micro.taxOption} onValueChange={(value) => update("micro", "taxOption", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Versement libératoire non retenu">Versement libératoire non retenu</SelectItem>
                  <SelectItem value="Versement libératoire simulé">Versement libératoire simulé</SelectItem>
                  <SelectItem value="Régime simplifié estimé">Régime simplifié estimé</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </StepFrame>
  );
}

function SalaryStep({
  state,
  update,
}: {
  state: ScenarioState;
  update: <Group extends keyof ScenarioState, Field extends keyof ScenarioState[Group]>(
    group: Group,
    field: Field,
    value: ScenarioState[Group][Field],
  ) => void;
}) {
  const effectiveGross = state.salary.grossFullTime * (state.salary.workTimePercent / 100);

  return (
    <StepFrame
      eyebrow="Étape 3"
      title="Situation ou proposition salariée"
      text="Le salaire équivalent temps plein est séparé du salaire réellement versé, surtout lorsque le temps de travail n’est pas de 100 %."
      tone="salary"
    >
      <div className="rounded-lg bg-salary-soft p-4 text-salary">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Salaire réellement versé estimé</p>
            <p className="text-sm text-foreground">Calculé à partir du brut annuel équivalent temps plein et du pourcentage travaillé.</p>
          </div>
          <strong className="text-2xl font-bold text-salary">{eur.format(effectiveGross)} brut / an</strong>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <NumberField label="Salaire brut annuel équivalent temps plein" suffix="€ / an ETP" help="Montant comparable à un poste à 100 %, pas forcément versé tel quel." value={state.salary.grossFullTime} onChange={(value) => update("salary", "grossFullTime", value)} />
        <NumberField label="Temps de travail" suffix="%" help="À 80 %, le salaire réellement versé est proratisé." value={state.salary.workTimePercent} onChange={(value) => update("salary", "workTimePercent", value)} />
        <NumberField label="Primes" suffix="€ / an" help="Primes variables ou fixes ajoutées au brut simulé." value={state.salary.bonuses} onChange={(value) => update("salary", "bonuses", value)} />
        <NumberField label="Participation et intéressement" suffix="€ / an" help="Avantage économique annuel distinct du salaire mensuel." value={state.salary.participation} onChange={(value) => update("salary", "participation", value)} />
      </div>

      <Accordion type="multiple" className="mt-6">
        <AccordionItem value="meal">
          <AccordionTrigger>Tickets-restaurant</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-5 md:grid-cols-3">
              <NumberField label="Nombre annuel" suffix="tickets" help="Nombre fictif de jours avec ticket." value={state.salary.mealTicketCount} onChange={(value) => update("salary", "mealTicketCount", value)} />
              <NumberField label="Valeur faciale" suffix="€" help="Valeur totale d’un ticket." value={state.salary.mealTicketValue} onChange={(value) => update("salary", "mealTicketValue", value)} />
              <NumberField label="Part employeur" suffix="%" help="Part prise en charge par l’employeur." value={state.salary.mealEmployerShare} onChange={(value) => update("salary", "mealEmployerShare", value)} />
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="time">
          <AccordionTrigger>Congés, RTT et autres avantages</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-5 md:grid-cols-4">
              <NumberField label="Congés payés" suffix="semaines" help="Temps non travaillé inclus dans le contrat." value={state.salary.paidLeaveWeeks} onChange={(value) => update("salary", "paidLeaveWeeks", value)} />
              <NumberField label="RTT" suffix="jours" help="Jours de repos supplémentaires simulés." value={state.salary.rttDays} onChange={(value) => update("salary", "rttDays", value)} />
              <NumberField label="Jours offerts" suffix="jours" help="Ponts, fermeture ou jours exceptionnels." value={state.salary.extraDaysOff} onChange={(value) => update("salary", "extraDaysOff", value)} />
              <NumberField label="Autres avantages" suffix="€ / an" help="Mutuelle, transport ou avantages divers estimés." value={state.salary.otherBenefits} onChange={(value) => update("salary", "otherBenefits", value)} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </StepFrame>
  );
}

function ResultsStep({
  results,
  displayFactor,
  periodLabel,
}: {
  results: { micro: Result; salary: Result; equivalents: ReturnType<typeof calculateEquivalents> };
  displayFactor: number;
  periodLabel: string;
}) {
  return (
    <StepFrame
      eyebrow="Étape 4"
      title="Résultats de la comparaison"
      text="Les quatre indicateurs sont séparés pour éviter de réduire la décision à un seul net mensuel."
    >
      <ComparisonHighlights results={results} displayFactor={displayFactor} periodLabel={periodLabel} />
      <EquivalentsPanel equivalents={results.equivalents} />
    </StepFrame>
  );
}

function DashboardView({
  state,
  update,
  results,
  displayFactor,
  periodLabel,
  mobileScenario,
  setMobileScenario,
}: {
  state: ScenarioState;
  update: <Group extends keyof ScenarioState, Field extends keyof ScenarioState[Group]>(
    group: Group,
    field: Field,
    value: ScenarioState[Group][Field],
  ) => void;
  results: { micro: Result; salary: Result; equivalents: ReturnType<typeof calculateEquivalents> };
  displayFactor: number;
  periodLabel: string;
  mobileScenario: "micro" | "salary";
  setMobileScenario: (value: "micro" | "salary") => void;
}) {
  return (
    <div className="grid gap-6">
      <section className="rounded-lg bg-panel p-4 shadow-soft sm:p-6 lg:p-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Tableau de bord modifiable</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-normal sm:text-4xl">Comparer sans recommencer le parcours</h2>
            <p className="mt-3 max-w-3xl text-base text-muted-foreground">
              Les hypothèses restent fictives et locales. Modifiez quelques valeurs pour voir comment la compréhension des écarts évolue.
            </p>
          </div>
          <div className="rounded-lg bg-surface px-4 py-3 text-sm text-muted-foreground">
            Affichage : <strong className="text-foreground">{state.common.displayMode === "monthly" ? "mensuel" : "annuel"}</strong>
          </div>
        </div>
      </section>

      <ComparisonHighlights results={results} displayFactor={displayFactor} periodLabel={periodLabel} />
      <UsefulChart results={results} />

      <section className="rounded-lg bg-panel p-4 shadow-soft sm:p-6 lg:p-8">
        <div className="mb-5 grid gap-3 md:hidden">
          <p className="text-sm font-semibold text-muted-foreground">Hypothèses à modifier</p>
          <Tabs value={mobileScenario} onValueChange={(value) => setMobileScenario(value as "micro" | "salary")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="micro">Micro</TabsTrigger>
              <TabsTrigger value="salary">Salariat</TabsTrigger>
            </TabsList>
            <TabsContent value="micro"><MicroDashboardFields state={state} update={update} /></TabsContent>
            <TabsContent value="salary"><SalaryDashboardFields state={state} update={update} /></TabsContent>
          </Tabs>
        </div>
        <div className="hidden gap-6 md:grid md:grid-cols-2">
          <MicroDashboardFields state={state} update={update} />
          <SalaryDashboardFields state={state} update={update} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <BreakdownPanel title="Décomposition micro-entreprise" tone="micro" result={results.micro} lines={[
          ["Chiffre d’affaires HT", results.micro.gross],
          ["Cotisations estimées", -results.micro.contributions],
          ["Dépenses professionnelles", -results.micro.expenses],
          ["Impôt estimé", -results.micro.tax],
        ]} />
        <BreakdownPanel title="Décomposition salariat" tone="salary" result={results.salary} lines={[
          ["Brut réellement versé", results.salary.gross],
          ["Cotisations salariales estimées", -results.salary.contributions],
          ["Impôt estimé", -results.salary.tax],
          ["Avantages économiques", results.salary.benefits],
        ]} />
      </section>

      <EquivalentsPanel equivalents={results.equivalents} />
      <ProtectionPanel />
      <AssumptionsPanel state={state} results={results} />
    </div>
  );
}

function ComparisonHighlights({
  results,
  displayFactor,
  periodLabel,
}: {
  results: { micro: Result; salary: Result; equivalents: ReturnType<typeof calculateEquivalents> };
  displayFactor: number;
  periodLabel: string;
}) {
  const items = [
    { label: "Net disponible après impôt", key: "netAvailable", icon: Euro, unit: periodLabel },
    { label: "Valeur économique", key: "economicValue", icon: Coins, unit: periodLabel },
    { label: "Jours réellement travaillés", key: "workedDays", icon: CalendarDays, unit: "par an", raw: true },
    { label: "Valeur par jour travaillé", key: "valuePerDay", icon: Scale, unit: "par jour", raw: true },
  ] as const;

  return (
    <section className="rounded-lg bg-panel p-4 shadow-soft sm:p-6 lg:p-8">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Indicateurs principaux</p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-normal">Quatre lectures, pas un seul salaire équivalent</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const microValue = results.micro[item.key];
          const salaryValue = results.salary[item.key];
          const gap = microValue - salaryValue;
          const relative = salaryValue === 0 ? 0 : gap / salaryValue;
          const format = item.key === "workedDays" ? (value: number) => `${Math.round(value)} j` : (value: number) => eur.format(value / (item.key === "valuePerDay" ? 1 : displayFactor));
          return (
            <article key={item.label} className="rounded-lg bg-surface p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <h3 className="min-w-0 text-sm font-semibold text-foreground">{item.label}</h3>
                <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
              </div>
              <div className="mt-4 grid gap-3">
                <MetricLine label="Micro" tone="micro" value={format(microValue)} unit={item.unit} />
                <MetricLine label="Salariat" tone="salary" value={format(salaryValue)} unit={item.unit} />
              </div>
              <p className={cn("mt-4 rounded-md px-3 py-2 text-sm font-medium", gap >= 0 ? "bg-micro-soft text-micro" : "bg-salary-soft text-salary")}>
                Écart micro vs salariat : {format(Math.abs(gap))} ({pct.format(relative)})
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function UsefulChart({ results }: { results: { micro: Result; salary: Result } }) {
  const rows = [
    ["Net disponible", results.micro.netAvailable, results.salary.netAvailable],
    ["Valeur économique", results.micro.economicValue, results.salary.economicValue],
    ["Valeur / jour", results.micro.valuePerDay, results.salary.valuePerDay],
  ] as const;

  return (
    <section className="rounded-lg bg-panel p-4 shadow-soft sm:p-6 lg:p-8">
      <div className="grid gap-2">
        <p className="text-sm font-semibold text-muted-foreground">Graphique comparatif</p>
        <h2 className="font-display text-2xl font-bold tracking-normal">Voir où l’écart se crée</h2>
      </div>
      <div className="mt-6 grid gap-5">
        {rows.map(([label, micro, salary]) => {
          const max = Math.max(micro, salary, 1);
          return (
            <div key={label} className="grid gap-2">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
                <span className="font-semibold">{label}</span>
                <span className="text-muted-foreground">Micro {eur.format(micro)} · Salariat {eur.format(salary)}</span>
              </div>
              <Bar label="Micro-entreprise" tone="micro" value={micro} max={max} />
              <Bar label="Salariat" tone="salary" value={salary} max={max} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MicroDashboardFields({
  state,
  update,
}: {
  state: ScenarioState;
  update: <Group extends keyof ScenarioState, Field extends keyof ScenarioState[Group]>(
    group: Group,
    field: Field,
    value: ScenarioState[Group][Field],
  ) => void;
}) {
  return (
    <div className="rounded-lg bg-micro-soft p-4 sm:p-5">
      <h3 className="flex items-center gap-2 text-lg font-bold text-micro"><BriefcaseBusiness className="size-5" aria-hidden="true" /> Micro-entreprise</h3>
      <div className="mt-5 grid gap-4">
        <NumberField label="TJM hors taxes" suffix="€ / jour" help="Montant facturé par journée client." value={state.micro.dailyRate} onChange={(value) => update("micro", "dailyRate", value)} />
        <NumberField label="Rythme" suffix="jours / semaine" help="Rythme moyen de mission." value={state.micro.daysPerWeek} step={0.5} onChange={(value) => update("micro", "daysPerWeek", value)} />
        <NumberField label="Semaines sans activité" suffix="semaines" help="Congés ou absence de mission." value={state.micro.weeksOff} onChange={(value) => update("micro", "weeksOff", value)} />
        <NumberField label="Jours non facturés" suffix="jours / an" help="Administratif, prospection, formation." value={state.micro.adminDays} onChange={(value) => update("micro", "adminDays", value)} />
        <NumberField label="Dépenses professionnelles" suffix="€ / an" help="Dépenses réellement payées par l’activité." value={state.micro.expenses} onChange={(value) => update("micro", "expenses", value)} />
      </div>
    </div>
  );
}

function SalaryDashboardFields({
  state,
  update,
}: {
  state: ScenarioState;
  update: <Group extends keyof ScenarioState, Field extends keyof ScenarioState[Group]>(
    group: Group,
    field: Field,
    value: ScenarioState[Group][Field],
  ) => void;
}) {
  return (
    <div className="rounded-lg bg-salary-soft p-4 sm:p-5">
      <h3 className="flex items-center gap-2 text-lg font-bold text-salary"><WalletCards className="size-5" aria-hidden="true" /> Salariat</h3>
      <div className="mt-5 grid gap-4">
        <NumberField label="Brut annuel équivalent temps plein" suffix="€ / an ETP" help="Salaire de référence à 100 %." value={state.salary.grossFullTime} onChange={(value) => update("salary", "grossFullTime", value)} />
        <NumberField label="Temps de travail" suffix="%" help="Le montant réellement versé est proratisé." value={state.salary.workTimePercent} onChange={(value) => update("salary", "workTimePercent", value)} />
        <NumberField label="Participation" suffix="€ / an" help="Avantage économique annuel." value={state.salary.participation} onChange={(value) => update("salary", "participation", value)} />
        <NumberField label="Tickets-restaurant" suffix="tickets / an" help="Nombre annuel de tickets." value={state.salary.mealTicketCount} onChange={(value) => update("salary", "mealTicketCount", value)} />
        <NumberField label="RTT et jours offerts" suffix="jours / an" help="Jours non travaillés en plus des congés." value={state.salary.rttDays + state.salary.extraDaysOff} onChange={(value) => {
          update("salary", "rttDays", Math.max(0, value - state.salary.extraDaysOff));
        }} />
      </div>
    </div>
  );
}

function EquivalentsPanel({ equivalents }: { equivalents: ReturnType<typeof calculateEquivalents> }) {
  const rows = [
    ["Même argent disponible", equivalents.sameNet, "Compare uniquement ce qui reste après cotisations, dépenses et impôt."],
    ["Même valeur économique annuelle", equivalents.sameEconomic, "Inclut les avantages salariés identifiés, sans valoriser la protection sociale."],
    ["Même valeur par jour travaillé", equivalents.samePerDay, "Tient compte du nombre de jours réellement travaillés."],
  ] as const;

  return (
    <section className="rounded-lg bg-panel p-4 shadow-soft sm:p-6 lg:p-8">
      <p className="text-sm font-semibold text-muted-foreground">Salaires équivalents</p>
      <h2 className="mt-1 font-display text-2xl font-bold tracking-normal">Trois réponses selon le critère retenu</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {rows.map(([label, value, help]) => (
          <article key={label} className="rounded-lg bg-surface p-4">
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{eur.format(value)} brut ETP / an</p>
            <p className="mt-3 text-sm text-muted-foreground">{help}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProtectionPanel() {
  return (
    <section className="rounded-lg bg-panel p-4 shadow-soft sm:p-6 lg:p-8">
      <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)]">
        <ShieldCheck className="size-9 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Protection sociale et droits associés</p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-normal">À lire séparément du revenu</h2>
          <p className="mt-3 text-muted-foreground">
            Le prototype ne transforme pas la couverture sociale en montant arbitraire. Il signale plutôt les différences à vérifier : assurance chômage, arrêts maladie, retraite, prévoyance, mutuelle, congés payés et continuité de revenu.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <InfoPill title="Micro-entreprise" tone="micro" text="Plus d’autonomie, mais droits et continuité de revenu à vérifier selon la situation." />
            <InfoPill title="Salariat" tone="salary" text="Protection plus structurée, congés intégrés et avantages dépendants de l’employeur." />
          </div>
        </div>
      </div>
    </section>
  );
}

function AssumptionsPanel({ state, results }: { state: ScenarioState; results: { micro: Result; salary: Result } }) {
  return (
    <section className="rounded-lg bg-surface p-4 sm:p-6 lg:p-8">
      <Accordion type="single" collapsible>
        <AccordionItem value="sources">
          <AccordionTrigger>Hypothèses et sources du prototype</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Hypothèses visibles</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <li>Année de référence : {state.common.year}</li>
                  <li>Micro : {state.micro.dailyRate} € HT / jour, {Math.round(results.micro.workedDays)} jours travaillés.</li>
                  <li>Salariat : {eur.format(state.salary.grossFullTime)} brut ETP, {state.salary.workTimePercent} % travaillé.</li>
                </ul>
              </div>
              <div className="rounded-lg bg-attention-soft p-4 text-sm text-attention-foreground">
                <p className="font-semibold">Valeurs estimées</p>
                <p className="mt-2">Cotisations, impôt, abattements et avantages sont simulés localement avec des coefficients simplifiés. Aucune source externe n’est utilisée.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

function StepFrame({
  eyebrow,
  title,
  text,
  children,
  tone,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children: React.ReactNode;
  tone?: "micro" | "salary";
}) {
  return (
    <div>
      <p className={cn("text-sm font-semibold", tone === "micro" ? "text-micro" : tone === "salary" ? "text-salary" : "text-primary")}>{eyebrow}</p>
      <h2 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-normal text-balance sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{text}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}

function Field({ label, help, children }: { label: string; help: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-base font-semibold">{label}</Label>
      <div>{children}</div>
      <p className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 text-sm text-muted-foreground">
        <CircleHelp className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{help}</span>
      </p>
    </div>
  );
}

function NumberField({
  label,
  help,
  value,
  onChange,
  suffix,
  step = 1,
}: {
  label: string;
  help: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <Field label={label} help={help}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-input bg-panel px-3 focus-within:shadow-focus">
        <Input
          className="h-11 border-0 px-0 shadow-none focus-visible:ring-0"
          type="number"
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {suffix ? <span className="shrink-0 text-sm font-medium text-muted-foreground">{suffix}</span> : null}
      </div>
    </Field>
  );
}

function ReadOnlyMetric({ label, value, help }: { label: string; value: string; help: string }) {
  return (
    <div className="rounded-lg bg-micro-soft p-4">
      <p className="text-sm font-semibold text-micro">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{help}</p>
    </div>
  );
}

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button variant={active ? "default" : "calm"} className="h-12 justify-start" onClick={onClick}>
      {active ? <Check aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
      {children}
    </Button>
  );
}

function MetricLine({ label, tone, value, unit }: { label: string; tone: "micro" | "salary"; value: string; unit: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
      <span className={cn("size-3 rounded-sm", tone === "micro" ? "bg-micro" : "bg-salary")} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="truncate text-xl font-bold text-foreground">{value} <span className="text-xs font-medium text-muted-foreground">{unit}</span></p>
      </div>
    </div>
  );
}

function Bar({ label, tone, value, max }: { label: string; tone: "micro" | "salary"; value: number; max: number }) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 text-sm">
      <span className="truncate text-muted-foreground">{label}</span>
      <div className="h-4 overflow-hidden rounded-sm bg-surface-strong" aria-label={`${label} ${eur.format(value)}`}>
        <div className={cn("h-full rounded-sm", tone === "micro" ? "bg-micro" : "bg-salary")} style={{ width: `${Math.max(4, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

function BreakdownPanel({ title, tone, result, lines }: { title: string; tone: "micro" | "salary"; result: Result; lines: [string, number][] }) {
  return (
    <section className="rounded-lg bg-panel p-4 shadow-soft sm:p-6">
      <h2 className={cn("text-xl font-bold", tone === "micro" ? "text-micro" : "text-salary")}>{title}</h2>
      <div className="mt-5 grid gap-3">
        {lines.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-border pb-3 text-sm">
            <span className="min-w-0 text-muted-foreground">{label}</span>
            <strong className={value < 0 ? "text-attention-foreground" : "text-foreground"}>{eur.format(value)}</strong>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-surface p-4">
        <p className="text-sm font-semibold text-muted-foreground">Résultat retenu</p>
        <p className="mt-1 text-2xl font-bold">{eur.format(result.economicValue)}</p>
      </div>
    </section>
  );
}

function InfoPill({ title, text, tone }: { title: string; text: string; tone: "micro" | "salary" }) {
  return (
    <div className={cn("rounded-lg p-4", tone === "micro" ? "bg-micro-soft" : "bg-salary-soft")}>
      <p className={cn("font-semibold", tone === "micro" ? "text-micro" : "text-salary")}>{title}</p>
      <p className="mt-2 text-sm text-foreground">{text}</p>
    </div>
  );
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