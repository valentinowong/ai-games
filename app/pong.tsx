import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, Platform } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const BALL_SIZE = 15;
const PADDLE_OFFSET = 50;
const GAME_SPEED = 16; // ~60fps
const AI_SPEED = 5;

export default function Pong() {
  // Game state
  const [playerPaddleY, setPlayerPaddleY] = useState(SCREEN_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [aiPaddleY, setAiPaddleY] = useState(SCREEN_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ballX, setBallX] = useState(SCREEN_WIDTH / 2);
  const [ballY, setBallY] = useState(SCREEN_HEIGHT / 2);
  const [ballDX, setBallDX] = useState(5);
  const [ballDY, setBallDY] = useState(5);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const gameLoopRef = useRef<NodeJS.Timeout>();

  // Add state for previous paddle positions
  const [prevPlayerPaddleY, setPrevPlayerPaddleY] = useState(SCREEN_HEIGHT / 2);
  const [prevAiPaddleY, setPrevAiPaddleY] = useState(SCREEN_HEIGHT / 2);

  // Player paddle control
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      setPlayerPaddleY(prev => {
        const newY = prev + gesture.dy;
        return Math.max(0, Math.min(newY, SCREEN_HEIGHT - PADDLE_HEIGHT));
      });
    },
  });

  // Add keyboard controls for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (event: any) => {
        switch (event.key) {
          case 'ArrowUp':
            setPlayerPaddleY(prev => 
              Math.max(0, prev - 20)
            );
            break;
          case 'ArrowDown':
            setPlayerPaddleY(prev => 
              Math.min(SCREEN_HEIGHT - PADDLE_HEIGHT, prev + 20)
            );
            break;
        }
      };
  
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  // Reset ball
  const resetBall = (scorer: 'player' | 'ai') => {
    setBallX(SCREEN_WIDTH / 2);
    setBallY(SCREEN_HEIGHT / 2);
    setBallDX(scorer === 'player' ? -5 : 5);
    setBallDY((Math.random() - 0.5) * 10);
  };

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      // Store previous positions before updates
      setPrevPlayerPaddleY(playerPaddleY);
      setPrevAiPaddleY(aiPaddleY);

      // Calculate new ball position
      const nextBallY = ballY + ballDY;

      // Wall collision checks with position correction
      if (nextBallY <= 0) {
        setBallY(0); // Set to top edge
        setBallDY(currentDY => Math.abs(currentDY)); // Bounce down
      } else if (nextBallY + BALL_SIZE >= SCREEN_HEIGHT) {
        setBallY(SCREEN_HEIGHT - BALL_SIZE); // Set to bottom edge
        setBallDY(currentDY => -Math.abs(currentDY)); // Bounce up
      } else {
        setBallY(nextBallY); // Normal movement
      }

      // Regular X movement
      setBallX(x => x + ballDX);

      // Player paddle collision
      if (
        ballX <= PADDLE_OFFSET + PADDLE_WIDTH &&
        ballY + BALL_SIZE >= playerPaddleY &&
        ballY <= playerPaddleY + PADDLE_HEIGHT
      ) {
        // Calculate paddle velocity
        const paddleVelocity = playerPaddleY - prevPlayerPaddleY;
        
        // Reverse X direction
        setBallDX(Math.abs(ballDX));
        
        // Add paddle momentum to Y velocity
        setBallDY(prev => prev + (paddleVelocity * 0.5));
        
        // Cap maximum vertical speed
        setBallDY(prev => Math.min(Math.max(prev, -10), 10));
      }

      // AI paddle collision
      if (
        ballX + BALL_SIZE >= SCREEN_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH &&
        ballY + BALL_SIZE >= aiPaddleY &&
        ballY <= aiPaddleY + PADDLE_HEIGHT
      ) {
        // Calculate paddle velocity
        const paddleVelocity = aiPaddleY - prevAiPaddleY;
        
        // Reverse X direction
        setBallDX(-Math.abs(ballDX));
        
        // Add paddle momentum to Y velocity
        setBallDY(prev => prev + (paddleVelocity * 0.5));
        
        // Cap maximum vertical speed
        setBallDY(prev => Math.min(Math.max(prev, -10), 10));
      }

      // Scoring
      if (ballX < 0) {
        setAiScore(s => s + 1);
        resetBall('ai');
      } else if (ballX > SCREEN_WIDTH) {
        setPlayerScore(s => s + 1);
        resetBall('player');
      }

      // AI movement
      setAiPaddleY(y => {
        const centerOfPaddle = y + PADDLE_HEIGHT / 2;
        const centerOfBall = ballY + BALL_SIZE / 2;
        if (centerOfPaddle < centerOfBall - 10) return y + AI_SPEED;
        if (centerOfPaddle > centerOfBall + 10) return y - AI_SPEED;
        return y;
      });
    };

    gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
    return () => clearInterval(gameLoopRef.current);
  }, [ballDX, ballDY, ballX, ballY]);

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{playerScore}</Text>
        <Text style={styles.score}>{aiScore}</Text>
      </View>
      
      <View {...panResponder.panHandlers} style={StyleSheet.absoluteFill}>
        <View style={[styles.paddle, { left: PADDLE_OFFSET, top: playerPaddleY }]} />
        <View style={[styles.paddle, { right: PADDLE_OFFSET, top: aiPaddleY }]} />
        <View style={[styles.ball, { left: ballX, top: ballY }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  score: {
    color: '#fff',
    fontSize: 40,
  },
  paddle: {
    position: 'absolute',
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    backgroundColor: '#fff',
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    backgroundColor: '#fff',
    borderRadius: BALL_SIZE / 2,
  },
});