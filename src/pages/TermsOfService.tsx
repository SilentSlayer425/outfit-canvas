/**
 * Terms of Service Page
 * 
 * Accessible without authentication at /terms
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfService() {
  const navigate = useNavigate();
  const parsedLastUpdated = new Date(__TOS_LAST_UPDATED__);
  const lastUpdatedDate = Number.isNaN(parsedLastUpdated.getTime()) ? new Date() : parsedLastUpdated;
  const formattedLastUpdated = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(lastUpdatedDate);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

const handleBack = () => {
    // Go back if there's history, otherwise go to home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4 sm:mb-6 gap-2 text-sm sm:text-base">
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" /> Back
        </Button>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">Last updated: {formattedLastUpdated}</p>

        <div className="space-y-4 sm:space-y-6 text-foreground">
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold mb-2 sm:mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              By accessing and using this digital closet application ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold mb-2 sm:mb-3">2. Use License</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">
              Permission is granted to temporarily use the Service for personal, non-commercial purposes. This license shall automatically terminate if you violate any of these restrictions.
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1 ml-2 sm:ml-4">
              <li>You may not modify or copy the materials</li>
              <li>You may not use the materials for any commercial purpose</li>
              <li>You may not attempt to reverse engineer any software contained in the Service</li>
              <li>You may not remove any copyright or other proprietary notations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold mb-2 sm:mb-3">3. User Content</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              You retain all rights to the content you upload to the Service (including clothing images and outfit data). By using the Service, you grant us permission to store and process your content solely for the purpose of providing the Service to you. Your data is stored in your personal Google Drive account and is not shared with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold mb-2 sm:mb-3">4. Google Drive Integration</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              The Service uses Google Drive to store your closet data. By using the Service, you authorize us to access your Google Drive account for the sole purpose of saving and loading your closet information. We only access files created by this application and do not read or modify any other files in your Google Drive.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold mb-2 sm:mb-3">5. Account Termination</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              You may stop using the Service at any time. We reserve the right to terminate or suspend access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold mb-2 sm:mb-3">6. Disclaimer</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              The Service is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free. Use of the Service is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold mb-2 sm:mb-3">7. Limitation of Liability</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              In no event shall we be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold mb-2 sm:mb-3">8. Changes to Terms</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold mb-2 sm:mb-3">9. Contact Information</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us through the Support tab in the application.
            </p>
          </section>
        </div>

        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-border">
          <p className="text-xs sm:text-sm text-muted-foreground">
            By using this Service, you acknowledge that you have read and understood these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
