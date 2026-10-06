import { Link, useLocation } from 'react-router-dom';
import { NavigationDropdown } from './NavDropdowns';
import { isActive, getCurrentNavItem, type NavItem } from './constants';
import { useConfigStore } from '../../stores/useConfigStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface NavMenuProps {
    navItems: NavItem[];
}

/**
 * 导航菜单组件 - 独立处理响应式
 *
 * 响应式策略:
 * - ≥ 1120px (md): 文字胶囊
 * - 640px - 1120px: 图标胶囊 (Logo 显示文字)
 * - 480px - 640px: 图标胶囊 (Logo 隐藏文字)
 * - 375px - 480px: 图标+文字下拉
 * - < 375px: 图标下拉
 */
export function NavMenu({ navItems }: NavMenuProps) {
    const location = useLocation();
    const { isMenuItemHidden } = useConfigStore();

    // 过滤隐藏的菜单项
    const visibleNavItems = navItems.filter(item => !isMenuItemHidden(item.path));

    const activeClass = 'bg-primary text-primary-foreground shadow-sm';
    const inactiveClass = 'text-muted-foreground hover:text-foreground hover:bg-accent';

    return (
        <>
            {/* 文字胶囊 (≥ 1120px) */}
            <nav className="max-[1119px]:hidden flex items-center gap-1 bg-muted rounded-full p-1">
                {visibleNavItems.map((item) => (
                    <Button
                        key={item.path}
                        asChild
                        size="sm"
                        variant="ghost"
                        className={cn(
                            'rounded-full px-4 xl:px-6 text-sm font-medium whitespace-nowrap',
                            isActive(location.pathname, item.path) ? activeClass : inactiveClass
                        )}
                    >
                        <Link to={item.path} draggable="false">
                            {item.label}
                        </Link>
                    </Button>
                ))}
            </nav>

            {/* 图标胶囊 (880px - 1120px) - Logo 显示文字 */}
            <nav className="max-[879px]:hidden min-[1120px]:hidden flex items-center gap-1 bg-muted rounded-full p-1">
                {visibleNavItems.map((item) => (
                    <Button
                        key={item.path}
                        asChild
                        size="icon"
                        variant="ghost"
                        className={cn(
                            'rounded-full',
                            isActive(location.pathname, item.path) ? activeClass : inactiveClass
                        )}
                        title={item.label}
                    >
                        <Link to={item.path} draggable="false">
                            <item.icon className="h-5 w-5" />
                        </Link>
                    </Button>
                ))}
            </nav>

            {/* 图标胶囊 (640px - 880px) - Logo 隐藏文字 */}
            <nav className="max-[639px]:hidden min-[880px]:hidden flex items-center gap-1 bg-muted rounded-full p-1">
                {visibleNavItems.map((item) => (
                    <Button
                        key={item.path}
                        asChild
                        size="icon"
                        variant="ghost"
                        className={cn(
                            'rounded-full',
                            isActive(location.pathname, item.path) ? activeClass : inactiveClass
                        )}
                        title={item.label}
                    >
                        <Link to={item.path} draggable="false">
                            <item.icon className="h-5 w-5" />
                        </Link>
                    </Button>
                ))}
            </nav>

            {/* 图标+文字下拉 (375px - 480px) */}
            <div className="max-[374px]:hidden min-[480px]:hidden block">
                <NavigationDropdown
                    navItems={visibleNavItems}
                    isActive={(path) => isActive(location.pathname, path)}
                    getCurrentNavItem={() => getCurrentNavItem(location.pathname, visibleNavItems)}
                    onNavigate={() => { }}
                    showLabel={true}
                />
            </div>

            {/* 图标下拉 (< 375px) */}
            <div className="min-[375px]:hidden">
                <NavigationDropdown
                    navItems={visibleNavItems}
                    isActive={(path) => isActive(location.pathname, path)}
                    getCurrentNavItem={() => getCurrentNavItem(location.pathname, visibleNavItems)}
                    onNavigate={() => { }}
                    showLabel={false}
                />
            </div>
        </>
    );
}