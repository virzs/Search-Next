import {
  createRouteSearchItems,
  type RouteSearchItem,
  type RouteTextResolver,
  type RouteVisibilityContext,
} from "./route-config";
import {
  accountRootRouteDefinition,
  accountRouteDefinitions,
} from "./account/route-definitions";
import {
  personalizationRootRouteDefinition,
  personalizationRouteDefinitions,
} from "./personalization/route-definitions";
import {
  settingsRootRouteDefinition,
  settingsRouteDefinitions,
} from "./settings/route-definitions";
import {
  storeRootRouteDefinition,
  storeRouteDefinitions,
} from "./store/route-definitions";

const searchableRouteDefinitions = [
  storeRootRouteDefinition,
  ...storeRouteDefinitions,
  personalizationRootRouteDefinition,
  ...personalizationRouteDefinitions,
  settingsRootRouteDefinition,
  ...settingsRouteDefinitions,
  accountRootRouteDefinition,
  ...accountRouteDefinitions,
];

export const getDefaultAppRouteSearchItems = (options: {
  context?: RouteVisibilityContext;
  textResolver?: RouteTextResolver;
} = {}): RouteSearchItem[] =>
  createRouteSearchItems(searchableRouteDefinitions, options);

export type { RouteSearchItem };
