import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_GAMES } from '../../graphql/queries';

const GameSearch = () => {
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [searchGames, { loading, error, data }] = useLazyQuery(SEARCH_GAMES);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setSearchTerm(searchInput);
            searchGames({ variables: { term: searchInput } });
        }
    };

    const handleChange = (e) => {
        setSearchInput(e.target.value);
        if (e.target.value === '') {
            setSearchTerm('');
        }
    };

    return (
        <Container>
            <h2 className="mb-4 text-white">Search Games</h2>

            <Form onSubmit={handleSearch} className="mb-4">
                <Row>
                    <Col md={10}>
                        <Form.Control
                            type="text"
                            placeholder="Search by title, genre, or platform..."
                            value={searchInput}
                            onChange={handleChange}
                            size="lg"
                        />
                    </Col>
                    <Col md={2}>
                        <Button type="submit" variant="primary" className="w-100" size="lg">
                            Search
                        </Button>
                    </Col>
                </Row>
            </Form>

            {loading && (
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            {error && (
                <Alert variant="danger">Error searching games: {error.message}</Alert>
            )}

            {searchTerm && data && (
                <>
                    <h4 className="text-white">Search Results for "{searchTerm}"</h4>
                    <p className="text-white-50">{data.searchGames.length} games found</p>

                    {data.searchGames.length === 0 ? (
                        <Alert variant="info">No games found matching your search.</Alert>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {data.searchGames.map(game => (
                                <Col key={game.id}>
                                    <Card className="h-100 shadow-sm hover-effect">
                                        <Card.Img
                                            variant="top"
                                            src={game.coverImage || 'https://via.placeholder.com/300x200?text=Game+Cover'}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <Card.Body>
                                            <Card.Title>{game.title}</Card.Title>
                                            <Card.Text>
                                                <strong>Genre:</strong> {game.genre}<br />
                                                <strong>Platform:</strong> {game.platform}<br />
                                                <strong>Released:</strong> {game.releaseYear}
                                            </Card.Text>
                                            <Button
                                                as={Link}
                                                to={`/games/${game.id}`}
                                                variant="primary"
                                                className="w-100"
                                            >
                                                View Details
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}
        </Container>
    );
};

export default GameSearch;