import { Navigate } from "react-router";
import SettingsModalRoute from "./index";
import AboutView from "./views/about";
import AccountView from "./views/account";
import BackupView from "./views/backup";
import LanguageView from "./views/language";
import PersonalizationView from "./views/personalization";
import { settingsRoute } from "./route-paths";

export const settingsRoutes = {
  path: settingsRoute.segment.root,
  element: <SettingsModalRoute />,
  children: [
    {
      index: true,
      element: <Navigate to={settingsRoute.segment.account} replace />,
    },
    { path: settingsRoute.segment.account, element: <AccountView /> },
    {
      path: settingsRoute.segment.personalization,
      element: <PersonalizationView />,
    },
    { path: settingsRoute.segment.language, element: <LanguageView /> },
    { path: settingsRoute.segment.backup, element: <BackupView /> },
    { path: settingsRoute.segment.about, element: <AboutView /> },
    {
      path: settingsRoute.segment.wildcard,
      element: <Navigate to={settingsRoute.segment.account} replace />,
    },
  ],
};
