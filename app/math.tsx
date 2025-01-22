import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';

export default function FastMath() {
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [problemCount, setProblemCount] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [finalTime, setFinalTime] = useState<number | null>(null);
    const [highScore, setHighScore] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout>();

    // Add timer effect
    useEffect(() => {
        if (isPlaying) {
        timerRef.current = setInterval(() => {
            setCurrentTime((Date.now() - (startTime || 0)) / 1000);
        }, 100);
    
        return () => {
            if (timerRef.current) {
            clearInterval(timerRef.current);
            }
        };
        }
    }, [isPlaying, startTime]);
  
  const generateProblem = () => {
    setNum1(Math.floor(Math.random() * 13));
    setNum2(Math.floor(Math.random() * 13));
    setUserAnswer('');
  };

  const startGame = () => {
    setIsPlaying(true);
    setProblemCount(0);
    setStartTime(Date.now());
    generateProblem();
  };

  const handleNumber = (num: number) => {
    setUserAnswer(prev => {
      const newAnswer = prev + num.toString();
      if (parseInt(newAnswer) === num1 * num2) {
        if (problemCount === 9) {
          setIsPlaying(false);
          const score = (Date.now() - (startTime || 0)) / 1000;
          setFinalTime(score);
          if (score < highScore || highScore === 0) {
            setHighScore(score);
          }
        } else {
          setProblemCount(prev => prev + 1);
          generateProblem();
          return '';
        }
      }
      return newAnswer;
    });
  };

  const handleBackspace = () => {
    setUserAnswer(prev => prev.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      {!isPlaying ? (
        <View>
          <Text style={styles.title}>FAST MATH</Text>
          <Button title="Start Game" onPress={startGame} />
          {finalTime && (
            <Text style={styles.score}>Last Score: {finalTime.toFixed(2)} seconds</Text>
          )}
          {highScore !== 0 && (
            <Text style={styles.score}>High Score: {highScore.toFixed(2)} seconds</Text>
        )}
        </View>
      ) : (
        <View style={styles.gameContainer}>
          
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <Text style={styles.timer}>Time: {currentTime.toFixed(1)}s</Text>

                <Text style={styles.problemCount}>
                    Problem: {problemCount + 1}/10
                </Text>

            </View>
          
            
            <View style={styles.progressBar}>
                {[...Array(10)].map((_, index) => (
                <View 
                    key={index} 
                    style={[
                        styles.checkmarkBorder,
                        index < problemCount ? styles.completed : styles.remaining
                    ]} 
                >
                    <Text
                        style={[
                        styles.checkmark,
                        index < problemCount ? styles.completed : styles.remaining
                        ]}
                    >
                        ✓
                    </Text>
                </View>
                ))}
            </View>

          <Text style={styles.problem}>
            {num1} × {num2} = ?
          </Text>
          <Text style={styles.answer}>{userAnswer}</Text>
          
          <View style={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <TouchableOpacity
                key={num}
                style={styles.key}
                onPress={() => handleNumber(num)}
              >
                <Text style={styles.keyText}>{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.key}
              onPress={() => handleNumber(0)}
            >
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.key}
              onPress={handleBackspace}
            >
              <Text style={styles.keyText}>←</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
    alignSelf: 'center',
  },
  problemCount: {
    fontSize: 20,
    marginBottom: 20,
    color: '#fff',
  },
  problem: {
    fontSize: 32,
    marginBottom: 20,
    color: '#fff',
  },
  score: {
    marginTop: 20,
    fontSize: 18,
    color: '#fff',
  },
  timer: {
    fontSize: 20,
    marginBottom: 20,
    color: '#fff',
  },
  gameContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 300,
    marginTop: 20,
  },
  key: {
    width: 80,
    height: 80,
    margin: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  keyText: {
    fontSize: 32,
    color: 'white',
  },
  answer: {
    fontSize: 40,
    marginVertical: 20,
    minHeight: 50,
    color: '#fff',
    width: 100,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 24,
  },
  checkmarkBorder: {
    marginHorizontal: 5,
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completed: {
    color: '#4CAF50',
    borderColor: '#4CAF50',
  },
  remaining: {
    color: '#ccc',
    borderColor: '#ccc',
  },
});