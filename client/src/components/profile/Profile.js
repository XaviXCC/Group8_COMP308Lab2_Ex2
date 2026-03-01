import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Modal, Spinner, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, UPDATE_PROFILE, REMOVE_FAVORITE_GAME } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const ProfileAvatar = memo(({ avatarUrl, onError }) => {
    return (
        <div className="avatar-container">
            <img
                src={avatarUrl}
                alt="Avatar"
                className="profile-avatar"
                onError={onError}
            />
        </div>
    );
});

const StatsCard = memo(({ favoriteCount, memberSince }) => {
    return (
        <Card className="shadow">
            <Card.Body>
                <Card.Title>Stats</Card.Title>
                <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Favorite Games</span>
                        <span className="badge bg-primary rounded-pill">
                            {favoriteCount}
                        </span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Member Since</span>
                        <span className="text-primary">
                            {memberSince}
                        </span>
                    </ListGroup.Item>
                </ListGroup>
            </Card.Body>
        </Card>
    );
});

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const { loading, data, refetch } = useQuery(GET_ME, {
        fetchPolicy: 'network-only',
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
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    }, [data]);

    // Format date function
    const formatDate = useCallback((timestamp) => {
        if (!timestamp) return 'N/A';

        try {
            const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
            const date = new Date(ts);
            if (isNaN(date.getTime())) return 'N/A';

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    }, []);

    // Get avatar URL
    const getAvatarUrl = useCallback(() => {
        if (previewUrl) return previewUrl;
        if (data?.me?.avatarImage) {
            // Add timestamp to prevent caching issues
            return `http://localhost:5000${data.me.avatarImage}?t=${Date.now()}`;
        }
        return 'http://localhost:5000/images/avatars/default-avatar.png';
    }, [data?.me?.avatarImage, previewUrl]);

    // Handle avatar upload
    const handleAvatarUpload = async () => {
        if (!selectedFile) return null;

        const formData = new FormData();
        formData.append('avatar', selectedFile);

        try {
            setUploading(true);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:5000/api/upload/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            return result.avatarUrl;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size too large. Max 5MB');
                return;
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Only JPG, PNG, GIF and WEBP images are allowed');
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

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

        // Validate passwords
        if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        // Upload avatar if selected
        let avatarUrl = data?.me?.avatarImage;
        if (selectedFile) {
            const uploadedUrl = await handleAvatarUpload();
            if (uploadedUrl) {
                avatarUrl = uploadedUrl;
            } else {
                return; // Upload failed, error already set
            }
        }

        // Prepare input for profile update
        const input = {
            username: editForm.username,
            email: editForm.email,
            avatarImage: avatarUrl
        };

        if (editForm.currentPassword && editForm.newPassword) {
            input.currentPassword = editForm.currentPassword;
            input.newPassword = editForm.newPassword;
        }

        try {
            await updateProfile({ variables: { input } });
            setSelectedFile(null);
            setPreviewUrl('');
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

    const handleAvatarError = useCallback(() => {
        console.log('Avatar failed to load, using default');
    }, []);

    // Memoize stats
    const stats = useMemo(() => ({
        favoriteCount: data?.me?.favoriteGames?.length || 0,
        memberSince: formatDate(data?.me?.createdAt)
    }), [data?.me?.favoriteGames?.length, data?.me?.createdAt, formatDate]);

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
                            <ProfileAvatar
                                avatarUrl={getAvatarUrl()}
                                onError={handleAvatarError}
                            />
                            <h3 className="mt-3">{player?.username}</h3>
                            <p className="text-muted">{player?.email}</p>
                            <Button variant="primary" onClick={() => setShowEditModal(true)}>
                                Edit Profile
                            </Button>
                        </Card.Body>
                    </Card>

                    <StatsCard
                        favoriteCount={stats.favoriteCount}
                        memberSince={stats.memberSince}
                    />
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
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Body>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        {/* Avatar Upload Section */}
                        <div className="text-center mb-4">
                            <img
                                src={previewUrl || `http://localhost:5000${player?.avatarImage || '/images/avatars/default-avatar.png'}`}
                                alt="Avatar Preview"
                                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
                                className="border border-3 border-primary mb-3"
                            />
                            <Form.Group>
                                <Form.Label className="fw-bold">Upload Avatar</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleFileSelect}
                                    className="mb-2"
                                    disabled={uploading}
                                />
                                <Form.Text className="text-muted">
                                    Supported formats: JPG, PNG, GIF, WEBP (Max size: 5MB)
                                </Form.Text>
                            </Form.Group>
                            {uploading && (
                                <div className="mt-2">
                                    <Spinner animation="border" size="sm" /> Uploading...
                                </div>
                            )}
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={editForm.username}
                                onChange={handleEditChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={editForm.email}
                                onChange={handleEditChange}
                                required
                            />
                        </Form.Group>

                        <hr />
                        <h6>Change Password (optional)</h6>

                        <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="currentPassword"
                                value={editForm.currentPassword}
                                onChange={handleEditChange}
                                placeholder="Enter current password"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="newPassword"
                                value={editForm.newPassword}
                                onChange={handleEditChange}
                                minLength="6"
                                placeholder="Enter new password"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={editForm.confirmPassword}
                                onChange={handleEditChange}
                                placeholder="Confirm new password"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Save Changes'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default Profile;