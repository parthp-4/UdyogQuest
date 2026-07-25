"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, type OnboardingInput } from "@/lib/profile/onboarding-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OnboardingForm() {
  const router = useRouter();
  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessCategory: "FOOD",
      stage: "PRE_REGISTRATION",
      ownership: "PROPRIETORSHIP",
      premises: "UNKNOWN",
      languages: ["English"],
      existingRegistrations: [],
      existingLicenses: []
    }
  });

  async function onSubmit(values: OnboardingInput) {
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    if (response.ok) router.push(`/profile?profile=${data.profile.id}`);
    else form.setError("root", { message: "Profile could not be created. Check the highlighted fields." });
  }

  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 lg:grid-cols-3">
        <Field label="Business name" error={form.formState.errors.businessName?.message}>
          <Input {...form.register("businessName")} />
        </Field>
        <Field label="Industry">
          <select className="h-10 rounded-md border bg-card px-3 text-sm" {...form.register("businessCategory")}>
            <option value="FOOD">Food Businesses</option>
            <option value="EXPORT_IMPORT">Export / Import Businesses</option>
          </select>
        </Field>
        <Field label="Business activity" error={form.formState.errors.businessActivity?.message}>
          <Input {...form.register("businessActivity")} />
        </Field>
        <Field label="Stage">
          <select className="h-10 rounded-md border bg-card px-3 text-sm" {...form.register("stage")}>
            <option value="IDEA">Idea</option>
            <option value="PRE_REGISTRATION">Pre-registration</option>
            <option value="OPERATING">Operating</option>
            <option value="EXPANDING">Expanding</option>
            <option value="EXPORT_READY">Export ready</option>
          </select>
        </Field>
        <Field label="State" error={form.formState.errors.state?.message}>
          <Input {...form.register("state")} />
        </Field>
        <Field label="District" error={form.formState.errors.district?.message}>
          <Input {...form.register("district")} />
        </Field>
        <Field label="City" error={form.formState.errors.city?.message}>
          <Input {...form.register("city")} />
        </Field>
        <Field label="PIN" error={form.formState.errors.pin?.message}>
          <Input {...form.register("pin")} />
        </Field>
        <Field label="Ownership">
          <select className="h-10 rounded-md border bg-card px-3 text-sm" {...form.register("ownership")}>
            <option value="PROPRIETORSHIP">Proprietorship</option>
            <option value="PARTNERSHIP">Partnership</option>
            <option value="LLP">LLP</option>
            <option value="PRIVATE_LIMITED">Private Limited</option>
            <option value="SHG">SHG</option>
            <option value="COOPERATIVE">Cooperative</option>
            <option value="TRUST">Trust</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>
        <Field label="Turnover">
          <Input type="number" {...form.register("turnover")} />
        </Field>
        <Field label="Investment">
          <Input type="number" {...form.register("investment")} />
        </Field>
        <Field label="Employees">
          <Input type="number" {...form.register("employees")} />
        </Field>
        <Field label="Annual income">
          <Input type="number" {...form.register("annualIncome")} />
        </Field>
        <Field label="Category">
          <Input {...form.register("socialCategory")} />
        </Field>
        <Field label="Gender">
          <Input {...form.register("gender")} />
        </Field>
        <Field label="Age">
          <Input type="number" {...form.register("age")} />
        </Field>
        <Field label="Education">
          <Input {...form.register("education")} />
        </Field>
        <Field label="Premises">
          <select className="h-10 rounded-md border bg-card px-3 text-sm" {...form.register("premises")}>
            <option value="RENTED">Rented</option>
            <option value="OWNED">Owned</option>
            <option value="SHARED">Shared</option>
            <option value="HOME_BASED">Home-based</option>
            <option value="WAREHOUSE">Warehouse</option>
            <option value="FACTORY">Factory</option>
            <option value="UNKNOWN">Unknown</option>
          </select>
        </Field>
        <Field label="Food category">
          <Input {...form.register("foodCategory")} />
        </Field>
        <Field label="Export destination">
          <Input {...form.register("exportDestination")} />
        </Field>
        <Field label="Import products">
          <Input {...form.register("importProducts")} />
        </Field>
        <Field label="Mobile" error={form.formState.errors.mobile?.message}>
          <Input {...form.register("mobile")} />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
      </div>

      <div className="grid gap-3 rounded-lg border bg-secondary/40 p-4 lg:grid-cols-4">
        {[
          ["hasGst", "GST"],
          ["hasPan", "PAN"],
          ["hasAadhaar", "Aadhaar"],
          ["hasUdyam", "Udyam"],
          ["hasFssai", "FSSAI"],
          ["hasIec", "IEC"],
          ["manufacturing", "Manufacturing"],
          ["trading", "Trading"],
          ["coldStorage", "Cold storage"],
          ["warehouse", "Warehouse"],
          ["bankAccount", "Bank account"]
        ].map(([name, label]) => (
          <label key={name} className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register(name as keyof OnboardingInput)} />
            {label}
          </label>
        ))}
      </div>

      {form.formState.errors.root?.message ? <p className="text-sm text-destructive">{form.formState.errors.root.message}</p> : null}
      <Button type="submit" className="w-fit">Create AI profile</Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

