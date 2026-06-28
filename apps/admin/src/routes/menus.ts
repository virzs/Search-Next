import { SystemMenu } from "@/views/system/router";
import { Menu } from "../utils/menu";
import { UserMenu } from "@/views/user/router";
import { TabsMenu } from "@/views/tabs/router";
import { ResourceMenu } from "@/views/resource/router";
import { AIMenu } from "@/views/ai/router";

const Menus: Menu[] = [SystemMenu, UserMenu, ResourceMenu, AIMenu, TabsMenu];

export default Menus;
