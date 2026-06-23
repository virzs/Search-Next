import { SystemMenu } from "@/views/system/router";
import { Menu } from "../utils/menu";
import { UserMenu } from "@/views/user/router";
import { TabsMenu } from "@/views/tabs/router";
import { ResourceMenu } from "@/views/resource/router";

const Menus: Menu[] = [SystemMenu, UserMenu, ResourceMenu, TabsMenu];

export default Menus;
