import { settingsRoutes } from "./settings/routes";
import { storeRoutes } from "./store/routes";
import { themeRoutes } from "./theme/routes";

const defaultAppRoutes = [storeRoutes, themeRoutes, settingsRoutes];

export default defaultAppRoutes;
