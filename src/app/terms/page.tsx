export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        
        <div className="prose prose-indigo">
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
          <p>
            Welcome to AlgoZ. By using our service, you agree to these terms and conditions.
            Please read them carefully.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. Account Registration</h2>
          <p>
            When you register for an account, you must provide accurate and complete information.
            You are responsible for maintaining the security of your account and password.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. Privacy Policy</h2>
          <p>
            Our privacy policy explains how we collect, use, and protect your personal information.
            By using our service, you agree to our privacy policy.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. User Conduct</h2>
          <p>
            You agree not to use our service for any illegal or unauthorized purpose.
            You must not violate any laws in your jurisdiction.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account at any time without notice
            if we believe you have violated these terms.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will provide notice of
            significant changes to these terms.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">7. Contact</h2>
          <p>
            If you have any questions about these terms, please contact us at support@algoz.com.
          </p>
        </div>
      </div>
    </div>
  );
}