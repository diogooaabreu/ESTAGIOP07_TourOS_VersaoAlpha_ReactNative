// ============================================================
// TourOS POS — Componente reutilizável de teclado PIN
// ============================================================

import React, {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';

export interface PinPadRef {
  shake: () => void;
  reset: () => void;
}

interface PinPadProps {
  pinLength?: number;
  onComplete: (pin: string) => void;
  onClear?: () => void;
  errorMessage?: string;
}

const PinPad = forwardRef<PinPadRef, PinPadProps>(
  ({ pinLength = 4, onComplete, onClear, errorMessage }, ref) => {
    const [pin, setPin] = useState('');
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // ── Expor métodos ao componente pai ────────────────────────────────

    useImperativeHandle(ref, () => ({
      shake: () => {
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 8,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -8,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();
      },
      reset: () => {
        setPin('');
        onClear?.();
      },
    }));

    // ── Premir tecla ─────────────────────────────────────────────────────

    const handlePress = useCallback(
      (value: string) => {
        if (pin.length >= pinLength) return;

        const newPin = pin + value;
        setPin(newPin);

        if (newPin.length === pinLength) {
          // Pequeno delay para mostrar o último dot antes de chamar onComplete
          setTimeout(() => onComplete(newPin), 150);
        }
      },
      [pin, pinLength, onComplete],
    );

    // ── Apagar último dígito ─────────────────────────────────────────────

    const handleDelete = useCallback(() => {
      if (pin.length === 0) return;
      setPin(prev => prev.slice(0, -1));
    }, [pin]);

    // ── Renderizar dots ──────────────────────────────────────────────────

    const renderDots = () => {
      const dots = [];
      for (let i = 0; i < pinLength; i++) {
        dots.push(
          <View
            key={i}
            style={[
              styles.dot,
              i < pin.length ? styles.dotFilled : styles.dotEmpty,
            ]}
          />,
        );
      }
      return dots;
    };

    // ── Teclas do PIN ────────────────────────────────────────────────────

    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['⌫', '0', ''],
    ];

    return (
      <View style={styles.container}>
        {/* Dots */}
        <Animated.View
          style={[
            styles.dotsContainer,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {renderDots()}
        </Animated.View>

        {/* Mensagem de erro */}
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Teclado numérico */}
        <View style={styles.keypad}>
          {keys.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keyRow}>
              {row.map((key, keyIndex) => {
                if (key === '') {
                  return <View key={keyIndex} style={styles.keyPlaceholder} />;
                }

                if (key === '⌫') {
                  return (
                    <TouchableOpacity
                      key={keyIndex}
                      style={styles.key}
                      onPress={handleDelete}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.keyText}>{key}</Text>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={keyIndex}
                    style={styles.key}
                    onPress={() => handlePress(key)}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.keyText}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Botão limpar */}
        {pin.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setPin('');
              onClear?.();
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

PinPad.displayName = 'PinPad';

export default PinPad;

// ── Estilos ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  dotEmpty: {
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  dotFilled: {
    backgroundColor: '#007AFF',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  keypad: {
    width: '100%',
    maxWidth: 280,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  keyPlaceholder: {
    width: 72,
    height: 72,
  },
  clearButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  clearText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
