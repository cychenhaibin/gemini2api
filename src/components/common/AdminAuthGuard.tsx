import React, { useState, useEffect } from 'react';
import { Lock, Globe, AlertCircle, Loader2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isTauri } from '../../utils/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

        // 检查 Session 存储 (优先)
        const sessionKey = sessionStorage.getItem('abv_admin_api_key');
        if (sessionKey) {
            setIsAuthenticated(true);
            setApiKey(sessionKey);
            return;
        }

        // 检查本地存储 (迁移逻辑)
        const savedKey = localStorage.getItem('abv_admin_api_key');
        if (savedKey) {
            // 迁移到 sessionStorage 并清理 localStorage
            sessionStorage.setItem('abv_admin_api_key', savedKey);
            localStorage.removeItem('abv_admin_api_key');
            setIsAuthenticated(true);
            setApiKey(savedKey);
        }

        // 监听全局 401 事件
        const handleUnauthorized = () => {
            sessionStorage.removeItem('abv_admin_api_key');
            localStorage.removeItem('abv_admin_api_key'); // 双重清理确保万一
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
            // 先临时存储 key，用于验证请求
            sessionStorage.setItem('abv_admin_api_key', trimmedKey);

            // 调用一个需要认证的 API 来验证密码是否正确
            const response = await fetch('/api/accounts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${trimmedKey}`,
                    'x-api-key': trimmedKey
                }
            });

            if (response.ok || response.status === 204) {
                // 验证成功
                localStorage.removeItem('abv_admin_api_key');
                setIsAuthenticated(true);
                window.location.reload();
            } else if (response.status === 401) {
                // 密码错误
                sessionStorage.removeItem('abv_admin_api_key');
                setError(t('login.error_invalid_key'));
            } else {
                // 其他错误，但可能密码是对的
                setIsAuthenticated(true);
                window.location.reload();
            }
        } catch (err) {
            // 网络错误等
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
            {/* 语言切换器 */}
            <div className="absolute top-6 right-6">
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

            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                        <Lock className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
                    <CardDescription>{t('login.desc')}</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="apiKey">
                                {t('login.placeholder', { defaultValue: 'API Key' })}
                            </Label>
                            <Input
                                id="apiKey"
                                type="password"
                                placeholder={t('login.placeholder')}
                                value={apiKey}
                                onChange={(e) => { setApiKey(e.target.value); setError(''); }}
                                autoFocus
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex w-full">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isLoading || !apiKey.trim()}
                            >
                                {isLoading && <Loader2 className="animate-spin" />}
                                {isLoading ? t('login.btn_verifying') : t('login.btn_login')}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t text-center">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {t('login.note')}
                            <br />
                            {t('login.lookup_hint')}
                            <br />
                            {t('login.config_hint')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
