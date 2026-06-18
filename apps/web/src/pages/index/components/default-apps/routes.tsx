import { accountRoutes } from "./account/routes";
import { personalizationRoutes } from "./personalization/routes";
import { settingsRoutes } from "./settings/routes";
import { storeRoutes } from "./store/routes";

const defaultAppRoutes = [
  accountRoutes,
  storeRoutes,
  personalizationRoutes,
  settingsRoutes,
];

export default defaultAppRoutes;
