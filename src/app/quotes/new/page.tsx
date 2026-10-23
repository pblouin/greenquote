import { QuoteForm } from "@/components/QuoteForm";
import { requireSession } from "@/lib/session";

export default async function NewQuotePage() {
  const session = await requireSession();

  return (
    <>
      <h1>Solar financing pre-qualification</h1>
      <QuoteForm defaultFullName={session.fullName} defaultEmail={session.email} />
    </>
  );
}
