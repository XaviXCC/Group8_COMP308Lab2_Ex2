import React, { useState } from 'react';
import { Form, Button, Modal, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { CREATE_GAME, GET_GAMES } from '../../graphql/queries';

const AddGame = ({ show, handleClose }) => {
    const [formData, setFormData] = useState({
        gameId: '',
        title: '',
        genre: 'Action',
        platform: 'PC',
        releaseYear: new Date().getFullYear(),
        description: '',
        coverImage: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [createGame, { loading }] = useMutation(CREATE_GAME, {
        refetchQueries: [{ query: GET_GAMES }],
        onCompleted: () => {
            setSuccess('Game created successfully!');
            setTimeout(() => {
                handleClose();
                resetForm();
            }, 2000);
        },
        onError: (error) => {
            setError(error.message);
        }
    });

    const resetForm = () => {
        setFormData({
            gameId: '',
            title: '',
            genre: 'Action',
            platform: 'PC',
            releaseYear: new Date().getFullYear(),
            description: '',
            coverImage: ''
        });
        setError('');
        setSuccess('');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        await createGame({
            variables: {
                input: formData
            }
        });
    };

    const genres = ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Puzzle', 'Simulation', 'FPS', 'Other'];
    const platforms = ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X', 'Xbox One', 'Nintendo Switch', 'Mobile', 'Other'];

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add New Game</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form.Group className="mb-3">
                        <Form.Label>Game ID</Form.Label>
                        <Form.Control
                            type="text"
                            name="gameId"
                            value={formData.gameId}
                            onChange={handleChange}
                            required
                            placeholder="e.g., G009"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Enter game title"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Genre</Form.Label>
                        <Form.Select name="genre" value={formData.genre} onChange={handleChange} required>
                            {genres.map(genre => (
                                <option key={genre} value={genre}>{genre}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Platform</Form.Label>
                        <Form.Select name="platform" value={formData.platform} onChange={handleChange} required>
                            {platforms.map(platform => (
                                <option key={platform} value={platform}>{platform}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Release Year</Form.Label>
                        <Form.Control
                            type="number"
                            name="releaseYear"
                            value={formData.releaseYear}
                            onChange={handleChange}
                            required
                            min="1950"
                            max={new Date().getFullYear() + 2}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter game description"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Cover Image URL</Form.Label>
                        <Form.Control
                            type="text"
                            name="coverImage"
                            value={formData.coverImage}
                            onChange={handleChange}
                            placeholder="Enter image URL (optional)"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Game'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddGame;