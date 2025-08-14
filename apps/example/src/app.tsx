import { StyleSheet, View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { VoiceError, VoiceEvent, VoiceKit, VoiceMode, useVoice } from 'react-native-voicekit';
import Dropdown from './components/dropdown';
import { useCallback, useEffect, useState } from 'react';

export default function App() {
  const [locale, setLocale] = useState('en-US');
  const [isLocaleInstalled, setIsLocaleInstalled] = useState(Platform.OS !== 'android');
  const [supportedLocales, setSupportedLocales] = useState<string[]>([]);

  const { available, listening, transcript, startListening, stopListening, resetTranscript } = useVoice({
    locale,
    enablePartialResults: true,
    mode: VoiceMode.Continuous,
    silenceTimeoutMs: 1000,
    useOnDeviceRecognizer: true,
  });

  useEffect(() => {
    VoiceKit.getSupportedLocales().then((locales) => {
      setSupportedLocales(locales.sort());
      setLocale((currentLocale) => (locales.includes(currentLocale) ? currentLocale : (locales[0] ?? 'en-US')));
    });
  }, [locale]);

  useEffect(() => {
    VoiceKit.isOnDeviceModelInstalled(locale).then((isInstalled) => {
      setIsLocaleInstalled(isInstalled);
    });
  }, [locale]);

  const onModelDownloadProgress = useCallback((progress: number) => {
    console.log('Model download progress:', progress);
    if (progress >= 100) {
      setIsLocaleInstalled(true);
      VoiceKit.removeListener(VoiceEvent.ModelDownloadProgress, onModelDownloadProgress);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text>Is available: {available ? 'Yes' : 'No'}</Text>
      <Text style={{ marginBottom: 30 }}>Is listening: {listening ? 'Yes' : 'No'}</Text>
      <Dropdown
        label={`Locale${Platform.OS === 'android' ? ` (is installed: ${isLocaleInstalled ? 'yes' : 'no'})` : ''}`}
        data={supportedLocales.map((l) => ({ label: l, value: l }))}
        maxHeight={300}
        value={locale}
        onChange={(item) => setLocale(item.value)}
        containerStyle={styles.dropdown}
        style={styles.dropdown}
      />
      {Platform.OS === 'android' && (
        <TouchableOpacity
          onPress={() => {
            VoiceKit.downloadOnDeviceModel(locale)
              .then((result) => {
                if (result.progressAvailable) {
                  VoiceKit.addListener(VoiceEvent.ModelDownloadProgress, onModelDownloadProgress);
                } else {
                  console.log('Model download status:', result.status);
                }
              })
              .catch((error) => {
                console.error('Error downloading model', error, error instanceof VoiceError ? error.details : null);
              });
          }}
          disabled={isLocaleInstalled}
          style={[styles.button, isLocaleInstalled && styles.disabledButton]}>
          <Text style={styles.buttonText}>Download "{locale}" Model</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={async () => {
          await startListening().catch((error) => {
            console.error('Error starting listening', error, error instanceof VoiceError ? error.details : null);
          });
        }}
        disabled={!available || !isLocaleInstalled || listening}
        style={[styles.button, (!available || !isLocaleInstalled || listening) && styles.disabledButton]}>
        <Text style={styles.buttonText}>Start Listening</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => stopListening()}
        disabled={!listening}
        style={[styles.button, !listening && styles.disabledButton]}>
        <Text style={styles.buttonText}>Stop Listening</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => resetTranscript()} style={styles.button}>
        <Text style={styles.buttonText}>Reset Transcript</Text>
      </TouchableOpacity>
      <TextInput multiline value={transcript} editable={false} style={styles.resultTextarea} placeholder="Transcript" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  dropdown: {
    width: '100%',
  },
  button: {
    width: '100%',
    padding: 10,
    backgroundColor: 'lightblue',
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    textAlign: 'center',
  },
  resultTextarea: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 10,
  },
});
