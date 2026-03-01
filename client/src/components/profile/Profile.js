import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, UPDATE_PROFILE, REMOVE_FAVORITE_GAME } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { updateUser } = useAuth();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        avatarImage: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { loading, data, refetch } = useQuery(GET_ME, {
        fetchPolicy: 'network-only'
    });

    const [updateProfile] = useMutation(UPDATE_PROFILE, {
        onCompleted: (data) => {
            updateUser(data.updateProfile);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
            setShowEditModal(false);
            refetch();
        },
        onError: (error) => {
            setError(error.message);
        }
    });

    const [removeFavorite] = useMutation(REMOVE_FAVORITE_GAME, {
        onCompleted: () => {
            refetch();
        }
    });

    useEffect(() => {
        if (data?.me) {
            setEditForm({
                username: data.me.username,
                email: data.me.email,
                avatarImage: data.me.avatarImage || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    }, [data]);

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        const input = {
            username: editForm.username,
            email: editForm.email,
            avatarImage: editForm.avatarImage
        };

        if (editForm.currentPassword && editForm.newPassword) {
            input.currentPassword = editForm.currentPassword;
            input.newPassword = editForm.newPassword;
        }

        try {
            await updateProfile({ variables: { input } });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemoveFavorite = async (gameId) => {
        try {
            await removeFavorite({ variables: { gameId } });
        } catch (err) {
            console.error('Error removing favorite:', err);
        }
    };

    // format date with fallback
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    if (loading) return (
        <div className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    const player = data?.me;

    return (
        <Container>
            <Row>
                <Col md={4}>
                    <Card className="shadow mb-4">
                        <Card.Body className="text-center">
                            <div className="mb-3">
                                <img
                                    src={player?.avatarImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    alt="Avatar"
                                    style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
                                    className="border border-3 border-primary profile-avatar"
                                    onError={(e) => {
                                        e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
                                    }}
                                />
                            </div>
                            <h3>{player?.username}</h3>
                            <p className="text-muted">{player?.email}</p>
                            <Button variant="primary" onClick={() => setShowEditModal(true)}>
                                Edit Profile
                            </Button>
                        </Card.Body>
                    </Card>

                    <Card className="shadow">
                        <Card.Body>
                            <Card.Title>Stats</Card.Title>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                    <span>Favorite Games</span>
                                    <span className="badge bg-primary rounded-pill">
                                        {player?.favoriteGames?.length || 0}
                                    </span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                    <span>Member Since</span>
                                    <span className="text-primary">
                                        {formatDate(player?.createdAt)}
                                    </span>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="shadow mb-4">
                        <Card.Body>
                            <Card.Title>Favorite Games</Card.Title>
                            {player?.favoriteGames?.length > 0 ? (
                                <ListGroup>
                                    {player.favoriteGames.map(game => (
                                        <ListGroup.Item key={game.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <Link to={`/games/${game.id}`} className="text-decoration-none">
                                                    <strong>{game.title}</strong>
                                                </Link>
                                                <br />
                                                <small className="text-muted">{game.genre} • {game.platform}</small>
                                            </div>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleRemoveFavorite(game.id)}
                                            >
                                                Remove
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <p className="text-muted">No favorite games yet. Browse games to add some!</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Edit Profile Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <form onSubmit={handleEditSubmit}>
                    <Modal.Body>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                name="username"
                                value={editForm.username}
                                onChange={handleEditChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={editForm.email}
                                onChange={handleEditChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Avatar URL</label>
                            <input
                                type="text"
                                className="form-control"
                                name="avatarImage"
                                value={editForm.avatarImage}
                                onChange={handleEditChange}
                                placeholder="Enter avatar image URL"
                            />
                        </div>

                        <hr />
                        <h6>Change Password (optional)</h6>

                        <div className="mb-3">
                            <label className="form-label">Current Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="currentPassword"
                                value={editForm.currentPassword}
                                onChange={handleEditChange}
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="newPassword"
                                value={editForm.newPassword}
                                onChange={handleEditChange}
                                minLength="6"
                                placeholder="Enter new password"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="confirmPassword"
                                value={editForm.confirmPassword}
                                onChange={handleEditChange}
                                placeholder="Confirm new password"
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </Container>
    );
};

export default Profile;