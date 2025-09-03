import React, { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveAs } from "file-saver";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { t, v, p, pc, titlePage, pageBreakBefore, labelValue, bullet } from "./docFormatting";
import "./index.css"; // must start with @import "tailwindcss" in Tailwind v4

/**
 * This file turns your single-page generator into a small website:
 *   /           → Home (hero, CTA)
 *   /builder    → Your existing two-step document builder
 *   /about      → About page (edit as you like)
 */

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
        <SiteHeader />
        <main className="flex-1 py-8">
          <div className="mx-auto max-w-none w-full px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/builder" element={<Builder />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}

function SiteHeader() {
  const base = "px-3 py-2 rounded-xl transition text-gray-600 hover:text-gray-900 hover:bg-gray-100";
  const active = "bg-gray-200 text-gray-900";
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-none w-full h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <NavLink to="/" className="text-lg font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">Will‑Me</span>
        </NavLink>
        <nav className="flex gap-1">
          <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? active : ""}`}>Home</NavLink>
          <NavLink to="/builder" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>Builder</NavLink>
          <NavLink to="/about" className={({ isActive }) => `${base} ${isActive ? active : ""}`}>About</NavLink>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-gray-200">
      <div className="mx-auto max-w-none w-full h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-gray-500">
        <span>© {new Date().getFullYear()} Will‑Me</span>
        <div className="space-x-4">
          <a className="hover:text-gray-900" href="#">Privacy</a>
          <a className="hover:text-gray-900" href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <section className="text-center">
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
        Online Wills Made
        <span className="block mt-1 bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">
          Easy with Will-Me
        </span>
      </h1>
      <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
        Choose a template, fill in the blanks, and export a clean .docx in seconds.
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <NavLink
          to="/builder"
          className="nline-flex h-11 items-center justify-center rounded-xl border bg-white px-6 text-center font-medium shadow hover:bg-indigo-700 hover:text-white"
        >
          Start Building
        </NavLink>
        <NavLink
          to="/about"
          className="h-11 px-6 rounded-xl border bg-white hover:bg-indigo-700 shadow"
        >
          Learn More
        </NavLink>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {[
          ["Template‑driven", "Will & POA samples you can extend."],
          ["Validation", "Validate your legal document"],
          ["Export .docx", "instant downloads."],
        ].map(([title, desc]) => (
          <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-gray-600">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="prose max-w-none">
      <h2>About Will‑Me</h2>
      <p>
        Will‑Me helps you draft common legal documents from parameterized templates.
      </p>
      <p className="text-sm text-gray-500">
        Disclaimer: for demonstration only; not legal advice.
      </p>
    </section>
  );
}

function NotFound() {
  return (
    <section className="text-center">
      <h2 className="text-3xl font-semibold">404</h2>
      <p className="mt-2 text-gray-600">Page not found.</p>
    </section>
  );
}

/** ----------------------------------------
 * 1) TEMPLATE DEFINITIONS (your original logic)
 * -----------------------------------------*/
const templates = [
  {
    id: "will-sample",
    type: "will",
    name: "Last Will and Testament (User Template)",
    fileName: (d) => `Will_${(d.testatorName || "Client").replace(/\s+/g, "_")}.docx`,
    schema: z.object({
      testatorName: z.string().min(1, "Required"),
      spouseName: z.string().min(1, "Required"),
      Childrendob: z.string().optional().nullable(),
      trustee1Name: z.string().min(1, "Required"),
      trustee1Address: z.string().min(1, "Required"),
      trustee1Email: z.string().email("Invalid email"),
      trustee1Phone: z.string().min(1, "Required"),
      trustee2Name: z.string().min(1, "Required"),
      trustee2Address: z.string().min(1, "Required"),
      childrenNames: z.string().optional().nullable(),
      guardian1Name: z.string().min(1, "Required"),
      guardian1Address: z.string().min(1, "Required"),
      guardian1Email: z.string().email("Invalid email"),
      guardian1Phone: z.string().min(1, "Required"),
      guardian2Name: z.string().min(1, "Required"),
      day: z.string().min(1, "Required"),
      monthYear: z.string().min(1, "Required"),
      witness1Name: z.string().min(1, "Required"),
      witness2Name: z.string().min(1, "Required"),
    }),
    renderDoc: (d) => {
      const firstPage = titlePage(d.testatorName);
      const startBody = pageBreakBefore();
      const body = [
        p([t("I, "), v(d.testatorName), t(", being of sound mind and disposing memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all former wills and codicils made by me.")]),
        p([t("")]),
        p([t("Marital Status")]),
        p([t("I am married to "), v(d.spouseName), t(".")]),
        p([t("")]),
        p([t("Children")]),
        p([t("I have the following living children.")]),
        p([v(d.childrenNames || "None.")]),
        p([t("born, "), v(d.Childrendob || ""), t(", respectively")]),
        p([t("Unless otherwise specified in the will, the term \"children\" is legally interpreted to mean: The testator’s biological children and legally adopted children, whether born before or after the execution of the will, but born during the testator’s lifetime.")]),
        p([t("")]),
        p([t("Estate Trustees")]),
        p([t("I appoint "), v(d.trustee1Name), t(", of "), v(d.trustee1Address), t(", with email: "), v(d.trustee1Email), t(" and current contact no "), v(d.trustee1Phone), t(" to be the Estate Trustee of this my Will.")]),
        p([t("If "), v(d.trustee1Name), t(", should predecease me or be unable or unwilling to act, I appoint "), v(d.trustee2Name), t(", of "), v(d.trustee2Address), t(", as alternate Estate Trustee. I give, devise, and bequeath all of the rest, residue, and remainder of my property of every nature and kind, and wherever situate, including any property over which I may have a power of appointment, to be divided as follows:")]),
        p([t("")]),
        p([t("Distribution")]),
        p([t("To my spouse, "), v(d.spouseName), t(", if he/she survives me by 30 days, absolutely.")]),
        p([t("If my spouse does not survive me by 30 days, then to my children, "), v(d.childrenNames || "[children name]"), t(", in equal shares per stirpes. If any of my children predecease me leaving issue (children of their own) surviving, such issue shall take their deceased parent's share equally.")]),
        p([t("If I die leaving minor children, I appoint "), v(d.guardian1Name), t(", of "), v(d.guardian1Address), t(", email: "), v(d.guardian1Email), t(" and phone no: "), v(d.guardian1Phone), t(" to be the guardian of their person and property. If they are unable or unwilling to act, I appoint "), v(d.guardian2Name), t(".")]),
        p([t("My Estate Trustee shall have all powers and authority conferred upon them by the Trustee Act (Ontario), including (but not limited to) the power to: Sell, lease, invest, and distribute estate assets; Retain assets in their existing form; Hire professionals and pay reasonable fees; Make distributions in cash or in kind; Postpone the sale or conversion of any estate asset.")]),
        p([t("I give the residue of my estate to be divided and distributed according to the instructions in clause 5.")]),
        p([t("I direct my Estate Trustee to pay all my legally enforceable debts, my funeral and testamentary expenses, and all taxes payable as a result of my death, as soon as practicable after my death.")]),
        p([t("")]),
        p([t("This is my Last Will and Testament, made on this "), v(d.day), t(" day of "), v(d.monthYear), t(".")]),
        p([t("")]),
        p([t("IN WITNESS WHEREOF, I have signed this Will on the date written above.")]),
        p([t("")]),
        p([t("_________________________")]),
        p([v(`${d.testatorName} (Testator)`)]),
        p([t("")]),
        p([t("Signed by the above-named Testator in our presence and signed by us in the presence of the Testator and each other, all being present at the same time.")]),
        p([t("")]),
        p([v(d.witness1Name)]),
        p([t("Name: ___________________________")]),
        p([t("Address: ___________________________")]),
        p([t("Signature: ___________________________")]),
        p([t("")]),
        p([v(d.witness2Name)]),
        p([t("Name: ___________________________")]),
        p([t("Address: ___________________________")]),
        p([t("Signature: ___________________________")]),
      ];

      return new Document({ sections: [{ properties: {}, children: [...firstPage, startBody, ...body] }] });
    },
    fields: [
      { name: "testatorName", label: "Testator Name : ", type: "text", required: true },
      { name: "spouseName", label: "spouse name : ", type: "text", required: true },
      { name: "Childrendob", label: "Children DOB (comma-separated)", type: "textarea" },
      { name: "trustee1Name", label: "Trustee1 Name : ", type: "text", required: true },
      { name: "trustee1Address", label: "Trustee1 address : ", type: "text", required: true },
      { name: "trustee1Email", label: "trustee1 email : ", type: "text", required: true },
      { name: "trustee1Phone", label: "trustee1 phone no : ", type: "text", required: true },
      { name: "trustee2Name", label: "Trustee2 Name : ", type: "text", required: true },
      { name: "trustee2Address", label: "trustee2 address : ", type: "text", required: true },
      { name: "childrenNames", label: "children name (comma-separated)", type: "text" },
      { name: "guardian1Name", label: "Guardian1 Name : ", type: "text", required: true },
      { name: "guardian1Address", label: "Guardian1 address : ", type: "text", required: true },
      { name: "guardian1Email", label: "Guardian1 email : ", type: "text", required: true },
      { name: "guardian1Phone", label: "guardian1 phone : ", type: "text", required: true },
      { name: "guardian2Name", label: "Guardian2 Name : ", type: "text", required: true },
      { name: "day", label: "[Day]", type: "text", required: true },
      { name: "monthYear", label: "[Month, Year]", type: "text", required: true },
      { name: "witness1Name", label: "[Witness1 Name]", type: "text", required: true },
      { name: "witness2Name", label: "[Witness2 Name]", type: "text", required: true },
    ],
  },
  {
    id: "poa-property",
    type: "poa",
    name: "Power of Attorney – Property",
    fileName: (d) => `POA_Property_${d.grantorLastName || "Client"}.docx`,
    schema: z.object({
      grantorFirstName: z.string().min(1, "Required"),
      grantorLastName: z.string().min(1, "Required"),
      date: z.string().min(1, "Required"),
      attorneyName: z.string().min(1, "Required"),
      powersGranted: z.string().min(1, "Required"),
      limitations: z.string().optional().nullable(),
    }),
    renderDoc: (data) => {
      const pP = (text) => new Paragraph({ children: [new TextRun({ text })] });
      const h = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_1 });
      const h2 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_2 });

      return new Document({
        sections: [
          {
            children: [
              h("POWER OF ATTORNEY – PROPERTY"),
              pP(`Grantor: ${data.grantorFirstName} ${data.grantorLastName}`),
              pP(`Date: ${data.date}`),
              h2("Appointment"),
              pP(`I appoint ${data.attorneyName} as my attorney for property.`),
              h2("Powers Granted"),
              pP(data.powersGranted),
              h2("Limitations"),
              pP(data.limitations || "None"),
              h2("Signature"),
              pP("______________________________  Grantor"),
            ],
          },
        ],
      });
    },
    fields: [
      { name: "grantorFirstName", label: "Grantor First Name", type: "text" },
      { name: "grantorLastName", label: "Grantor Last Name", type: "text" },
      { name: "date", label: "Date", type: "text" },
      { name: "attorneyName", label: "Attorney Name", type: "text" },
      { name: "powersGranted", label: "Powers Granted", type: "textarea" },
      { name: "limitations", label: "Limitations", type: "textarea" },
    ],
  },
];

/** ----------------------------------------
 * 2) UI HELPERS (unchanged)
 * -----------------------------------------*/
function Section({ title, children }) {
  return (
    <div className="rounded-2xl shadow p-5 bg-white border border-gray-100">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ field, register, errors }) {
  const base = "w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring focus:ring-indigo-200";
  switch (field.type) {
    case "textarea":
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{field.label}</label>
          <textarea className={base} rows={4} {...register(field.name)} />
          {errors?.[field.name] && (
            <span className="text-sm text-red-600">{errors[field.name].message}</span>
          )}
        </div>
      );
    default:
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{field.label}</label>
          <input className={base} type={field.type || "text"} {...register(field.name)} />
          {errors?.[field.name] && (
            <span className="text-sm text-red-600">{errors[field.name].message}</span>
          )}
        </div>
      );
  }
}

/** ----------------------------------------
 * 3) BUILDER (your original two‑step app, now at /builder)
 * -----------------------------------------*/
function Builder() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null); // 'will' | 'poa'
  const [selectedId, setSelectedId] = useState(templates[0].id);

  const template = useMemo(() => templates.find((t) => t.id === selectedId) || templates[0], [selectedId]);

  const defaultByType = useMemo(() => {
    const map = {};
    for (const t of templates) if (!map[t.type]) map[t.type] = t.id;
    return map;
  }, []);

  const form = useForm({
    resolver: zodResolver(template.schema),
    defaultValues: Object.fromEntries(template.fields.map((f) => [f.name, ""])),
    mode: "onChange",
  });

  React.useEffect(() => {
    form.reset(Object.fromEntries(template.fields.map((f) => [f.name, ""])));
    // NOTE: if schemas differ a lot, consider keying a child form by template.id to remount
  }, [template.id]);

  async function onGenerate(values) {
    const doc = template.renderDoc(values);
    const blob = await Packer.toBlob(doc);
    saveAs(blob, template.fileName(values));
  }

  const { register, handleSubmit, formState: { errors, isValid } } = form;

  if (step === 1) {
    return (
      <div className="grid gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Will‑Me</h1>
          <span className="text-sm text-gray-600">Select Document Type</span>
        </header>

        <Section title="Choose a document type">
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => { setSelectedType('will'); setSelectedId(defaultByType['will'] ?? templates[0].id); setStep(2); }}
              className="text-left rounded-2xl p-6 border bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="text-lg font-semibold">Will</div>
              <p className="text-sm text-gray-600 mt-1">Create a Last Will & Testament</p>
            </button>

            <button
              onClick={() => { setSelectedType('poa'); setSelectedId(defaultByType['poa'] ?? templates[0].id); setStep(2); }}
              className="text-left rounded-2xl p-6 border bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="text-lg font-semibold">Power of Attorney</div>
              <p className="text-sm text-gray-600 mt-1">Property / Personal Care</p>
            </button>
          </div>
        </Section>
      </div>
    );
  }

  const visibleTemplates = templates.filter((t) => !selectedType || t.type === selectedType);

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Will‑Me</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setStep(1)} className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-sm">← Back</button>
          <span className="text-sm text-gray-600">Fill Details</span>
        </div>
      </header>

      <Section title="1) Choose a template">
        <div className="grid md:grid-cols-2 gap-4">
          {visibleTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`text-left rounded-2xl p-4 border shadow-sm transition ${selectedId === t.id ? "bg-indigo-50 border-indigo-300" : "bg-white border-gray-200 hover:bg-gray-50"}`}
            >
              <div className="font-semibold">{t.name}</div>
              <div className="text-xs text-gray-600 mt-1">ID: {t.id}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="2) Enter variable data">
        <form className="grid gap-4" onSubmit={handleSubmit(onGenerate)}>
          <div className="grid md:grid-cols-2 gap-4">
            {template.fields.map((f) => (
              <Field key={f.name} field={f} register={register} errors={errors} />
            ))}
          </div>

          <div className="flex items-center justify-between mt-2">
            <button type="button" onClick={() => setStep(1)} className="px-4 py-3 rounded-xl border bg-white hover:bg-gray-50">Back</button>
            <button type="submit" disabled={!isValid} className={`px-5 py-3 rounded-xl font-medium shadow ${isValid ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-200 text-gray-500"}`}>
              Generate .docx
            </button>
          </div>
        </form>
      </Section>

      <footer className="text-xs text-gray-500 text-center py-3">
        © {new Date().getFullYear()} Legal Auto‑Docs Starter. For demonstration only; not legal advice.
      </footer>
    </div>
  );
}
