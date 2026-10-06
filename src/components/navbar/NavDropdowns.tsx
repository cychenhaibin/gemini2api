import { Link } from 'react-router-dom';
import { ChevronDown, MoreVertical, Sun, Moon, LogOut, Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NavItem, Language } from './constants';
import { isTauri } from '../../utils/env';
import { useViewStore } from '../../stores/useViewStore';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 语言下拉菜单组件
interface LanguageDropdownProps {
    currentLanguage: string;
    languages: Language[];
    onLanguageChange: (langCode: string) => void;
    className?: string;
}

export function LanguageDropdown({
    currentLanguage,
    languages,
    onLanguageChange,
    className = ''
}: LanguageDropdownProps) {
    const { t } = useTranslation();
    const current = languages.find(l => l.code === currentLanguage);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className={className}>
                <Button
                    variant="outline"
                    size="icon"
                    title={t('settings.general.language')}
                    className="rounded-full"
                >
                    <span className="text-xs font-bold">
                        {current?.short || 'EN'}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[10rem]">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => onLanguageChange(lang.code)}
                    >
                        <span className="font-mono font-bold w-8">{lang.short}</span>
                        <span className="text-xs text-muted-foreground">{lang.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// 导航下拉菜单组件 (< 375px)
interface NavigationDropdownProps {
    navItems: NavItem[];
    isActive?: (path: string) => boolean;
    getCurrentNavItem: () => NavItem | undefined;
    onNavigate: () => void;
    showLabel?: boolean;
}

export function NavigationDropdown({
    navItems,
    getCurrentNavItem,
    onNavigate,
    showLabel = true
}: NavigationDropdownProps) {
    const currentItem = getCurrentNavItem();
    const CurrentIcon = currentItem?.icon;

    if (!currentItem || !CurrentIcon) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <CurrentIcon className="h-4 w-4" />
                    {showLabel && <span className="text-sm">{currentItem.label}</span>}
                    <ChevronDown className="h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[12rem]">
                {navItems.map((item) => (
                    <DropdownMenuItem
                        key={item.path}
                        asChild
                    >
                        <Link to={item.path} onClick={onNavigate}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// 更多菜单组件 (< 480px)
interface MoreDropdownProps {
    theme: 'light' | 'dark';
    currentLanguage: string;
    languages: Language[];
    onThemeToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onLanguageChange: (langCode: string) => void;
}

export function MoreDropdown({
    theme,
    languages,
    onThemeToggle,
    onLanguageChange
}: MoreDropdownProps) {
    const { t } = useTranslation();
    const { setMiniView } = useViewStore();

    const handleThemeToggle = (event: React.MouseEvent<HTMLDivElement>) => {
        onThemeToggle(event as unknown as React.MouseEvent<HTMLButtonElement>);
    };

    const handleLanguageChange = (langCode: string) => {
        onLanguageChange(langCode);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('abv_admin_api_key');
        localStorage.removeItem('abv_admin_api_key');
        window.location.reload();
    };

    const handleMiniView = () => {
        setMiniView(true);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" title={t('nav.more', '更多')}>
                    <MoreVertical />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[12rem]">
                <DropdownMenuItem onClick={handleMiniView}>
                    <Minimize2 />
                    {t('nav.mini_view', 'Mini View')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleThemeToggle}>
                    {theme === 'light' ? <Moon /> : <Sun />}
                    {theme === 'light' ? t('nav.theme_to_dark') : t('nav.theme_to_light')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                    >
                        <span className="font-mono font-bold w-8 text-xs">{lang.short}</span>
                        <span className="text-xs text-muted-foreground">{lang.label}</span>
                    </DropdownMenuItem>
                ))}
                {!isTauri() && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-destructive focus:text-destructive"
                        >
                            <LogOut />
                            {t('nav.logout', '登出')}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}