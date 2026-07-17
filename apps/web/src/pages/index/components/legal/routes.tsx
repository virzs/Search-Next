import LegalDocumentRoute from ".";

export const legalRoutes = {
  path: "legal",
  children: [
    { path: "terms", element: <LegalDocumentRoute type="terms" /> },
    { path: "privacy", element: <LegalDocumentRoute type="privacy" /> },
  ],
};
