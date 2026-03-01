import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_GAMES } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import AddGame from './AddGame';
import './GameList.css';

const GameList = () => {
    const { isAuthenticated } = useAuth();
    const [showAddModal, setShowAddModal] = useState(false);
    const { loading, error, data } = useQuery(GET_GAMES);

    // local image（ public/images/games/ ）
    // get game image with fallback logic:
    const getGameImage = (game) => {
        // 1. use the image path from database if available and not default
        if (game.coverImage && game.coverImage !== 'default-game.jpg') {
            // use the URL directly if it's a full URL
            if (game.coverImage.startsWith('http')) {
                return game.coverImage;
            }
            // get image from server
            return `http://localhost:5000${game.coverImage}`;
        }

        // 2. return corresponding local image based on game title
        const titleToImage = {
            'The Last of Us Part II': '/images/games/last-of-us.jpg',
            'Cyberpunk 2077': '/images/games/cyberpunk.jpg',
            'FIFA 24': '/images/games/fifa24.jpg',
            'Zelda: Tears of the Kingdom': '/images/games/zelda.jpg',
            'Starfield': '/images/games/starfield.jpg',
            'God of War Ragnarök': '/images/games/god-of-war.jpg',
            'Elden Ring': '/images/games/elden-ring.jpg',
            'Minecraft': '/images/games/minecraft.jpg'
        };

        if (titleToImage[game.title]) {
            return `http://localhost:5000${titleToImage[game.title]}`;
        }

        // 3. 使用默认图片
        return 'http://localhost:5000/images/games/default-game.jpg';
    };

    // deal with broken image links by replacing them with a text placeholder that shows the first letter of the game title
    const handleImageError = (e, game) => {
        console.log(`Image failed to load for ${game.title}, using text placeholder...`);

        // create a placeholder element with the first letter of the game title
        const parent = e.target.parentNode;
        const placeholder = document.createElement('div');
        placeholder.className = 'game-image-placeholder';
        placeholder.innerHTML = `<span>${game.title.charAt(0)}</span>`;
        placeholder.style.cssText = `
            width: 100%;
            height: 200px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 4rem;
            font-weight: bold;
            text-transform: uppercase;
        `;

        e.target.style.display = 'none';
        parent.appendChild(placeholder);
    };

    if (loading) return (
        <div className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    if (error) return (
        <Container className="mt-5">
            <Alert variant="danger">Error loading games: {error.message}</Alert>
        </Container>
    );

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-white mb-0">All Games</h2>
                {isAuthenticated && (
                    <Button variant="success" onClick={() => setShowAddModal(true)}>
                        + Add New Game
                    </Button>
                )}
            </div>

            <Row xs={1} md={2} lg={3} className="g-4">
                {data.games.map(game => (
                    <Col key={game.id}>
                        <Card className="h-100 shadow-sm hover-effect game-card">
                            <div className="image-container" style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                                <Card.Img
                                    variant="top"
                                    src={getGameImage(game)}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                    onError={(e) => handleImageError(e, game)}
                                />
                            </div>
                            <Card.Body>
                                <Card.Title>{game.title}</Card.Title>
                                <Card.Text>
                                    <strong>Genre:</strong> {game.genre}<br />
                                    <strong>Platform:</strong> {game.platform}<br />
                                    <strong>Released:</strong> {game.releaseYear}
                                </Card.Text>
                                <div className="d-grid gap-2">
                                    <Button
                                        as={Link}
                                        to={`/games/${game.id}`}
                                        variant="primary"
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </Card.Body>
                            <Card.Footer className="text-muted">
                                <small>Game ID: {game.gameId}</small>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            <AddGame show={showAddModal} handleClose={() => setShowAddModal(false)} />
        </Container>
    );
};

export default GameList;