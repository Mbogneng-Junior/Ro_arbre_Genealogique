import React, { useState, useEffect } from 'react';
import './index.css'
// ============================================================================
// COMPOSANTS D'ICÔNES SVG PERSONNALISÉS
// ============================================================================

const TreeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" />
        <path d="m8 11 4 4 4-4" />
        <path d="M8 21v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6" />
    </svg>
);

const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const UsersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="m22 21-3-3" />
        <path d="m16 8 3-3" />
        <circle cx="18" cy="5" r="3" />
    </svg>
);

const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="M12 5v14" />
    </svg>
);

const HeartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
);

const BabyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6" />
        <path d="M9 16h6" />
        <path d="M6.3 3h11.4a1 1 0 0 1 .8 1.6L16 8l2.5 3.4a1 1 0 0 1-.8 1.6H6.3a1 1 0 0 1-.8-1.6L8 8 5.5 4.6A1 1 0 0 1 6.3 3Z" />
    </svg>
);

const LogOutIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16,17 21,12 16,7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const SearchIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
);

const ActivityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

const GitBranchIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
);

const ZapIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
    </svg>
);

const NetworkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6" />
        <path d="m21 12-6-3-6 3-6-3" />
    </svg>
);

const BarChartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
);

// ============================================================================
// CONFIGURATION API
// ============================================================================

const API_BASE_URL = 'http://localhost:8019/api';

// Service API amélioré avec tous les nouveaux endpoints
const apiService = {
    // Auth endpoints
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response.json();
    },

    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return response.json();
    },

    getUserInfo: async (username, token) => {
        const response = await fetch(`${API_BASE_URL}/getUserInfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username })
        });
        return response.json();
    },

    getUserFamilies: async (username, token) => {
        const response = await fetch(`${API_BASE_URL}/userFamilies/${username}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    // Family endpoints
    createFamily: async (familyData) => {
        const response = await fetch(`${API_BASE_URL}/create_family`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(familyData)
        });
        return response.json();
    },

    addMember: async (memberData, token) => {
        const response = await fetch(`${API_BASE_URL}/add_member`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(memberData)
        });
        return response.json();
    },

    getFamilyTree: async (familyId, token) => {
        const response = await fetch(`${API_BASE_URL}/tree/${familyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    findPath: async (pathData, token) => {
        const response = await fetch(`${API_BASE_URL}/find_path`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(pathData)
        });
        return response.json();
    },

    // Nouveaux endpoints pour les algorithmes
    bellmanFord: async (familyId, sourceUsername, token) => {
        const response = await fetch(`${API_BASE_URL}/algorithms/bellman-ford/${familyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sourceUsername })
        });
        return response.json();
    },

    primMST: async (familyId, token) => {
        const response = await fetch(`${API_BASE_URL}/algorithms/prim/${familyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    kruskalMST: async (familyId, token) => {
        const response = await fetch(`${API_BASE_URL}/algorithms/kruskal/${familyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    compareAlgorithms: async (familyId, requestData, token) => {
        const response = await fetch(`${API_BASE_URL}/algorithms/compare/${familyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });
        return response.json();
    },

    performanceAnalysis: async (familyId, requestData, token) => {
        const response = await fetch(`${API_BASE_URL}/algorithms/performance/${familyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });
        return response.json();
    }
};

// ============================================================================
// COMPOSANTS UI
// ============================================================================

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await apiService.login({ email, password });
            if (result.value === '200') {
                onLogin(result.data);
            } else {
                setError(result.text);
            }
        } catch (err) {
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/20">
                <div className="text-center mb-10">
                    <div className="mx-auto h-16 w-16 text-emerald-600 mb-6 animate-pulse">
                        <TreeIcon />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        FamilyTree
                    </h1>
                    <p className="text-gray-600 mt-3 text-lg">Explorez votre héritage familial</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            placeholder="votre@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-4 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-200 font-semibold text-lg transform hover:scale-105"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Connexion...
                            </div>
                        ) : (
                            'Se connecter'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={onSwitchToRegister}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
                    >
                        Créer un compte
                    </button>
                </div>
            </div>
        </div>
    );
};

