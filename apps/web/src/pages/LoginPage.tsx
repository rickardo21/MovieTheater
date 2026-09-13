import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import SFIcon from '@bradleyhodges/sfsymbols-react';
import { sfTv, sfLockFill, sfEnvelopeFill, sfPersonFill, sfQrcode, sfCheckmarkCircleFill } from '@bradleyhodges/sfsymbols';

const API_BASE = import.meta.env.VITE_API_URL || 'http://192.168.1.114:4000';

export const LoginPage: React.FC = () => {
    const { login, register, user, loginWithCustomToken } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const codeFromUrl = searchParams.get('code');

    const [tab, setTab] = useState<'login' | 'register' | 'qr'>('login');

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Device QR Code flow state
    const [deviceCode, setDeviceCode] = useState<string | null>(null);
    const [qrUrl, setQrUrl] = useState<string>('');
    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const [authorizeSuccess, setAuthorizeSuccess] = useState(false);
    // Use a ref so the polling interval can read the latest code without being
    // listed as a dependency (which would restart the effect every time it changes).
    const deviceCodeRef = React.useRef<string | null>(null);

    // If user is already logged in and there is a code in URL, show authorization prompt
    useEffect(() => {
        if (user && codeFromUrl) {
            setTab('qr');
        } else if (user && !codeFromUrl) {
            navigate('/');
        }
    }, [user, codeFromUrl, navigate]);

    // ── Step 1: Fetch a device code once when the QR tab is shown ────────────
    useEffect(() => {
        if (tab !== 'qr' || codeFromUrl) return;

        // Reset state when entering QR tab
        setDeviceCode(null);
        setQrUrl('');
        deviceCodeRef.current = null;

        let cancelled = false;
        const fetchDeviceCode = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/auth/device/code`, { method: 'POST' });
                if (res.ok && !cancelled) {
                    const data = await res.json();
                    deviceCodeRef.current = data.code;
                    setDeviceCode(data.code);
                    // Derive the web app origin from the API URL so that when
                    // scanned from a phone on the same LAN the link resolves
                    // correctly (avoids "localhost" in the QR which only works
                    // on the same machine).
                    let webOrigin = window.location.origin;
                    try {
                        const apiUrl = new URL(API_BASE);
                        // Replace host with the API server host (same machine)
                        // but keep the web port (5173 in dev, 80/443 in prod).
                        webOrigin = `${window.location.protocol}//${apiUrl.hostname}:${window.location.port || (window.location.protocol === 'https:' ? '443' : '80')}`;
                    } catch {}
                    setQrUrl(`${webOrigin}/login?code=${data.code}`);
                }
            } catch (err) {
                console.error('Errore generazione codice dispositivo:', err);
            }
        };

        fetchDeviceCode();
        return () => { cancelled = true; };
    }, [tab, codeFromUrl]); // Only re-run if tab or codeFromUrl changes

    // ── Step 2: Poll for authorization using the ref (no deviceCode dependency) ─
    useEffect(() => {
        if (tab !== 'qr' || codeFromUrl) return;

        const intervalId = setInterval(async () => {
            const code = deviceCodeRef.current;
            if (!code) return; // Not yet fetched — wait
            try {
                const res = await fetch(`${API_BASE}/api/auth/device/poll/${code}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'authorized' && data.customToken) {
                        clearInterval(intervalId);
                        await loginWithCustomToken(data.customToken);
                        navigate('/');
                    }
                }
            } catch (err) {
                console.error('Errore polling dispositivo:', err);
            }
        }, 2500);

        return () => clearInterval(intervalId);
    }, [tab, codeFromUrl, loginWithCustomToken, navigate]); // deviceCode NOT here

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            // If we have a device code in the URL, don't redirect to home —
            // the useEffect will switch to the "Authorize TV" tab automatically.
            if (!codeFromUrl) navigate('/');
        } catch (err: any) {
            setError(err.message || 'Errore durante l\'accesso. Controlla e-mail e password.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await register(email, password, name);
            // Same: stay on page if there's a device code to authorize.
            if (!codeFromUrl) navigate('/');
        } catch (err: any) {
            setError(err.message || 'Errore durante la registrazione.');
        } finally {
            setLoading(false);
        }
    };

    const handleAuthorizeDevice = async () => {
        if (!user || !codeFromUrl) return;
        setIsAuthorizing(true);
        setError(null);
        try {
            // Force-refresh the token to ensure it's not expired
            const token = await user.getIdToken(true);
            console.log('[Auth] Authorizing device code:', codeFromUrl, 'API:', API_BASE);
            const res = await fetch(`${API_BASE}/api/auth/device/authorize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: codeFromUrl })
            });

            const data = await res.json();
            console.log('[Auth] Authorize response:', res.status, data);

            if (res.ok) {
                setAuthorizeSuccess(true);
                setTimeout(() => navigate('/'), 2000);
            } else {
                setError(data.error || `Errore ${res.status}: autorizzazione fallita.`);
            }
        } catch (err: any) {
            console.error('[Auth] Authorize error:', err);
            setError(err.message || 'Errore di rete durante l\'autorizzazione.');
        } finally {
            setIsAuthorizing(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0d0d0d] flex items-center justify-center overflow-hidden font-sans select-none">
            {/* Ambient Apple TV glow circles */}
            <div className="absolute -top-40 -left-40 w-lg h-128 bg-purple-900/30 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-140 h-140 bg-blue-900/25 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Frosted Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md mx-4 bg-black/60 backdrop-blur-3xl border border-white/12 rounded-[36px] shadow-[0_32px_80px_rgba(0,0,0,0.8)] p-8 overflow-hidden"
            >
                {/* Header Logo & Title */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-4 shadow-lg">
                        <SFIcon icon={sfTv} size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">MovieTheater</h1>
                    <p className="text-white/50 text-xs mt-1 font-medium tracking-wide">
                        L'esperienza streaming definitiva in stile Apple
                    </p>
                </div>

                {/* Mode Selector Tabs (If not authorizing from link) */}
                {!codeFromUrl && (
                    <div className="flex bg-white/8 p-1 rounded-2xl mb-6 border border-white/5">
                        <button
                            onClick={() => { setTab('login'); setError(null); }}
                            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                                tab === 'login'
                                    ? 'bg-white text-black shadow-md font-bold'
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            Accedi
                        </button>
                        <button
                            onClick={() => { setTab('register'); setError(null); }}
                            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                                tab === 'register'
                                    ? 'bg-white text-black shadow-md font-bold'
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            Registrati
                        </button>
                        <button
                            onClick={() => { setTab('qr'); setError(null); }}
                            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                tab === 'qr'
                                    ? 'bg-white text-black shadow-md font-bold'
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            <SFIcon icon={sfQrcode} size={14} />
                            <span>Accedi da TV</span>
                        </button>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs text-center"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Tab Forms */}
                <AnimatePresence mode="wait">
                    {/* ── LOGIN ── */}
                    {tab === 'login' && !codeFromUrl && (
                        <motion.form
                            key="login-form"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleLogin}
                            className="flex flex-col gap-4"
                        >
                            <div className="relative flex items-center">
                                <SFIcon icon={sfEnvelopeFill} size={16} className="absolute left-4 text-white/40" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Indirizzo E-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/8 text-white text-sm pl-11 pr-4 py-3.5 rounded-2xl outline-none border border-white/10 transition-all"
                                />
                            </div>

                            <div className="relative flex items-center">
                                <SFIcon icon={sfLockFill} size={16} className="absolute left-4 text-white/40" />
                                <input
                                    type="password"
                                    required
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/8 text-white text-sm pl-11 pr-4 py-3.5 rounded-2xl outline-none border border-white/10 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                            >
                                {loading ? 'Accordo in corso...' : 'Accedi'}
                            </button>
                        </motion.form>
                    )}

                    {/* ── REGISTER ── */}
                    {tab === 'register' && !codeFromUrl && (
                        <motion.form
                            key="register-form"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleRegister}
                            className="flex flex-col gap-4"
                        >
                            <div className="relative flex items-center">
                                <SFIcon icon={sfPersonFill} size={16} className="absolute left-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Nome completo (opzionale)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/8 text-white text-sm pl-11 pr-4 py-3.5 rounded-2xl outline-none border border-white/10 transition-all"
                                />
                            </div>

                            <div className="relative flex items-center">
                                <SFIcon icon={sfEnvelopeFill} size={16} className="absolute left-4 text-white/40" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Indirizzo E-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/8 text-white text-sm pl-11 pr-4 py-3.5 rounded-2xl outline-none border border-white/10 transition-all"
                                />
                            </div>

                            <div className="relative flex items-center">
                                <SFIcon icon={sfLockFill} size={16} className="absolute left-4 text-white/40" />
                                <input
                                    type="password"
                                    required
                                    placeholder="Crea Password (min. 6 caratteri)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/8 text-white text-sm pl-11 pr-4 py-3.5 rounded-2xl outline-none border border-white/10 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                            >
                                {loading ? 'Creazione profilo...' : 'Crea Account'}
                            </button>
                        </motion.form>
                    )}

                    {/* ── ACCEDI DA TV (QR CODE & DEVICE FLOW) ── */}
                    {tab === 'qr' && !codeFromUrl && (
                        <motion.div
                            key="qr-code-view"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center text-center"
                        >
                            <p className="text-white/70 text-xs mb-4">
                                Scansiona questo codice QR con lo smartphone oppure vai su questa pagina per accedere immediatamente sulla TV.
                            </p>

                            {qrUrl ? (
                                <div className="p-4 bg-white rounded-3xl shadow-xl mb-4 border border-white/20">
                                    <QRCode value={qrUrl} size={160} />
                                </div>
                            ) : (
                                <div className="w-44 h-44 bg-white/10 rounded-3xl flex items-center justify-center mb-4 animate-pulse">
                                    <span className="text-white/40 text-xs">Generazione QR...</span>
                                </div>
                            )}

                            {deviceCode && (
                                <div className="flex flex-col items-center mt-1">
                                    <span className="text-white/40 text-[11px] uppercase tracking-widest font-semibold">
                                        Codice Dispositivo
                                    </span>
                                    <span className="text-2xl font-mono font-bold text-white tracking-widest mt-0.5 px-4 py-1 rounded-xl bg-white/10 border border-white/15">
                                        {deviceCode}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-4 text-white/50 text-xs">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                <span>In attesa di autorizzazione...</span>
                            </div>
                        </motion.div>
                    )}

                    {/* ── AUTHORIZATION FROM PHONE LINK ── */}
                    {codeFromUrl && (
                        <motion.div
                            key="authorize-device"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center text-center py-2"
                        >
                            {authorizeSuccess ? (
                                <div className="flex flex-col items-center py-4">
                                    <SFIcon icon={sfCheckmarkCircleFill} size={48} className="text-emerald-400 mb-3" />
                                    <h3 className="text-lg font-bold text-white">Dispositivo Autorizzato!</h3>
                                    <p className="text-white/60 text-xs mt-1">La tua TV ora è connessa.</p>
                                </div>
                            ) : (
                                <>
                                    <SFIcon icon={sfTv} size={40} className="text-white/80 mb-3" />
                                    <h3 className="text-base font-bold text-white">Autorizza Accesso TV</h3>
                                    <p className="text-white/60 text-xs mt-1 mb-4">
                                        Vuoi autorizzare la TV a registrarsi con il codice <span className="text-white font-mono font-bold">{codeFromUrl}</span>?
                                    </p>

                                    <button
                                        onClick={handleAuthorizeDevice}
                                        disabled={isAuthorizing}
                                        className="w-full py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                                    >
                                        {isAuthorizing ? 'Autorizzazione...' : 'Autorizza TV'}
                                    </button>

                                    <p>{error}</p>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default LoginPage;
