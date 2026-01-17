'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import styles from './challenges.module.css';

export default function FreelancerChallengesPage() {

    // --- ESTADOS DE DATOS ---
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [myChallenges, setMyChallenges] = useState([]); // Historial
    const [availableChallenges, setAvailableChallenges] = useState([]); // Catálogo

    // --- ESTADOS DE UI/QUIZ ---
    const [view, setView] = useState('list'); // 'list' | 'quiz'
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});

    // --- ALERTAS ---
    const [successMessage, setSuccessMessage] = useState(null);

    const supabase = createClient();

    // 1. CARGA INICIAL
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                // Revisar si veníamos de un login con datos pendientes
                await checkPendingResults(user.id);
                // Cargar datos
                await loadData(user.id);
            }
            setLoading(false);
        };
        init();
    }, []);

    // Función auxiliar para recargar todo
    const loadData = async (userId) => {
        await Promise.all([
            fetchUserChallenges(userId),
            fetchAvailableChallenges()
        ]);
    };

    // --- LÓGICA DE DATOS ---
    const checkPendingResults = async (userId) => {
        if (typeof window === 'undefined') return;
        const pending = localStorage.getItem('pending_challenge_result');
        if (pending) {
            try {
                const result = JSON.parse(pending);
                const { error } = await supabase.from('user_challenges').insert({
                    user_id: userId,
                    challenge_id: result.challengeId,
                    score: result.score,
                    status: result.score >= 70 ? 'approved' : 'failed',
                    completed_at: new Date()
                });
                if (!error) {
                    setSuccessMessage("¡Resultado pendiente guardado correctamente!");
                    localStorage.removeItem('pending_challenge_result');
                }
            } catch (e) { console.error(e); }
        }
    };

    const fetchUserChallenges = async (userId) => {
        const { data } = await supabase
            .from('user_challenges')
            .select('*, challenges(title, difficulty)')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });
        setMyChallenges(data || []);
    };

    const fetchAvailableChallenges = async () => {
        // Traemos todos los desafíos disponibles
        const { data } = await supabase
            .from('challenges')
            .select('id, title, description, difficulty');
        setAvailableChallenges(data || []);
    };

    // --- LÓGICA DEL QUIZ (Iniciar, Responder, Terminar) ---
    const startChallenge = async (challenge) => {
        setSuccessMessage(null); // Limpiar mensajes previos
        setCurrentChallenge(challenge);

        // Cargar preguntas
        const { data: qData } = await supabase
            .from('challenge_questions')
            .select(`id, question_text, points, challenge_options (id, option_text)`)
            .eq('challenge_id', challenge.id)
            .order('order_index', { ascending: true });

        if (qData && qData.length > 0) {
            setQuestions(qData);
            setAnswers({});
            setCurrentQIndex(0);
            setView('quiz');
        } else {
            alert("Este desafío está en mantenimiento.");
        }
    };

    const handleOptionSelect = (qId, optionId) => {
        setAnswers(prev => ({ ...prev, [qId]: optionId }));
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        setLoading(true);
        // 1. Calcular Puntaje
        const { data: correctData } = await supabase
            .from('challenge_options')
            .select('id, question_id')
            .eq('is_correct', true)
            .in('question_id', questions.map(q => q.id));

        let totalScore = 0;
        let maxScore = questions.length * 10; // Asumimos 10 ptos por preg

        if (correctData) {
            questions.forEach(q => {
                const userAnsId = answers[q.id];
                const correctOption = correctData.find(c => c.question_id === q.id);
                if (correctOption?.id === userAnsId) totalScore += 10;
            });
        }

        // 2. Guardar Directamente en DB (Sin localstorage, sin login)
        const status = totalScore >= (maxScore * 0.7) ? 'approved' : 'failed';

        const { error } = await supabase.from('user_challenges').insert({
            user_id: user.id,
            challenge_id: currentChallenge.id,
            score: totalScore,
            status: status,
            completed_at: new Date()
        });

        if (!error) {
            await fetchUserChallenges(user.id); // Recargar historial
            setSuccessMessage(`Has completado el desafío: ${currentChallenge.title}. Puntaje: ${totalScore}/${maxScore}`);
            setView('list'); // Volver al dashboard
        } else {
            alert("Error guardando el resultado. Intenta de nuevo.");
        }
        setLoading(false);
    };


    // --- RENDERIZADO ---
    if (loading && view === 'list') return <div className={styles.container}>Cargando...</div>;

    const activeQuestion = questions[currentQIndex];

    return (
        <div className={styles.container}>

            {/* VISTA 1: LISTADO (Mis Certs + Explorar) */}
            {view === 'list' && (
                <>
                    {/* Header */}
                    <div className={styles.header}>
                        <h1 className={styles.title}>Mis Certificaciones</h1>
                        <p className={styles.subtitle}>Gestiona tus logros y demuestra tu talento.</p>
                    </div>

                    {/* Alerta Éxito */}
                    {successMessage && (
                        <div className={styles.successAlert}>
                            <div className={styles.successIcon}>✓</div>
                            <div className={styles.successContent}>
                                <h4>¡Excelente!</h4>
                                <p>{successMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* HISTORIAL */}
                    <div className={styles.grid1}>
                        {myChallenges.length === 0 ? (
                            <div className={styles.emptyState}>No has realizado ningún desafío aún.</div>
                        ) : (
                            myChallenges.map((item) => (
                                <div key={item.id} className={styles.card1}>
                                    <div className={styles.card1Info}>
                                        <h3>{item.challenges?.title}</h3>
                                        <div className={styles.tags}>
                                            <span className={`${styles.badge} ${item.status === 'approved' ? styles.badgeApproved : styles.badgeFailed}`}>
                                                {item.status === 'approved' ? 'APROBADO' : 'INTENTADO'}
                                            </span>
                                            <span className={styles.date}>{new Date(item.completed_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className={styles.scoreCol}>
                                        <span className={styles.scoreValue}>{item.score} pts</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                <div className={styles.exploreSection}></div>        
                    <div className={styles.grid}>
                        {availableChallenges.map(ch => (
                            <div key={ch.id} className={styles.card}>

                                {/* CABECERA (Icono y Título) */}
                                <div className={styles.cardHeader}>
                                    <div className={styles.iconBox}>
                                        {/* SVG de Código reutilizado */}
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                                    </div>
                                    <div className={styles.cardTitleGroup}>
                                        <h3 className={styles.cardTitle}>{ch.title}</h3>
                                        <span className={styles.cardCategory}>Tecnología</span>
                                    </div>
                                </div>

                                {/* DESCRIPCIÓN */}
                                <p className={styles.cardDesc}>
                                    {ch.description || 'Evalúa tus conocimientos técnicos.'}
                                </p>

                                {/* ETIQUETAS */}
                                <div className={styles.tagsWrapper}>
                                    <span className={styles.tag}>Oficial</span>
                                    <span className={styles.tag}>{ch.difficulty || 'General'}</span>
                                </div>

                                {/* FOOTER (Meta y Botón) */}
                                <div className={styles.cardFooter}>
                                    <div className={styles.cardMeta}>
                                        <div className={styles.metaItem}>
                                            {/* Icono Reloj */}
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            15m
                                        </div>
                                    </div>
                                    <button onClick={() => startChallenge(ch)} className={styles.btnStart}>
                                        Iniciar
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* VISTA 2: QUIZ ACTIVO */}
            {view === 'quiz' && activeQuestion && (
                <div className={styles.quizWrapper}>
                    <div className={styles.quizCard}>
                        {/* Barra Progreso */}
                        <div className={styles.progressContainer}>
                            <div className={styles.progressLabel}>
                                <span>Pregunta {currentQIndex + 1} / {questions.length}</span>
                                <span>{Math.round(((currentQIndex + 1) / questions.length) * 100)}%</span>
                            </div>
                            <div className={styles.track}>
                                <div className={styles.fill} style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
                            </div>
                        </div>

                        {/* Pregunta */}
                        <h2 className={styles.questionText}>{activeQuestion.question_text}</h2>

                        {/* Opciones */}
                        <div className={styles.optionsList}>
                            {activeQuestion.challenge_options?.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleOptionSelect(activeQuestion.id, opt.id)}
                                    className={answers[activeQuestion.id] === opt.id ? styles.optionSelected : styles.optionBtn}
                                >
                                    {opt.option_text}
                                </button>
                            ))}
                        </div>

                        {/* Footer Quiz */}
                        <div className={styles.quizFooter}>
                            <button onClick={() => setView('list')} className={styles.btnCancel}>Cancelar</button>
                            <button onClick={handleNext} className={styles.btnStart} style={{ width: 'auto', padding: '12px 30px' }}>
                                {currentQIndex === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}