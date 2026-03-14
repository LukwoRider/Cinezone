import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import "../styles/Reviews.css";

const API = "http://localhost:3000/reviews";

function ReviewSection({ movieId, onReviewChange }) {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formRating, setFormRating] = useState(0);
    const [formComment, setFormComment] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchReviews = () => {
        fetch(`${API}/${movieId}`)
            .then((res) => res.json())
            .then((data) => setReviews(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchReviews();
    }, [movieId]);

    const existingReview = user
        ? reviews.find((r) => r.user_id === user.id)
        : null;
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formRating === 0) {
            alert("Veuillez sélectionner une note");
            return;
        }

        if (!formComment.trim()) {
            alert("Veuillez écrire un commentaire");
            return;
        }

        setSubmitting(true);

        try {
            const isEdit = editingId !== null;

            const res = await fetch(
                isEdit ? `${API}/${editingId}` : API,
                {
                    method: isEdit ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        movieId: Number(movieId),
                        rating: formRating,
                        comment: formComment.trim(),
                    }),
                }
            );

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Erreur lors de l'envoi");
                return;
            }

            setFormRating(0);
            setFormComment("");
            setEditingId(null);
            fetchReviews();
            if (onReviewChange) onReviewChange();
        } catch (err) {
            console.error(err);
            alert("Erreur réseau");
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (review) => {
        setEditingId(review.id);
        setFormRating(review.rating);
        setFormComment(review.comment);
        document
            .querySelector(".review-form")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormRating(0);
        setFormComment("");
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Supprimer votre avis ?")) return;

        try {
            const res = await fetch(`${API}/${reviewId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Erreur lors de la suppression");
                return;
            }

            fetchReviews();
            if (onReviewChange) onReviewChange();
        } catch (err) {
            console.error(err);
        }
    };

    const renderStarSelector = () => (
        <div className="star-selector">
            {[...Array(10)].map((_, i) => {
                const starValue = i + 1;
                return (
                    <button
                        type="button"
                        key={starValue}
                        className={`star-btn ${starValue <= (hoverRating || formRating) ? "filled" : ""}`}
                        onClick={() => setFormRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        <FaStar />
                    </button>
                );
            })}
            {formRating > 0 && (
                <span style={{ color: "var(--incon-star)", marginLeft: 8, fontWeight: 600 }}>
                    {formRating}/10
                </span>
            )}
        </div>
    );

    const renderStars = (rating) => (
        <div className="review-stars">
            {[...Array(10)].map((_, i) => (
                <FaStar
                    key={i}
                    className={`star-icon ${i < Math.round(rating) ? "filled" : "empty"}`}
                />
            ))}
            <span style={{ color: "var(--incon-star)", marginLeft: 6, fontWeight: 600, fontSize: "0.85rem" }}>
                {rating}/10
            </span>
        </div>
    );

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getInitials = (firstname, lastname) => {
        return `${(firstname || "")[0] || ""}${(lastname || "")[0] || ""}`.toUpperCase();
    };

    if (loading) return null;

    const showForm = user && (!existingReview || editingId !== null);

    return (
        <div className="reviews-section">
            <h2>Avis ({reviews.length})</h2>

            {!user && (
                <div className="login-prompt">
                    <p>Connectez-vous pour donner votre avis</p>
                    <Link to="/login">Se connecter</Link>
                </div>
            )}

            {showForm && (
                <form className="review-form" onSubmit={handleSubmit}>
                    <h3>{editingId ? "Modifier votre avis" : "Donner votre avis"}</h3>

                    {renderStarSelector()}

                    <textarea
                        placeholder="Partagez votre avis sur ce film..."
                        value={formComment}
                        onChange={(e) => setFormComment(e.target.value)}
                    />

                    <div className="review-form-actions">
                        <button
                            type="submit"
                            className="review-submit-btn"
                            disabled={submitting}
                        >
                            {submitting
                                ? "Envoi..."
                                : editingId
                                    ? "Modifier"
                                    : "Envoyer"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="review-cancel-btn"
                                onClick={cancelEdit}
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </form>
            )}

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <p className="no-reviews">Aucun avis pour le moment. Soyez le premier !</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="review-author">
                                    {review.avatar ? (
                                        <img
                                            src={`http://localhost:3000${review.avatar}`}
                                            alt="Avatar"
                                            className="review-avatar-img"
                                        />
                                    ) : (
                                        <div className="review-avatar">
                                            {getInitials(review.firstname, review.lastname)}
                                        </div>
                                    )}
                                    <div>
                                        <div className="review-author-name">
                                            {review.firstname} {review.lastname}
                                        </div>
                                        <div className="review-date">{formatDate(review.created_at)}</div>
                                    </div>
                                </div>
                            </div>

                            {renderStars(review.rating)}

                            <p className="review-comment">{review.comment}</p>

                            {user && user.id === review.user_id && editingId !== review.id && (
                                <div className="review-actions">
                                    <button
                                        className="review-edit-btn"
                                        onClick={() => startEdit(review)}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        className="review-delete-btn"
                                        onClick={() => handleDelete(review.id)}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ReviewSection;
