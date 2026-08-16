import type { ReactElement, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactElement | ReactElement[];
}) {
  return (
    <section id={id} className="space-y-3">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export default function LegalPage(): ReactElement {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => history.back()}
          aria-label="Back"
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Legal</h1>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <a
          href="#terms"
          className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground"
        >
          Terms of Service
        </a>
        <a
          href="#privacy"
          className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground"
        >
          Privacy Policy
        </a>
      </div>

      <div className="space-y-10">
        <Section id="terms" title="Terms of Service">
          <P>
            Welcome to MyLittleGymBro ("the app", "we", "us"). By using the app
            you agree to these Terms of Service. If you do not agree, please do
            not use the app.
          </P>
          <P>
            <strong className="text-foreground">1. Use of the app.</strong> The
            app is a macro and nutrition tracker. It is provided free of charge
            for personal, non-commercial use. You may use the app on your own
            devices and are responsible for your use of it.
          </P>
          <P>
            <strong className="text-foreground">2. Local-first.</strong> Your
            food library, log entries, recipes, and settings are stored locally
            on your device in your browser's storage. There is no account, no
            cloud sync, and no server that stores your personal data.
          </P>
          <P>
            <strong className="text-foreground">3. Third-party services.</strong>{" "}
            The app makes limited calls to third-party services to provide its
            features: (a) Open Food Facts, an open barcode and food database used
            to look up products; and (b) Google Gemini, an AI service used for
            nutrition-label reading and web-based food searches. If you use the
            AI features, you supply your own Gemini API key, and requests are
            sent directly to Google. These services have their own terms and
            privacy policies that apply to the data you send them.
          </P>
          <P>
            <strong className="text-foreground">4. Your content and future use.</strong>{" "}
            By using the app, you grant us a broad, non-exclusive, worldwide,
            royalty-free right to use, retain, and process information and
            content you provide or that the app generates on your behalf —
            including images you capture, web searches you perform, and other
            app data — for the purpose of operating, improving, and developing
            the app and related products. We reserve the right to use such
            images, web searches, and other app data for future products and
            services, whether commercial or non-commercial. You represent that
            you have the right to grant this permission for any content you
            provide.
          </P>
          <P>
            <strong className="text-foreground">5. Acceptable use.</strong> You
            agree not to misuse the app, attempt to access it in unauthorized
            ways, interfere with its operation, or use it for any unlawful
            purpose.
          </P>
          <P>
            <strong className="text-foreground">6. No warranty.</strong> The app
            is provided "as is" and "as available" without warranties of any
            kind, express or implied. Nutrition data comes from third-party
            sources and AI and may be inaccurate; you should not rely on it as
            medical or professional advice.
          </P>
          <P>
            <strong className="text-foreground">7. Limitation of liability.</strong>{" "}
            To the maximum extent permitted by law, we are not liable for any
            indirect, incidental, special, or consequential damages arising from
            your use of the app.
          </P>
          <P>
            <strong className="text-foreground">8. Changes.</strong> We may update
            these Terms from time to time. Continued use of the app after changes
            means you accept the revised Terms.
          </P>
          <P>
            <strong className="text-foreground">9. Contact.</strong> Questions
            about these Terms may be directed to the app maintainer.
          </P>
        </Section>

        <Section id="privacy" title="Privacy Policy">
          <P>
            This Privacy Policy explains how MyLittleGymBro handles information.
            The app is designed to be local-first and privacy-respecting: most of
            your data never leaves your device.
          </P>
          <P>
            <strong className="text-foreground">1. Data stored on your device.</strong>{" "}
            The following is stored locally in your browser: your food library,
            daily log entries, saved recipes, and app settings — including, if
            you choose to provide one, your Gemini API key. This data is not
            transmitted to us or stored on any server we operate.
          </P>
          <P>
            <strong className="text-foreground">2. Data shared with third
            parties.</strong> The app makes only the following outside calls: (a)
            Open Food Facts receives the barcodes you scan or enter in order to
            look up product information; and (b) Google Gemini receives the
            nutrition-label images and search queries you submit to the AI
            features, along with your own API key. These providers process that
            data under their own terms and privacy policies. We do not otherwise
            send your personal data to third parties.
          </P>
          <P>
            <strong className="text-foreground">3. Future use of data.</strong>{" "}
            We reserve the right to use images you take, web searches you
            perform, and other app data — for the purpose of improving the app
            and for future products we may build, which may be commercial or
            non-commercial. Where practical we will use such data in aggregate or
            de-identified form, but we may also use it as provided.
          </P>
          <P>
            <strong className="text-foreground">4. Security.</strong> Because data
            is stored on your device, its security largely depends on your
            device and browser. Do not share a device that contains sensitive
            nutrition or health data.
          </P>
          <P>
            <strong className="text-foreground">5. Children.</strong> The app is
            not directed to children under 13, and we do not knowingly collect
            personal information from children.
          </P>
          <P>
            <strong className="text-foreground">6. Changes.</strong> We may update
            this Privacy Policy from time to time. Continued use of the app after
            changes means you accept the revised policy.
          </P>
          <P>
            <strong className="text-foreground">7. Contact.</strong> Questions
            about this Privacy Policy may be directed to the app maintainer.
          </P>
        </Section>
      </div>
    </div>
  );
}
