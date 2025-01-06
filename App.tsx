import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  PanResponderGestureState,
  GestureResponderEvent,
} from 'react-native';

// Adjust these for your game board:
const BOARD_SIZE = 15;      // how many cells in each row/column
const CELL_SIZE = 20;       // pixel size of each cell
const INITIAL_SNAKE = [[0, 0], [1, 0]];  // starting positions
const INITIAL_DIRECTION = [1, 0];        // moving right initially
const GAME_SPEED = 150;    // snake movement speed in ms

function getRandomFoodPosition(snake: number[][]): [number, number] {
  while (true) {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);

    // Confirm it's not in the snake
    const isOnSnake = snake.some(
      ([sx, sy]) => sx === x && sy === y
    );
    if (!isOnSnake) {
      return [x, y];
    }
  }
}

export default function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(() => getRandomFoodPosition(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderRelease: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          const { dx, dy } = gestureState;
          if (Math.abs(dx) > Math.abs(dy)) {
            handleDirectionChange(dx > 0 ? [1, 0] : [-1, 0]);
          } else {
            handleDirectionChange(dy > 0 ? [0, 1] : [0, -1]);
          }
        },
      }),
    [direction] // re-create whenever direction changes
  );

  useEffect(() => {
    // Start the game loop
    startGame();
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      switch (event.key) {
        case 'ArrowUp':
          setDirection([0, -1]);
          break;
        case 'ArrowDown':
          setDirection([0, 1]);
          break;
        case 'ArrowLeft':
          setDirection([-1, 0]);
          break;
        case 'ArrowRight':
          setDirection([1, 0]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFoodPosition(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    // clear any previous interval
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    // set up the game loop
    gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
  };

  const gameLoop = useCallback(() => {
    setSnake((prevSnake) => {
      const newHead = [
        prevSnake[prevSnake.length - 1][0] + direction[0],
        prevSnake[prevSnake.length - 1][1] + direction[1],
      ];

      // Check collisions with walls
      if (
        newHead[0] < 0 ||
        newHead[0] >= BOARD_SIZE ||
        newHead[1] < 0 ||
        newHead[1] >= BOARD_SIZE
      ) {
        triggerGameOver();
        return prevSnake;
      }

      // Check collisions with self
      for (let i = 0; i < prevSnake.length; i++) {
        if (prevSnake[i][0] === newHead[0] && prevSnake[i][1] === newHead[1]) {
          triggerGameOver();
          return prevSnake;
        }
      }

      // Check if snake eats the food
      let newSnake = [...prevSnake, newHead];
      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        // snake eats, increase score
        setScore((prevScore) => {
          const newScore = prevScore + 1;
          if (newScore > highScore) {
            setHighScore(newScore);
          }
          return newScore;
        });
        setFood(getRandomFoodPosition(newSnake));
      } else {
        // just move forward (remove tail)
        newSnake.shift();
      }
      return newSnake;
    });
  }, [direction]);

  useEffect(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
    return () => gameLoopRef.current && clearInterval(gameLoopRef.current);
  }, [gameLoop]);

  const triggerGameOver = () => {
    setGameOver(true);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  };

  const handleDirectionChange = (newDirection) => {
    // Prevent reversing directly
    if (
      (direction[0] !== 0 && newDirection[0] !== 0) ||
      (direction[1] !== 0 && newDirection[1] !== 0)
    ) {
      return; // ignore invalid direction
    }
    setDirection(newDirection);
  };

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <View style={styles.container}>
        <Text style={styles.title}>Snake</Text>
        
        <View
          style={[
            styles.board,
            { width: BOARD_SIZE * CELL_SIZE, height: BOARD_SIZE * CELL_SIZE },
          ]}
        >
          {/* Render snake */}
          {snake.map((segment, index) => {
            const left = segment[0] * CELL_SIZE;
            const top = segment[1] * CELL_SIZE;
            return (
              <View
                key={index}
                style={[styles.snakeSegment, { left, top }]}
              />
            );
          })}

          {/* Render food */}
          <View
            style={[
              styles.food,
              {
                left: food[0] * CELL_SIZE,
                top: food[1] * CELL_SIZE,
              },
            ]}
          />
        </View>

        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.score}>High Score: {highScore}</Text>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleDirectionChange([0, -1])}
              on
            >
              <Text style={styles.buttonText}>Up</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleDirectionChange([-1, 0])}
            >
              <Text style={styles.buttonText}>Left</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleDirectionChange([1, 0])}
            >
              <Text style={styles.buttonText}>Right</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleDirectionChange([0, 1])}
            >
              <Text style={styles.buttonText}>Down</Text>
            </TouchableOpacity>
          </View>
        </View>

        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverText}>Game Over</Text>
            <TouchableOpacity style={styles.restartButton} onPress={startGame}>
              <Text style={styles.buttonText}>Restart</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// Some basic styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  board: {
    position: 'relative',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  snakeSegment: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#0f0',
  },
  food: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#f00',
  },
  score: {
    color: '#fff',
    marginTop: 10,
    fontSize: 18,
  },
  controls: {
    marginTop: 20,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#555',
    margin: 5,
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverText: {
    fontSize: 30,
    color: '#fff',
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#d9534f',
    padding: 15,
    borderRadius: 5,
  },
});

