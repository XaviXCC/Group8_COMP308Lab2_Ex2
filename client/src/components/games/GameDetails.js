import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_GAME, GET_FAVORITE_GAMES, ADD_FAVORITE_GAME } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';

const GameDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const { loading: gameLoading, error: gameError, data: gameData } = useQuery(GET_GAME, {
        variables: { id }
    });

    const { data: favData } = useQuery(GET_FAVORITE_GAMES, {
        skip: !isAuthenticated
    });

    const [addFavorite, { loading: favLoading }] = useMutation(ADD_FAVORITE_GAME, {
        refetchQueries: ['GetFavoriteGames']
    });

    // use the same title-to-image mapping as GameList for consistency
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

    // get game image with fallback logic
    const getGameImage = (game) => {
        if (!game) return '/images/games/default-game.jpg';

        // 1. use image path from database if available and not default
        if (game.coverImage && game.coverImage !== 'default-game.jpg') {
            // if it's a full URL, use it directly
            if (game.coverImage.startsWith('http')) {
                return game.coverImage;
            }
            // get image from server
            return `http://localhost:4000${game.coverImage}`;
        }

        // 2. return corresponding local image based on game title
        if (titleToImage[game.title]) {
            return `http://localhost:4000${titleToImage[game.title]}`;
        }

        // 3. use default image
        return 'http://localhost:4000/images/games/default-game.jpg';
    };

    // deal with broken image links by replacing them with a text placeholder that shows the first letter of the game title
    const handleImageError = (e, game) => {
        console.log(`Image failed to load for ${game?.title}, creating placeholder...`);

        // create a placeholder element with the first letter of the game title
        const parent = e.target.parentNode;
        const placeholder = document.createElement('div');
        placeholder.className = 'game-image-placeholder';
        placeholder.style.cssText = `
      width: 100%;
      height: 400px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 6rem;
      font-weight: bold;
      text-transform: uppercase;
      border-radius: 8px;
    `;
        placeholder.textContent = game?.title?.charAt(0) || '?';

        e.target.style.display = 'none';
        parent.appendChild(placeholder);
    };

    if (gameLoading) return (
        <div className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    if (gameError) return (
        <Container className="mt-5">
            <Alert variant="danger">Error loading game: {gameError.message}</Alert>
        </Container>
    );

    const game = gameData?.game;
    if (!game) return null;

    const isFavorite = favData?.getFavoriteGames?.some(fav => fav.id === game.id);

    const handleAddFavorite = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            await addFavorite({ variables: { gameId: game.id } });
        } catch (error) {
            console.error('Error adding favorite:', error);
        }
    };

    return (
        <Container>
            <Button
                variant="secondary"
                onClick={() => navigate(-1)}
                className="mb-3"
            >
                ← Back
            </Button>

            <Row>
                <Col md={4}>
                    <Card className="shadow game-details-image">
                        <div style={{ position: 'relative', height: '400px' }}>
                            <Card.Img
                                variant="top"
                                src={getGameImage(game)}
                                style={{ height: '400px', objectFit: 'cover' }}
                                onError={(e) => handleImageError(e, game)}
                            />
                        </div>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card className="shadow">
                        <Card.Body>
                            <Card.Title as="h1">{game.title}</Card.Title>
                            <Card.Text>
                                <strong>Game ID:</strong> {game.gameId}
                            </Card.Text>

                            <Row className="mt-4">
                                <Col md={6}>
                                    <h5>Details</h5>
                                    <p><strong>Genre:</strong> {game.genre}</p>
                                    <p><strong>Platform:</strong> {game.platform}</p>
                                    <p><strong>Release Year:</strong> {game.releaseYear}</p>
                                </Col>
                                <Col md={6}>
                                    <h5>Description</h5>
                                    <p>{game.description || 'No description available.'}</p>
                                </Col>
                            </Row>

                            {isAuthenticated && (
                                <div className="mt-4">
                                    <Button
                                        variant={isFavorite ? 'success' : 'primary'}
                                        size="lg"
                                        onClick={handleAddFavorite}
                                        disabled={isFavorite || favLoading}
                                        className="w-100"
                                    >
                                        {isFavorite ? '✓ In Favorites' : 'Add to Favorites'}
                                    </Button>
                                </div>
                            )}

                            {!isAuthenticated && (
                                <div className="mt-4">
                                    <Alert variant="info">
                                        Please <Alert.Link href="/login">login</Alert.Link> to add this game to your favorites.
                                    </Alert>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default GameDetails;