import { Sun, Moon, LogOut, Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageDropdown, MoreDropdown } from './NavDropdowns';
import { LANGUAGES } from './constants';
import { isTauri } from '../../utils/env';
import { useViewStore } from '../../stores/useViewStore';
import { Button } from '@/components/ui/button';

interface NavSettingsProps {
    theme: 'light' | 'dark';
    currentLanguage: string;
    onThemeToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onLanguageChange: (langCode: string) => void;
}

/**
 * 设置按钮组件 - 独立处理响应式
 *
 * 响应式策略:
 * - ≥ 480px (md): 独立按钮(主题 + 语言)
 * - < 480px: 更多下拉菜单
 */
export function NavSettings({
    theme,
    currentLanguage,
    onThemeToggle,
    onLanguageChange
}: NavSettingsProps) {
    const { t } = useTranslation();
    const { setMiniView } = useViewStore();

    const handleLogout = () => {
        sessionStorage.removeItem('abv_admin_api_key');
        localStorage.removeItem('abv_admin_api_key');
        window.location.reload();
    };

    return (
        <>
            {/* 独立按钮 (≥ 480px) */}
            <div className="hidden min-[480px]:flex items-center gap-2">
                {/* 迷你视图切换按钮 */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMiniView(true)}
                    title={t('nav.mini_view', 'Mini View')}
                >
                    <Minimize2 />
                </Button>

                {/* 主题切换按钮 */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onThemeToggle}
                    title={theme === 'light' ? t('nav.theme_to_dark') : t('nav.theme_to_light')}
                >
                    {theme === 'light' ? <Moon /> : <Sun />}
                </Button>

                {/* 语言切换下拉菜单 */}
                <LanguageDropdown
                    currentLanguage={currentLanguage}
                    languages={LANGUAGES}
                    onLanguageChange={onLanguageChange}
                />

                {/* 登出按钮 - 仅 Web 模式显示 */}
                {!isTauri() && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleLogout}
                        title={t('nav.logout', '登出')}
                    >
                        <LogOut />
                    </Button>
                )}
            </div>

            {/* 更多菜单 (< 480px) */}
            <div className="min-[480px]:hidden">
                <MoreDropdown
                    theme={theme}
                    currentLanguage={currentLanguage}
                    languages={LANGUAGES}
                    onThemeToggle={onThemeToggle}
                    onLanguageChange={onLanguageChange}
                />
            </div>
        </>
    );
}