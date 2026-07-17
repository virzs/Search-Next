import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { createRouteObjectsFromDefinitions } from "../route-config";
import SettingsModalRoute from "./index";
import AboutView from "./views/about";
import LegalDocumentView from "./views/about/legal-document";
import AccountView from "./views/account";
import BackupView, {
  AppStorageUsageView,
  StorageUsageView,
} from "./views/backup";
import DeveloperView from "./views/developer";
import LanguageView from "./views/language";
import PersonalizationView from "./views/personalization";
import SearchSettingsView from "./views/search";
import { settingsRouteDefinitions } from "./route-definitions";
import { settingsRoute } from "./route-paths";

const settingsRouteElements = {
  "settings.account": <AccountView />,
  "settings.personalization": <PersonalizationView />,
  "settings.search": <SearchSettingsView />,
  "settings.language": <LanguageView />,
  "settings.backup": <BackupView />,
  "settings.backup-storage": <StorageUsageView />,
  "settings.backup-storage-apps": <AppStorageUsageView />,
  "settings.backup-storage-detail": <StorageUsageView />,
  "settings.about": <AboutView />,
  "settings.about-terms": <LegalDocumentView type="terms" />,
  "settings.about-privacy": <LegalDocumentView type="privacy" />,
  "settings.developer": <DeveloperView />,
} satisfies Record<string, ReactNode>;

export const settingsRoutes = {
  path: settingsRoute.segment.root,
  element: <SettingsModalRoute />,
  children: [
    {
      index: true,
      element: <Navigate to={settingsRoute.segment.account} replace />,
    },
    ...createRouteObjectsFromDefinitions(
      settingsRouteDefinitions,
      settingsRouteElements,
    ),
    {
      path: settingsRoute.segment.wildcard,
      element: <Navigate to={settingsRoute.segment.account} replace />,
    },
  ],
};
