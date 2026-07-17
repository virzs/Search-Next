import { accountRoutes } from "./account/routes";
import { personalizationRoutes } from "./personalization/routes";
import { settingsRoutes } from "./settings/routes";
import { storeRoutes } from "./store/routes";
import { legalRoutes } from "../legal/routes";

const defaultAppRoutes = [
  accountRoutes,
  storeRoutes,
  personalizationRoutes,
  settingsRoutes,
  legalRoutes,
];

export default defaultAppRoutes;
