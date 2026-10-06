import React, { useState, useEffect } from 'react';
import { Lock, Globe, Loader2, Check, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isTauri } from '../../utils/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * AdminAuthGuard
 * 针对 Docker/Web 模式的强制鉴权保护层。
 * 如果检测到没有存储的 API Key 或后端返回 401，将拦截 UI 并要求输入 Key。
 */
export const AdminAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t, i18n } = useTranslation();
    const [isAuthenticated, setIsAuthenticated] = useState(isTauri());
    const [apiKey, setApiKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isTauri()) return;

        const sessionKey = sessionStorage.getItem('abv_admin_api_key');
        if (sessionKey) {
            setIsAuthenticated(true);
            setApiKey(sessionKey);
            return;
        }

        const savedKey = localStorage.getItem('abv_admin_api_key');
        if (savedKey) {
            sessionStorage.setItem('abv_admin_api_key', savedKey);
            localStorage.removeItem('abv_admin_api_key');
            setIsAuthenticated(true);
            setApiKey(savedKey);
        }

        const handleUnauthorized = () => {
            sessionStorage.removeItem('abv_admin_api_key');
            localStorage.removeItem('abv_admin_api_key');
            setIsAuthenticated(false);
        };

        window.addEventListener('abv-unauthorized', handleUnauthorized);
        return () => window.removeEventListener('abv-unauthorized', handleUnauthorized);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedKey = apiKey.trim();
        if (!trimmedKey) return;

        setIsLoading(true);
        setError('');

        try {
            sessionStorage.setItem('abv_admin_api_key', trimmedKey);

            const response = await fetch('/api/accounts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${trimmedKey}`,
                    'x-api-key': trimmedKey
                }
            });

            if (response.ok || response.status === 204) {
                localStorage.removeItem('abv_admin_api_key');
                setIsAuthenticated(true);
                window.location.reload();
            } else if (response.status === 401) {
                sessionStorage.removeItem('abv_admin_api_key');
                setError(t('login.error_invalid_key'));
            } else {
                setIsAuthenticated(true);
                window.location.reload();
            }
        } catch (err) {
            sessionStorage.removeItem('abv_admin_api_key');
            setError(t('login.error_network'));
        } finally {
            setIsLoading(false);
        }
    };

    const languages = [
        { code: 'zh', name: '简体中文' },
        { code: 'zh-TW', name: '繁體中文' },
        { code: 'en', name: 'English' },
        { code: 'ja', name: '日本語' },
        { code: 'ko', name: '한국어' },
        { code: 'ru', name: 'Русский' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'pt', name: 'Português' },
        { code: 'ar', name: 'العربية' },
        { code: 'es', name: 'Español' },
        { code: 'my', name: 'Bahasa Melayu' },
    ];

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="bg-background relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            {/* 语言切换 */}
            <div className="absolute right-4 top-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Globe />
                            <span className="uppercase font-medium">{i18n.language.split('-')[0]}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                        {languages.map((lang) => (
                            <DropdownMenuItem
                                key={lang.code}
                                onClick={() => i18n.changeLanguage(lang.code)}
                            >
                                {i18n.language === lang.code && <Check />}
                                {lang.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="mb-6 flex flex-col items-center gap-3 text-center">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
                    <Lock className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold tracking-[-0.01em]">Antigravity Manager</h1>
                    <p className="text-xs text-muted-foreground">
                        {t('login.desc')}
                    </p>
                </div>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-sm rounded-[24px] bg-muted p-5">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="apiKey" className="text-[11px] text-muted-foreground">
                            {t('login.placeholder', { defaultValue: 'API Key' })}
                        </Label>
                        <Input
                            id="apiKey"
                            name="apiKey"
                            type="password"
                            autoComplete="current-password"
                            placeholder={t('login.placeholder')}
                            value={apiKey}
                            onChange={(e) => { setApiKey(e.target.value); setError(''); }}
                            autoFocus
                            disabled={isLoading}
                            className="bg-background rounded-full h-11"
                        />
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <Button
                        type="submit"
                        size="default"
                        disabled={isLoading || !apiKey.trim()}
                        className="w-full rounded-full h-11"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <LogIn className="h-4 w-4" />
                        )}
                        {isLoading ? t('login.btn_verifying') : t('login.btn_login')}
                    </Button>
                </div>
            </form>

            <p className="text-center text-[11px] text-muted-foreground max-w-sm">
                {t('login.note')}
                <br />
                {t('login.lookup_hint')}
                <br />
                {t('login.config_hint')}
            </p>
        </div>
    );
};