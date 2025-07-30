import { ShieldCheck, UserCheck, Lock, Users, FileText, Database, KeyRound, MailCheck, AlertCircle, ArrowLeft } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsAndConditions = () => (
  <div className="max-w-3xl mx-auto py-10 px-4 text-gray-800">
    <div className="mb-6">
      <Link to="/auth/login">
        <Button variant="outline" className="inline-flex items-center gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Button>
      </Link>
    </div>
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h1 className="text-3xl font-bold text-center text-emerald-700 mb-2">Terms and Conditions</h1>
      <p className="text-center text-gray-500 mb-2">Transparent practices that prioritize your privacy and conservation experience on EcoRwanda Conservation Portal</p>
      <div className="text-center text-sm text-emerald-700 font-medium mb-6 flex items-center justify-center gap-2">
        <KeyRound className="inline-block h-5 w-5 text-emerald-600" />
        To access data, we verify your account.
      </div>
      <div className="bg-emerald-100 rounded p-4 mb-6">
        <h2 className="text-lg font-semibold text-emerald-800 mb-2 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-700" /> Ethical Considerations
        </h2>
        <ul className="space-y-4 text-sm">
          <li className="flex items-start gap-2">
            <UserCheck className="h-5 w-5 text-emerald-600 mt-1" />
            <span><span className="font-semibold">Informed Consent and Voluntary Participation:</span> All participants engage with EcoRwanda Conservation Portal voluntarily, with clear descriptions of project aims and participation requirements. Feedback and usage information may be gathered for conservation research, with informed consent provided through digital agreements. Participants can withdraw at any time without penalty or loss of access.</span>
          </li>
          <li className="flex items-start gap-2">
            <Lock className="h-5 w-5 text-blue-600 mt-1" />
            <span><span className="font-semibold">Privacy and Data Protection:</span> We prioritize your privacy. Only essential account information is collected. Analysis data (such as activity outcomes, survey responses, and usage logs) is anonymized or aggregated. No personally identifiable information is shared in reports. All data is securely stored and restricted to the EcoRwanda research team.</span>
          </li>
          <li className="flex items-start gap-2">
            <Users className="h-5 w-5 text-amber-600 mt-1" />
            <span><span className="font-semibold">Consideration of Vulnerable Groups:</span> We support ethical engagement, especially for young adults and participants from diverse backgrounds. No minors are knowingly involved in field deployment. We avoid exploitation or undue influence, and strive for inclusivity in conservation participation.</span>
          </li>
          <li className="flex items-start gap-2">
            <FileText className="h-5 w-5 text-purple-600 mt-1" />
            <span><span className="font-semibold">Compliance with Institutional and National Ethics Standards:</span> EcoRwanda adheres to national and international research ethics, including guidelines from the African Leadership University and Rwandan law. We uphold honesty, integrity, and respect for persons in all conservation activities.</span>
          </li>
        </ul>
      </div>
      {/* Ethical Principles Section */}
      <div className="bg-slate-50 rounded p-4 mb-6">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-700" /> Our Ethical Principles</h3>
        <ul className="text-xs space-y-1">
          <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-blue-600" /> <span className="font-semibold">Data Protection:</span> Your data is handled securely and only for conservation purposes.</li>
          <li className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-600" /> <span className="font-semibold">Transparency:</span> We are open about how your information is used.</li>
          <li className="flex items-center gap-2"><Database className="h-4 w-4 text-purple-600" /> <span className="font-semibold">Purpose-Driven:</span> Data is used to improve conservation outcomes and user experience.</li>
          <li className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-emerald-600" /> <span className="font-semibold">User Consent:</span> You control your participation and data sharing preferences.</li>
        </ul>
      </div>
      {/* How We Manage Your Data Section */}
      <div className="bg-slate-50 rounded p-4 mb-8">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Database className="h-4 w-4 text-purple-700" /> How We Manage Your Data</h3>
        <ul className="text-xs space-y-1">
          <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-700" /> <span className="font-semibold">What We Collect:</span> Account info, activity logs, survey responses.</li>
          <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-700" /> <span className="font-semibold">How We Use It:</span> For research, platform improvement, and conservation reporting.</li>
          <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-blue-600" /> <span className="font-semibold">How We Protect:</span> Encryption, secure authentication, and regular audits.</li>
        </ul>
      </div>
      <div className="mb-8">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><UserCheck className="h-4 w-4 text-emerald-700" /> Your Privacy Rights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-emerald-50 rounded p-3 flex items-center gap-2">
            <MailCheck className="h-4 w-4 text-emerald-600" />
            <span><span className="font-semibold">Right to Access:</span> Request a copy of your personal data held by EcoRwanda.</span>
          </div>
          <div className="bg-emerald-50 rounded p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span><span className="font-semibold">Right to Rectification:</span> Correct inaccurate or incomplete information.</span>
          </div>
          <div className="bg-emerald-50 rounded p-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-purple-600" />
            <span><span className="font-semibold">Right to Erasure:</span> Request deletion of your personal data.</span>
          </div>
          <div className="bg-emerald-50 rounded p-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-amber-600" />
            <span><span className="font-semibold">Right to Portability:</span> Obtain your data in a portable format.</span>
          </div>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-700" /> Safety & Security Measures</h3>
        <ul className="text-xs space-y-1">
          <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-blue-600" /> <span className="font-semibold">SSL Encryption:</span> All data is protected with SSL encryption.</li>
          <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-700" /> <span className="font-semibold">Secure Authentication:</span> We use secure login and access controls.</li>
          <li className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-600" /> <span className="font-semibold">Regular Review:</span> Security practices are regularly reviewed and updated.</li>
          <li className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-purple-600" /> <span className="font-semibold">Account Controls:</span> You can manage your account and privacy settings at any time.</li>
        </ul>
      </div>
      <div className="mb-4 text-xs text-gray-600">
        <h3 className="font-semibold mb-1 flex items-center gap-2"><MailCheck className="h-4 w-4 text-emerald-700" /> Questions About Your Privacy?</h3>
        <p>Contact our Privacy Officer at <a href="mailto:privacy@ecorwanda.org" className="underline text-emerald-700">privacy@ecorwanda.org</a> or Data Protection Lead at <a href="mailto:dataprotection@ecorwanda.org" className="underline text-emerald-700">dataprotection@ecorwanda.org</a>.</p>
      </div>
      <div className="text-xs text-gray-400 text-right mb-6">Last updated: July 7, 2025</div>
      
      <div className="text-center pt-6 border-t border-gray-200">
        <Link to="/auth/login">
          <Button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Login
          </Button>
        </Link>
      </div>
    </div>
  </div>
);

export default TermsAndConditions; 