const RegisterForm = ({ onRegister, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        dateOfBirth: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await apiService.register({
                ...formData,
                dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : null
            });

            if (result.value === '200') {
                onRegister(result.data);
            } else {
                setError(result.text);
            }
        } catch (err) {
            setError('Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 w-full max-w-lg border border-white/20">
                <div className="text-center mb-10">
                    <div className="mx-auto h-16 w-16 text-emerald-600 mb-6 animate-pulse">
                        <UsersIcon />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        Rejoignez-nous
                    </h1>
                    <p className="text-gray-600 mt-3 text-lg">Créez votre arbre généalogique</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date de naissance</label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-4 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-200 font-semibold text-lg transform hover:scale-105"
                    >
                        {loading ? 'Inscription...' : 'S\'inscrire'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={onSwitchToLogin}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
                    >
                        Déjà un compte ? Se connecter
                    </button>
                </div>
            </div>
        </div>
    );
};

const Dashboard = ({ user, onLogout }) => {
    const [families, setFamilies] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [selectedFamily, setSelectedFamily] = useState(null);
    const [familyTree, setFamilyTree] = useState(null);
    const [currentTab, setCurrentTab] = useState('tree');
    const [showCreateFamily, setShowCreateFamily] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [algorithmResults, setAlgorithmResults] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userInfoResult = await apiService.getUserInfo(user.username, user.BearerInfos.Bearer);
            if (userInfoResult.value === '200') {
                setUserInfo(userInfoResult.data);
            }

            const familiesResult = await apiService.getUserFamilies(user.username, user.BearerInfos.Bearer);
            if (familiesResult.value === '200') {
                setFamilies(familiesResult.data);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
        }
    };

    const loadFamilyTree = async (familyId) => {
        try {
            const result = await apiService.getFamilyTree(familyId, user.BearerInfos.Bearer);
            if (result.value === '200') {
                setFamilyTree(result.data);
            }
        } catch (err) {
            console.error('Erreur lors du chargement de l\'arbre:', err);
        }
    };

    const runAlgorithmAnalysis = async () => {
        if (!selectedFamily) return;

        try {
            // Exécuter tous les algorithmes
            const [primResult, kruskalResult, performanceResult] = await Promise.all([
                apiService.primMST(selectedFamily.id, user.BearerInfos.Bearer),
                apiService.kruskalMST(selectedFamily.id, user.BearerInfos.Bearer),
                apiService.performanceAnalysis(selectedFamily.id, {
                    sourceUsername: user.username,
                    targetUsername: user.username
                }, user.BearerInfos.Bearer)
            ]);

            setAlgorithmResults({
                prim: primResult.data,
                kruskal: kruskalResult.data
            });
            setPerformanceData(performanceResult.data);
        } catch (err) {
            console.error('Erreur lors de l\'analyse algorithmique:', err);
        }
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setCurrentTab(id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentTab === id
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
        >
            <Icon />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header amélioré */}
            <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                            <div className="h-10 w-10 text-emerald-600 mr-4">
                                <TreeIcon />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                    FamilyTree
                                </h1>
                                <p className="text-sm text-gray-500">Votre héritage familial</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-2">
                                <div className="h-8 w-8 text-gray-600">
                                    <UserIcon />
                                </div>
                                <div>
                  <span className="text-sm font-medium text-gray-700">
                    {userInfo?.firstName} {userInfo?.lastName}
                  </span>
                                    <p className="text-xs text-gray-500">@{user.username}</p>
                                </div>
                            </div>
                            <button
                                onClick={onLogout}
                                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                            >
                                <div className="h-5 w-5">
                                    <LogOutIcon />
                                </div>
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar amélioré */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Mes Familles</h2>
                                <button
                                    onClick={() => setShowCreateFamily(true)}
                                    className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                >
                                    <div className="h-5 w-5">
                                        <PlusIcon />
                                    </div>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {families.map((family) => (
                                    <div
                                        key={family.id}
                                        onClick={() => {
                                            setSelectedFamily(family);
                                            loadFamilyTree(family.id);
                                        }}
                                        className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                                            selectedFamily?.id === family.id
                                                ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-blue-50 shadow-lg'
                                                : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                                                {family.familyName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{family.familyName}</h3>
                                                <p className="text-sm text-gray-600 flex items-center">
                                                    <div className="h-4 w-4 mr-1">
                                                        <UsersIcon />
                                                    </div>
                                                    {family.numberOfMembers} membres
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {families.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                                        <UsersIcon />
                                    </div>
                                    <p className="text-gray-600 font-medium">Aucune famille trouvée</p>
                                    <p className="text-sm text-gray-500 mt-2">Créez votre première famille</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content amélioré */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                            {selectedFamily ? (
                                <>
                                    {/* En-tête de la famille */}
                                    <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-6 text-white">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2">
                                                    Famille {selectedFamily.familyName}
                                                </h2>
                                                <p className="text-emerald-100">
                                                    {selectedFamily.numberOfMembers} membres • Explorez les relations
                                                </p>
                                            </div>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => setShowAddMember(true)}
                                                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
                                                >
                                                    <div className="h-4 w-4">
                                                        <PlusIcon />
                                                    </div>
                                                    <span>Ajouter</span>
                                                </button>
                                                <button
                                                    onClick={() => setShowSearchModal(true)}
                                                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
                                                >
                                                    <div className="h-4 w-4">
                                                        <SearchIcon />
                                                    </div>
                                                    <span>Rechercher</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Onglets de navigation */}
                                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-200">
                                        <div className="flex space-x-4 overflow-x-auto">
                                            <TabButton id="tree" label="Arbre Généalogique" icon={TreeIcon} />
                                            <TabButton id="algorithms" label="Algorithmes" icon={NetworkIcon} />
                                            <TabButton id="performance" label="Performance" icon={BarChartIcon} />
                                            <TabButton id="analysis" label="Analyse" icon={ActivityIcon} />
                                        </div>
                                    </div>

                                    {/* Contenu des onglets */}
                                    <div className="p-6">
                                        {currentTab === 'tree' && (
                                            <div>
                                                {familyTree ? (
                                                    <FamilyTreeView tree={familyTree} />
                                                ) : (
                                                    <div className="text-center py-16">
                                                        <div className="mx-auto h-20 w-20 text-gray-400 mb-6 animate-pulse">
                                                            <TreeIcon />
                                                        </div>
                                                        <p className="text-gray-600 text-lg">Chargement de l'arbre généalogique...</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {currentTab === 'algorithms' && (
                                            <AlgorithmsTab
                                                selectedFamily={selectedFamily}
                                                user={user}
                                                algorithmResults={algorithmResults}
                                                onRunAnalysis={runAlgorithmAnalysis}
                                            />
                                        )}

                                        {currentTab === 'performance' && (
                                            <PerformanceTab
                                                performanceData={performanceData}
                                                onRunAnalysis={runAlgorithmAnalysis}
                                            />
                                        )}

                                        {currentTab === 'analysis' && (
                                            <AnalysisTab
                                                selectedFamily={selectedFamily}
                                                algorithmResults={algorithmResults}
                                            />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
                                        <TreeIcon />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                        Sélectionnez une famille
                                    </h3>
                                    <p className="text-gray-500">
                                        Choisissez une famille dans la liste pour explorer son arbre généalogique
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showCreateFamily && (
                <CreateFamilyModal
                    username={user.username}
                    onClose={() => setShowCreateFamily(false)}
                    onCreated={() => {
                        setShowCreateFamily(false);
                        loadUserData();
                    }}
                />
            )}

            {showAddMember && selectedFamily && (
                <AddMemberModal
                    familyId={selectedFamily.id}
                    token={user.BearerInfos.Bearer}
                    onClose={() => setShowAddMember(false)}
                    onAdded={() => {
                        setShowAddMember(false);
                        loadFamilyTree(selectedFamily.id);
                    }}
                />
            )}

            {showSearchModal && selectedFamily && (
                <SearchModal
                    familyId={selectedFamily.id}
                    token={user.BearerInfos.Bearer}
                    onClose={() => setShowSearchModal(false)}
                />
            )}
        </div>
    );
};

// ============================================================================
// COMPOSANT ARBRE GÉNÉALOGIQUE AMÉLIORÉ
// ============================================================================

const FamilyTreeView = ({ tree }) => {
    const renderNode = (node, level = 0) => {
        return (
            <div key={node.id} className={`flex flex-col items-center ${level > 0 ? 'ml-8' : ''} animate-fadeIn`}>
                {/* Nœud principal avec animation */}
                <div className="relative group">
                    <div className="bg-white border-2 border-emerald-400 rounded-2xl p-6 shadow-xl min-w-[240px] text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-emerald-500">
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative">
                                <img
                                    src={`${API_BASE_URL}/profile/${node.username}`}
                                    alt={node.name}
                                    className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-100 shadow-lg"
                                    onError={(e) => {
                                        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgb(16 185 129)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
                                    }}
                                />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {level === 0 ? '👑' : level === 1 ? '👨' : '👶'}
                  </span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{node.name}</h3>
                            <p className="text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                                @{node.username}
                            </p>
                        </div>
                    </div>

                    {/* Partenaires avec cœurs animés */}
                    {node.partners && node.partners.length > 0 && (
                        <div className="flex items-center mt-6 justify-center">
                            <div className="h-6 w-6 text-red-500 mx-3 animate-pulse">
                                <HeartIcon />
                            </div>
                            <div className="flex space-x-3">
                                {node.partners.map((partner) => (
                                    <div key={partner.id} className="bg-gradient-to-r from-pink-50 to-red-50 border-2 border-pink-200 rounded-xl p-4 text-center transform hover:scale-105 transition-all duration-200 shadow-lg">
                                        <p className="text-sm font-semibold text-gray-800">{partner.name}</p>
                                        <p className="text-xs text-gray-600">@{partner.username}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Ligne de connexion animée */}
                {node.childrens && node.childrens.length > 0 && (
                    <div className="mt-8">
                        <div className="flex justify-center mb-6">
                            <div className="h-6 w-6 text-blue-500 animate-bounce">
                                <BabyIcon />
                            </div>
                        </div>
                        <div className="relative">
                            {/* Ligne de connexion */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 to-blue-400"></div>
                            <div className="flex flex-wrap justify-center gap-8 pt-8">
                                {node.childrens.map((child) => renderNode(child, level + 1))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="overflow-auto p-6">
            <div className="flex flex-col items-center space-y-12">
                {tree && tree.map((rootNode) => renderNode(rootNode))}
            </div>
        </div>
    );
};

// ============================================================================
// COMPOSANT ONGLET ALGORITHMES
// ============================================================================

const AlgorithmsTab = ({ selectedFamily, user, algorithmResults, onRunAnalysis }) => {
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('prim');
    const [sourceUser, setSourceUser] = useState('');
    const [targetUser, setTargetUser] = useState('');
    const [algorithmResult, setAlgorithmResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const runSpecificAlgorithm = async (algorithm) => {
        setLoading(true);
        try {
            let result;
            switch (algorithm) {
                case 'bellman-ford':
                    result = await apiService.bellmanFord(selectedFamily.id, sourceUser, user.BearerInfos.Bearer);
                    break;
                case 'prim':
                    result = await apiService.primMST(selectedFamily.id, user.BearerInfos.Bearer);
                    break;
                case 'kruskal':
                    result = await apiService.kruskalMST(selectedFamily.id, user.BearerInfos.Bearer);
                    break;
                default:
                    return;
            }
            setAlgorithmResult(result.data);
        } catch (err) {
            console.error('Erreur lors de l\'exécution de l\'algorithme:', err);
        } finally {
            setLoading(false);
        }
    };

    const AlgorithmCard = ({ id, title, description, icon: Icon, color }) => (
        <div
            onClick={() => setSelectedAlgorithm(id)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                selectedAlgorithm === id
                    ? `border-${color}-500 bg-${color}-50 shadow-lg`
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
            }`}
        >
            <div className="flex items-center space-x-4">
                <div className={`h-12 w-12 text-${color}-500`}>
                    <Icon />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Sélection d'algorithme */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Choisissez un algorithme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AlgorithmCard
                        id="bellman-ford"
                        title="Bellman-Ford"
                        description="Détection de cycles négatifs"
                        icon={ZapIcon}
                        color="yellow"
                    />
                    <AlgorithmCard
                        id="prim"
                        title="Prim MST"
                        description="Arbre couvrant minimal"
                        icon={NetworkIcon}
                        color="green"
                    />
                    <AlgorithmCard
                        id="kruskal"
                        title="Kruskal MST"
                        description="Partitionnement en sous-familles"
                        icon={GitBranchIcon}
                        color="blue"
                    />
                </div>
            </div>

            {/* Paramètres */}
            {selectedAlgorithm === 'bellman-ford' && (
                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <h4 className="font-bold text-gray-900 mb-4">Paramètres Bellman-Ford</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Utilisateur source
                            </label>
                            <input
                                type="text"
                                value={sourceUser}
                                onChange={(e) => setSourceUser(e.target.value)}
                                placeholder="Nom d'utilisateur"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Bouton d'exécution */}
            <div className="text-center">
                <button
                    onClick={() => runSpecificAlgorithm(selectedAlgorithm)}
                    disabled={loading || (selectedAlgorithm === 'bellman-ford' && !sourceUser)}
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
                >
                    {loading ? (
                        <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Exécution...
                        </div>
                    ) : (
                        `Exécuter ${selectedAlgorithm}`
                    )}
                </button>
            </div>

            {/* Résultats */}
            {algorithmResult && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Résultats</h4>
                    <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-auto">
            {JSON.stringify(algorithmResult, null, 2)}
          </pre>
                </div>
            )}

            {/* Analyse globale */}
            <div className="text-center">
                <button
                    onClick={onRunAnalysis}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                    Analyse complète de tous les algorithmes
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// COMPOSANT ONGLET PERFORMANCE
// ============================================================================

const PerformanceTab = ({ performanceData, onRunAnalysis }) => {
    if (!performanceData) {
        return (
            <div className="text-center py-16">
                <div className="mx-auto h-20 w-20 text-gray-400 mb-6">
                    <BarChartIcon />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-4">
                    Analyse de Performance
                </h3>
                <p className="text-gray-500 mb-6">
                    Exécutez une analyse pour voir les performances des algorithmes
                </p>
                <button
                    onClick={onRunAnalysis}
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                    Lancer l'analyse
                </button>
            </div>
        );
    }

    const PerformanceCard = ({ algorithm, time, color }) => (
        <div className={`bg-${color}-50 border border-${color}-200 rounded-xl p-6`}>
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{algorithm}</h4>
                <div className={`text-${color}-600 font-bold text-lg`}>
                    {time?.toFixed(2)} ms
                </div>
            </div>
            <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`bg-${color}-500 h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${Math.min((time / Math.max(...Object.values(performanceData))) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Performance des Algorithmes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <PerformanceCard
                        algorithm="Dijkstra"
                        time={performanceData.dijkstraTime}
                        color="blue"
                    />
                    <PerformanceCard
                        algorithm="Bellman-Ford"
                        time={performanceData.bellmanTime}
                        color="red"
                    />
                    <PerformanceCard
                        algorithm="Prim"
                        time={performanceData.primTime}
                        color="green"
                    />
                    <PerformanceCard
                        algorithm="Kruskal"
                        time={performanceData.kruskalTime}
                        color="yellow"
                    />
                </div>
            </div>

            {/* Graphique simple avec CSS */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">Comparaison Visuelle</h4>
                <div className="space-y-4">
                    {Object.entries(performanceData).map(([key, value]) => {
                        if (key.includes('Time')) {
                            const algorithm = key.replace('Time', '').replace(/([A-Z])/g, ' $1').trim();
                            const percentage = (value / Math.max(...Object.values(performanceData))) * 100;
                            return (
                                <div key={key} className="flex items-center space-x-4">
                                    <div className="w-24 text-sm font-medium text-gray-700">
                                        {algorithm}
                                    </div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                                        <div
                                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-4 rounded-full transition-all duration-1000"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-20 text-sm text-gray-600">
                                        {value?.toFixed(2)} ms
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// COMPOSANT ONGLET ANALYSE
// ============================================================================

const AnalysisTab = ({ selectedFamily, algorithmResults }) => {
    if (!algorithmResults) {
        return (
            <div className="text-center py-16">
                <div className="mx-auto h-20 w-20 text-gray-400 mb-6">
                    <ActivityIcon />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-4">
                    Analyse Familiale
                </h3>
                <p className="text-gray-500">
                    Exécutez d'abord une analyse algorithmique pour voir les résultats
                </p>
            </div>
        );
    }

    const { prim, kruskal } = algorithmResults;

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Analyse Structurelle</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Analyse Prim */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <h4 className="font-bold text-green-800 mb-4 flex items-center">
                            <NetworkIcon className="mr-2" />
                            Connexion Minimale (Prim)
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-700">Arêtes nécessaires:</span>
                                <span className="font-semibold">{prim?.mstEdges?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Poids total:</span>
                                <span className="font-semibold">{prim?.totalWeight || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Famille connectée:</span>
                                <span className={`font-semibold ${prim?.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {prim?.isConnected ? 'Oui' : 'Non'}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Analyse Kruskal */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h4 className="font-bold text-blue-800 mb-4 flex items-center">
                            <GitBranchIcon className="mr-2" />
                            Sous-Familles (Kruskal)
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-700">Nombre de branches:</span>
                                <span className="font-semibold">{kruskal?.numberOfSubFamilies || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Poids total MST:</span>
                                <span className="font-semibold">{kruskal?.totalWeight || 0}</span>
                            </div>
                        </div>

                        {kruskal?.subFamilies && (
                            <div className="mt-4">
                                <h5 className="font-medium text-gray-700 mb-2">Composition des branches:</h5>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {Object.entries(kruskal.subFamilies).map(([root, members], index) => (
                                        <div key={root} className="text-sm">
                                            <span className="font-medium text-blue-700">Branche {index + 1}:</span>
                                            <span className="text-gray-600 ml-2">
                        {Array.isArray(members) ? members.join(', ') : 'Aucun membre'}
                      </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recommandations */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <h4 className="font-bold text-purple-800 mb-4">Recommandations</h4>
                <div className="space-y-3 text-sm">
                    {prim?.isConnected ? (
                        <p className="text-green-700">✅ Votre famille est parfaitement connectée!</p>
                    ) : (
                        <p className="text-red-700">⚠️ Certains membres semblent isolés. Vérifiez les relations.</p>
                    )}

                    {kruskal?.numberOfSubFamilies > 1 && (
                        <p className="text-blue-700">
                            🌳 Votre famille comprend {kruskal.numberOfSubFamilies} branches distinctes.
                            Considérez organiser des réunions par branche.
                        </p>
                    )}

                    <p className="text-purple-700">
                        💡 Le poids total de connexion est de {prim?.totalWeight || 0}.
                        Plus ce nombre est faible, plus votre famille est étroitement liée.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MODALS AMÉLIORÉS
// ============================================================================

const CreateFamilyModal = ({ username, onClose, onCreated }) => {
    const [familyName, setFamilyName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await apiService.createFamily({
                familyName,
                description,
                username,
                familyMembers: []
            });

            if (result.value === '200') {
                onCreated();
            }
        } catch (err) {
            console.error('Erreur lors de la création de la famille:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-6">
                    Créer une nouvelle famille
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Nom de la famille
                        </label>
                        <input
                            type="text"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            placeholder="Famille Martin"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Description (optionnel)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            placeholder="Une famille unie depuis des générations..."
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-200 font-semibold"
                        >
                            {loading ? 'Création...' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddMemberModal = ({ familyId, token, onClose, onAdded }) => {
    const [formData, setFormData] = useState({
        sourceUsername: '',
        targetUser: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            dateOfBirth: ''
        },
        poid: 1
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await apiService.addMember({
                ...formData,
                familyId,
                targetUser: {
                    ...formData.targetUser,
                    dateOfBirth: formData.targetUser.dateOfBirth ?
                        new Date(formData.targetUser.dateOfBirth).toISOString().split('T')[0] : null
                }
            }, token);

            if (result.value === '200') {
                onAdded();
            }
        } catch (err) {
            console.error('Erreur lors de l\'ajout du membre:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-6">
                    Ajouter un membre à la famille
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Membre existant (qui ajoute)
                            </label>
                            <input
                                type="text"
                                value={formData.sourceUsername}
                                onChange={(e) => setFormData({...formData, sourceUsername: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                placeholder="Nom d'utilisateur"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Type de relation
                            </label>
                            <select
                                value={formData.poid}
                                onChange={(e) => setFormData({...formData, poid: parseInt(e.target.value)})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                            >
                                <option value={1}>Parent-Enfant</option>
                                <option value={0}>Partenaire/Conjoint</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-semibold text-gray-900 mb-6 flex items-center">
                            <div className="h-5 w-5 mr-2 text-emerald-500">
                                <UserIcon />
                            </div>
                            Informations du nouveau membre
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
                                <input
                                    type="text"
                                    value={formData.targetUser.firstName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        targetUser: {...formData.targetUser, firstName: e.target.value}
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                                <input
                                    type="text"
                                    value={formData.targetUser.lastName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        targetUser: {...formData.targetUser, lastName: e.target.value}
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.targetUser.email}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    targetUser: {...formData.targetUser, email: e.target.value}
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mot de passe (optionnel)
                                </label>
                                <input
                                    type="password"
                                    value={formData.targetUser.password}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        targetUser: {...formData.targetUser, password: e.target.value}
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                    placeholder="Laissez vide pour défaut"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Date de naissance (optionnel)
                                </label>
                                <input
                                    type="date"
                                    value={formData.targetUser.dateOfBirth}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        targetUser: {...formData.targetUser, dateOfBirth: e.target.value}
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-200 font-semibold"
                        >
                            {loading ? 'Ajout...' : 'Ajouter le membre'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SearchModal = ({ familyId, token, onClose }) => {
    const [sourceUser, setSourceUser] = useState('');
    const [targetUser, setTargetUser] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!sourceUser || !targetUser) return;

        setLoading(true);
        try {
            const result = await apiService.findPath({
                familyId,
                usernameSource: sourceUser,
                usernameTarget: targetUser
            }, token);

            setSearchResult(result.data);
        } catch (err) {
            console.error('Erreur lors de la recherche:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        Rechercher un lien de parenté
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Premier utilisateur
                            </label>
                            <input
                                type="text"
                                value={sourceUser}
                                onChange={(e) => setSourceUser(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                placeholder="Nom d'utilisateur source"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Deuxième utilisateur
                            </label>
                            <input
                                type="text"
                                value={targetUser}
                                onChange={(e) => setTargetUser(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                                placeholder="Nom d'utilisateur cible"
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleSearch}
                            disabled={loading || !sourceUser || !targetUser}
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Recherche...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <div className="h-5 w-5 mr-2">
                                        <SearchIcon />
                                    </div>
                                    Trouver le lien
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Résultats de recherche */}
                    {searchResult && (
                        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                <div className="h-5 w-5 mr-2 text-emerald-500">
                                    <ZapIcon />
                                </div>
                                Chemin trouvé
                            </h3>

                            {Array.isArray(searchResult) && searchResult.length > 0 ? (
                                <div className="space-y-3">
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Distance:</span> {searchResult.length - 1} degré(s) de parenté
                                    </p>

                                    <div className="flex items-center space-x-2 overflow-x-auto py-2">
                                        {searchResult.map((person, index) => (
                                            <React.Fragment key={person.id}>
                                                <div className="bg-white rounded-lg p-3 shadow-md min-w-[120px] text-center">
                                                    <p className="font-medium text-gray-900 text-sm">{person.name}</p>
                                                    <p className="text-xs text-gray-600">@{person.username}</p>
                                                </div>
                                                {index < searchResult.length - 1 && (
                                                    <div className="text-emerald-500 font-bold">→</div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-600">Aucun lien trouvé entre ces deux personnes.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// COMPOSANT PRINCIPAL DE L'APPLICATION
// ============================================================================

const App = () => {
    const [currentView, setCurrentView] = useState('login');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Vérifier si l'utilisateur est déjà connecté
        const savedUser = localStorage.getItem('familyTreeUser');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                // Vérifier si le token n'est pas expiré (simple vérification)
                if (userData.BearerInfos && userData.BearerInfos.ExpireAt) {
                    const expireDate = new Date(userData.BearerInfos.ExpireAt);
                    if (expireDate > new Date()) {
                        setUser(userData);
                        setCurrentView('dashboard');
                    } else {
                        localStorage.removeItem('familyTreeUser');
                    }
                }
            } catch (err) {
                localStorage.removeItem('familyTreeUser');
            }
        }
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('familyTreeUser', JSON.stringify(userData));
        setCurrentView('dashboard');
    };

    const handleRegister = (userData) => {
        // Après inscription, afficher un message de succès et basculer vers login
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setCurrentView('login');
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('familyTreeUser');
        setCurrentView('login');
    };

    if (currentView === 'login') {
        return (
            <LoginForm
                onLogin={handleLogin}
                onSwitchToRegister={() => setCurrentView('register')}
            />
        );
    }

    if (currentView === 'register') {
        return (
            <RegisterForm
                onRegister={handleRegister}
                onSwitchToLogin={() => setCurrentView('login')}
            />
        );
    }

    if (currentView === 'dashboard' && user) {
        return (
            <Dashboard
                user={user}
                onLogout={handleLogout}
            />
        );
    }

    return null;
};

// ============================================================================
// STYLES CSS ADDITIONNELS (à ajouter dans une balise <style>)
// ============================================================================

const additionalStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-5px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(5px);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out;
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }

  /* Scrollbar personnalisée */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #10b981, #3b82f6);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #059669, #2563eb);
  }

  /* Effet de verre */
  .glass-effect {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
`;

// Ajouter les styles au head du document
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = additionalStyles;
    document.head.appendChild(styleElement);
}

export default App;